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
    private String targetUsername;
    private int poid;

    private UUID familyId;
}
