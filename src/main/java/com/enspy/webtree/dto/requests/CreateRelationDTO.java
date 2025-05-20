package com.enspy.webtree.dto.requests;

import lombok.*;

import java.util.UUID;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CreateRelationDTO {
    private String sourceUsername;
    private CreateUserDto targetUser; // Optionnel si targetUsername est fourni
    private int poid;
    private String targetUsername; // Optionnel si targetUser est fourni
    private UUID familyId;
}
