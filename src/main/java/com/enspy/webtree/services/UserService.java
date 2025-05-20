package com.enspy.webtree.services;

import com.enspy.webtree.dto.responses.ApiResponse;
import com.enspy.webtree.models.Family;
import com.enspy.webtree.models.Users;
import com.enspy.webtree.repositories.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.*;


@Service
public class UserService implements UserDetailsService {

    private UserRepository userRepository;
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return userRepository.findByUsername(username).get();
    }

    public ApiResponse getUserFamilies(String username) {
        ApiResponse response = new ApiResponse();
        try {
            Optional<Users> userOpt = userRepository.findByUsername(username);
            if (userOpt.isEmpty()) {
                response.setText("invalid username");
                response.setValue("404");
                return response;
            }

            Users user = userOpt.get();
            List<Family> families = user.getFamilies();


            Map<String, Map<String, String>> familyList = new HashMap<>();

            int count = 1;
            for (Family family : families) {
                
                Map<String, String> familyMap = new HashMap<>();
                familyMap.put("id", family.getId().toString());
                familyMap.put("familyName", family.getFamilyName());
                familyMap.put("numberOfMembers", String.valueOf(family.getMemberCount()));

                familyList.put("family" + count, familyMap);
                count++;
            }


            response.setData(familyList);
            response.setText("success");
            response.setValue("200");
            return response;

        } catch (Exception e) {
            response.setText("an error occurred: " + e.getMessage());
            response.setValue("500");
            return response;
        }
    }





}
