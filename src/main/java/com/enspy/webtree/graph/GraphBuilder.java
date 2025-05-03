package com.enspy.webtree.graph;

import com.enspy.webtree.models.Relations;
import com.enspy.webtree.repositories.RelationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
public class GraphBuilder {

    @Autowired
    private RelationRepository relationsRepository;

    public Map<UUID, List<Neighbor>> buildGraph() {
        List<Relations> relations = relationsRepository.findAll();
        Map<UUID, List<Neighbor>> graph = new HashMap<>();

        for (Relations relation : relations) {
            UUID sourceId = relation.getSources().getId();
            UUID targetId = relation.getTarget().getId();
            int poid = relation.getPoid();

            graph.computeIfAbsent(sourceId, k -> new ArrayList<>()).add(new Neighbor(targetId, poid));
            // graph.computeIfAbsent(targetId, k -> new ArrayList<>()).add(new Neighbor(sourceId, poid)); // Si bidirectionnel
        }

        return graph;
    }

    public static class Neighbor {
        public UUID id;
        public int weight;

        public Neighbor(UUID id, int weight) {
            this.id = id;
            this.weight = weight;
        }
    }
}
