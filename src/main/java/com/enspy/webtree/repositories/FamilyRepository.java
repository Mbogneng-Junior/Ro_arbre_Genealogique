package com.enspy.webtree.repositories;

import com.enspy.webtree.models.Family;
import com.enspy.webtree.models.Users;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface FamilyRepository extends JpaRepository<Family, UUID> {
    Optional<Family> findById(UUID id);
}
