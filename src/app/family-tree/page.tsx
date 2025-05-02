"use client";

import { useState, useEffect } from 'react';
import { User, UserPlus, GitMerge, Database, ChevronRight, Search, Users, TreePalm} from 'lucide-react';
import FamilyTree from './components/FamilyTree';
import AddPersonForm from './components/AddPersonForm';
import PathFinder from './components/PathFinder';
import { getTabIcon } from './lib/utils';
import SubfamilyAnalysis from './components/SubfamilyAnalysis';
import { FamilyTreeData, Person, Relationship } from './lib/types';
import { 
  getAllPersons, 
  getAllRelationships, 
  addPerson, 
  addRelationship,
  sampleFamilyData
} from './db/db';
import { initDB } from './db/db';
import { LoadingScreen } from './loader';

export default function FamTree() {
  const [familyData, setFamilyData] = useState<FamilyTreeData>({ persons: [], relationships: [] });
  const [activeTab, setActiveTab] = useState<'tree' | 'add' | 'path' | 'subfamily'>('tree');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        await initDB();
        const persons = await getAllPersons();
        const relationships = await getAllRelationships();
        
        if (persons.length > 0) {
          setFamilyData({ persons, relationships });
        } else {
          // Fallback to sample data if no data exists
          setFamilyData(sampleFamilyData);
        }
      } catch (error) {
        console.error("Failed to load data:", error);
        // Fallback to sample data on error
        setFamilyData(sampleFamilyData);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  const handleAddPerson = async (person: Omit<Person, 'id'>) => {
    try {
      const newPerson = await addPerson(person);
      setFamilyData(prev => ({
        ...prev,
        persons: [...prev.persons, newPerson]
      }));
      return true;
    } catch (error) {
      console.error("Failed to add person:", error);
      return false;
    }
  };

  const handleAddRelationship = async (relationship: Omit<Relationship, 'id'>) => {
    try {
      const newRelationship = await addRelationship(relationship);
      setFamilyData(prev => ({
        ...prev,
        relationships: [...prev.relationships, newRelationship]
      }));
      return true;
    } catch (error) {
      console.error("Failed to add relationship:", error);
      return false;
    }
  };

  if (isLoading) {
    return <LoadingScreen />
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-10">
          <h1 className="text-4xl font-bold text-blue-800 mb-2">Arbre Généalogique Familial</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Explorez, construisez et analysez votre histoire familiale avec notre application intuitive
          </p>
        </header>
        
        <div className="flex justify-center mb-8">
          <nav className="flex bg-white rounded-xl shadow-lg overflow-hidden">
            {(['tree', 'add', 'path', 'subfamily'] as const).map((tab) => (
              <button 
                key={tab}
                className={`
                  px-6 py-3 flex items-center space-x-2 transition-all duration-200
                  ${activeTab === tab 
                    ? 'bg-blue-600 text-white font-medium' 
                    : 'text-gray-700 hover:bg-blue-50'}
                `}
                onClick={() => setActiveTab(tab)}
              >
                {getTabIcon(tab)}
                <span className="ml-2 capitalize">
                  {tab === 'tree' && 'Visualiser'}
                  {tab === 'add' && 'Ajouter'}
                  {tab === 'path' && 'Liens'}
                  {tab === 'subfamily' && 'Analyses'}
                </span>
              </button>
            ))}
          </nav>
        </div>
        
        <div className="bg-white rounded-xl shadow-xl p-6 border border-gray-100">
          <div className="mb-4">
            <h2 className="text-2xl font-semibold text-gray-800 flex items-center">
              {activeTab === 'tree' && <><TreePalm size={20} className="mr-2 text-blue-600" /> Visualisation de l'arbre</>}
              {activeTab === 'add' && <><UserPlus size={20} className="mr-2 text-blue-600" /> Ajouter des données</>}
              {activeTab === 'path' && <><GitMerge size={20} className="mr-2 text-blue-600" /> Trouver un lien familial</>}
              {activeTab === 'subfamily' && <><Users size={20} className="mr-2 text-blue-600" /> Analyse de sous-familles</>}
            </h2>
            <div className="h-1 w-20 bg-blue-600 mt-2 mb-6 rounded-full"></div>
          </div>
          
          {activeTab === 'tree' && (
            <FamilyTree familyData={familyData} />
          )}
          
          {activeTab === 'add' && (
            <AddPersonForm 
              persons={familyData.persons}
              onAddPerson={handleAddPerson}
              onAddRelationship={handleAddRelationship}
            />
          )}
          
          {activeTab === 'path' && (
            <PathFinder familyData={familyData} />
          )}
          
          {activeTab === 'subfamily' && (
            <SubfamilyAnalysis familyData={familyData} />
          )}
        </div>
        
        <footer className="mt-12 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} Arbre Généalogique Familial. Tous droits réservés.</p>
        </footer>
      </div>
    </main>
  );
}