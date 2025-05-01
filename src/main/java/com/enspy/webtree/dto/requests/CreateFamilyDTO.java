package com.enspy.webtree.dto.requests;

import com.enspy.webtree.models.Relations;
import lombok.*;

import java.util.List;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CreateFamilyDTO {
    private String familyName;
    private String username;
    private List<CreateRelationDTO> familyMembers;
}
