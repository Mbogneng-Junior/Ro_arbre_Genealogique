package com.enspy.webtree.graph;

import java.util.UUID;




public class Edge implements Comparable<Edge> {
    public UUID from;
    public UUID to;
    public int weight;

    public Edge(UUID from, UUID to, int weight) {
        this.from = from;
        this.to = to;
        this.weight = weight;
    }

    @Override
    public int compareTo(Edge other) {
        return Integer.compare(this.weight, other.weight);
    }
}
