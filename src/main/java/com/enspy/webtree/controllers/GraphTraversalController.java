package com.enspy.webtree.controllers;

import com.enspy.webtree.graph.parcourt.BFS;
import com.enspy.webtree.graph.parcourt.DFS;
import com.enspy.webtree.graph.GraphBuilder;
import com.enspy.webtree.graph.GraphBuilder.Neighbor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/traversal")
public class GraphTraversalController {

    @Autowired
    private GraphBuilder graphBuilder;

    @Autowired
    private DFS dfs;

    @Autowired
    private BFS bfs;

    // Parcours en profondeur (DFS)
    @GetMapping("/dfs")
    public Map<String, Object> runDFS() {
        Map<UUID, List<Neighbor>> graph = graphBuilder.buildGraph();
        dfs.dfs(graph); // Appel correct avec un seul argument

        Map<String, Object> response = new HashMap<>();
        response.put("parents", dfs.getParents());
        response.put("discoveryTimes", dfs.getDiscoveryTimes());
        response.put("finishingTimes", dfs.getFinishTimes());
        response.put("colors", dfs.getColors());
        return response;
    }

    // Parcours en largeur (BFS)
    @GetMapping("/bfs")
    public Map<String, Object> runBFS(@RequestParam UUID sourceId) {
        Map<UUID, List<Neighbor>> graph = graphBuilder.buildGraph();
        bfs.bfs(graph, sourceId);

        Map<String, Object> response = new HashMap<>();
        response.put("distances", bfs.getDistances());
        response.put("parents", bfs.getParents());
        response.put("colors", bfs.getColors());
        return response;
    }
}
