package com.enspy.webtree.controllers;


import com.enspy.webtree.dto.requests.*;
import com.enspy.webtree.dto.responses.ApiResponse;
import com.enspy.webtree.dto.responses.TreeNodeDTO;
import com.enspy.webtree.services.FamilyService;
import com.enspy.webtree.services.GraphLogicServices;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
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


    /**
     * Endpoint pour l'algorithme de Bellman-Ford
     * Détecte les cycles et trouve les chemins avec poids négatifs
     */
    @PostMapping("/bellman-ford/{familyId}")
    public ResponseEntity<ApiResponse> bellmanFord(
            @PathVariable UUID familyId,
            @RequestBody AlgorithmRequestDTO request) {

        ApiResponse response = graphLogicServices.bellmanFord(
                familyId,
                request.getSourceUsername()
        );

        return new ResponseEntity<>(
                response,
                HttpStatusCode.valueOf(Integer.parseInt(response.getValue()))
        );
    }

    /**
     * Endpoint pour l'algorithme de Prim
     * Trouve l'arbre couvrant minimal
     */
    @GetMapping("/prim/{familyId}")
    public ResponseEntity<ApiResponse> primMST(@PathVariable UUID familyId) {

        ApiResponse response = graphLogicServices.primMST(familyId);

        return new ResponseEntity<>(
                response,
                HttpStatusCode.valueOf(Integer.parseInt(response.getValue()))
        );
    }

    /**
     * Endpoint pour l'algorithme de Kruskal
     * Partitionne la famille en sous-groupes
     */
    @GetMapping("/kruskal/{familyId}")
    public ResponseEntity<ApiResponse> kruskalMST(@PathVariable UUID familyId) {

        ApiResponse response = graphLogicServices.kruskalMST(familyId);

        return new ResponseEntity<>(
                response,
                HttpStatusCode.valueOf(Integer.parseInt(response.getValue()))
        );
    }

    /**
     * Endpoint pour comparer tous les algorithmes
     * Exécute tous les algorithmes et compare les résultats
     */
    @PostMapping("/compare/{familyId}")
    public ResponseEntity<ApiResponse> compareAlgorithms(
            @PathVariable UUID familyId,
            @RequestBody AlgorithmRequestDTO request) {

        List<TreeNodeDTO> dijkstraResult = graphLogicServices.findPathDijkstra(
                familyId,
                request.getSourceUsername(),
                request.getTargetUsername()
        );


        ApiResponse bellmanResult = graphLogicServices.bellmanFord(
                familyId,
                request.getSourceUsername()
        );

        ApiResponse primResult = graphLogicServices.primMST(familyId);
        ApiResponse kruskalResult = graphLogicServices.kruskalMST(familyId);

        // Créer une réponse comparative
        Map<String, Object> comparison = new HashMap<>();
        comparison.put("dijkstra", dijkstraResult);
        comparison.put("bellmanFord", bellmanResult.getData());
        comparison.put("prim", primResult.getData());
        comparison.put("kruskal", kruskalResult.getData());
        comparison.put("executionTime", System.currentTimeMillis());

        ApiResponse response = ApiResponse.builder()
                .text("Comparaison des algorithmes terminée")
                .value("200")
                .data(comparison)
                .build();

        return new ResponseEntity<>(response, HttpStatusCode.valueOf(200));
    }

    /**
     * Endpoint pour l'analyse de performance
     * Compare les temps d'exécution des différents algorithmes
     */
    @PostMapping("/performance/{familyId}")
    public ResponseEntity<ApiResponse> performanceAnalysis(
            @PathVariable UUID familyId,
            @RequestBody AlgorithmRequestDTO request) {

        Map<String, Object> performanceResults = new HashMap<>();

        // Test Dijkstra
        long startTime = System.nanoTime();
        List<TreeNodeDTO> dijkstraResult = graphLogicServices.findPathDijkstra(
                familyId, request.getSourceUsername(), request.getTargetUsername()
        );
        long dijkstraTime = System.nanoTime() - startTime;

        // Test Bellman-Ford
        startTime = System.nanoTime();
        ApiResponse bellmanResult = graphLogicServices.bellmanFord(
                familyId, request.getSourceUsername()
        );
        long bellmanTime = System.nanoTime() - startTime;

        // Test Prim
        startTime = System.nanoTime();
        ApiResponse primResult = graphLogicServices.primMST(familyId);
        long primTime = System.nanoTime() - startTime;

        // Test Kruskal
        startTime = System.nanoTime();
        ApiResponse kruskalResult = graphLogicServices.kruskalMST(familyId);
        long kruskalTime = System.nanoTime() - startTime;

        performanceResults.put("dijkstraTime", dijkstraTime / 1_000_000.0); // ms
        performanceResults.put("bellmanTime", bellmanTime / 1_000_000.0);
        performanceResults.put("primTime", primTime / 1_000_000.0);
        performanceResults.put("kruskalTime", kruskalTime / 1_000_000.0);
        performanceResults.put("results", Map.of(
                "dijkstra", dijkstraResult,
                "bellman", bellmanResult.getData(),
                "prim", primResult.getData(),
                "kruskal", kruskalResult.getData()
        ));

        ApiResponse response = ApiResponse.builder()
                .text("Analyse de performance terminée")
                .value("200")
                .data(performanceResults)
                .build();

        return new ResponseEntity<>(response, HttpStatusCode.valueOf(200));
    }
}
