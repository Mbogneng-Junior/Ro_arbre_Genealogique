'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  User, Users, Heart, Calendar, Search, Home, 
  ChevronsRight, X, ZoomIn, ZoomOut, Move, Info
} from 'lucide-react';
import { BiRightArrow, BiUpArrow } from 'react-icons/bi';
import { getRelationshipDescription, findRelationshipPath } from './relations';
import FamilyTreeComponent from './arbre';

const FamilyTree = ({ familyData }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [rootPerson, setRootPerson] = useState(null);
  const [relationshipPath, setRelationshipPath] = useState([]);
  const [pathDescription, setPathDescription] = useState('');
  const [isHorizontalLayout, setIsHorizontalLayout] = useState(true);
  const [zoom, setZoom] = useState(1);
  
  const containerRef = useRef(null);

  // Trouver une personne par son nom
  const findPersonByName = useCallback((name) => {
    const lowerName = name.toLowerCase();
    return familyData.persons.find(p => p.name.toLowerCase().includes(lowerName)) || null;
  }, [familyData.persons]);

  // Initialiser l'arbre avec la première personne
  useEffect(() => {
    if (familyData.persons.length > 0 && !rootPerson) {
      setRootPerson(familyData.persons[0]);
    }
  }, [familyData.persons, rootPerson]);

  // Générer une description du chemin entre deux personnes
  const generatePathDescription = useCallback((path, start, end) => {
    return getRelationshipDescription(path, familyData.persons, start, end);
  }, [familyData.persons]);

  // Rechercher une personne et définir comme racine
  const handleSearch = () => {
    const found = findPersonByName(searchTerm);
    if (found) {
      setRootPerson(found);
      setSelectedPerson(null);
      setRelationshipPath([]);
      setPathDescription('');
    }
  };

  // Gérer le clic sur un nœud de l'arbre
  const handleNodeClick = useCallback((person) => {
    setSelectedPerson(person);
    
    if (rootPerson && person.id !== rootPerson.id) {
      const path = findRelationshipPath(familyData, rootPerson.id, person.id);
      setRelationshipPath(path);
      setPathDescription(generatePathDescription(path, rootPerson, person));
    } else {
      setRelationshipPath([]);
      setPathDescription('');
    }
  }, [rootPerson, familyData, generatePathDescription]);

  // Fonctions de zoom
  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.1, 2));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.5));
  const toggleLayout = () => setIsHorizontalLayout(prev => !prev);

  return (
    <div className='flex justify-center mb-4'>
      <div className="flex flex-col justify-center bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg shadow-lg overflow-hidden max-w-6xl w-full">
      <div className="bg-gradient-to-r from-gray-800 to-gray-700 text-white p-4 flex justify-between items-center">
        <div className="flex items-center">
          <Users className="mr-2 text-amber-300" />
          <h1 className="text-xl font-semibold">Arbre Généalogique Familial</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center bg-gray-700/50 rounded-lg p-2 border border-gray-600">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher une personne..."
              className="bg-transparent border-none outline-none text-white placeholder-gray-400 w-48"
            />
            <button 
              onClick={handleSearch}
              className="ml-2 p-1.5 rounded hover:bg-gray-600/70 transition-colors"
            >
              <Search size={18} className="text-amber-300" />
            </button>
          </div>
          
          <button
            onClick={toggleLayout}
            className="bg-gray-700/50 p-2 rounded-lg border border-gray-600 hover:bg-gray-600/70 transition-colors"
            title={isHorizontalLayout ? "Passer en vue verticale" : "Passer en vue horizontale"}
          >
            {isHorizontalLayout ? 
              <BiUpArrow size={20} className="text-amber-300" /> : 
              <BiRightArrow size={20} className="text-amber-300" />
            }
          </button>
        </div>
      </div>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Panneau de l'arbre généalogique */}
        <div className="flex-1 relative overflow-auto bg-gradient-to-br from-gray-50 to-gray-100" ref={containerRef}>
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-md p-2 z-10 flex">
            <button 
              onClick={handleZoomIn} 
              className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-700"
              title="Zoom avant"
            >
              <ZoomIn size={20} />
            </button>
            <button 
              onClick={handleZoomOut} 
              className="p-1.5 hover:bg-gray-100 rounded-lg ml-1 text-gray-700"
              title="Zoom arrière"
            >
              <ZoomOut size={20} />
            </button>
          </div>
          
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-md p-2 z-10">
            <div className="flex flex-col space-y-1">
              <div className="flex items-center text-sm">
                <div className="w-4 h-0.5 bg-black mr-2"></div>
                <span>Relation parent-enfant</span>
              </div>
              <div className="flex items-center text-sm">
                <div className="w-4 h-0.5 bg-yellow-500 mr-2 border-dashed border-b"></div>
                <span>Relation époux</span>
              </div>
            </div>
          </div>
          
          <div 
            className="transform origin-center transition-transform duration-200"
            style={{ transform: `scale(${zoom})` }}
          >
            <FamilyTreeComponent 
              familyData={familyData}
              rootPerson={rootPerson}
              relationshipPath={relationshipPath}
              onNodeClick={handleNodeClick}
              orientation={isHorizontalLayout ? 'horizontal' : 'vertical'}
            />
          </div>
        </div>
        
        {/* Panneau d'informations */}
        {selectedPerson && (
          <div className="w-96 border-l border-gray-200 bg-white overflow-y-auto shadow-inner">
            <div className="sticky top-0 bg-gradient-to-r from-gray-50 to-gray-100 p-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800">Détails</h2>
              <button 
                onClick={() => setSelectedPerson(null)}
                className="p-1.5 rounded-full hover:bg-gray-200 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="p-5">
              <div className="flex items-center mb-5">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-md
                  ${selectedPerson.gender === 'male' ? 'bg-gradient-to-br from-blue-400 to-blue-600 text-white' : 
                    selectedPerson.gender === 'female' ? 'bg-gradient-to-br from-pink-400 to-pink-600 text-white' : 
                    'bg-gradient-to-br from-gray-400 to-gray-600 text-white'}`}>
                  <User size={28} />
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-bold text-gray-800">{selectedPerson.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {selectedPerson.gender === 'male' ? 'Homme' : 
                      selectedPerson.gender === 'female' ? 'Femme' : 'Autre'}
                  </p>
                </div>
              </div>
              
              <div className="mb-5 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl shadow-sm">
                <div className="flex items-center text-gray-700 mb-2">
                  <Calendar size={18} className="mr-2 text-blue-600" />
                  <span className="font-medium">Date de naissance:</span>
                </div>
                <p className="ml-7 text-gray-800">{selectedPerson.birthYear || 'Inconnue'}</p>
                
                {selectedPerson.deathYear && (
                  <>
                    <div className="flex items-center text-gray-700 mt-4 mb-2">
                      <Calendar size={18} className="mr-2 text-gray-600" />
                      <span className="font-medium">Date de décès:</span>
                    </div>
                    <p className="ml-7 text-gray-800">{selectedPerson.deathYear}</p>
                  </>
                )}
              </div>
              
              {/* Relation avec la personne racine */}
              {rootPerson && selectedPerson.id !== rootPerson.id && (
                <div className="mt-6">
                  <h4 className="font-semibold mb-3 flex items-center text-gray-800">
                    <Heart size={18} className="mr-2 text-red-500" />
                    Relation avec {rootPerson.name}
                  </h4>
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-xl border border-amber-200 shadow-sm">
                    <div className="flex items-center mb-2">
                      <ChevronsRight size={16} className="flex-shrink-0 text-amber-600 mr-1" />
                      <span className="font-medium text-amber-800">Type de relation:</span>
                    </div>
                    <p className="ml-6 text-amber-800">{pathDescription}</p>
                  </div>
                </div>
              )}
              
              {/* Métadonnées supplémentaires */}
              {selectedPerson.metadata && Object.keys(selectedPerson.metadata).length > 0 && (
                <div className="mt-6">
                  <h4 className="font-semibold mb-3 flex items-center text-gray-800">
                    <Info size={18} className="mr-2 text-indigo-500" />
                    Informations supplémentaires
                  </h4>
                  <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-4 rounded-xl shadow-sm">
                    {Object.entries(selectedPerson.metadata).map(([key, value]) => (
                      <div key={key} className="flex justify-between mb-2 pb-2 border-b border-indigo-100 last:border-0">
                        <span className="font-medium text-indigo-800">{key}:</span>
                        <span className="text-indigo-700">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
    </div>
  );
};

export default FamilyTree;