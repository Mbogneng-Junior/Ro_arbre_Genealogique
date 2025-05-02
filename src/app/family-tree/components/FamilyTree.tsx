'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  User, Users, Heart, Calendar, Search, Home, 
  ChevronsRight, X, ZoomIn, ZoomOut, Move, Info
} from 'lucide-react';
import * as d3 from 'd3';
import { FamilyTreeData, Person, Relationship } from '../lib/types';
import { getRelationshipDescription, findRelationshipPath, organizeByGeneration } from './relations';
import { BiRightArrow, BiUpArrow } from 'react-icons/bi';

interface FamilyTreeProps {
  familyData: FamilyTreeData;
}

const FamilyTree = ({ familyData }: FamilyTreeProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [rootPerson, setRootPerson] = useState<Person | null>(null);
  const [relationshipPath, setRelationshipPath] = useState<Relationship[]>([]);
  const [pathDescription, setPathDescription] = useState('');
  const [isHorizontalLayout, setIsHorizontalLayout] = useState(true);
  const [zoom, setZoom] = useState(1);

  
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Trouver une personne par son nom
  const findPersonByName = useCallback((name: string): Person | null => {
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
  const generatePathDescription = useCallback((path: Relationship[], start: Person, end: Person): string => {
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
  const handleNodeClick = useCallback((person: Person) => {
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

  // Dessiner l'arbre avec D3
// Dessiner l'arbre avec D3
useEffect(() => {
  if (!svgRef.current || !rootPerson || !familyData.persons.length) return;

  // Nettoyer le SVG existant
  d3.select(svgRef.current).selectAll("*").remove();

  // Organiser par génération
  const generationsMap = organizeByGeneration(familyData, rootPerson?.id || '');
  
  // Trouver les générations min et max pour dimensionner l'arbre
  const generations = Array.from(generationsMap.keys()).sort((a, b) => a - b);
  const minGeneration = Math.min(...generations);
  const maxGeneration = Math.max(...generations);
  
  // Dimensions et marges
  const margin = { top: 80, right: 100, bottom: 80, left: 100 };
  const width = 1500 - margin.left - margin.right;
  const height = 900 - margin.top - margin.bottom;
  
  // Ajuster SVG à la taille nécessaire
  d3.select(svgRef.current)
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);
  
  const svg = d3.select(svgRef.current)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);
    
  // Définir un gradient pour l'arrière-plan des nœuds
  const defs = svg.append("defs");
  
  // Gradient pour les hommes
  defs.append("linearGradient")
    .attr("id", "male-gradient")
    .attr("x1", "0%").attr("y1", "0%")
    .attr("x2", "100%").attr("y2", "100%")
    .selectAll("stop")
    .data([
      {offset: "0%", color: "#e6f2ff"},
      {offset: "100%", color: "#b3d7ff"}
    ])
    .enter().append("stop")
    .attr("offset", d => d.offset)
    .attr("stop-color", d => d.color);
    
  // Gradient pour les femmes
  defs.append("linearGradient")
    .attr("id", "female-gradient")
    .attr("x1", "0%").attr("y1", "0%")
    .attr("x2", "100%").attr("y2", "100%")
    .selectAll("stop")
    .data([
      {offset: "0%", color: "#ffebf0"},
      {offset: "100%", color: "#ffc2d1"}
    ])
    .enter().append("stop")
    .attr("offset", d => d.offset)
    .attr("stop-color", d => d.color);
    
  // Gradient neutre
  defs.append("linearGradient")
    .attr("id", "neutral-gradient")
    .attr("x1", "0%").attr("y1", "0%")
    .attr("x2", "100%").attr("y2", "100%")
    .selectAll("stop")
    .data([
      {offset: "0%", color: "#f5f5f5"},
      {offset: "100%", color: "#e0e0e0"}
    ])
    .enter().append("stop")
    .attr("offset", d => d.offset)
    .attr("stop-color", d => d.color);
  
  // Gradient doré pour les relations d'époux
  defs.append("linearGradient")
    .attr("id", "spouse-gradient")
    .attr("x1", "0%").attr("y1", "0%")
    .attr("x2", "100%").attr("y2", "0%")
    .selectAll("stop")
    .data([
      {offset: "0%", color: "#ffd700"},
      {offset: "100%", color: "#c9a81d"}
    ])
    .enter().append("stop")
    .attr("offset", d => d.offset)
    .attr("stop-color", d => d.color);
    
  // Filtre pour l'effet d'ombre
  defs.append("filter")
    .attr("id", "drop-shadow")
    .attr("height", "130%")
    .append("feDropShadow")
    .attr("dx", 0)
    .attr("dy", 3)
    .attr("stdDeviation", 3)
    .attr("flood-color", "rgba(0, 0, 0, 0.3)")
    .attr("flood-opacity", 0.5);

  // Échelles pour positionner les générations
  const generationScale = isHorizontalLayout
    ? d3.scaleLinear()
        .domain([minGeneration, maxGeneration])
        .range([0, height])
    : d3.scaleLinear()
        .domain([minGeneration, maxGeneration])
        .range([0, width]);
        
  // Positionnement des nœuds
  const nodes: {person: Person, x: number, y: number}[] = [];
  const nodeById = new Map<string, {person: Person, x: number, y: number}>();
  
  // Créer les nœuds avec leur position par génération
  for (const [generation, persons] of generationsMap.entries()) {
    const genPosition = generationScale(generation);
    
    // Positionnement horizontal ou vertical selon l'orientation
    if (isHorizontalLayout) {
      const perPersonSpace = width / (persons.length || 1);
      persons.forEach((person, idx) => {
        const node = {
          person,
          x: perPersonSpace * (idx + 0.5),
          y: genPosition
        };
        nodes.push(node);
        nodeById.set(person.id, node);
      });
    } else {
      const perPersonSpace = height / (persons.length || 1);
      persons.forEach((person, idx) => {
        const node = {
          person,
          x: genPosition,
          y: perPersonSpace * (idx + 0.5)
        };
        nodes.push(node);
        nodeById.set(person.id, node);
      });
    }
  }
  
  // Créer les liens
  const links: {source: {x: number, y: number}, target: {x: number, y: number}, type: string, id: string}[] = [];
  
  // Ajouter les liens parent-enfant
  for (const rel of familyData.relationships) {
    const sourceNode = nodeById.get(rel.from);
    const targetNode = nodeById.get(rel.to);
    
    if (sourceNode && targetNode) {
      if (rel.type === 'parent-child') {
        links.push({
          source: { x: sourceNode.x, y: sourceNode.y },
          target: { x: targetNode.x, y: targetNode.y },
          type: 'parent-child',
          id: `link-${rel.from}-${rel.to}`
        });
      } else if (rel.type === 'spouse') {
        links.push({
          source: { x: sourceNode.x, y: sourceNode.y },
          target: { x: targetNode.x, y: targetNode.y },
          type: 'spouse',
          id: `link-${rel.from}-${rel.to}`
        });
      }
    }
  }

  // Dessiner les lignes de niveau (générations)
  for (const generation of generations) {
    if (isHorizontalLayout) {
      const lineY = generationScale(generation);
      
      svg.append("line")
        .attr("x1", 0)
        .attr("y1", lineY)
        .attr("x2", width)
        .attr("y2", lineY)
        .attr("stroke", "#e5e5e5")
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "5,5");
        
      svg.append("text")
        .attr("x", 10)
        .attr("y", lineY - 10)
        .attr("fill", "#666")
        .attr("font-size", "12px")
        .text(`Génération ${generation === 0 ? "0 (référence)" : generation}`);
    } else {
      const lineX = generationScale(generation);
      
      svg.append("line")
        .attr("x1", lineX)
        .attr("y1", 0)
        .attr("x2", lineX)
        .attr("y2", height)
        .attr("stroke", "#e5e5e5")
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "5,5");
        
      svg.append("text")
        .attr("x", lineX + 5)
        .attr("y", 15)
        .attr("fill", "#666")
        .attr("font-size", "12px")
        .text(`Génération ${generation === 0 ? "0 (référence)" : generation}`);
    }
  }

  // Dessiner les liens
  svg.selectAll(".link")
    .data(links)
    .enter()
    .append("path")
    .attr("class", "link")
    .attr("d", d => {
      if (d.type === 'spouse') {
        // Ligne droite pour les époux
        return `M${d.source.x},${d.source.y}L${d.target.x},${d.target.y}`;
      } else {
        // Relation parent-enfant
        if (isHorizontalLayout) {
          const controlY = (d.source.y + d.target.y) / 2;
          return `M${d.source.x},${d.source.y} C${d.source.x},${controlY} ${d.target.x},${controlY} ${d.target.x},${d.target.y}`;
        } else {
          const controlX = (d.source.x + d.target.x) / 2;
          return `M${d.source.x},${d.source.y} C${controlX},${d.source.y} ${controlX},${d.target.y} ${d.target.x},${d.target.y}`;
        }
      }
    })
    .attr("fill", "none")
    .attr("stroke", d => d.type === 'spouse' ? "url(#spouse-gradient)" : "#3f373c")
    .attr("stroke-width", d => d.type === 'spouse' ? 2.5 : 2)
    .attr("stroke-dasharray", d => d.type === 'spouse' ? "6,3" : "none")
    .attr("id", d => d.id);

  // Dessiner les nœuds
  const nodeGroups = svg.selectAll(".node")
    .data(nodes)
    .enter()
    .append("g")
    .attr("class", "node")
    .attr("transform", d => `translate(${d.x},${d.y})`)
    .attr("cursor", "pointer")
    .on("click", (event, d) => {
      handleNodeClick(d.person);
    });

  // Fond des nœuds avec gradient et effet de survol
  nodeGroups.append("rect")
    .attr("width", 180)
    .attr("height", 90)
    .attr("x", -90)
    .attr("y", -45)
    .attr("rx", 12)
    .attr("ry", 12)
    .attr("fill", d => {
      const gender = d.person.gender;
      if (gender === 'male') return "url(#male-gradient)";
      if (gender === 'female') return "url(#female-gradient)";
      return "url(#neutral-gradient)";
    })
    .attr("stroke", d => {
      // Mettre en évidence la personne racine
      if (d.person.id === rootPerson.id) return "#ff8c00";
      
      const gender = d.person.gender;
      if (gender === 'male') return "#8bbdbd";
      if (gender === 'female') return "#d8a0b4";
      return "#aaaaaa";
    })
    .attr("stroke-width", d => d.person.id === rootPerson.id ? 3 : 2)
    .attr("filter", "url(#drop-shadow)")
    .on("mouseover", function() {
      d3.select(this).attr("opacity", 0.8).attr("stroke-width", d => d.person.id === rootPerson.id ? 4 : 3);
    })
    .on("mouseout", function(event, d) {
      d3.select(this).attr("opacity", 1).attr("stroke-width", d.person.id === rootPerson.id ? 3 : 2);
    });

  // Icônes avec cercles de couleur
  nodeGroups.append("circle")
    .attr("r", 18)
    .attr("cx", -65)
    .attr("cy", -20)
    .attr("fill", d => {
      const gender = d.person.gender;
      if (gender === 'male') return "#4f86c6";
      if (gender === 'female') return "#c66493";
      return "#888888";
    });

  // Symboles homme/femme avec effet de brillance
  nodeGroups.append("text")
    .attr("x", -65)
    .attr("y", -14)
    .attr("text-anchor", "middle")
    .attr("font-family", "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif")
    .attr("font-size", "14px")
    .attr("fill", "white")
    .attr("font-weight", "bold")
    .text(d => {
      const gender = d.person.gender;
      if (gender === 'male') return "♂";
      if (gender === 'female') return "♀";
      return "?";
    });

  // Noms avec meilleure typographie
  nodeGroups.append("text")
    .attr("x", 0)
    .attr("y", -15)
    .attr("text-anchor", "middle")
    .attr("font-family", "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif")
    .attr("font-weight", "600")
    .attr("font-size", "15px")
    .attr("fill", "#2d2d2d")
    .text(d => d.person.name);

  // Dates avec style amélioré
  nodeGroups.append("text")
    .attr("x", 0)
    .attr("y", 12)
    .attr("text-anchor", "middle")
    .attr("font-family", "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif")
    .attr("font-size", "13px")
    .attr("fill", "#555")
    .text(d => {
      const person = d.person;
      if (person.birthYear) {
        return person.deathYear 
          ? `${person.birthYear} - ${person.deathYear}`
          : `${person.birthYear} - présent`;
      }
      return "";
    });

  // Indicateur de métadonnées supplémentaires
  nodeGroups.filter(d => d.person.metadata && 
                   Object.keys(d.person.metadata).length > 0)
    .append("circle")
    .attr("r", 10)
    .attr("cx", 65)
    .attr("cy", -20)
    .attr("fill", "#f0ad4e")
    .attr("opacity", 0.8);
    
  nodeGroups.filter(d => d.person.metadata && 
                   Object.keys(d.person.metadata).length > 0)
    .append("text")
    .attr("x", 65)
    .attr("y", -16)
    .attr("text-anchor", "middle")
    .attr("font-family", "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif")
    .attr("font-size", "12px")
    .attr("font-weight", "bold")
    .attr("fill", "white")
    .text("i");
  
  // Ajouter une étiquette spéciale pour la personne racine
  nodeGroups.filter(d => d.person.id === rootPerson.id)
    .append("text")
    .attr("x", 0)
    .attr("y", -60)
    .attr("text-anchor", "middle")
    .attr("font-family", "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif")
    .attr("font-size", "14px")
    .attr("font-weight", "bold")
    .attr("fill", "#ff8c00")
    .text("Référence");

  // Mettre à jour les chemins mis en évidence
  if (relationshipPath.length > 0) {
    highlightPath(relationshipPath);
  }

}, [rootPerson, familyData, handleNodeClick, relationshipPath, isHorizontalLayout, organizeByGeneration]);

const highlightPath = (path: Relationship[]) => {
  // Réinitialiser tous les liens
  d3.select(svgRef.current)
    .selectAll(".link")
    .attr("stroke", d => d.type === 'spouse' ? "url(#spouse-gradient)" : "#3f373c")
    .attr("stroke-width", d => d.type === 'spouse' ? 2.5 : 2)
    .attr("stroke-dasharray", d => d.type === 'spouse' ? "6,3" : "none");
  
  // Mettre en évidence le chemin avec un dégradé animé
  for (const rel of path) {
    d3.select(svgRef.current)
      .select(`#link-${rel.from}-${rel.to}, #link-${rel.to}-${rel.from}`)
      .attr("stroke", "url(#path-gradient)")
      .attr("stroke-width", 3.5)
      .attr("stroke-linecap", "round")
      .attr("stroke-dasharray", "6,3")
      .attr("opacity", 0.9);
  }
};


  // Créer les données d'arbre à partir de la personne racine
  const createTreeData = (root: Person) => {
    const visited = new Set<string>();
    
    function buildTree(person: Person) {
      if (visited.has(person.id)) return null;
      visited.add(person.id);
      
      const node = {
        id: person.id,
        person: person,
        children: [] as any[]
      };
      
      // Trouver les enfants
      const childRelationships = familyData.relationships.filter(
        r => r.from === person.id && r.type === 'parent-child'
      );
      
      for (const rel of childRelationships) {
        const child = familyData.persons.find(p => p.id === rel.to);
        if (child) {
          const childNode = buildTree(child);
          if (childNode) node.children.push(childNode);
        }
      }
      
      // Pour la racine uniquement, ajouter les parents également
      if (person.id === root.id) {
        const parentRelationships = familyData.relationships.filter(
          r => r.to === person.id && r.type === 'parent-child'
        );
        
        for (const rel of parentRelationships) {
          const parent = familyData.persons.find(p => p.id === rel.from);
          if (parent) {
            const parentNode = buildTree(parent);
            if (parentNode) node.children.push(parentNode);
          }
        }
        
        // Ajouter les relations fraternelles pour la racine
        const siblingRelationships = familyData.relationships.filter(
          r => (r.from === person.id || r.to === person.id) && r.type === 'sibling'
        );
        
        for (const rel of siblingRelationships) {
          const siblingId = rel.from === person.id ? rel.to : rel.from;
          const sibling = familyData.persons.find(p => p.id === siblingId);
          if (sibling) {
            const siblingNode = buildTree(sibling);
            if (siblingNode) node.children.push(siblingNode);
          }
        }
      }
      
      return node;
    }
    
    return buildTree(root);
  };

  // Fonctions de zoom
  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.1, 2));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.5));
  const toggleLayout = () => setIsHorizontalLayout(prev => !prev);

  return (
    <div className="flex flex-col w-full h-full bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg shadow-lg overflow-hidden">
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
            <svg ref={svgRef} width="1500" height="900">
              <defs>
                <linearGradient id="path-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#e67e22" />
                  <stop offset="100%" stopColor="#f39c12" />
                  <animate attributeName="x1" from="0%" to="100%" dur="3s" repeatCount="indefinite" />
                  <animate attributeName="x2" from="100%" to="200%" dur="3s" repeatCount="indefinite" />
                </linearGradient>
              </defs>
            </svg>
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
                    <p className="ml-6 text-amber-800">{selectedPerson.name} est le {pathDescription} de {rootPerson.name}</p>
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
  );
};

export default FamilyTree;