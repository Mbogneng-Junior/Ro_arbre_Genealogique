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
      <div className="flex flex-col justify-center bg-white rounded-lg shadow-lg overflow-hidden max-w-6xl w-full">
      <div className="bg-[#8BBDBD] text-[#171717] p-4 flex justify-between items-center">
        <div className="flex items-center">
          <Users className="mr-2 text-white" />
          <h1 className="text-xl font-semibold">Arbre Généalogique Familial</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center bg-white/20 rounded-lg p-2 border border-white/30">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher une personne..."
              className="bg-transparent border-none outline-none text-[#171717] placeholder-[#171717]/60 w-48"
            />
            <button 
              onClick={handleSearch}
              className="ml-2 p-1.5 rounded hover:bg-white/30 transition-colors"
            >
              <Search size={18} className="text-[#171717]" />
            </button>
          </div>
          
          <button
            onClick={toggleLayout}
            className="bg-white/20 p-2 rounded-lg border border-white/30 hover:bg-white/30 transition-colors"
            title={isHorizontalLayout ? "Passer en vue verticale" : "Passer en vue horizontale"}
          >
            {isHorizontalLayout ? 
              <BiUpArrow size={20} className="text-[#171717]" /> : 
              <BiRightArrow size={20} className="text-[#171717]" />
            }
          </button>
        </div>
      </div>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Panneau de l'arbre généalogique */}
        <div className="flex-1 relative overflow-auto bg-white" ref={containerRef}>
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-md p-2 z-10 flex">
            <button 
              onClick={handleZoomIn} 
              className="p-1.5 hover:bg-[#8BBDBD]/10 rounded-lg text-[#171717]"
              title="Zoom avant"
            >
              <ZoomIn size={20} />
            </button>
            <button 
              onClick={handleZoomOut} 
              className="p-1.5 hover:bg-[#8BBDBD]/10 rounded-lg ml-1 text-[#171717]"
              title="Zoom arrière"
            >
              <ZoomOut size={20} />
            </button>
          </div>
          
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-md p-2 z-10">
            <div className="flex flex-col space-y-1">
              <div className="flex items-center text-sm">
                <div className="w-4 h-0.5 bg-[#171717] mr-2"></div>
                <span>Relation parent-enfant</span>
              </div>
              <div className="flex items-center text-sm">
                <div className="w-4 h-0.5 bg-[#8BBDBD] mr-2 border-dashed border-b"></div>
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
            <div className="sticky top-0 bg-white p-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-[#171717]">Détails</h2>
              <button 
                onClick={() => setSelectedPerson(null)}
                className="p-1.5 rounded-full hover:bg-[#8BBDBD]/10 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="p-5">
              <div className="flex items-center mb-5">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-md
                  ${selectedPerson.gender === 'male' ? 'bg-[#8BBDBD] text-white' : 
                    selectedPerson.gender === 'female' ? 'bg-[#8BBDBD] text-white' : 
                    'bg-[#8BBDBD]/70 text-white'}`}>
                  <User size={28} />
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-bold text-[#171717]">{selectedPerson.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {selectedPerson.gender === 'male' ? 'Homme' : 
                      selectedPerson.gender === 'female' ? 'Femme' : 'Autre'}
                  </p>
                </div>
              </div>
              
              <div className="mb-5 p-4 bg-[#8BBDBD]/10 rounded-xl shadow-sm">
                <div className="flex items-center text-[#171717] mb-2">
                  <Calendar size={18} className="mr-2 text-[#8BBDBD]" />
                  <span className="font-medium">Date de naissance:</span>
                </div>
                <p className="ml-7 text-[#171717]">{selectedPerson.birthYear || 'Inconnue'}</p>
                
                {selectedPerson.deathYear && (
                  <>
                    <div className="flex items-center text-[#171717] mt-4 mb-2">
                      <Calendar size={18} className="mr-2 text-[#8BBDBD]/80" />
                      <span className="font-medium">Date de décès:</span>
                    </div>
                    <p className="ml-7 text-[#171717]">{selectedPerson.deathYear}</p>
                  </>
                )}
              </div>
              
              {/* Relation avec la personne racine */}
              {rootPerson && selectedPerson.id !== rootPerson.id && (
                <div className="mt-6">
                  <h4 className="font-semibold mb-3 flex items-center text-[#171717]">
                    <Heart size={18} className="mr-2 text-[#8BBDBD]" />
                    Relation avec {rootPerson.name}
                  </h4>
                  <div className="bg-[#8BBDBD]/10 p-4 rounded-xl border border-[#8BBDBD]/30 shadow-sm">
                    <div className="flex items-center mb-2">
                      <ChevronsRight size={16} className="flex-shrink-0 text-[#8BBDBD] mr-1" />
                      <span className="font-medium text-[#171717]">Type de relation:</span>
                    </div>
                    <p className="ml-6 text-[#171717]">{pathDescription}</p>
                  </div>
                </div>
              )}
              
              {/* Métadonnées supplémentaires */}
              {selectedPerson.metadata && Object.keys(selectedPerson.metadata).length > 0 && (
                <div className="mt-6">
                  <h4 className="font-semibold mb-3 flex items-center text-[#171717]">
                    <Info size={18} className="mr-2 text-[#8BBDBD]" />
                    Informations supplémentaires
                  </h4>
                  <div className="bg-[#8BBDBD]/10 p-4 rounded-xl shadow-sm">
                    {Object.entries(selectedPerson.metadata).map(([key, value]) => (
                      <div key={key} className="flex justify-between mb-2 pb-2 border-b border-[#8BBDBD]/20 last:border-0">
                        <span className="font-medium text-[#171717]">{key}:</span>
                        <span className="text-[#171717]/80">{String(value)}</span>
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