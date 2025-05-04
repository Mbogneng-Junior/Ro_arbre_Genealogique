package com.enspy.webtree.controllers;


import com.enspy.webtree.dto.requests.ConnectToFamilyDTO;
import com.enspy.webtree.dto.requests.CreateUserDto;
import com.enspy.webtree.dto.requests.LoginDTO;
import com.enspy.webtree.dto.responses.ApiResponse;
import com.enspy.webtree.services.AuthenticationService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@AllArgsConstructor
public class AuthenticationController {
    private AuthenticationService authenticationService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse> register( CreateUserDto createUserDto,  MultipartFile[] profile) {
        ApiResponse response = this.authenticationService.createUser(createUserDto, profile);
        return new ResponseEntity<>(response, HttpStatusCode.valueOf(Integer.parseInt(response.getValue())));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse> login(@RequestBody LoginDTO loginDTO) {
        ApiResponse response = this.authenticationService.login(loginDTO);
        return new ResponseEntity<>(response, HttpStatusCode.valueOf(Integer.parseInt(response.getValue())));
    }

    @PostMapping("/connect_to_family")
    public ResponseEntity<ApiResponse> connectToFamily(@RequestBody ConnectToFamilyDTO connect) {
        ApiResponse response = this.authenticationService.connectToFamily(connect);
        return new ResponseEntity<>(response, HttpStatusCode.valueOf(Integer.parseInt(response.getValue())));
    }


}
