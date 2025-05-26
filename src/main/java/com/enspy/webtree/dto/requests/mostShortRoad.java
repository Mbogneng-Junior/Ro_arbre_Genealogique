package com.enspy.webtree.dto.requests;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;


@Data
@Builder
public class mostShortRoad {
    private String usernameSource;
    private String usernameTarget;
    private UUID familyId;
}
