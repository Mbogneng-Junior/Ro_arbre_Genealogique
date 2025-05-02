import { AdjacencyList, Path, Relationship } from '../types';

// Dijkstra's algorithm for finding the shortest path
export function runDijkstra(
  adjacencyList: AdjacencyList,
  sourceId: string,
  targetId: string,
  relationships: Relationship[]
): Path {
  // Initialize distances with Infinity for all nodes except source
  const distances: Record<string, number> = {};
  const previous: Record<string, string | null> = {};
  const visited: Set<string> = new Set();
  
  // Initialize all nodes with infinite distance
  adjacencyList.forEach(item => {
    distances[item.personId] = item.personId === sourceId ? 0 : Infinity;
    previous[item.personId] = null;
  });

  // Process nodes
  while (true) {
    // Find unvisited node with minimum distance
    let minDistance = Infinity;
    let current: string | null = null;
    
    for (const personId in distances) {
      if (!visited.has(personId) && distances[personId] < minDistance) {
        minDistance = distances[personId];
        current = personId;
      }
    }
    
    // All remaining nodes are unreachable or target is reached
    if (current === null || current === targetId || minDistance === Infinity) {
      break;
    }
    
    // Mark current node as visited
    visited.add(current);
    
    // Find the adjacent list item for the current node
    const adjacentNodes = adjacencyList.find(item => item.personId === current)?.connections || [];
    
    // Update distances to adjacent nodes
    for (const connection of adjacentNodes) {
      if (!visited.has(connection.personId)) {
        const newDistance = distances[current] + connection.weight;
        if (newDistance < distances[connection.personId]) {
          distances[connection.personId] = newDistance;
          previous[connection.personId] = current;
        }
      }
    }
  }
  
  // No path found
  if (distances[targetId] === Infinity) {
    return { path: [], totalWeight: Infinity, relationshipPath: [] };
  }
  
  // Reconstruct path
  const path: string[] = [];
  let current = targetId;
  
  while (current) {
    path.unshift(current);
    current = previous[current] || '';
    if (current === '') break;
  }
  
  // Get relationship path
  const relationshipPath: Relationship[] = [];
  for (let i = 0; i < path.length - 1; i++) {
    const from = path[i];
    const to = path[i + 1];
    
    const relationship = relationships.find(
      r => (r.from === from && r.to === to) || (r.from === to && r.to === from)
    );
    
    if (relationship) {
      relationshipPath.push(relationship);
    }
  }
  
  return {
    path,
    totalWeight: distances[targetId],
    relationshipPath
  };
}

// Bellman-Ford algorithm for finding the shortest path (works with negative weights)
export function runBellmanFord(
  adjacencyList: AdjacencyList,
  sourceId: string,
  targetId: string,
  relationships: Relationship[]
): Path {
  // Initialize distances with Infinity for all nodes except source
  const distances: Record<string, number> = {};
  const previous: Record<string, string | null> = {};
  
  // Get all person IDs
  const personIds = adjacencyList.map(item => item.personId);
  
  // Initialize all nodes with infinite distance
  personIds.forEach(personId => {
    distances[personId] = personId === sourceId ? 0 : Infinity;
    previous[personId] = null;
  });
  
  // Create a flat list of all edges for easier processing
  type Edge = { from: string; to: string; weight: number };
  const edges: Edge[] = [];
  
  adjacencyList.forEach(item => {
    item.connections.forEach(conn => {
      edges.push({
        from: item.personId,
        to: conn.personId,
        weight: conn.weight
      });
    });
  });
  
  // Relax edges |V| - 1 times
  const numVertices = personIds.length;
  for (let i = 0; i < numVertices - 1; i++) {
    let updated = false;
    
    for (const edge of edges) {
      if (distances[edge.from] !== Infinity) {
        const newDistance = distances[edge.from] + edge.weight;
        
        if (newDistance < distances[edge.to]) {
          distances[edge.to] = newDistance;
          previous[edge.to] = edge.from;
          updated = true;
        }
      }
    }
    
    // Early termination if no updates were made in this iteration
    if (!updated) break;
  }
  
  // Check for negative cycles
  for (const edge of edges) {
    if (distances[edge.from] !== Infinity && 
        distances[edge.from] + edge.weight < distances[edge.to]) {
      console.warn("Graph contains a negative weight cycle");
      // You could handle this differently if needed
    }
  }
  
  // No path found
  if (distances[targetId] === Infinity) {
    return { path: [], totalWeight: Infinity, relationshipPath: [] };
  }
  
  // Reconstruct path
  const path: string[] = [];
  let current = targetId;
  
  while (current) {
    path.unshift(current);
    current = previous[current] || '';
    if (current === '') break;
  }
  
  // Get relationship path
  const relationshipPath: Relationship[] = [];
  for (let i = 0; i < path.length - 1; i++) {
    const from = path[i];
    const to = path[i + 1];
    
    const relationship = relationships.find(
      r => (r.from === from && r.to === to) || (r.from === to && r.to === from)
    );
    
    if (relationship) {
      relationshipPath.push(relationship);
    }
  }
  
  return {
    path,
    totalWeight: distances[targetId],
    relationshipPath
  };
}