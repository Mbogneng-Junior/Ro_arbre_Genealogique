import { FamilyTreeData, Person, Relationship } from '../lib/types';

export const organizeByGeneration = (
  familyData: FamilyTreeData | undefined | null,
  rootPersonId: string
): Map<number, Person[]> => {
  // Handle undefined or null familyData
  if (!familyData || !familyData.persons || !familyData.relationships) {
    return new Map<number, Person[]>();
  }

  const generationsMap = new Map<number, Person[]>();
  const visited = new Set<string>();
  
  // Initialiser la génération 0 avec la personne racine
  const rootPerson = familyData.persons.find(p => p.id === rootPersonId);
  if (!rootPerson) return generationsMap;
  
  generationsMap.set(0, [rootPerson]);
  visited.add(rootPersonId);
  
  // File d'attente pour le BFS avec des tuples (personId, generation)
  const queue: Array<[string, number]> = [];
  
  // Ajouter les parents (génération -1)
  const parentRelationships = familyData.relationships.filter(
    r => r.to === rootPersonId && r.type === 'parent-child'
  );
  
  for (const rel of parentRelationships) {
    const parentId = rel.from;
    if (!visited.has(parentId)) {
      visited.add(parentId);
      const gen = -1; // Les parents sont à la génération -1
      
      if (!generationsMap.has(gen)) {
        generationsMap.set(gen, []);
      }
      
      const parent = familyData.persons.find(p => p.id === parentId);
      if (parent) {
        generationsMap.get(gen)!.push(parent);
      }
      
      queue.push([parentId, gen]);
    }
  }
  
  
  // Ajouter les enfants (génération +1)
  const childRelationships = familyData.relationships.filter(
    r => r.from === rootPersonId && r.type === 'parent-child'
  );
  
  for (const rel of childRelationships) {
    const childId = rel.to;
    if (!visited.has(childId)) {
      visited.add(childId);
      const gen = 1; // Les enfants sont à la génération +1
      
      if (!generationsMap.has(gen)) {
        generationsMap.set(gen, []);
      }
      
      const child = familyData.persons.find(p => p.id === childId);
      if (child) {
        generationsMap.get(gen)!.push(child);
      }
      
      queue.push([childId, gen]);
    }
  }
  
  // Ajouter les frères et sœurs (génération 0)
  // Trouver d'abord les parents
  const parents = parentRelationships.map(r => r.from);
  
  // Pour chaque parent, trouver ses autres enfants (frères et sœurs de la personne racine)
  for (const parentId of parents) {
    const siblingRelationships = familyData.relationships.filter(
      r => r.from === parentId && r.type === 'parent-child' && r.to !== rootPersonId
    );
    
    for (const rel of siblingRelationships) {
      const siblingId = rel.to;
      if (!visited.has(siblingId)) {
        visited.add(siblingId);
        const gen = 0; // Les frères et sœurs sont à la même génération
        
        const sibling = familyData.persons.find(p => p.id === siblingId);
        if (sibling) {
          generationsMap.get(gen)!.push(sibling);
        }
        
        queue.push([siblingId, gen]);
      }
    }
  }
  
  // Ajouter le conjoint (génération 0)
  const spouseRelationships = familyData.relationships.filter(
    r => (r.from === rootPersonId || r.to === rootPersonId) && r.type === 'spouse'
  );
  
  for (const rel of spouseRelationships) {
    const spouseId = rel.from === rootPersonId ? rel.to : rel.from;
    if (!visited.has(spouseId)) {
      visited.add(spouseId);
      const gen = 0; // Le conjoint est à la même génération
      
      const spouse = familyData.persons.find(p => p.id === spouseId);
      if (spouse) {
        generationsMap.get(gen)!.push(spouse);
      }
      
      queue.push([spouseId, gen]);
    }
  }
  
  // BFS pour explorer le reste de l'arbre
  while (queue.length > 0) {
    const [personId, generation] = queue.shift()!;
    
    // Explorer les parents (génération -1 par rapport à la génération actuelle)
    const parentRels = familyData.relationships.filter(
      r => r.to === personId && r.type === 'parent-child'
    );
    
    for (const rel of parentRels) {
      const parentId = rel.from;
      if (!visited.has(parentId)) {
        visited.add(parentId);
        const gen = generation - 1;
        
        if (!generationsMap.has(gen)) {
          generationsMap.set(gen, []);
        }
        
        const parent = familyData.persons.find(p => p.id === parentId);
        if (parent) {
          generationsMap.get(gen)!.push(parent);
        }
        
        queue.push([parentId, gen]);
      }
    }
    
    // Explorer les enfants (génération +1 par rapport à la génération actuelle)
    const childRels = familyData.relationships.filter(
      r => r.from === personId && r.type === 'parent-child'
    );
    
    for (const rel of childRels) {
      const childId = rel.to;
      if (!visited.has(childId)) {
        visited.add(childId);
        const gen = generation + 1;
        
        if (!generationsMap.has(gen)) {
          generationsMap.set(gen, []);
        }
        
        const child = familyData.persons.find(p => p.id === childId);
        if (child) {
          generationsMap.get(gen)!.push(child);
        }
        
        queue.push([childId, gen]);
      }
    }
    
    // Explorer les conjoints (même génération)
    const spouseRels = familyData.relationships.filter(
      r => (r.from === personId || r.to === personId) && r.type === 'spouse'
    );
    
    for (const rel of spouseRels) {
      const spouseId = rel.from === personId ? rel.to : rel.from;
      if (!visited.has(spouseId)) {
        visited.add(spouseId);
        const gen = generation;
        
        if (!generationsMap.has(gen)) {
          generationsMap.set(gen, []);
        }
        
        const spouse = familyData.persons.find(p => p.id === spouseId);
        if (spouse) {
          generationsMap.get(gen)!.push(spouse);
        }
        
        queue.push([spouseId, gen]);
      }
    }
    
    // Explorer les frères et sœurs (même génération)
    // Trouver d'abord les parents de la personne actuelle
    const personsParents = familyData.relationships.filter(
      r => r.to === personId && r.type === 'parent-child'
    ).map(r => r.from);
    
    // Pour chaque parent, trouver ses autres enfants
    for (const parentId of personsParents) {
      const siblingRels = familyData.relationships.filter(
        r => r.from === parentId && r.type === 'parent-child' && r.to !== personId
      );
      
      for (const rel of siblingRels) {
        const siblingId = rel.to;
        if (!visited.has(siblingId)) {
          visited.add(siblingId);
          const gen = generation;
          
          if (!generationsMap.has(gen)) {
            generationsMap.set(gen, []);
          }
          
          const sibling = familyData.persons.find(p => p.id === siblingId);
          if (sibling) {
            generationsMap.get(gen)!.push(sibling);
          }
          
          queue.push([siblingId, gen]);
        }
      }
    }
  }
  
  return generationsMap;
};

