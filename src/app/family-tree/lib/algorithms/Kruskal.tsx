import { FamilyTreeData, Relationship } from '../types';

interface Edge {
  id: string;
  from: string;
  to: string;
  weight: number;
  type: string;
}

interface SubfamilyAssignment {
  personId: string;
  subfamilyId: number;
}

interface DisjointSet {
  parent: Map<string, string>;
  rank: Map<string, number>;
  
  makeSet(x: string): void;
  find(x: string): string;
  union(x: string, y: string): void;
}

/**
 * Implementation of a disjoint-set data structure for Kruskal's algorithm
 */
const createDisjointSet = (): DisjointSet => {
  const parent = new Map<string, string>();
  const rank = new Map<string, number>();
  
  return {
    parent,
    rank,
    
    makeSet(x: string) {
      parent.set(x, x);
      rank.set(x, 0);
    },
    
    find(x: string): string {
      if (!parent.has(x)) {
        return x; // Handle case where x isn't in the set
      }
      
      if (parent.get(x) !== x) {
        parent.set(x, this.find(parent.get(x)!));
      }
      return parent.get(x)!;
    },
    
    union(x: string, y: string) {
      const rootX = this.find(x);
      const rootY = this.find(y);
      
      if (rootX === rootY) return;
      
      const rankX = rank.get(rootX) || 0;
      const rankY = rank.get(rootY) || 0;
      
      if (rankX < rankY) {
        parent.set(rootX, rootY);
      } else if (rankX > rankY) {
        parent.set(rootY, rootX);
      } else {
        parent.set(rootY, rootX);
        rank.set(rootX, rankX + 1);
      }
    }
  };
};

/**
 * Runs Kruskal's algorithm to divide the family into subfamilies
 */
export const runKruskal = (data: FamilyTreeData, numSubfamilies: number = 2) => {
  // Early exit for empty data
  if (data.persons.length === 0) {
    return { 
      includedRelationships: [],
      assignments: []
    };
  }
  
  // Convert relationships to edges for sorting
  const edges: Edge[] = data.relationships.map(rel => ({
    id: rel.id,
    from: rel.from,
    to: rel.to,
    weight: rel.weight,
    type: rel.type
  }));
  
  // Sort edges by weight (ascending)
  edges.sort((a, b) => a.weight - b.weight);
  
  // Create disjoint-set for Kruskal's algorithm
  const disjointSet = createDisjointSet();
  
  // Initialize each person as their own set
  for (const person of data.persons) {
    disjointSet.makeSet(person.id);
  }
  
  // Run standard Kruskal to find MST
  const mstEdges: Edge[] = [];
  const remainingEdges: Edge[] = [];
  
  for (const edge of edges) {
    const rootFrom = disjointSet.find(edge.from);
    const rootTo = disjointSet.find(edge.to);
    
    if (rootFrom !== rootTo) {
      mstEdges.push(edge);
      disjointSet.union(edge.from, edge.to);
    } else {
      remainingEdges.push(edge);
    }
  }
  
  // Reset disjoint-set for subfamily assignment
  const subfamilyDisjointSet = createDisjointSet();
  for (const person of data.persons) {
    subfamilyDisjointSet.makeSet(person.id);
  }
  
  // Sort MST edges by weight (descending) to break strongest connections first
  mstEdges.sort((a, b) => b.weight - a.weight);
  
  // Calculate how many edges to remove to get desired number of subfamilies
  // In a connected graph with n nodes, we have n-1 edges in MST
  // To get k components, we need to remove k-1 edges
  const edgesToRemove = Math.min(numSubfamilies - 1, mstEdges.length);
  
  // Remove the highest weight edges to create subfamilies
  const removedEdges = mstEdges.splice(0, edgesToRemove);
  
  // Create new MST with remaining edges
  for (const edge of mstEdges) {
    subfamilyDisjointSet.union(edge.from, edge.to);
  }
  
  // Map each person to their subfamily (component)
  const assignments: SubfamilyAssignment[] = [];
  const rootToSubfamily = new Map<string, number>();
  let subfamilyCounter = 0;
  
  for (const person of data.persons) {
    const root = subfamilyDisjointSet.find(person.id);
    
    if (!rootToSubfamily.has(root)) {
      rootToSubfamily.set(root, subfamilyCounter++);
    }
    
    assignments.push({
      personId: person.id,
      subfamilyId: rootToSubfamily.get(root)!
    });
  }
  
  // Return results
  return {
    includedRelationships: [...mstEdges, ...removedEdges].map(edge => 
      data.relationships.find(rel => rel.id === edge.id)!
    ),
    assignments
  };
};