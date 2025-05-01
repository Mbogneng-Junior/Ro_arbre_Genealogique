package com.enspy.webtree.models;


import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.*;

@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
public class Relations {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    String id;
}
