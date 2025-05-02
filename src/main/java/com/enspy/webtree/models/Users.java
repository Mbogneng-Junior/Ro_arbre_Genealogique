package com.enspy.webtree.models;


import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
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
    private String FirstName;
    private String LastName;
    private String username;
    
    private String password;



    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collection.emptyList();
    }

    
    public String getPassword() {
        return password;
    }
    
    public void setPassword(String password) {
        this.password = password;
    }

    
    public String getUsername() {
        return username;
    }
    
    public void setFirstName(String firstname) {
        this.FirstName = firstname;
    }
    
    public String getFirstName() {
        return FirstName;
    }
    
    public void setLastName(String lastname) {
        this.LastName = lastname;
    }
    
    public String getLastName() {
        return LastName;
    }
    
    public void setUsername(String username) {
        this.username = username;
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
}
