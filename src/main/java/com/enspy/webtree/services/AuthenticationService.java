package com.enspy.webtree.services;


import com.enspy.webtree.dto.responses.ApiResponse;
import com.enspy.webtree.repositories.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class AuthenticationService {

    public AuthenticationService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    private UserRepository userRepository;

    public ApiResponse createUser(){
        return null;
    }

}
