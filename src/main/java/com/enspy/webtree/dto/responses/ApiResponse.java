package com.enspy.webtree.dto.responses;

import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ApiResponse{
    private String text;//La description du resultat
    private Object data;//Donnees de la requette reponse
    private String value;//Le code de retour
}
