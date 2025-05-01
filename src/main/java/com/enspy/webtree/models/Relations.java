package com.enspy.webtree.models;


import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
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


    @ManyToOne @JoinColumn(name = "target_id")
    private Users target;

    @ManyToOne @JoinColumn(name = "source_id")
    private Users sources;
    private int poid;


}
