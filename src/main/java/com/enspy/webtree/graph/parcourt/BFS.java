package com.enspy.webtree.graph.parcourt;

import java.util.*;

import com.enspy.webtree.graph.GraphBuilder;
import org.springframework.stereotype.Component;

@Component
public class BFS {

    private Map<UUID, Integer> d = new HashMap<>(); // Distance depuis le sommet source
    private Map<UUID, UUID> p = new HashMap<>(); // Parent de chaque sommet
    private Map<UUID, String> couleur = new HashMap<>(); // Couleur pour marquer l'état de chaque sommet (BLANC, GRIS, NOIR)

    // Fonction principale pour démarrer le BFS à partir du sommet source
    public void bfs(Map<UUID, List<GraphBuilder.Neighbor>> graph, UUID source) {
        // Initialisation
        for (UUID u : graph.keySet()) {
            couleur.put(u, "BLANC");
            d.put(u, Integer.MAX_VALUE); // Distance infinie par défaut
            p.put(u, null); // Pas de parent
        }

        couleur.put(source, "GRIS"); // Le sommet source est en exploration
        d.put(source, 0); // La distance du sommet source à lui-même est 0
        p.put(source, null); // Le sommet source n'a pas de parent
        Queue<UUID> queue = new LinkedList<>(); // Utilisation d'une file
        queue.add(source); // On met le sommet source dans la file

        // Exploration du graphe
        while (!queue.isEmpty()) {
            UUID u = queue.poll(); // Défilement du sommet de la file
            for (GraphBuilder.Neighbor neighbor : graph.get(u)) {
                UUID v = neighbor.id;
                if (couleur.get(v).equals("BLANC")) { // Si le sommet v n'a pas encore été exploré
                    couleur.put(v, "GRIS"); // Le sommet v est maintenant en exploration
                    d.put(v, d.get(u) + 1); // La distance de v est la distance de u + 1
                    p.put(v, u); // Le parent de v est u
                    queue.add(v); // On ajoute v à la file pour l'explorer plus tard
                }
            }
            couleur.put(u, "NOIR"); // Le sommet u est maintenant exploré
        }
    }

    // Méthodes pour récupérer les résultats
    public Map<UUID, Integer> getDistances() {
        return d;
    }

    public Map<UUID, UUID> getParents() {
        return p;
    }

    public Map<UUID, String> getColors() {
        return couleur;
    }
}
