package com.enspy.webtree.models;


import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.*;

import java.util.UUID;

@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
public class Relations {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    UUID id;

    private UUID targetId;
    private UUID sourcesId;
    private int poid;


}
