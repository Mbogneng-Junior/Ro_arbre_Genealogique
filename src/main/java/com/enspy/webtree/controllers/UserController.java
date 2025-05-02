/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */

package com.enspy.webtree.controllers;

import com.enspy.webtree.models.Users;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class UserController {

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@AuthenticationPrincipal Users user) {
        return ResponseEntity.ok().body(
                new UserDTO(user.getId().toString(), user.getUsername(), user.getFirstName(), user.getLastName())
        );
    }

    public record UserDTO(String id, String username, String firstName, String lastName) {}
}
