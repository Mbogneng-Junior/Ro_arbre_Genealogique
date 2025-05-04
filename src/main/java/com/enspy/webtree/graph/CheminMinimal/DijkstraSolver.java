package com.enspy.webtree.graph.CheminMinimal;

import org.springframework.stereotype.Component;

import com.enspy.webtree.graph.GraphBuilder;
import com.enspy.webtree.graph.GraphBuilder.Neighbor;

import java.util.*;

@Component
public class DijkstraSolver {

    public List<UUID> findShortestPath(UUID source, UUID target, Map<UUID, List<GraphBuilder.Neighbor>> graph) {
        Map<UUID, Integer> distances = new HashMap<>();
        Map<UUID, UUID> previous = new HashMap<>();
        Set<UUID> visited = new HashSet<>();
        PriorityQueue<UUID> queue = new PriorityQueue<>(Comparator.comparingInt(distances::get));

        for (UUID node : graph.keySet()) {
            distances.put(node, Integer.MAX_VALUE);
        }

        distances.put(source, 0);
        queue.add(source);

        while (!queue.isEmpty()) {
            UUID current = queue.poll();
            if (visited.contains(current)) continue;
            visited.add(current);

            if (!graph.containsKey(current)) continue;

            for (GraphBuilder.Neighbor neighbor : graph.get(current)) {
                if (visited.contains(neighbor.id)) continue;

                int newDist = distances.get(current) + neighbor.weight;
                if (newDist < distances.getOrDefault(neighbor.id, Integer.MAX_VALUE)) {
                    distances.put(neighbor.id, newDist);
                    previous.put(neighbor.id, current);
                    queue.add(neighbor.id);
                }
            }
        }

        // Reconstruct path
        List<UUID> path = new ArrayList<>();
        UUID step = target;
        while (step != null && previous.containsKey(step)) {
            path.add(step);
            step = previous.get(step);
        }
        if (step == source) path.add(source);
        Collections.reverse(path);

        return path.isEmpty() || path.get(0) != source ? List.of() : path;
    }
}
