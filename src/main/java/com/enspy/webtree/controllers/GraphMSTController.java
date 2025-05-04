package com.enspy.webtree.controllers;

import com.enspy.webtree.graph.GraphBuilder;
import com.enspy.webtree.graph.Edge;
import com.enspy.webtree.graph.arbreCouvrant.Prim;
import com.enspy.webtree.graph.arbreCouvrant.Kruskal;

import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/mst")
public class GraphMSTController {

    private final GraphBuilder graphBuilder = new GraphBuilder();
    private final Prim prim = new Prim();
    private final Kruskal kruskal = new Kruskal();

    @GetMapping("/prim")
    public List<Edge> runPrim(@RequestParam UUID sourceId) {
        Map<UUID, List<GraphBuilder.Neighbor>> graph = graphBuilder.buildGraph();
        Set<Edge> mst = prim.findMST(graph, sourceId);
        return new ArrayList<>(mst); // conversion Set -> List
    }

    @GetMapping("/kruskal")
    public List<Edge> runKruskal() {
        Map<UUID, List<GraphBuilder.Neighbor>> graph = graphBuilder.buildGraph();
        Set<Edge> mst = kruskal.findMST(graph);
        return new ArrayList<>(mst); // conversion Set -> List
    }
}