const haveSameParents = (familyData: FamilyTreeData, person1Id: string, person2Id: string): boolean => {
  const parents1 = new Set(familyData.relationships.filter(r => r.to === person1Id && r.type === 'parent-child').map(r => r.from));
  const parents2 = new Set(familyData.relationships.filter(r => r.to === person2Id && r.type === 'parent-child').map(r => r.from));
  if (parents1.size === 0 || parents2.size === 0) return false;
  for (const parent of parents1) { if (!parents2.has(parent)) return false; }
  for (const parent of parents2) { if (!parents1.has(parent)) return false; }
  return true;
};

const haveCommonParent = (familyData: FamilyTreeData, person1Id: string, person2Id: string): boolean => {
  const parents1 = new Set(familyData.relationships.filter(r => r.to === person1Id && r.type === 'parent-child').map(r => r.from));
  const parents2 = new Set(familyData.relationships.filter(r => r.to === person2Id && r.type === 'parent-child').map(r => r.from));
  for (const parent of parents1) { if (parents2.has(parent)) return true; }
  return false;
};

const isParentOf = (familyData: FamilyTreeData, potentialParentId: string, childId: string): boolean => {
  return familyData.relationships.some(r => r.from === potentialParentId && r.to === childId && r.type === 'parent-child');
};

const isGrandparentOf = (familyData: FamilyTreeData, potentialGrandparentId: string, grandchildId: string): boolean => {
  const children = familyData.relationships.filter(r => r.from === potentialGrandparentId && r.type === 'parent-child').map(r => r.to);
  return children.some(childId => isParentOf(familyData, childId, grandchildId));
};

const isGreatGrandparentOf = (familyData: FamilyTreeData, potentialGreatGrandparentId: string, greatGrandchildId: string): boolean => {
  const children = familyData.relationships.filter(r => r.from === potentialGreatGrandparentId && r.type === 'parent-child').map(r => r.to);
  return children.some(childId => isGrandparentOf(familyData, childId, greatGrandchildId));
};

const areSpouses = (familyData: FamilyTreeData, person1Id: string, person2Id: string): boolean => {
  return familyData.relationships.some(r => ((r.from === person1Id && r.to === person2Id) || (r.from === person2Id && r.to === person1Id)) && r.type === 'spouse');
};

