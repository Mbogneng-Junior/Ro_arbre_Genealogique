package com.enspy.webtree.controllers;


import com.enspy.webtree.models.Users;
import com.enspy.webtree.services.StorageService;
import lombok.AllArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;

@RestController
@AllArgsConstructor
public class UserController {
    private final StorageService storageService;


    @GetMapping("/profile/{username}")
    public ResponseEntity<Resource> serveFile(
            @PathVariable String username
            ) {
        return this.storageService.getFile( username,  "profile");
    }

    @PostMapping("/user")
    public ResponseEntity<Users> getUser(Principal principal) {
        Users user = (Users) principal;  // Casting sans risque
        return ResponseEntity.ok(user);
    }


}
