package com.enspy.webtree.services;


import com.enspy.webtree.dto.responses.ApiResponse;
import com.enspy.webtree.dto.responses.TreeNodeDTO;
import com.enspy.webtree.dto.responses.UserGraphBuilder;
import com.enspy.webtree.models.Family;
import com.enspy.webtree.models.Relations;
import com.enspy.webtree.models.Users;
import com.enspy.webtree.repositories.FamilyRepository;
import com.enspy.webtree.repositories.RelationRepository;
import com.enspy.webtree.repositories.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class GraphLogicServices {


    private AuthenticationService authenticationService;
    private UserRepository userRepository;
    private RelationRepository relationRepository;
    private FamilyRepository familyRepository;


    public GraphLogicServices(AuthenticationService authenticationService,
                             UserRepository userRepository,
                             RelationRepository relationRepository,
                             FamilyRepository familyRepository){
        this.authenticationService = authenticationService;
        this.userRepository = userRepository;
        this.relationRepository = relationRepository;
        this.familyRepository = familyRepository;
    }
    public ApiResponse familyTree(UUID familyId){
        ApiResponse response = new ApiResponse();
        Optional<Family> familyOpt = familyRepository.findById(familyId);
        if(familyOpt.isEmpty()){
            response.setData(null);
            response.setText("invalid family id");
            response.setValue("404");
            return response;
        }
        Family family = familyOpt.get();
        List<Users> members = family.getMembers();

        try {
            if(members.isEmpty()){
                response.setData(null);
                response.setText("family has no members");
                response.setValue("404");
                return response;
            }
            List<Relations> relationsList = relationRepository.findAllBySourcesInAndTargetIn(members, members);
            Map<String, UserGraphBuilder> userGraph = new HashMap<>();
            members.forEach(member -> userGraph.put(member.getUsername(), new UserGraphBuilder(member)));

            for (Relations relation : relationsList) {
                UserGraphBuilder sourceNode = userGraph.get(relation.getSources().getUsername());
                UserGraphBuilder targetNode = userGraph.get(relation.getTarget().getUsername());

                if (sourceNode == null || targetNode == null) {
                    continue;
                }

                if (relation.getPoid() == 1) { // Parent-enfant
                    sourceNode.getChildrenUsername().add(targetNode.getUser().getUsername());
                    targetNode.getParentUsername().add(sourceNode.getUser().getUsername());
                } else if (relation.getPoid() == 0) { // Frères/Sœurs
                    sourceNode.getPartnerUsername().add(targetNode.getUser().getUsername());
                    targetNode.getPartnerUsername().add(sourceNode.getUser().getUsername());
                }

            }

            // On identifie les racines de l'arbre ( les membres sans parents )
            List<String> rootUsernames = userGraph.values().stream()
                    .filter(node -> node.getParentUsername().isEmpty()) // Ceux sans parents dans la famille
                    .map(node -> node.getUser().getUsername())
                    .toList();

            if (rootUsernames.isEmpty() && !members.isEmpty()) {
                response.setText("Une erreur s'est produite");
                response.setValue("500");
                return response;
            }

            List<TreeNodeDTO> treeNodes = new ArrayList<>();
            Set<String> visitedNodes = new HashSet<>();

            for (String rootUsername : rootUsernames) {
                if (!visitedNodes.contains(rootUsername)) { //on traiter une racine qu'une fois
                    treeNodes.add(buildNodeRecursive(rootUsername, userGraph, visitedNodes));
                }
            }

            response.setData(treeNodes);
            response.setText("success");
            response.setValue("200");
            return response;

        } catch (Exception e){
            response.setText("an error occured :" + e.getMessage() );
            response.setValue("500");
            return response;
        }

    }


    private TreeNodeDTO buildNodeRecursive(String username, Map<String, UserGraphBuilder> userGraph, Set<String> visitedNodes) {


        if (visitedNodes.contains(username)) {
            Users user = userRepository.findByUsername(username).orElse(null);
            assert user != null;
            return TreeNodeDTO.builder()
                    .id(user.getId())
                    .name(user.getFirstName() + " " + user.getLastName())
                    .username(userGraph.get(username).getUser().getUsername())
                    .build();
        }
        visitedNodes.add(username);

        UserGraphBuilder currentNodeData = userGraph.get(username);
        if (currentNodeData == null) {
            return null;
        }

        TreeNodeDTO node = TreeNodeDTO.builder()
                .id(currentNodeData.getUser().getId())
                .name(currentNodeData.getUser().getFirstName()+ " " + currentNodeData.getUser().getLastName())
                .username(currentNodeData.getUser().getUsername())
                .childrens(new ArrayList<>())
                .partners(new ArrayList<>())
                .build();

        // Récursion pour les enfants
        if(currentNodeData.getChildrenUsername() != null) {
            for (String childUsername : currentNodeData.getChildrenUsername()) {
                TreeNodeDTO childNode = buildNodeRecursive(childUsername, userGraph, visitedNodes);
                if (childNode != null) {
                    node.getChildrens().add(childNode);
                }
            }
        }

        // Récursion pour les partenaires
        if(currentNodeData.getPartnerUsername() != null) {
            for (String partnerUsername : currentNodeData.getPartnerUsername()) {

                if (!visitedNodes.contains(partnerUsername)) {
                    visitedNodes.add(partnerUsername);
                    TreeNodeDTO partnerNode = buildNodeRecursive(partnerUsername, userGraph, visitedNodes);
                    if (partnerNode != null) {
                        node.getPartners().add(partnerNode);
                    }
                } else {
                    return null;
                }
            }
        }

        return node;
    }


    /**
     * plus court chemin
     */

    @Transactional(readOnly = true)
    public List<TreeNodeDTO> findPathDijkstra(UUID familyId, String usernameSource, String usernameTarget) {
        Family family = familyRepository.findById(familyId)
                .orElseThrow(() -> new NoSuchElementException("Famille non trouvée avec l'ID : " + familyId));

        List<Users> familyMembers = family.getMembers();
        if (familyMembers == null || familyMembers.isEmpty()) {
            return Collections.emptyList();
        }

        Users userSource = familyMembers.stream()
                .filter(u -> u.getUsername().equals(usernameSource))
                .findFirst()
                .orElseThrow(() -> new NoSuchElementException("Utilisateur source non trouvé : " + usernameSource));

        Users userTarget = familyMembers.stream()
                .filter(u -> u.getUsername().equals(usernameTarget))
                .findFirst()
                .orElseThrow(() -> new NoSuchElementException("Utilisateur cible non trouvé : " + usernameTarget));

        if (userSource.getUsername().equals(userTarget.getUsername())) { // Comparaison par username
            return Collections.singletonList(buildNodeFromUser(userSource));
        }

        Map<String, UserGraphBuilder> userGraph = buildUserGraph(familyMembers);

        List<Relations> allRelations = relationRepository.findAllBySourcesInAndTargetIn(familyMembers, familyMembers);

        Set<String> familyMemberUsernames = familyMembers.stream().map(Users::getUsername).collect(Collectors.toSet());

        for (Relations rel : allRelations) { // Itérer sur toutes les relations
            String sourceUsername = rel.getSources().getUsername();
            String targetUsername = rel.getTarget().getUsername();

            // S'assurer que les deux membres de la relation sont dans la famille concernée
            if (familyMemberUsernames.contains(sourceUsername) && familyMemberUsernames.contains(targetUsername)) {
                UserGraphBuilder sourceNode = userGraph.get(sourceUsername);
                UserGraphBuilder targetNode = userGraph.get(targetUsername);

                if (sourceNode == null || targetNode == null) continue;

                if (rel.getPoid() == 1) { // Parent-enfant
                    sourceNode.getChildrenUsername().add(targetUsername); // Utilise username du voisin
                    targetNode.getParentUsername().add(sourceUsername); // Utilise username du voisin
                } else if (rel.getPoid() == 0) { // Conjoint/Partenaire
                    sourceNode.getPartnerUsername().add(targetUsername); // Utilise username du voisin
                    targetNode.getPartnerUsername().add(sourceUsername); // Utilise username du voisin
                }
            }
        }

        // 2. Implémentation de l'algorithme de Dijkstra
        Map<String, Integer> distances = new HashMap<>(); // Clé est String (username)
        Map<String, String> previousNodes = new HashMap<>(); // Clé est String (username), Valeur est String (username)
        PriorityQueue<NodeDistance> priorityQueue = new PriorityQueue<>(Comparator.comparingInt(nd -> nd.distance));

        // Initialisation
        for (String username : userGraph.keySet()) { // Parcourir les usernames
            distances.put(username, Integer.MAX_VALUE);
        }
        distances.put(userSource.getUsername(), 0); // Utilise username de la source
        priorityQueue.offer(new NodeDistance(userSource.getUsername(), 0)); // Utilise username de la source

        String foundTargetUsername = null; // Cible trouvée par username

        while (!priorityQueue.isEmpty()) {
            NodeDistance current = priorityQueue.poll();
            String currentUsername = current.nodeId; // NodeDistance stocke maintenant un String
            int currentDistance = current.distance;

            if (currentDistance > distances.get(currentUsername)) {
                continue;
            }

            if (currentUsername.equals(userTarget.getUsername())) { // Comparaison par username
                foundTargetUsername = currentUsername;
                break; // Chemin trouvé !
            }

            UserGraphBuilder currentNode = userGraph.get(currentUsername);
            if (currentNode == null) continue;

            // Obtenir tous les voisins (parents, enfants, partenaires) par username
            Set<String> neighbors = new HashSet<>();
            neighbors.addAll(currentNode.getParentUsername());
            neighbors.addAll(currentNode.getChildrenUsername());
            neighbors.addAll(currentNode.getPartnerUsername());

            for (String neighborUsername : neighbors) {
                int newDistance = currentDistance + 1; // Coût de 1 pour chaque relation

                if (newDistance < distances.getOrDefault(neighborUsername, Integer.MAX_VALUE)) {
                    distances.put(neighborUsername, newDistance);
                    previousNodes.put(neighborUsername, currentUsername); // Enregistrer le chemin
                    priorityQueue.offer(new NodeDistance(neighborUsername, newDistance));
                }
            }
        }

        // 3. Reconstruction et formatage du chemin
        if (foundTargetUsername == null) {
            return Collections.emptyList(); // Pas de chemin trouvé
        }

        List<String> pathUsernames = new ArrayList<>(); // Liste d'usernames pour le chemin
        String currentPathUsername = foundTargetUsername;
        while (currentPathUsername != null) {
            pathUsernames.add(currentPathUsername);
            currentPathUsername = previousNodes.get(currentPathUsername);
        }
        Collections.reverse(pathUsernames); // Inverser pour avoir source -> cible

        // Convertir les usernames du chemin en TreeNodeDTOs
        return pathUsernames.stream()
                .map(username -> buildNodeFromUser(userGraph.get(username).getUser()))
                .collect(Collectors.toList());
    }

    // --- Fin de la méthode findShortestPathWithDijkstra ---


    private Map<String, UserGraphBuilder> buildUserGraph(List<Users> familyMembers) {
        Map<String, UserGraphBuilder> userGraph = new HashMap<>();
        familyMembers.forEach(member -> userGraph.put(member.getUsername(), new UserGraphBuilder(member))); // Clé est username
        return userGraph;
    }

    private TreeNodeDTO buildNodeFromUser(Users user) {
        return TreeNodeDTO.builder()
                .id(user.getId())
                .name(user.getFirstName() + " " + user.getLastName()) // Utilise nom complet
                .username(user.getUsername())
                .childrens(Collections.emptyList())
                .partners(Collections.emptyList())
                .build();
    }

    // Classe interne pour la priorité de Dijkstra, maintenant avec String pour l'username
    private static class NodeDistance {
        String nodeId; // Changé de UUID à String (username)
        int distance;

        public NodeDistance(String nodeId, int distance) {
            this.nodeId = nodeId;
            this.distance = distance;
        }
    }
}


