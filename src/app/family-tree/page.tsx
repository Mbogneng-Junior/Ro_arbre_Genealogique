"use client";

import { useState, useEffect } from 'react';
import { User, Users, TreePalm, Search, Settings, UserPlus, GitMerge, Database } from 'lucide-react';
import FamilyTree from './components/FamilyTree';
import AddPersonForm from './components/AddPersonForm';
import PathFinder from './components/PathFinder';
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
import Loading from '../loading';

export default function FamTree() {
  const [familyData, setFamilyData] = useState<FamilyTreeData>({ persons: [], relationships: [] });
  const [activeSection, setActiveSection] = useState('visualiser');
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

  const getSectionIcon = (section) => {
    switch(section) {
      case 'gerer': return <User size={20} />;
      case 'visualiser': return <TreePalm size={20} />;
      case 'rechercher': return <Search size={20} />;
      case 'analyser': return <Users size={20} />;
      case 'parametres': return <Settings size={20} />;
      default: return <TreePalm size={20} />;
    }
  };

  const getSectionTitle = (section) => {
    switch(section) {
      case 'gerer': return 'Gérer les membres';
      case 'visualiser': return 'Visualiser l\'arbre généalogique';
      case 'rechercher': return 'Rechercher une relation';
      case 'analyser': return 'Analyser la structure familiale';
      case 'parametres': return 'Paramètres';
      default: return 'Arbre généalogique';
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#8BBDBD] from-5% to-white flex">
      {/* Menu latéral (à gauche) */}
      <aside className="w-72 min-w-64 bg-white shadow-lg flex flex-col h-screen sticky top-0">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-[#8BBDBD]">Arbre Familial</h1>
        </div>
        
        <nav className="flex-1 p-2">
          <ul className="space-y-1">
            <li>
              <button 
                className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${activeSection === 'gerer' ? 'bg-[#8BBDBD] text-white' : 'text-[#171717] hover:bg-[#8BBDBD] hover:bg-opacity-10'}`}
                onClick={() => setActiveSection('gerer')}
              >
                <User size={18} className="mr-3" />
                <span>Gérer les membres</span>
              </button>
            </li>
            <li>
              <button 
                className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${activeSection === 'visualiser' ? 'bg-[#8BBDBD] text-white' : 'text-[#171717] hover:bg-[#8BBDBD] hover:bg-opacity-10'}`}
                onClick={() => setActiveSection('visualiser')}
              >
                <TreePalm size={18} className="mr-3" />
                <span>Visualiser l'arbre</span>
              </button>
            </li>
            <li>
              <button 
                className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${activeSection === 'rechercher' ? 'bg-[#8BBDBD] text-white' : 'text-[#171717] hover:bg-[#8BBDBD] hover:bg-opacity-10'}`}
                onClick={() => setActiveSection('rechercher')}
              >
                <Search size={18} className="mr-3" />
                <span>Rechercher une relation</span>
              </button>
            </li>
            <li>
              <button 
                className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${activeSection === 'analyser' ? 'bg-[#8BBDBD] text-white' : 'text-[#171717] hover:bg-[#8BBDBD] hover:bg-opacity-10'}`}
                onClick={() => setActiveSection('analyser')}
              >
                <Users size={18} className="mr-3" />
                <span>Analyser la structure</span>
              </button>
            </li>
            <li>
              <button 
                className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${activeSection === 'parametres' ? 'bg-[#8BBDBD] text-white' : 'text-[#171717] hover:bg-[#8BBDBD] hover:bg-opacity-10'}`}
                onClick={() => setActiveSection('parametres')}
              >
                <Settings size={18} className="mr-3" />
                <span>Paramètres</span>
              </button>
            </li>
          </ul>
        </nav>
        
        <div className="p-4 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-500">© {new Date().getFullYear()} Arbre Familial</p>
        </div>
      </aside>
      
      {/* Zone centrale (à droite) */}
      <div className="flex-1 p-8">
        <header className="mb-8">
          <h2 className="text-2xl font-bold text-[#171717] flex items-center">
            {getSectionIcon(activeSection)}
            <span className="ml-3">{getSectionTitle(activeSection)}</span>
          </h2>
          <div className="h-1 w-24 bg-[#8BBDBD] mt-2 rounded-full"></div>
        </header>
        
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          {activeSection === 'gerer' && (
            <AddPersonForm 
              persons={familyData.persons}
              onAddPerson={handleAddPerson}
              onAddRelationship={handleAddRelationship}
            />
          )}
          
          {activeSection === 'visualiser' && (
            <FamilyTree familyData={familyData} />
          )}
          
          {activeSection === 'rechercher' && (
            <PathFinder familyData={familyData} />
          )}
          
          {activeSection === 'analyser' && (
            <SubfamilyAnalysis familyData={familyData} />
          )}
          
          {activeSection === 'parametres' && (
            <div className="p-4">
              <h3 className="text-xl font-medium mb-4">Paramètres de l'application</h3>
              <div className="space-y-4">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h4 className="font-medium mb-2">Apparence</h4>
                  <div className="flex items-center">
                    <span className="mr-4">Thème:</span>
                    <select className="border rounded-md px-3 py-2 focus:border-[#8BBDBD] focus:ring-[#8BBDBD]">
                      <option>Clair</option>
                      <option>Sombre</option>
                      <option>Système</option>
                    </select>
                  </div>
                </div>
                
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h4 className="font-medium mb-2">Langue</h4>
                  <div className="flex items-center">
                    <span className="mr-4">Langue:</span>
                    <select className="border rounded-md px-3 py-2 focus:border-[#8BBDBD] focus:ring-[#8BBDBD]">
                      <option>Français</option>
                      <option>English</option>
                      <option>Español</option>
                    </select>
                  </div>
                </div>
                
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h4 className="font-medium mb-2">Base de données</h4>
                  <button className="bg-[#8BBDBD] text-white px-4 py-2 rounded-md flex items-center hover:bg-[#7aa9a9]">
                    <Database size={16} className="mr-2" />
                    Exporter les données
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}