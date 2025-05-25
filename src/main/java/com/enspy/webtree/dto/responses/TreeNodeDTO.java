package com.enspy.webtree.dto.responses;

import lombok.Builder;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;


@Data
@Builder
public class TreeNodeDTO {
    private UUID id;
    private String name;
    private String username;
    private List<TreeNodeDTO> childrens;
    private List<TreeNodeDTO> partners;
}
