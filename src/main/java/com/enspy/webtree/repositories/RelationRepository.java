package com.enspy.webtree.repositories;

import com.enspy.webtree.models.Family;
import com.enspy.webtree.models.Relations;
import com.enspy.webtree.models.Users;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface RelationRepository extends JpaRepository<Relations, UUID> {

    List<Relations> findAllBySourcesInAndTargetIn(List<Users> sources, List<Users> targets);
}