const isUncleAuntOf = (familyData: FamilyTreeData, potentialUncleAuntId: string, nephewNieceId: string): boolean => {
  const parentsOfNephewNiece = familyData.relationships.filter(r => r.to === nephewNieceId && r.type === 'parent-child').map(r => r.from);
  for (const parentId of parentsOfNephewNiece) {
    if (haveCommonParent(familyData, parentId, potentialUncleAuntId)) return true;
  }
  return false;
};

const areCousins = (familyData: FamilyTreeData, person1Id: string, person2Id: string): boolean => {
  const parentsOfPerson1 = familyData.relationships.filter(r => r.to === person1Id && r.type === 'parent-child').map(r => r.from);
  const parentsOfPerson2 = familyData.relationships.filter(r => r.to === person2Id && r.type === 'parent-child').map(r => r.from);
  for (const parent1Id of parentsOfPerson1) {
    for (const parent2Id of parentsOfPerson2) {
      if (haveCommonParent(familyData, parent1Id, parent2Id)) return true;
    }
  }
  return false;
};

// Nouvelles fonctions pour les relations par alliance
const isInLawSiblingOf = (familyData: FamilyTreeData, person1Id: string, person2Id: string): boolean => {
  // Trouver le conjoint de person1
  const spouse = familyData.relationships.find(r => (r.from === person1Id || r.to === person1Id) && r.type === 'spouse');
  if (!spouse) return false;
  const spouseId = spouse.from === person1Id ? spouse.to : spouse.from;
  // Vérifier si person2 est un frère/sœur du conjoint
  return haveCommonParent(familyData, spouseId, person2Id);
};

const isSpouseOfSibling = (familyData: FamilyTreeData, person1Id: string, person2Id: string): boolean => {
  // Trouver les frères/sœurs de person1
  const parents = familyData.relationships.filter(r => r.to === person1Id && r.type === 'parent-child').map(r => r.from);
  for (const parentId of parents) {
    const siblings = familyData.relationships.filter(r => r.from === parentId && r.to !== person1Id && r.type === 'parent-child').map(r => r.to);
    for (const siblingId of siblings) {
      if (areSpouses(familyData, siblingId, person2Id)) return true;
    }
  }
  return false;
};

const isParentInLaw = (familyData: FamilyTreeData, potentialParentInLawId: string, personId: string): boolean => {
  // Trouver le conjoint de la personne
  const spouse = familyData.relationships.find(r => (r.from === personId || r.to === personId) && r.type === 'spouse');
  if (!spouse) return false;
  const spouseId = spouse.from === personId ? spouse.to : spouse.from;
  // Vérifier si le parent potentiel est parent du conjoint
  return isParentOf(familyData, potentialParentInLawId, spouseId);
};

const isChildInLaw = (familyData: FamilyTreeData, potentialChildInLawId: string, personId: string): boolean => {
  // Trouver les enfants de la personne
  const children = familyData.relationships.filter(r => r.from === personId && r.type === 'parent-child').map(r => r.to);
  for (const childId of children) {
    // Vérifier si l'enfant potentiel est conjoint d'un enfant
    if (areSpouses(familyData, childId, potentialChildInLawId)) return true;
  }
  return false;
};

export const findRelationshipPath = (familyData: FamilyTreeData, startId: string, endId: string): Relationship[] => {
  if (startId === endId) return [];
  const visited = new Set<string>();
  const queue: Array<{id: string, path: Relationship[]}> = [{ id: startId, path: [] }];
  
  while (queue.length > 0) {
    const { id, path } = queue.shift()!;
    if (id === endId) return path;
    
    if (!visited.has(id)) {
      visited.add(id);
      const relationships = familyData.relationships.filter(r => r.from === id || r.to === id);
      
      for (const rel of relationships) {
        const nextId = rel.from === id ? rel.to : rel.from;
        
        if (!visited.has(nextId)) {
          const directedRel = { 
            ...rel,
            direction: rel.from === id ? 'forward' : 'backward'
          };
          
          queue.push({
            id: nextId, 
            path: [...path, directedRel]
          });
        }
      }
    }
  }
  
  return [];
};

