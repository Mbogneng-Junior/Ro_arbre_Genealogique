package com.enspy.webtree.controllers;


import com.enspy.webtree.dto.requests.CreateFamilyDTO;
import com.enspy.webtree.dto.requests.CreateRelationDTO;
import com.enspy.webtree.dto.requests.CreateUserDto;
import com.enspy.webtree.dto.responses.ApiResponse;
import com.enspy.webtree.services.FamilyService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@AllArgsConstructor
public class FamilyController {
    private FamilyService familyService;

    @PostMapping("/create_family")
    public ResponseEntity<ApiResponse> register(@RequestBody CreateFamilyDTO createFamilyDTO) {
        ApiResponse response = this.familyService.createFamily(createFamilyDTO);
        return new ResponseEntity<>(response, HttpStatusCode.valueOf(Integer.parseInt(response.getValue())));
    }

    @PostMapping("/add_member")
    public ResponseEntity<ApiResponse> addMember(@RequestBody CreateRelationDTO createRelationDTO) {
        ApiResponse response = this.familyService.addMember(createRelationDTO);
        return new ResponseEntity<>(response, HttpStatusCode.valueOf(Integer.parseInt(response.getValue())));
    }
}
