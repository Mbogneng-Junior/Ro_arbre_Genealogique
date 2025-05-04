package com.enspy.webtree.graph.arbreCouvrant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;

import com.enspy.webtree.graph.Edge;
import com.enspy.webtree.graph.GraphBuilder;
   
import java.util.Set;
import java.util.UUID;


public class Kruskal {


    

    private static class UnionFind {
        private final Map<UUID, UUID> parent = new HashMap<>();

        public UUID find(UUID node) {
            if (!parent.containsKey(node)) parent.put(node, node);
            if (!node.equals(parent.get(node))) {
                parent.put(node, find(parent.get(node)));
            }
            return parent.get(node);
        }

        public boolean union(UUID u, UUID v) {
            UUID rootU = find(u);
            UUID rootV = find(v);
            if (rootU.equals(rootV)) return false;
            parent.put(rootU, rootV);
            return true;
        }
    }

    public Set<Edge> findMST(Map<UUID, List<GraphBuilder.Neighbor>> graph) {
        List<Edge> allEdges = new ArrayList<>();
        for (UUID from : graph.keySet()) {
            for (GraphBuilder.Neighbor neighbor : graph.get(from)) {
                allEdges.add(new Edge(from, neighbor.id, neighbor.weight));
            }
        }

        Collections.sort(allEdges);

        Set<Edge> mst = new HashSet<>();
        UnionFind uf = new UnionFind();

        for (Edge edge : allEdges) {
            if (uf.union(edge.from, edge.to)) {
                mst.add(edge);
            }
        }

        return mst;
    }
}
