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


    // ========================================================================
    // ALGORITHME DE BELLMAN-FORD
    // ========================================================================

    /**
     * Implémentation de l'algorithme de Bellman-Ford pour détecter les cycles
     * et trouver les chemins les plus courts avec poids négatifs
     */
    @Transactional(readOnly = true)
    public ApiResponse bellmanFord(UUID familyId, String sourceUsername) {
        ApiResponse response = new ApiResponse();

        try {
            Family family = familyRepository.findById(familyId)
                    .orElseThrow(() -> new NoSuchElementException("Famille non trouvée"));

            List<Users> familyMembers = family.getMembers();
            List<Relations> allRelations = relationRepository
                    .findAllBySourcesInAndTargetIn(familyMembers, familyMembers);

            // Initialisation
            Map<String, Integer> distances = new HashMap<>();
            Map<String, String> predecessors = new HashMap<>();

            for (Users user : familyMembers) {
                distances.put(user.getUsername(), Integer.MAX_VALUE);
            }
            distances.put(sourceUsername, 0);

            // Relaxation des arêtes (V-1) fois
            for (int i = 0; i < familyMembers.size() - 1; i++) {
                for (Relations relation : allRelations) {
                    String sourceUser = relation.getSources().getUsername();
                    String targetUser = relation.getTarget().getUsername();
                    int weight = relation.getPoid();

                    if (distances.get(sourceUser) != Integer.MAX_VALUE &&
                            distances.get(sourceUser) + weight < distances.get(targetUser)) {
                        distances.put(targetUser, distances.get(sourceUser) + weight);
                        predecessors.put(targetUser, sourceUser);
                    }
                }
            }

            // Détection de cycles négatifs
            boolean hasNegativeCycle = false;
            for (Relations relation : allRelations) {
                String sourceUser = relation.getSources().getUsername();
                String targetUser = relation.getTarget().getUsername();
                int weight = relation.getPoid();

                if (distances.get(sourceUser) != Integer.MAX_VALUE &&
                        distances.get(sourceUser) + weight < distances.get(targetUser)) {
                    hasNegativeCycle = true;
                    break;
                }
            }

            Map<String, Object> result = new HashMap<>();
            result.put("distances", distances);
            result.put("predecessors", predecessors);
            result.put("hasNegativeCycle", hasNegativeCycle);
            result.put("sourceUsername", sourceUsername);

            response.setData(result);
            response.setText("Algorithme Bellman-Ford exécuté avec succès");
            response.setValue("200");

        } catch (Exception e) {
            response.setText("Erreur lors de l'exécution de Bellman-Ford: " + e.getMessage());
            response.setValue("500");
        }

        return response;
    }

    // ========================================================================
    // ALGORITHME DE PRIM
    // ========================================================================

    /**
     * Implémentation de l'algorithme de Prim pour trouver l'arbre couvrant minimal
     */
    @Transactional(readOnly = true)
    public ApiResponse primMST(UUID familyId) {
        ApiResponse response = new ApiResponse();

        try {
            Family family = familyRepository.findById(familyId)
                    .orElseThrow(() -> new NoSuchElementException("Famille non trouvée"));

            List<Users> familyMembers = family.getMembers();
            List<Relations> allRelations = relationRepository
                    .findAllBySourcesInAndTargetIn(familyMembers, familyMembers);

            if (familyMembers.isEmpty()) {
                response.setText("Aucun membre dans la famille");
                response.setValue("404");
                return response;
            }

            // Structure pour l'algorithme de Prim
            Set<String> visited = new HashSet<>();
            List<Edge> mstEdges = new ArrayList<>();
            PriorityQueue<Edge> priorityQueue = new PriorityQueue<>(
                    Comparator.comparingInt(e -> e.weight)
            );

            // Commencer avec le premier membre
            String startVertex = familyMembers.get(0).getUsername();
            visited.add(startVertex);

            // Ajouter toutes les arêtes du sommet de départ
            addEdgesToQueue(startVertex, allRelations, priorityQueue, visited);

            while (!priorityQueue.isEmpty() && visited.size() < familyMembers.size()) {
                Edge minEdge = priorityQueue.poll();

                if (visited.contains(minEdge.target)) {
                    continue; // Éviter les cycles
                }

                // Ajouter l'arête à l'MST
                mstEdges.add(minEdge);
                visited.add(minEdge.target);

                // Ajouter les nouvelles arêtes
                addEdgesToQueue(minEdge.target, allRelations, priorityQueue, visited);
            }

            // Calculer le poids total
            int totalWeight = mstEdges.stream().mapToInt(e -> e.weight).sum();

            Map<String, Object> result = new HashMap<>();
            result.put("mstEdges", mstEdges);
            result.put("totalWeight", totalWeight);
            result.put("numberOfVertices", visited.size());
            result.put("isConnected", visited.size() == familyMembers.size());

            response.setData(result);
            response.setText("Arbre couvrant minimal calculé avec succès");
            response.setValue("200");

        } catch (Exception e) {
            response.setText("Erreur lors du calcul de l'MST: " + e.getMessage());
            response.setValue("500");
        }

        return response;
    }

    // ========================================================================
    // ALGORITHME DE KRUSKAL
    // ========================================================================

    /**
     * Implémentation de l'algorithme de Kruskal pour partitionner en sous-familles
     */
    @Transactional(readOnly = true)
    public ApiResponse kruskalMST(UUID familyId) {
        ApiResponse response = new ApiResponse();

        try {
            Family family = familyRepository.findById(familyId)
                    .orElseThrow(() -> new NoSuchElementException("Famille non trouvée"));

            List<Users> familyMembers = family.getMembers();
            List<Relations> allRelations = relationRepository
                    .findAllBySourcesInAndTargetIn(familyMembers, familyMembers);

            // Convertir en liste d'arêtes
            List<Edge> edges = allRelations.stream()
                    .map(relation -> new Edge(
                            relation.getSources().getUsername(),
                            relation.getTarget().getUsername(),
                            relation.getPoid()
                    ))
                    .sorted(Comparator.comparingInt(e -> e.weight))
                    .collect(Collectors.toList());

            // Structure Union-Find
            UnionFind unionFind = new UnionFind(familyMembers);
            List<Edge> mstEdges = new ArrayList<>();

            for (Edge edge : edges) {
                if (unionFind.find(edge.source) != unionFind.find(edge.target)) {
                    unionFind.union(edge.source, edge.target);
                    mstEdges.add(edge);
                }
            }

            // Identifier les composantes connexes (sous-familles)
            Map<String, List<String>> subFamilies = unionFind.getComponents();

            Map<String, Object> result = new HashMap<>();
            result.put("mstEdges", mstEdges);
            result.put("subFamilies", subFamilies);
            result.put("numberOfSubFamilies", subFamilies.size());
            result.put("totalWeight", mstEdges.stream().mapToInt(e -> e.weight).sum());

            response.setData(result);
            response.setText("Partitionnement en sous-familles réalisé avec succès");
            response.setValue("200");

        } catch (Exception e) {
            response.setText("Erreur lors du partitionnement: " + e.getMessage());
            response.setValue("500");
        }

        return response;
    }

    // ========================================================================
    // CLASSES UTILITAIRES
    // ========================================================================

    private void addEdgesToQueue(String vertex, List<Relations> relations,
                                 PriorityQueue<Edge> queue, Set<String> visited) {
        for (Relations relation : relations) {
            if (relation.getSources().getUsername().equals(vertex)) {
                String target = relation.getTarget().getUsername();
                if (!visited.contains(target)) {
                    queue.offer(new Edge(vertex, target, relation.getPoid()));
                }
            }
        }
    }

    /**
     * Classe représentant une arête
     */
    public static class Edge {
        public String source;
        public String target;
        public int weight;

        public Edge(String source, String target, int weight) {
            this.source = source;
            this.target = target;
            this.weight = weight;
        }

        @Override
        public String toString() {
            return String.format("(%s -> %s, poids: %d)", source, target, weight);
        }
    }

    /**
     * Structure Union-Find pour l'algorithme de Kruskal
     */
    public static class UnionFind {
        private Map<String, String> parent;
        private Map<String, Integer> rank;

        public UnionFind(List<Users> vertices) {
            parent = new HashMap<>();
            rank = new HashMap<>();

            for (Users user : vertices) {
                parent.put(user.getUsername(), user.getUsername());
                rank.put(user.getUsername(), 0);
            }
        }

        public String find(String vertex) {
            if (!parent.get(vertex).equals(vertex)) {
                parent.put(vertex, find(parent.get(vertex))); // Compression de chemin
            }
            return parent.get(vertex);
        }

        public void union(String vertex1, String vertex2) {
            String root1 = find(vertex1);
            String root2 = find(vertex2);

            if (!root1.equals(root2)) {
                // Union par rang
                if (rank.get(root1) < rank.get(root2)) {
                    parent.put(root1, root2);
                } else if (rank.get(root1) > rank.get(root2)) {
                    parent.put(root2, root1);
                } else {
                    parent.put(root2, root1);
                    rank.put(root1, rank.get(root1) + 1);
                }
            }
        }

        public Map<String, List<String>> getComponents() {
            Map<String, List<String>> components = new HashMap<>();

            for (String vertex : parent.keySet()) {
                String root = find(vertex);
                components.computeIfAbsent(root, k -> new ArrayList<>()).add(vertex);
            }

            return components;
        }
    }
}


