package com.enspy.webtree.controllers;


import com.enspy.webtree.services.StorageService;
import lombok.AllArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

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
}
