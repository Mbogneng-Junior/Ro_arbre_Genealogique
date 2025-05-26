package com.enspy.webtree.controllers;


import com.enspy.webtree.dto.requests.CreateFamilyDTO;
import com.enspy.webtree.dto.requests.CreateRelationDTO;
import com.enspy.webtree.dto.requests.CreateUserDto;
import com.enspy.webtree.dto.requests.mostShortRoad;
import com.enspy.webtree.dto.responses.ApiResponse;
import com.enspy.webtree.dto.responses.TreeNodeDTO;
import com.enspy.webtree.services.FamilyService;
import com.enspy.webtree.services.GraphLogicServices;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@AllArgsConstructor
public class FamilyController {
    private FamilyService familyService;
    private GraphLogicServices graphLogicServices;

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

    @GetMapping("/tree/{familyId}")
    public ResponseEntity<ApiResponse> addMember(@PathVariable UUID familyId) {
        ApiResponse response = this.graphLogicServices.familyTree(familyId);
        return new ResponseEntity<>(response, HttpStatusCode.valueOf(Integer.parseInt(response.getValue())));
    }

    @GetMapping("/find_path")
    public ResponseEntity<ApiResponse> addMember(@RequestBody mostShortRoad mostShortRoad) {
        List<TreeNodeDTO> tree = this.graphLogicServices.findPathDijkstra(mostShortRoad.getFamilyId(), mostShortRoad.getUsernameSource(), mostShortRoad.getUsernameTarget());
        ApiResponse response = ApiResponse.builder().text("success").value("200").data(tree).build();
        return new ResponseEntity<>(response, HttpStatusCode.valueOf(Integer.parseInt(response.getValue())));
    }
}
