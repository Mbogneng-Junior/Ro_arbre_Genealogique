/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.enspy.webtree.controllers;

import lombok.AllArgsConstructor;
import com.enspy.webtree.models.Users;
import java.security.Principal;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 *
 * @author Roddier
 */
@RestController
@AllArgsConstructor
public class UserController {
    @PostMapping("/user")
    public ResponseEntity<Users> getUser(Principal user) {
        return ResponseEntity.ok((Users) user);
    }
}
