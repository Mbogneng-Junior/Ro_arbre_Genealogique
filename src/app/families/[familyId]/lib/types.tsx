export interface Person {
    id: string;
    name: string;
    birthYear?: number;
    deathYear?: number;
    gender?: 'male' | 'female' | 'other';
    imageUrl?: string;
    metadata?: Record<string, any>;
  }
  
  export interface Relationship {
    id: string;
    from: string; // Person ID (parent)
    to: string; // Person ID (child)
    type: 'parent-child' | 'spouse' | 'other';
    weight: number; // 1 for parent/child, 2 for grandparent, etc.
    metadata?: Record<string, any>;
  }
  
  export interface FamilyTreeData {
    persons: Person[];
    relationships: Relationship[];
  }
  
  export interface GraphNode {
    id: string;
    data: Person;
  }
  
  export interface GraphEdge {
    id: string;
    source: string;
    target: string;
    data: Relationship;
  }
  
  export interface Graph {
    nodes: GraphNode[];
    edges: GraphEdge[];
  }
  
  export interface AdjacencyListItem {
    personId: string;
    connections: {
      personId: string;
      relationshipId: string;
      weight: number;
    }[];
  }

  export type TreeNode = {
    id: string;
    name: string;
    gender?: 'male' | 'female' | 'other';
    birthYear?: number;
    deathYear?: number;
    x: number;
    y: number;
    generation: number;
  };
  
  export type AdjacencyList = AdjacencyListItem[];
  
  export interface Path {
    path: string[]; // Array of person IDs
    totalWeight: number;
    relationshipPath: Relationship[];
  }