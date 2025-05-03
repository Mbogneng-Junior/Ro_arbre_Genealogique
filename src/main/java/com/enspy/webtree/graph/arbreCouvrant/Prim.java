package com.enspy.webtree.graph.arbreCouvrant;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.PriorityQueue;

import com.enspy.webtree.graph.Edge;
import com.enspy.webtree.graph.GraphBuilder;


import java.util.Set;
import java.util.UUID;

public class Prim {
  
    
    

    public Set<Edge> findMST(Map<UUID, List<GraphBuilder.Neighbor>> graph, UUID start) {
        Set<UUID> visited = new HashSet<>();
        PriorityQueue<Edge> minHeap = new PriorityQueue<>();
        Set<Edge> mst = new HashSet<>();

        visited.add(start);
        for (GraphBuilder.Neighbor neighbor : graph.get(start)) {
            minHeap.add(new Edge(start, neighbor.id, neighbor.weight));
        }

        while (!minHeap.isEmpty()) {
            Edge edge = minHeap.poll();
            if (visited.contains(edge.to)) continue;

            visited.add(edge.to);
            mst.add(edge);

            for (GraphBuilder.Neighbor neighbor : graph.get(edge.to)) {
                if (!visited.contains(neighbor.id)) {
                    minHeap.add(new Edge(edge.to, neighbor.id, neighbor.weight));
                }
            }
        }

        return mst;
    }
}

