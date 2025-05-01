package com.enspy.webtree.dto.requests;

import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CreateRelationDTO {
    private String sourceUsername;
    private String targetUsername;
    private int poid;
}
