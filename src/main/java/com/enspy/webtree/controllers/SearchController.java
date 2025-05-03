package com.enspy.webtree.controllers;

import com.enspy.webtree.graph.GraphBuilder;
import com.enspy.webtree.graph.CheminMinimal.BellmanFordSolver;
import com.enspy.webtree.graph.CheminMinimal.DijkstraSolver;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/search")
public class SearchController {

    @Autowired
    private DijkstraSolver dijkstraSolver;

    @Autowired
    private BellmanFordSolver bellmanFordSolver;

    @Autowired
    private GraphBuilder graphBuilder;

    @GetMapping("/dijkstra")
    public Map<String, Object> searchWithDijkstra(
            @RequestParam UUID sourceId,
            @RequestParam UUID targetId
    ) {
        Map<UUID, List<GraphBuilder.Neighbor>> graph = graphBuilder.buildGraph();
        List<UUID> path = dijkstraSolver.findShortestPath(sourceId, targetId, graph);
        return buildResponse("dijkstra", sourceId, targetId, path);
    }

    @GetMapping("/bellman-ford")
    public Map<String, Object> searchWithBellmanFord(
            @RequestParam UUID sourceId,
            @RequestParam UUID targetId
    ) {
        Map<UUID, List<GraphBuilder.Neighbor>> graph = graphBuilder.buildGraph();
        List<UUID> path = bellmanFordSolver.findShortestPath(sourceId, targetId, graph); // Passer le graphe ici
        return buildResponse("bellman-ford", sourceId, targetId, path);
    }

    private Map<String, Object> buildResponse(String algorithm, UUID sourceId, UUID targetId, List<UUID> path) {
        Map<String, Object> response = new HashMap<>();
        response.put("algorithm", algorithm);
        response.put("source", sourceId);
        response.put("target", targetId);
        response.put("path", path);
        response.put("found", !path.isEmpty());
        return response;
    }
}
