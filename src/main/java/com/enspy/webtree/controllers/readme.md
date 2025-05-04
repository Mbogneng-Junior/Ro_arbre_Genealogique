# 🌳 WebTree – API d'Analyse de Graphe Généalogique

Ce projet est une API Spring Boot permettant d’analyser dynamiquement un arbre généalogique modélisé sous forme de graphe orienté et pondéré. Elle offre des outils de recherche, de parcours, et de génération d’arbres couvrants à l’aide d’algorithmes classiques comme Prim, Kruskal, Dijkstra, BFS, DFS, etc.

---

## 🚀 Fonctionnalités principales

- 🔍 Recherche du chemin le plus court entre deux membres (Dijkstra, Bellman-Ford)
- 🌲 Construction de l’arbre couvrant minimum (Prim, Kruskal)
- 🔄 Parcours du graphe pour identifier les liens familiaux (DFS, BFS)
- 🧠 Architecture REST modulaire
- ⚙️ Graphe généré dynamiquement à partir des données membres/relation

---

## 📁 Structure du projet

src/ └── main/ └── java/ └── com.enspy.webtree/ ├── controllers/ │ ├── GraphMSTController.java │ ├── GraphTraversalController.java │ └── SearchController.java ├── graph/ │ ├── GraphBuilder.java │ ├── Edge.java │ ├── arbreCouvrant/ (Prim, Kruskal) │ ├── parcourt/ (BFS, DFS) │ └── CheminMinimal/ (Dijkstra, BellmanFord)


---

## 🔗 Endpoints REST disponibles

### `/api/mst/prim?sourceId=UUID`

> Arbre couvrant minimum depuis un sommet avec l’algorithme de Prim.

### `/api/mst/kruskal`

> Arbre couvrant minimum global avec l’algorithme de Kruskal.

### `/api/traversal/dfs`

> Parcours en profondeur (DFS) de l’ensemble du graphe.

### `/api/traversal/bfs?sourceId=UUID`

> Parcours en largeur (BFS) depuis un sommet donné.

### `/api/search/dijkstra?sourceId=UUID&targetId=UUID`

> Recherche du chemin le plus court entre deux sommets avec Dijkstra.

### `/api/search/bellman-ford?sourceId=UUID&targetId=UUID`

> Recherche du chemin le plus court avec Bellman-Ford (gère les poids négatifs).

---

## 📤 Exemples de réponse JSON

### 🔍 Dijkstra

```json
{
  "algorithm": "dijkstra",
  "source": "ab12cd34-56ef-78ab-90cd-1234567890ef",
  "target": "12345678-90ab-cdef-1234-567890abcdef",
  "path": [
    "ab12cd34-56ef-78ab-90cd-1234567890ef",
    "de34fa56-78bc-90ab-cd12-34567890abcd",
    "12345678-90ab-cdef-1234-567890abcdef"
  ],
  "found": true
}

🌲 Prim

[
  {
    "from": "ab12cd34-56ef-78ab-90cd-1234567890ef",
    "to": "de34fa56-78bc-90ab-cd12-34567890abcd",
    "weight": 1
  }
]

🔄 BFS

{
  "distances": {
    "ab12cd34-56ef-78ab-90cd-1234567890ef": 0,
    "de34fa56-78bc-90ab-cd12-34567890abcd": 1
  },
  "parents": {
    "de34fa56-78bc-90ab-cd12-34567890abcd": "ab12cd34-56ef-78ab-90cd-1234567890ef"
  },
  "colors": {
    "ab12cd34-56ef-78ab-90cd-1234567890ef": "black"
  }
}

🎯 Cas d’usage dans le frontend

    🌳 Visualiser l’arbre familial depuis un ancêtre avec /dfs ou /bfs

    🧩 Identifier les liens les plus courts entre deux personnes éloignées avec /dijkstra

    🕸 Réduire la complexité du graphe à ses liens fondamentaux avec /prim ou /kruskal

    🧬 Organiser les générations en couches avec /bfs

🔧 Installation & Exécution

# 1. Cloner le repo
git clone https://github.com/ton-user/webtree-api.git

# 2. Ouvrir avec IntelliJ ou VS Code

# 3. Lancer le projet
./mvnw spring-boot:run

    ⚠️ Assurez-vous que la base de données des membres est bien configurée pour que GraphBuilder fonctionne correctement.

📬 Contact