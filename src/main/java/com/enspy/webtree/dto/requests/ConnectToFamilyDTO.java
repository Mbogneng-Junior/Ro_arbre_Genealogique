package com.enspy.webtree.dto.requests;

import lombok.*;

import java.util.UUID;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ConnectToFamilyDTO {
    private String username;
    private UUID familyId;
}
