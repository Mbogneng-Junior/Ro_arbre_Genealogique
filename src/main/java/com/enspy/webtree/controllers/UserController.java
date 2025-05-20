package com.enspy.webtree.controllers;


import com.enspy.webtree.dto.requests.CreateUserDto;
import com.enspy.webtree.dto.requests.GetUserInfo;
import com.enspy.webtree.dto.responses.ApiResponse;
import com.enspy.webtree.services.AuthenticationService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@AllArgsConstructor
public class UserController {

    private AuthenticationService authenticationService;

    @PostMapping("/getUserInfo")
    public ResponseEntity<ApiResponse> getUserInfo(@RequestBody GetUserInfo userInfoDto) {
        ApiResponse response = this.authenticationService.getUserInfo(userInfoDto.getUsername());
        return new ResponseEntity<>(response, HttpStatusCode.valueOf(Integer.parseInt(response.getValue())));
    }
}
