package com.enspy.webtree.dto.responses;


import com.enspy.webtree.models.Users;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.util.HashSet;
import java.util.Set;

@Data
@Builder
@AllArgsConstructor
public class UserGraphBuilder {
    private Users user;
    private Set<String> childrenUsername = new HashSet<>();
    private Set<String> parentUsername   = new HashSet<>();
    private Set<String> partnerUsername  = new HashSet<>();

    public UserGraphBuilder(Users user) {
        this.user = user;
        this.parentUsername = new HashSet<>();
        this.childrenUsername = new HashSet<>();
        this.partnerUsername  = new HashSet<>();
    }
}
