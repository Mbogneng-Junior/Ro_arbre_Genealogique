package com.enspy.webtree.graph.parcourt;

import java.util.*;

import com.enspy.webtree.graph.GraphBuilder;
import com.enspy.webtree.graph.GraphBuilder.Neighbor;
import org.springframework.stereotype.Component;

@Component
public class DFS {

    private Map<UUID, Integer> d = new HashMap<>(); // Date de découverte
    private Map<UUID, Integer> f = new HashMap<>(); // Date de fin
    private Map<UUID, UUID> p = new HashMap<>(); // Parent de chaque sommet
    private Map<UUID, String> couleur = new HashMap<>(); // Couleur pour marquer l'état de chaque sommet (BLANC, GRIS, NOIR)
    private int date = 0; // Variable pour la gestion des dates

    // Fonction principale pour démarrer le DFS
    public void dfs(Map<UUID, List<GraphBuilder.Neighbor>> graph) {
        for (UUID u : graph.keySet()) {
            // Initialisation
            couleur.put(u, "BLANC");
            p.put(u, null);
        }

        // Parcours de tous les sommets
        for (UUID u : graph.keySet()) {
            if (couleur.get(u).equals("BLANC")) {
                visiter(u, graph);
            }
        }
    }

    // Fonction pour visiter un sommet u
    private void visiter(UUID u, Map<UUID, List<GraphBuilder.Neighbor>> graph) {
        couleur.put(u, "GRIS"); // Sommet en cours d'exploration
        date++;
        d.put(u, date); // Marquer la date de découverte
        for (GraphBuilder.Neighbor neighbor : graph.get(u)) {
            UUID v = neighbor.id;
            if (couleur.get(v).equals("BLANC")) {
                p.put(v, u); // Marquer le parent
                visiter(v, graph); // Exploration récursive
            }
        }
        couleur.put(u, "NOIR"); // Sommet exploré
        date++;
        f.put(u, date); // Marquer la date de fin
    }

    // Méthodes pour récupérer les résultats
    public Map<UUID, Integer> getDiscoveryTimes() {
        return d;
    }

    public Map<UUID, Integer> getFinishTimes() {
        return f;
    }

    public Map<UUID, UUID> getParents() {
        return p;
    }

    public Map<UUID, String> getColors() {
        return couleur;
    }
}
