package com.enspy.webtree.dto.requests;


import lombok.*;

import java.util.UUID;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CreateUserDto {
    private String firstName;
    private String lastName;
    private String email;
    private String password;
    private java.sql.Date dateOfBirth;
    private UUID familyId;
}
