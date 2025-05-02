package com.enspy.webtree.models;


import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import lombok.*;

@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
public class Family {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private String familyName;

    @JsonManagedReference("members")
    @ManyToMany
    @JoinTable(
            name = "user_family",
            joinColumns = @JoinColumn(name = "family_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private List<Users> members;


    public void addMember(Users user) {
        if (user == null) {
            throw new IllegalArgumentException("L'utilisateur ne peut pas être null");
        }

        if (this.members == null) {
            this.members = new ArrayList<>();
        }

        if (!this.members.contains(user)) {
            this.members.add(user);
        }

        List<Family> familiesOfUser = user.getFamilies();
        if (familiesOfUser == null) {
            familiesOfUser = new ArrayList<>();
            user.setFamilies(familiesOfUser);
        }
        if (!familiesOfUser.contains(this)) {
            familiesOfUser.add(this);
        }
    }
}
