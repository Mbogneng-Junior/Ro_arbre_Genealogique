package com.enspy.webtree.graph.CheminMinimal;

import com.enspy.webtree.graph.GraphBuilder;
import com.enspy.webtree.graph.GraphBuilder.Neighbor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
public class BellmanFordSolver {

    public List<UUID> findShortestPath(UUID sourceId, UUID targetId, Map<UUID, List<Neighbor>> graph) { // Accepte le graphe en paramètre
        Map<UUID, Integer> distance = new HashMap<>();
        Map<UUID, UUID> predecessor = new HashMap<>();

        // Initialisation
        for (UUID node : graph.keySet()) {
            distance.put(node, Integer.MAX_VALUE);
            predecessor.put(node, null);
        }
        distance.put(sourceId, 0);

        boolean changed = true;

        // Boucle principale de Bellman-Ford amélioré
        while (changed) {
            changed = false;
            for (UUID x : graph.keySet()) {
                for (Neighbor neighbor : graph.get(x)) {
                    UUID y = neighbor.id;
                    int weight = neighbor.weight;

                    if (distance.get(x) != Integer.MAX_VALUE && distance.get(x) + weight < distance.getOrDefault(y, Integer.MAX_VALUE)) {
                        distance.put(y, distance.get(x) + weight);
                        predecessor.put(y, x);
                        changed = true;
                    }
                }
            }
        }

        // Reconstruction du chemin depuis target vers source
        LinkedList<UUID> path = new LinkedList<>();
        UUID current = targetId;
        while (current != null) {
            path.addFirst(current);
            current = predecessor.get(current);
        }

        // Vérification : le chemin commence bien à la source
        if (path.isEmpty() || !path.getFirst().equals(sourceId)) {
            return Collections.emptyList();
        }

        return path;
    }
}
