import { GitMerge, TreePalm, UserPlus, Users } from 'lucide-react';
import { FamilyTreeData, AdjacencyList, Person, Relationship } from './types';

export const buildAdjacencyList = (data: FamilyTreeData): AdjacencyList => {
  const adjacencyList: AdjacencyList = [];

  // Initialize the list with all persons
  data.persons.forEach(person => {
    adjacencyList.push({
      personId: person.id,
      connections: []
    });
  });

  // Add all relationships
  data.relationships.forEach(rel => {
    // Find the person in the adjacency list
    const fromPerson = adjacencyList.find(item => item.personId === rel.from);
    const toPerson = adjacencyList.find(item => item.personId === rel.to);

    if (fromPerson && toPerson) {
      // Add connection from parent to child
      fromPerson.connections.push({
        personId: rel.to,
        relationshipId: rel.id,
        weight: rel.weight
      });

      // Add connection from child to parent (bidirectional)
      toPerson.connections.push({
        personId: rel.from,
        relationshipId: rel.id,
        weight: rel.weight
      });
    }
  });

  return adjacencyList;
};

export const getPersonById = (id: string, persons: Person[]): Person | undefined => {
  return persons.find(person => person.id === id);
};

export const getRelationshipById = (id: string, relationships: Relationship[]): Relationship | undefined => {
  return relationships.find(rel => rel.id === id);
};

export const getRelationshipBetween = (person1Id: string, person2Id: string, relationships: Relationship[]): Relationship | undefined => {
  return relationships.find(rel => 
    (rel.from === person1Id && rel.to === person2Id) || 
    (rel.from === person2Id && rel.to === person1Id)
  );
};

export const describePath = (path: string[], persons: Person[]): string => {
  if (path.length <= 1) return "Même personne";
  
  let description = "";
  
  for (let i = 0; i < path.length - 1; i++) {
    const current = getPersonById(path[i], persons);
    const next = getPersonById(path[i + 1], persons);
    
    if (current && next) {
      description += `${current.name} → ${next.name}`;
      if (i < path.length - 2) description += " → ";
    }
  }
  
  return description;
};

export const generateUniqueId = (): string => {
  return Math.random().toString(36).substring(2, 9);
};

export const getTabIcon = (tab: 'tree' | 'add' | 'path' | 'subfamily') => {
  switch (tab) {
    case 'tree': return <TreePalm size={18} />;
    case 'add': return <UserPlus size={18} />;
    case 'path': return <GitMerge size={18} />;
    case 'subfamily': return <Users size={18} />;
  }
};

export const transformDataToTree = (rootPersonId: string) => {
  if (!familyData) return;

  const newNodes: TreeNode[] = [];
  const newLinks: {source: string, target: string, type: 'parent-child' | 'spouse'}[] = [];
  
  // Trouver la personne racine
  const rootPerson = familyData.persons.find(p => p.id === rootPersonId);
  if (!rootPerson) return;

  // Ajouter la personne racine
  newNodes.push({
    id: rootPerson.id,
    name: rootPerson.name,
    gender: rootPerson.gender,
    birthYear: rootPerson.birthYear,
    deathYear: rootPerson.deathYear,
    x: 0, // Position initiale
    y: 0, // Position initiale
    generation: 0
  });


  // Ajouter les ancêtres (parents, grands-parents)
  addRelations(rootPersonId, 0, 'ancestors');
  
  // Ajouter les descendants (enfants, petits-enfants)
  addRelations(rootPersonId, 0, 'descendants');

  // Calculer les positions
  const positionedNodes = calculateNodePositions(newNodes, newLinks);
  
  setNodes(positionedNodes);
  setLinks(newLinks);
};

export const addRelations = (personId: string, generation: number, direction: 'ancestors' | 'descendants') => {
  const relations = familyData.relationships.filter(r => 
    direction === 'ancestors' 
      ? r.to === personId && r.type === 'parent-child'
      : r.from === personId && r.type === 'parent-child'
  );

  relations.forEach(rel => {
    const relatedPersonId = direction === 'ancestors' ? rel.from : rel.to;
    const person = familyData.persons.find(p => p.id === relatedPersonId);
    if (!person) return;

    // Vérifier si le nœud existe déjà
    if (!newNodes.some(n => n.id === relatedPersonId)) {
      newNodes.push({
        id: relatedPersonId,
        name: person.name,
        gender: person.gender,
        birthYear: person.birthYear,
        deathYear: person.deathYear,
        x: 0, // Position temporaire
        y: 0, // Position temporaire
        generation: direction === 'ancestors' ? generation - 1 : generation + 1
      });

      // Ajouter les conjoints
      const spouseRelations = familyData.relationships.filter(r => 
        (r.from === relatedPersonId || r.to === relatedPersonId) && 
        r.type === 'spouse'
      );

      spouseRelations.forEach(spouseRel => {
        const spouseId = spouseRel.from === relatedPersonId ? spouseRel.to : spouseRel.from;
        const spouse = familyData.persons.find(p => p.id === spouseId);
        if (spouse && !newNodes.some(n => n.id === spouseId)) {
          newNodes.push({
            id: spouseId,
            name: spouse.name,
            gender: spouse.gender,
            birthYear: spouse.birthYear,
            deathYear: spouse.deathYear,
            x: 0,
            y: 0,
            generation: direction === 'ancestors' ? generation - 1 : generation + 1
          });
          newLinks.push({
            source: relatedPersonId,
            target: spouseId,
            type: 'spouse'
          });
        }
      });

      // Continuer récursivement
      addRelations(relatedPersonId, direction === 'ancestors' ? generation - 1 : generation + 1, direction);
    }

    // Ajouter le lien
    newLinks.push({
      source: direction === 'ancestors' ? relatedPersonId : personId,
      target: direction === 'ancestors' ? personId : relatedPersonId,
      type: 'parent-child'
    });
  });
};


export const calculateNodePositions = (nodes: TreeNode[], links: any[]) => {
  // Organiser les nœuds par génération
  const generations: Record<number, TreeNode[]> = {};
  nodes.forEach(node => {
    if (!generations[node.generation]) {
      generations[node.generation] = [];
    }
    generations[node.generation].push(node);
  });

  // Calculer les positions
  const generationSpacing = horizontalLayout ? 200 : 150;
  const siblingSpacing = horizontalLayout ? 100 : 80;

  Object.keys(generations).forEach(genKey => {
    const gen = parseInt(genKey);
    const genNodes = generations[gen];
    
    genNodes.forEach((node, index) => {
      if (horizontalLayout) {
        node.x = gen * generationSpacing;
        node.y = (index - (genNodes.length - 1) / 2) * siblingSpacing;
      } else {
        node.x = (index - (genNodes.length - 1) / 2) * siblingSpacing;
        node.y = gen * generationSpacing;
      }
    });
  });

  return nodes;
};



