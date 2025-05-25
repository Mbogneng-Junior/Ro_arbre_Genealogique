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
}
