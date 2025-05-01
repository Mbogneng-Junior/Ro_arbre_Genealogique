package com.enspy.webtree.services;

import com.enspy.webtree.dto.requests.CreateFamilyDTO;
import com.enspy.webtree.dto.requests.CreateRelationDTO;
import com.enspy.webtree.dto.responses.ApiResponse;
import com.enspy.webtree.models.Family;
import com.enspy.webtree.models.Relations;
import com.enspy.webtree.models.Users;
import com.enspy.webtree.repositories.FamilyRepository;
import com.enspy.webtree.repositories.RelationRepository;
import com.enspy.webtree.repositories.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import javax.management.relation.Relation;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class FamilyService {

    public FamilyService(UserRepository userRepository,
                         FamilyRepository familyRepository,
                         RelationRepository relationRepository) {
        this.userRepository = userRepository;
        this.familyRepository = familyRepository;
        this.relationRepository = relationRepository;
    }

    private UserRepository userRepository;
    private RelationRepository relationRepository;
    private FamilyRepository familyRepository;


    public ApiResponse createFamily(CreateFamilyDTO createFamilyDTO) {
        ApiResponse response = new ApiResponse();
        Optional<Users> userOpt = userRepository.findByUsername(createFamilyDTO.getUsername());
        if(userOpt.isEmpty()){
            response.setText("Invalid username");
            response.setValue("404");
            return response;
        }
        Users user = userOpt.get();
        try {
            Family family = new Family();
            family.setFamilyName(createFamilyDTO.getFamilyName());
            family.addMember(user);
            familyRepository.save(family);
            response.setText("Family created successfully");
            response.setValue("200");

            if(createFamilyDTO.getFamilyMembers() != null){
                for (CreateRelationDTO relationDTO : createFamilyDTO.getFamilyMembers()){
                    Relations relation = createRelation(relationDTO);
                    addMemberToFamily(relation, family);
                }
            }
            return response;

        } catch (Exception e){
            response.setText("Error creating family"+ e.getMessage());
            response.setValue("500");
            return response;
        }

    }

    public ApiResponse addMemberToFamily(Relations relations, Family family){
        ApiResponse response = new ApiResponse();
        try {
            Users userSource  = relations.getSources();

            boolean found = false;
            for(Family familySource : userSource.getFamilies()){
                if(familySource.getId().equals(family.getId())){
                    found = true;
                }
            }
            if(!found){
                response.setValue("401");
                response.setText("the User is not member of this family");
                return response;
            }


                relationRepository.save(relations);
                Users targetUser = relations.getTarget();
                family.addMember(targetUser);
                targetUser.addFamily(family);
                userRepository.save(targetUser);

            familyRepository.save(family);

            response.setText("Members added successfully");
            response.setValue("200");
            return response;
        } catch (Exception e){
            response.setText("an error occured :" + e.getMessage());
            response.setValue("500");
            return response;
        }
    }

    public Relations createRelation(CreateRelationDTO createRelation){
        Relations relations = new Relations();
        relations.setPoid(createRelation.getPoid());
        relations.setSources(userRepository.findByUsername(createRelation.getSourceUsername()).orElse(null));
        relations.setTarget(userRepository.findByUsername(createRelation.getTargetUsername()).orElse(null));
        relationRepository.save(relations);
        return relations;
    }
}
