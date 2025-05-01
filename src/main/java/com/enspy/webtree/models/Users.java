package com.enspy.webtree.models;


import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
public class Users implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    private String firstName;
    private String lastName;
    private java.sql.Date dateOfBirth;
    private String username;
    private String password;
    private String email;


    @JsonBackReference("members")
    @ManyToMany(mappedBy = "members")
    private List <Family> families =  new ArrayList<>();

    @JsonBackReference("sources")
    @OneToMany()
    private List <Relations> listeAdjacence;



    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return null;
    }

    @Override
    public String getPassword() {
        return null;
    }

    @Override
    public String getUsername() {
        return null;
    }

    @Override
    public boolean isAccountNonExpired() {
        return UserDetails.super.isAccountNonExpired();
    }

    @Override
    public boolean isAccountNonLocked() {
        return UserDetails.super.isAccountNonLocked();
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return UserDetails.super.isCredentialsNonExpired();
    }

    @Override
    public boolean isEnabled() {
        return UserDetails.super.isEnabled();
    }

    public void addFamily(Family family) {
        if (family == null) {
            throw new IllegalArgumentException("La famille ne peut pas être null");
        }

        if (this.families == null) {
            this.families = new ArrayList<>();
        }

        if (!this.families.contains(family)) {
            this.families.add(family);
        }

        List<Users> members = family.getMembers();
        if (members == null) {
            members = new ArrayList<>();
            family.setMembers(members);
        }
        if (!members.contains(this)) {
            members.add(this);
        }
    }

}
