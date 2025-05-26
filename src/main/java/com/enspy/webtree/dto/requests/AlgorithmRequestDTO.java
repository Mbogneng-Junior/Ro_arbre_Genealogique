package com.enspy.webtree.dto.requests;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AlgorithmRequestDTO {
    private String sourceUsername;
    private String targetUsername;
    private String algorithmType; // "dijkstra", "bellman", "prim", "kruskal"
    private Boolean includePerformance = false;
}
