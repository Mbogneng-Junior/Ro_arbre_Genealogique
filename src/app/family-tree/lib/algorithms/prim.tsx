import { FamilyTreeData, Relationship } from '../types';

interface Edge {
  from: string;
  to: string;
  weight: number;
  relationshipId: string;
}

interface AdjacencyListItem {
  personId: string;
  connections: {
    personId: string;
    weight: number;
    relationshipId: string;
  }[];
}

/**
 * Creates an adjacency list representation of the family tree
 */
const buildAdjacencyList = (data: FamilyTreeData): AdjacencyListItem[] => {
  const adjacencyList: AdjacencyListItem[] = [];
  
  // Initialize the adjacency list with all persons
  for (const person of data.persons) {
    adjacencyList.push({
      personId: person.id,
      connections: []
    });
  }
  
  // Add edges for all relationships
  for (const relationship of data.relationships) {
    // Find the indices in adjacency list
    const fromIndex = adjacencyList.findIndex(item => item.personId === relationship.from);
    const toIndex = adjacencyList.findIndex(item => item.personId === relationship.to);
    
    if (fromIndex !== -1 && toIndex !== -1) {
      // Add connection in both directions (undirected graph)
      adjacencyList[fromIndex].connections.push({
        personId: relationship.to,
        weight: relationship.weight,
        relationshipId: relationship.id
      });
      
      adjacencyList[toIndex].connections.push({
        personId: relationship.from,
        weight: relationship.weight,
        relationshipId: relationship.id
      });
    }
  }
  
  return adjacencyList;
};

/**
 * Runs Prim's algorithm to find the minimum spanning tree
 */
export const runPrim = (data: FamilyTreeData): Relationship[] => {
  if (data.persons.length === 0) {
    return [];
  }
  
  const adjacencyList = buildAdjacencyList(data);
  
  // Start from the first person
  const startId = data.persons[0].id;
  
  // Set to keep track of visited nodes
  const visited = new Set<string>();
  
  // Array to store MST edges (relationships)
  const mstEdges: Relationship[] = [];
  
  // Start with the first node
  visited.add(startId);
  
  // Continue until all nodes are in the MST or we can't add more (disconnected graph)
  while (visited.size < data.persons.length) {
    let minEdge: Edge | null = null;
    
    // Find the edge with minimum weight from a visited node to an unvisited node
    for (const item of adjacencyList) {
      if (visited.has(item.personId)) {
        for (const conn of item.connections) {
          if (!visited.has(conn.personId) && (!minEdge || conn.weight < minEdge.weight)) {
            minEdge = {
              from: item.personId,
              to: conn.personId,
              weight: conn.weight,
              relationshipId: conn.relationshipId
            };
          }
        }
      }
    }
    
    // If we can't find an edge, the graph might be disconnected
    if (!minEdge) break;
    
    // Add the edge to the MST
    const relationship = data.relationships.find(r => r.id === minEdge.relationshipId);
    if (relationship) {
      mstEdges.push(relationship);
    }
    
    // Mark the node as visited
    visited.add(minEdge.to);
  }
  
  return mstEdges;
};