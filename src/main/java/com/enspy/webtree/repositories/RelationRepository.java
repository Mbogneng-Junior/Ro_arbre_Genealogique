package com.enspy.webtree.repositories;

import com.enspy.webtree.models.Family;
import com.enspy.webtree.models.Relations;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface RelationRepository extends JpaRepository<Relations, UUID> {
}