export const getRelationshipDescription = (path: Relationship[], persons: Person[], startPerson: Person, endPerson: Person): string => {
  if (path.length === 0) return "Aucune relation trouvée";
  if (startPerson.id === endPerson.id) return "Même personne";
  
  const familyData: FamilyTreeData = { 
    persons: persons,
    relationships: path.map(r => ({
      from: r.from,
      to: r.to,
      type: r.type
    }))
  };
  
  // Préfixes selon le genre et le statut marital
  const getPrefix = (person: Person) => {
    if (person.gender === 'male') return "Monsieur";
    // Pour les femmes, vérifier si mariée
    const isMarried = familyData.relationships.some(r => 
      (r.from === person.id || r.to === person.id) && r.type === 'spouse'
    );
    return isMarried ? "Madame" : "Mademoiselle";
  };
  
  // Formulation complète de la relation
  const getFormattedRelation = (relationName: string) => {
    const prefix = getPrefix(endPerson);
    return `${prefix} ${endPerson.name} est ${relationName} de ${startPerson.name}`;
  };
  
  // Relations directes
  if (areSpouses(familyData, startPerson.id, endPerson.id)) {
    return getFormattedRelation(endPerson.gender === 'male' ? "l'époux" : "l'épouse");
  }
  
  if (isParentOf(familyData, endPerson.id, startPerson.id)) {
    return getFormattedRelation(endPerson.gender === 'male' ? "le père" : "la mère");
  }
  
  if (isParentOf(familyData, startPerson.id, endPerson.id)) {
    return getFormattedRelation(endPerson.gender === 'male' ? "le fils" : "la fille");
  }
  
  if (isGrandparentOf(familyData, endPerson.id, startPerson.id)) {
    return getFormattedRelation(endPerson.gender === 'male' ? "le grand-père" : "la grand-mère");
  }
  
  if (isGrandparentOf(familyData, startPerson.id, endPerson.id)) {
    return getFormattedRelation(endPerson.gender === 'male' ? "le petit-fils" : "la petite-fille");
  }
  
  if (isGreatGrandparentOf(familyData, endPerson.id, startPerson.id)) {
    return getFormattedRelation(endPerson.gender === 'male' ? "l'arrière-grand-père" : "l'arrière-grand-mère");
  }
  
  if (isGreatGrandparentOf(familyData, startPerson.id, endPerson.id)) {
    return getFormattedRelation(endPerson.gender === 'male' ? "l'arrière-petit-fils" : "l'arrière-petite-fille");
  }
  
  if (haveSameParents(familyData, startPerson.id, endPerson.id)) {
    return getFormattedRelation(endPerson.gender === 'male' ? "le frère" : "la sœur");
  }
  
  if (haveCommonParent(familyData, startPerson.id, endPerson.id) && !haveSameParents(familyData, startPerson.id, endPerson.id)) {
    return getFormattedRelation(endPerson.gender === 'male' ? "le demi-frère" : "la demi-sœur");
  }
  
  if (isUncleAuntOf(familyData, endPerson.id, startPerson.id)) {
    return getFormattedRelation(endPerson.gender === 'male' ? "l'oncle" : "la tante");
  }
  
  if (isUncleAuntOf(familyData, startPerson.id, endPerson.id)) {
    return getFormattedRelation(endPerson.gender === 'male' ? "le neveu" : "la nièce");
  }
  
  if (areCousins(familyData, startPerson.id, endPerson.id)) {
    return getFormattedRelation(endPerson.gender === 'male' ? "le cousin" : "la cousine");
  }
  
  // Relations par alliance
  if (isInLawSiblingOf(familyData, startPerson.id, endPerson.id)) {
    return getFormattedRelation(endPerson.gender === 'male' ? "le beau-frère" : "la belle-sœur");
  }
  
  if (isSpouseOfSibling(familyData, startPerson.id, endPerson.id)) {
    return getFormattedRelation(endPerson.gender === 'male' ? "le beau-frère" : "la belle-sœur");
  }
  
  if (isParentInLaw(familyData, endPerson.id, startPerson.id)) {
    return getFormattedRelation(endPerson.gender === 'male' ? "le beau-père" : "la belle-mère");
  }
  
  if (isChildInLaw(familyData, endPerson.id, startPerson.id)) {
    return getFormattedRelation(endPerson.gender === 'male' ? "le gendre" : "la belle-fille");
  }
  
  if (path.length > 6) {
    return getFormattedRelation("un parent éloigné");
  }
  
  return getFormattedRelation("un membre de la belle famille");
};

export const RelationshipAnalyzer = ({
  persons,
  relationships,
  fromPerson,
  toPerson
}: {
  persons: Person[],
  relationships: Relationship[],
  fromPerson: Person,
  toPerson: Person
}) => {
  const familyData = { persons, relationships };
  const path = findRelationshipPath(familyData, fromPerson.id, toPerson.id);
  const description = getRelationshipDescription(path, persons, fromPerson, toPerson);
  
  return { path, description };
};