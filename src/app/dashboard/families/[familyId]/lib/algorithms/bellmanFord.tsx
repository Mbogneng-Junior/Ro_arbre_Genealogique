import { AdjacencyList, Path, Relationship, Person } from '../types';

export const runbellmanFord = (
  adjacencyList: AdjacencyList,
  startId: string,
  endId: string,
  relationships: Relationship[],
  persons: Person[]
): { path: Path | null; hasNegativeCycle: boolean } => {
  // Initialize distances with Infinity for all nodes except start
  const distances: Record<string, number> = {};
  const previous: Record<string, string | null> = {};

  adjacencyList.forEach(item => {
    distances[item.personId] = item.personId === startId ? 0 : Infinity;
    previous[item.personId] = null;
  });

  // Create an array of all edges for easier processing
  const edges: { from: string; to: string; weight: number }[] = [];
  adjacencyList.forEach(item => {
    item.connections.forEach(conn => {
      edges.push({
        from: item.personId,
        to: conn.personId,
        weight: conn.weight
      });
    });
  });

  // Relax edges |V|-1 times
  const vertices = adjacencyList.length;
  for (let i = 0; i < vertices - 1; i++) {
    for (const edge of edges) {
      if (
        distances[edge.from] !== Infinity && 
        distances[edge.from] + edge.weight < distances[edge.to]
      ) {
        distances[edge.to] = distances[edge.from] + edge.weight;
        previous[edge.to] = edge.from;
      }
    }
  }

  // Check for negative weight cycles
  let hasNegativeCycle = false;
  for (const edge of edges) {
    if (
      distances[edge.from] !== Infinity && 
      distances[edge.from] + edge.weight < distances[edge.to]
    ) {
      hasNegativeCycle = true;
      break;
    }
  }

  // If there's no path to the end node
  if (distances[endId] === Infinity) {
    return { path: null, hasNegativeCycle };
  }

  // Reconstruct the path
  const path: string[] = [];
  let current = endId;

  while (current) {
    path.unshift(current);
    current = previous[current] || null;
  }

  // Find the relationships along the path
  const relationshipPath: Relationship[] = [];
  for (let i = 0; i < path.length - 1; i++) {
    const rel = relationships.find(r => 
      (r.from === path[i] && r.to === path[i+1]) || 
      (r.from === path[i+1] && r.to === path[i])
    );
    if (rel) relationshipPath.push(rel);
  }

  return {
    path: {
      path,
      totalWeight: distances[endId],
      relationshipPath
    },
    hasNegativeCycle
  };
};