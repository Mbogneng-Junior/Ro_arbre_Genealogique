import { FamilyTreeData, Person, Relationship } from '../lib/types';

/**
 * Organise les personnes par génération par rapport à une personne de référence
 * @param familyData Données de l'arbre généalogique
 * @param rootPersonId ID de la personne de référence (génération 0)
 * @returns Map des générations avec les personnes correspondantes
 */
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

/**
 * Vérifie si deux personnes ont les mêmes parents
 * @param familyData Données de l'arbre généalogique
 * @param person1Id ID de la première personne
 * @param person2Id ID de la deuxième personne
 * @returns true si les personnes ont les mêmes parents
 */
const haveSameParents = (
  familyData: FamilyTreeData,
  person1Id: string, 
  person2Id: string
): boolean => {
  const parents1 = new Set(
    familyData.relationships
      .filter(r => r.to === person1Id && r.type === 'parent-child')
      .map(r => r.from)
  );
  
  const parents2 = new Set(
    familyData.relationships
      .filter(r => r.to === person2Id && r.type === 'parent-child')
      .map(r => r.from)
  );
  
  // Si les deux ensembles contiennent les mêmes éléments et ne sont pas vides
  if (parents1.size === 0 || parents2.size === 0) return false;
  
  // Vérifiez si tous les parents de person1 sont aussi des parents de person2
  for (const parent of parents1) {
    if (!parents2.has(parent)) return false;
  }
  
  // Vérifiez si tous les parents de person2 sont aussi des parents de person1
  for (const parent of parents2) {
    if (!parents1.has(parent)) return false;
  }
  
  return true;
};

/**
 * Vérifie si deux personnes ont au moins un parent en commun
 * @param familyData Données de l'arbre généalogique
 * @param person1Id ID de la première personne
 * @param person2Id ID de la deuxième personne
 * @returns true si les personnes ont au moins un parent en commun
 */
const haveCommonParent = (
  familyData: FamilyTreeData,
  person1Id: string, 
  person2Id: string
): boolean => {
  const parents1 = new Set(
    familyData.relationships
      .filter(r => r.to === person1Id && r.type === 'parent-child')
      .map(r => r.from)
  );
  
  const parents2 = new Set(
    familyData.relationships
      .filter(r => r.to === person2Id && r.type === 'parent-child')
      .map(r => r.from)
  );
  
  // Vérifiez s'il y a au moins un parent en commun
  for (const parent of parents1) {
    if (parents2.has(parent)) return true;
  }
  
  return false;
};

/**
 * Vérifie si une personne est le parent d'une autre
 * @param familyData Données de l'arbre généalogique
 * @param potentialParentId ID du parent potentiel
 * @param childId ID de l'enfant potentiel
 * @returns true si potentialParent est effectivement le parent de child
 */
const isParentOf = (
  familyData: FamilyTreeData,
  potentialParentId: string, 
  childId: string
): boolean => {
  return familyData.relationships.some(
    r => r.from === potentialParentId && r.to === childId && r.type === 'parent-child'
  );
};

/**
 * Vérifie si une personne est le grand-parent d'une autre
 * @param familyData Données de l'arbre généalogique
 * @param potentialGrandparentId ID du grand-parent potentiel
 * @param grandchildId ID du petit-enfant potentiel
 * @returns true si potentialGrandparent est effectivement le grand-parent de grandchild
 */
const isGrandparentOf = (
  familyData: FamilyTreeData,
  potentialGrandparentId: string, 
  grandchildId: string
): boolean => {
  // Trouver tous les enfants du grand-parent potentiel
  const children = familyData.relationships
    .filter(r => r.from === potentialGrandparentId && r.type === 'parent-child')
    .map(r => r.to);
  
  // Vérifier si l'un de ces enfants est le parent du petit-enfant potentiel
  return children.some(childId => isParentOf(familyData, childId, grandchildId));
};

/**
 * Vérifie si une personne est l'arrière-grand-parent d'une autre
 * @param familyData Données de l'arbre généalogique
 * @param potentialGreatGrandparentId ID de l'arrière-grand-parent potentiel
 * @param greatGrandchildId ID de l'arrière-petit-enfant potentiel
 * @returns true si potentialGreatGrandparent est effectivement l'arrière-grand-parent de greatGrandchild
 */
const isGreatGrandparentOf = (
  familyData: FamilyTreeData,
  potentialGreatGrandparentId: string, 
  greatGrandchildId: string
): boolean => {
  // Trouver tous les enfants de l'arrière-grand-parent potentiel
  const children = familyData.relationships
    .filter(r => r.from === potentialGreatGrandparentId && r.type === 'parent-child')
    .map(r => r.to);
  
  // Vérifier si l'un de ces enfants est le grand-parent de l'arrière-petit-enfant potentiel
  return children.some(childId => isGrandparentOf(familyData, childId, greatGrandchildId));
};

/**
 * Vérifie si deux personnes sont mariées ou en couple
 * @param familyData Données de l'arbre généalogique
 * @param person1Id ID de la première personne
 * @param person2Id ID de la deuxième personne
 * @returns true si les personnes sont mariées
 */
