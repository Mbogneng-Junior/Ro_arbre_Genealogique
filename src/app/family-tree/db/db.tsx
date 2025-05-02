import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Person, Relationship, FamilyTreeData } from '../lib/types';

// Fonction pour générer un ID unique
export const generateUniqueId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

interface FamilyTreeDB extends DBSchema {
  persons: {
    key: string;
    value: Person;
    indexes: { 'by-name': string };
  };
  relationships: {
    key: string;
    value: Relationship;
    indexes: { 'by-from': string; 'by-to': string };
  };
}

let db: IDBPDatabase<FamilyTreeDB> | null = null;

export const initDB = async (): Promise<IDBPDatabase<FamilyTreeDB>> => {
  if (db) return db;

  try {
    db = await openDB<FamilyTreeDB>('family-tree-db', 1, {
      upgrade(database) {
        // Create the persons store if it doesn't exist
        if (!database.objectStoreNames.contains('persons')) {
          const personsStore = database.createObjectStore('persons', { keyPath: 'id' });
          personsStore.createIndex('by-name', 'name');
        }

        // Create the relationships store if it doesn't exist
        if (!database.objectStoreNames.contains('relationships')) {
          const relationshipsStore = database.createObjectStore('relationships', { keyPath: 'id' });
          relationshipsStore.createIndex('by-from', 'from');
          relationshipsStore.createIndex('by-to', 'to');
        }
      },
    });

    return db;
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
};

export const getAllPersons = async (): Promise<Person[]> => {
  try {
    const database = await initDB();
    return database.getAll('persons');
  } catch (error) {
    console.error("Error getting persons:", error);
    return [];
  }
};

export const getAllRelationships = async (): Promise<Relationship[]> => {
  try {
    const database = await initDB();
    return database.getAll('relationships');
  } catch (error) {
    console.error("Error getting relationships:", error);
    return [];
  }
};

export const getFamilyTreeData = async (): Promise<FamilyTreeData> => {
  const persons = await getAllPersons();
  const relationships = await getAllRelationships();
  return { persons, relationships };
};

export const addPerson = async (person: Omit<Person, 'id'>): Promise<Person> => {
  const database = await initDB();
  const newPerson = { ...person, id: generateUniqueId() };
  await database.add('persons', newPerson);
  return newPerson;
};

export const updatePerson = async (person: Person): Promise<Person> => {
  const database = await initDB();
  await database.put('persons', person);
  return person;
};

export const deletePerson = async (id: string): Promise<void> => {
  const database = await initDB();
  await database.delete('persons', id);
  
  // Delete all relationships involving this person
  const relationships = await getAllRelationships();
  for (const rel of relationships) {
    if (rel.from === id || rel.to === id) {
      await database.delete('relationships', rel.id);
    }
  }
};

export const addRelationship = async (relationship: Omit<Relationship, 'id'>): Promise<Relationship> => {
  const database = await initDB();
  const newRelationship = { ...relationship, id: generateUniqueId() };
  await database.add('relationships', newRelationship);
  return newRelationship;
};

export const updateRelationship = async (relationship: Relationship): Promise<Relationship> => {
  const database = await initDB();
  await database.put('relationships', relationship);
  return relationship;
};

export const deleteRelationship = async (id: string): Promise<void> => {
  const database = await initDB();
  await database.delete('relationships', id);
};

export const importData = async (data: FamilyTreeData): Promise<void> => {
  const database = await initDB();
  const tx = database.transaction(['persons', 'relationships'], 'readwrite');
  
  // Clear existing data
  await tx.objectStore('persons').clear();
  await tx.objectStore('relationships').clear();
  
  // Add new data
  for (const person of data.persons) {
    await tx.objectStore('persons').add(person);
  }
  
  for (const relationship of data.relationships) {
    await tx.objectStore('relationships').add(relationship);
  }
  
  await tx.done;
};

export const exportData = async (): Promise<FamilyTreeData> => {
  return getFamilyTreeData();
};

// Données d'exemple pour l'arbre généalogique camerounais
export const sampleFamilyData: FamilyTreeData = {
  persons: [
    // Génération ancienne (années 1920-1940)
    { id: "p1", name: "Ngoa Ekobo", birthYear: 1925, deathYear: 2005, gender: "male", imageUrl: "/api/placeholder/60/60" },
    { id: "p2", name: "Manga Mado", birthYear: 1930, deathYear: 2010, gender: "female", imageUrl: "/api/placeholder/60/60" },
    { id: "p3", name: "Tchatchouang Ndedi", birthYear: 1935, deathYear: 2015, gender: "male", imageUrl: "/api/placeholder/60/60" },
    { id: "p4", name: "Ngo Bikok", birthYear: 1938, gender: "female", imageUrl: "/api/placeholder/60/60" },

    // Génération intermédiaire (années 1950-1970)
    { id: "p5", name: "Atangana Mballa", birthYear: 1952, gender: "male", imageUrl: "/api/placeholder/60/60" },
    { id: "p6", name: "Ngo Bikok Manga", birthYear: 1955, gender: "female", imageUrl: "/api/placeholder/60/60" },
    { id: "p7", name: "Tchakounté Ngoa", birthYear: 1960, gender: "male", imageUrl: "/api/placeholder/60/60" },
    { id: "p8", name: "Ndjock Ekobo", birthYear: 1963, gender: "female", imageUrl: "/api/placeholder/60/60" },
    { id: "p9", name: "Mbarga Atangana", birthYear: 1968, gender: "male", imageUrl: "/api/placeholder/60/60" },
    { id: "p10", name: "Mefire Tchatchouang", birthYear: 1972, gender: "female", imageUrl: "/api/placeholder/60/60" },

    // Génération jeune adulte (années 1980-2000)
    { id: "p11", name: "Ngoa Mballa", birthYear: 1980, gender: "male", imageUrl: "/api/placeholder/60/60" },
    { id: "p12", name: "Mado Atangana", birthYear: 1983, gender: "female", imageUrl: "/api/placeholder/60/60" },
    { id: "p13", name: "Ndedi Mbarga", birthYear: 1985, gender: "male", imageUrl: "/api/placeholder/60/60" },
    { id: "p14", name: "Bikok Tchakounté", birthYear: 1988, gender: "female", imageUrl: "/api/placeholder/60/60" },
    { id: "p15", name: "Ekobo Ndjock", birthYear: 1992, gender: "male", imageUrl: "/api/placeholder/60/60" },
    { id: "p16", name: "Manga Mefire", birthYear: 1995, gender: "female", imageUrl: "/api/placeholder/60/60" },

    // Enfants (années 2010-2020)
    { id: "p17", name: "Mballa Ngoa", birthYear: 2010, gender: "male", imageUrl: "/api/placeholder/60/60" },
    { id: "p18", name: "Atangana Mado", birthYear: 2012, gender: "female", imageUrl: "/api/placeholder/60/60" },
    { id: "p19", name: "Tchatchouang Ndedi", birthYear: 2015, gender: "male", imageUrl: "/api/placeholder/60/60" },
    { id: "p20", name: "Ngo Bikok", birthYear: 2018, gender: "female", imageUrl: "/api/placeholder/60/60" },
    { id: "p21", name: "Mbarga Ekobo", birthYear: 2020, gender: "male", imageUrl: "/api/placeholder/60/60" }
  ],
  relationships: [
    // Relations pour la génération ancienne
    { id: "r1", from: "p1", to: "p2", type: "spouse", weight: 2 },
    { id: "r2", from: "p3", to: "p4", type: "spouse", weight: 2 },

    // Parents -> enfants (génération intermédiaire)
    { id: "r3", from: "p1", to: "p5", type: "parent-child", weight: 1 },
    { id: "r4", from: "p2", to: "p5", type: "parent-child", weight: 1 },
    { id: "r5", from: "p1", to: "p6", type: "parent-child", weight: 1 },
    { id: "r6", from: "p2", to: "p6", type: "parent-child", weight: 1 },
    { id: "r7", from: "p3", to: "p7", type: "parent-child", weight: 1 },
    { id: "r8", from: "p4", to: "p7", type: "parent-child", weight: 1 },
    { id: "r9", from: "p3", to: "p8", type: "parent-child", weight: 1 },
    { id: "r10", from: "p4", to: "p8", type: "parent-child", weight: 1 },

    // Mariages génération intermédiaire
    { id: "r11", from: "p5", to: "p10", type: "spouse", weight: 2 },
    { id: "r12", from: "p7", to: "p6", type: "spouse", weight: 2 },
    { id: "r13", from: "p9", to: "p8", type: "spouse", weight: 2 },

    // Parents -> enfants (génération jeune adulte)
    { id: "r14", from: "p5", to: "p11", type: "parent-child", weight: 1 },
    { id: "r15", from: "p10", to: "p11", type: "parent-child", weight: 1 },
    { id: "r16", from: "p7", to: "p12", type: "parent-child", weight: 1 },
    { id: "r17", from: "p6", to: "p12", type: "parent-child", weight: 1 },
    { id: "r18", from: "p7", to: "p13", type: "parent-child", weight: 1 },
    { id: "r19", from: "p6", to: "p13", type: "parent-child", weight: 1 },
    { id: "r20", from: "p9", to: "p14", type: "parent-child", weight: 1 },
    { id: "r21", from: "p8", to: "p14", type: "parent-child", weight: 1 },
    { id: "r22", from: "p9", to: "p15", type: "parent-child", weight: 1 },
    { id: "r23", from: "p8", to: "p15", type: "parent-child", weight: 1 },

    // Mariages génération jeune adulte
    { id: "r24", from: "p11", to: "p16", type: "spouse", weight: 2 },
    { id: "r25", from: "p13", to: "p14", type: "spouse", weight: 2 },

    // Parents -> enfants (génération enfants)
    { id: "r26", from: "p11", to: "p17", type: "parent-child", weight: 1 },
    { id: "r27", from: "p16", to: "p17", type: "parent-child", weight: 1 },
    { id: "r28", from: "p11", to: "p18", type: "parent-child", weight: 1 },
    { id: "r29", from: "p16", to: "p18", type: "parent-child", weight: 1 },
    { id: "r30", from: "p13", to: "p19", type: "parent-child", weight: 1 },
    { id: "r31", from: "p14", to: "p19", type: "parent-child", weight: 1 },
    { id: "r32", from: "p13", to: "p20", type: "parent-child", weight: 1 },
    { id: "r33", from: "p14", to: "p20", type: "parent-child", weight: 1 },
    { id: "r34", from: "p15", to: "p21", type: "parent-child", weight: 1 }
  ]
};