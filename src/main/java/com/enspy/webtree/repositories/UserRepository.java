package com.enspy.webtree.repositories;

import com.enspy.webtree.models.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.security.core.userdetails.User;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<Users, UUID> {
    Optional<Users> findById(UUID id);
    Optional<Users> findByUsername(String username);
}