const areSpouses = (
  familyData: FamilyTreeData,
  person1Id: string, 
  person2Id: string
): boolean => {
  return familyData.relationships.some(
    r => ((r.from === person1Id && r.to === person2Id) ||
          (r.from === person2Id && r.to === person1Id)) &&
         r.type === 'spouse'
  );
};

/**
 * Vérifie si une personne est l'oncle ou la tante d'une autre
 * @param familyData Données de l'arbre généalogique
 * @param potentialUncleAuntId ID de l'oncle/tante potentiel(le)
 * @param nephewNieceId ID du neveu/nièce potentiel(le)
 * @returns true si potentialUncleAunt est effectivement l'oncle/tante de nephewNiece
 */
const isUncleAuntOf = (
  familyData: FamilyTreeData,
  potentialUncleAuntId: string, 
  nephewNieceId: string
): boolean => {
  // Trouver les parents du neveu/nièce
  const parentsOfNephewNiece = familyData.relationships
    .filter(r => r.to === nephewNieceId && r.type === 'parent-child')
    .map(r => r.from);
  
  // Vérifier si l'oncle/tante potentiel(le) est le frère/la sœur d'un des parents
  for (const parentId of parentsOfNephewNiece) {
    // Vérifier s'ils ont les mêmes parents (= sont frères/sœurs)
    if (haveCommonParent(familyData, parentId, potentialUncleAuntId)) {
      return true;
    }
  }
  
  return false;
};

/**
 * Vérifie si une personne est le cousin ou la cousine d'une autre
 * @param familyData Données de l'arbre généalogique
 * @param person1Id ID de la première personne
 * @param person2Id ID de la deuxième personne
 * @returns true si les personnes sont cousins
 */
const areCousins = (
  familyData: FamilyTreeData,
  person1Id: string, 
  person2Id: string
): boolean => {
  // Trouver les parents des deux personnes
  const parentsOfPerson1 = familyData.relationships
    .filter(r => r.to === person1Id && r.type === 'parent-child')
    .map(r => r.from);
  
  const parentsOfPerson2 = familyData.relationships
    .filter(r => r.to === person2Id && r.type === 'parent-child')
    .map(r => r.from);
  
  // Vérifier si un parent de person1 est le frère/la sœur d'un parent de person2
  for (const parent1Id of parentsOfPerson1) {
    for (const parent2Id of parentsOfPerson2) {
      if (haveCommonParent(familyData, parent1Id, parent2Id)) {
        return true;
      }
    }
  }
  
  return false;
};

/**
 * Trouve le chemin relationnel entre deux personnes
 * @param familyData Données de l'arbre généalogique
 * @param startId ID de la personne de départ
 * @param endId ID de la personne d'arrivée
 * @returns Chemin des relations entre les deux personnes
 */
