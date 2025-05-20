package com.enspy.webtree.controllers;


import com.enspy.webtree.dto.requests.CreateUserDto;
import com.enspy.webtree.dto.requests.GetUserInfo;
import com.enspy.webtree.dto.responses.ApiResponse;
import com.enspy.webtree.services.AuthenticationService;
import com.enspy.webtree.services.UserService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@AllArgsConstructor
public class UserController {

    private AuthenticationService authenticationService;
    private UserService userService;

    @PostMapping("/getUserInfo")
    public ResponseEntity<ApiResponse> getUserInfo(@RequestBody GetUserInfo userInfoDto) {
        ApiResponse response = this.authenticationService.getUserInfo(userInfoDto.getUsername());
        return new ResponseEntity<>(response, HttpStatusCode.valueOf(Integer.parseInt(response.getValue())));
    }

    @GetMapping("/userFamilies/{username}")
    public ResponseEntity<ApiResponse> getUserFamily(@PathVariable String username) {
        ApiResponse response = this.userService.getUserFamilies(username);
        return new ResponseEntity<>(response, HttpStatusCode.valueOf(Integer.parseInt(response.getValue())));
    }
}