export const findRelationshipPath = (
  familyData: FamilyTreeData, 
  startId: string, 
  endId: string
): Relationship[] => {
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
          // Créer une copie de la relation avec la direction préservée
          const directedRel = { 
            ...rel,
            // Si la personne actuelle est la source de la relation, alors la direction est de la source vers la cible
            // Sinon, c'est de la cible vers la source
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

/**
 * Détermine la relation précise entre deux personnes en termes généalogiques naturels
 * @param path Chemin des relations entre les personnes
 * @param persons Liste de toutes les personnes
 * @param startPerson Personne de départ
 * @param endPerson Personne d'arrivée
 * @returns Description de la relation en langage naturel
 */
export const getRelationshipDescription = (
  path: Relationship[], 
  persons: Person[], 
  startPerson: Person, 
  endPerson: Person
): string => {
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
  
  // Vérifier les relations directes
  
  // Conjoint(e)
  if (areSpouses(familyData, startPerson.id, endPerson.id)) {
    return endPerson.gender === 'male' ? 
      "Époux/Mari" : "Épouse/Femme";
  }
  
  // Parent / Enfant
  if (isParentOf(familyData, endPerson.id, startPerson.id)) {
    return endPerson.gender === 'male' ? 
      "Père" : "Mère";
  }
  
  if (isParentOf(familyData, startPerson.id, endPerson.id)) {
    return endPerson.gender === 'male' ? 
      "Fils" : "Fille";
  }
  
  // Grands-parents / Petits-enfants
  if (isGrandparentOf(familyData, endPerson.id, startPerson.id)) {
    return endPerson.gender === 'male' ? 
      "Grand-père" : "Grand-mère";
  }
  
  if (isGrandparentOf(familyData, startPerson.id, endPerson.id)) {
    return endPerson.gender === 'male' ? 
      "Petit-fils" : "Petite-fille";
  }
  
  // Arrière-grands-parents / Arrière-petits-enfants
  if (isGreatGrandparentOf(familyData, endPerson.id, startPerson.id)) {
    return endPerson.gender === 'male' ? 
      "Arrière-grand-père" : "Arrière-grand-mère";
  }
  
  if (isGreatGrandparentOf(familyData, startPerson.id, endPerson.id)) {
    return endPerson.gender === 'male' ? 
      "Arrière-petit-fils" : "Arrière-petite-fille";
  }
  
  // Frères et sœurs (mêmes parents)
  if (haveSameParents(familyData, startPerson.id, endPerson.id)) {
    return endPerson.gender === 'male' ? 
      "Frère" : "Sœur";
  }
  
  // Demi-frères et demi-sœurs (un parent en commun)
  if (haveCommonParent(familyData, startPerson.id, endPerson.id) && 
      !haveSameParents(familyData, startPerson.id, endPerson.id)) {
    return endPerson.gender === 'male' ? 
      "Demi-frère" : "Demi-sœur";
  }
  
  // Oncles et tantes / Neveux et nièces
  if (isUncleAuntOf(familyData, endPerson.id, startPerson.id)) {
    return endPerson.gender === 'male' ? 
      "Oncle" : "Tante";
  }
  
  if (isUncleAuntOf(familyData, startPerson.id, endPerson.id)) {
    return endPerson.gender === 'male' ? 
      "Neveu" : "Nièce";
  }
  
  // Cousins et cousines
  if (areCousins(familyData, startPerson.id, endPerson.id)) {
    return endPerson.gender === 'male' ? 
      "Cousin" : "Cousine";
  }
  
  // Analyser le chemin complet pour des relations plus complexes
  const completeData: FamilyTreeData = { persons, relationships: path };
  
  // Relations par alliance (beaux-parents, beaux-frères, etc.)
  const spouseRelations = path.filter(rel => rel.type === 'spouse').length;
  if (spouseRelations > 0) {
    // Beaux-parents / Beaux-enfants
    const spouseId = path.find(rel => rel.type === 'spouse')?.from === startPerson.id ? 
                      path.find(rel => rel.type === 'spouse')?.to : 
                      path.find(rel => rel.type === 'spouse')?.from;
    
    if (spouseId) {
      const spousePerson = persons.find(p => p.id === spouseId);
      
      if (spousePerson && isParentOf(completeData, endPerson.id, spouseId)) {
        return endPerson.gender === 'male' ? 
          "Beau-père" : "Belle-mère";
      }
      
      if (spousePerson && isParentOf(completeData, spouseId, endPerson.id)) {
        return endPerson.gender === 'male' ? 
          "Beau-fils/Gendre" : "Belle-fille/Bru";
      }
      
      // Beaux-frères et belles-sœurs (par alliance)
      if (spousePerson && haveCommonParent(completeData, spouseId, endPerson.id)) {
        return endPerson.gender === 'male' ? 
          "Beau-frère (frère du conjoint)" : "Belle-sœur (sœur du conjoint)";
      }
      
      if (spousePerson && areSpouses(completeData, endPerson.id, 
          persons.find(p => haveSameParents(completeData, p.id, startPerson.id))?.id || '')) {
        return endPerson.gender === 'male' ? 
          "Beau-frère (conjoint de frère/sœur)" : "Belle-sœur (conjointe de frère/sœur)";
      }
    }
  }
  
  // Analyser la structure du chemin pour déterminer des relations complexes
  if (path.length >= 4) {
    // Vérifier si c'est un cousin éloigné
    const parentChildRelations = path.filter(rel => rel.type === 'parent-child').length;
    const siblingRelations = path.filter(rel => rel.type === 'sibling').length;
    
    if (parentChildRelations >= 4 && siblingRelations >= 1) {
      const degree = Math.floor(parentChildRelations / 2) - 1;
      
      if (degree === 1) {
        return endPerson.gender === 'male' ? 
          "Cousin germain" : "Cousine germaine";
      } else if (degree === 2) {
        return endPerson.gender === 'male' ? 
          "Cousin issu de germain" : "Cousine issue de germaine";
      } else {
        return endPerson.gender === 'male' ? 
          `Cousin au ${degree}ème degré` : `Cousine au ${degree}ème degré`;
      }
    }
    
    // Grand-oncles/Grand-tantes et petits-neveux/petites-nièces
    if (parentChildRelations >= 3 && siblingRelations >= 1) {
      // Structure potentielle d'un grand-oncle/grande-tante ou petit-neveu/petite-nièce
      if (path[0].type === 'parent-child' && path[1].type === 'parent-child' && 
          (path[2].type === 'sibling' || path[2].type === 'parent-child')) {
        
        if (isParentOf(completeData, path[0].from, path[0].to) && 
            isParentOf(completeData, path[1].from, path[1].to)) {
          return endPerson.gender === 'male' ? 
            "Grand-oncle" : "Grand-tante";
        } else {
          return endPerson.gender === 'male' ? 
            "Petit-neveu" : "Petite-nièce";
        }
      }
    }
  }
  
  // Si le chemin est très long, c'est probablement une parenté éloignée
  if (path.length > 6) {
    return "Parenté éloignée";
  }
  
  // Si aucune relation spécifique n'est identifiée, donner une description générique
  return "Relation familiale";
};

/**
 * Composant pour analyser et obtenir une description de la relation entre deux personnes
 * @param persons Liste de toutes les personnes
 * @param relationships Liste de toutes les relations
 * @param fromPerson Personne de départ
 * @param toPerson Personne d'arrivée
 * @returns Description et chemin de la relation
 */
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