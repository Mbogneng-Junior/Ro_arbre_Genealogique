import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  User, Users, Heart, Calendar, Search, 
  ChevronsRight, X, ZoomIn, ZoomOut, Info
} from 'lucide-react';
import * as d3 from 'd3';

// Composant principal d'arbre généalogique
const FamilyTree = ({ familyData }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [rootPerson, setRootPerson] = useState(null);
  const [relationshipPath, setRelationshipPath] = useState([]);
  const [pathDescription, setPathDescription] = useState('');
  const [isHorizontalLayout, setIsHorizontalLayout] = useState(true);
  const [zoom, setZoom] = useState(1);
  
  const svgRef = useRef(null);
  const containerRef = useRef(null);

  // Initialiser avec la première personne
  useEffect(() => {
    if (familyData.persons.length > 0 && !rootPerson) {
      setRootPerson(familyData.persons[0]);
    }
  }, [familyData.persons, rootPerson]);

  // Rechercher une personne par nom
  const findPersonByName = useCallback((name) => {
    const lowerName = name.toLowerCase();
    return familyData.persons.find(p => p.name.toLowerCase().includes(lowerName)) || null;
  }, [familyData.persons]);

  // Générer une description de relation
  const generatePathDescription = useCallback((path, start, end) => {
    // Utilisation de la fonction importée getRelationshipDescription
    if (path.length === 0) return "Aucune relation trouvée";
    
    // Version simplifiée pour démonstration
    let description = "";
    
    if (path.length === 1) {
      const rel = path[0];
      if (rel.type === 'parent-child') {
        if (rel.from === start.id) {
          description = end.gender === 'male' ? "Fils" : "Fille";
        } else {
          description = end.gender === 'male' ? "Père" : "Mère";
        }
      } else if (rel.type === 'spouse') {
        description = end.gender === 'male' ? "Époux" : "Épouse";
      } else if (rel.type === 'sibling') {
        description = end.gender === 'male' ? "Frère" : "Sœur";
      }
    } else {
      description = `Relation de ${path.length} degrés`;
    }
    
    return description;
  }, []);

  // Rechercher une personne
  const handleSearch = () => {
    const found = findPersonByName(searchTerm);
    if (found) {
      setRootPerson(found);
      setSelectedPerson(null);
      setRelationshipPath([]);
      setPathDescription('');
    }
  };

  // Gérer le clic sur un nœud
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

  // Trouver le chemin relationnel entre deux personnes
  const findRelationshipPath = (data, startId, endId) => {
    if (startId === endId) return [];
    const visited = new Set();
    const queue = [{ id: startId, path: [] }];
    
    while (queue.length > 0) {
      const { id, path } = queue.shift();
      if (id === endId) return path;
      if (!visited.has(id)) {
        visited.add(id);
        const relationships = data.relationships.filter(r => r.from === id || r.to === id);
        for (const rel of relationships) {
          const nextId = rel.from === id ? rel.to : rel.from;
          if (!visited.has(nextId)) {
            queue.push({id: nextId, path: [...path, rel]});
          }
        }
      }
    }
    return [];
  };

  // Calculer la génération relative pour chaque personne
  const calculateGenerations = useCallback(() => {
    if (!rootPerson) return {};
    
    const generations = {};
    const visited = new Set();
    const queue = [{ id: rootPerson.id, gen: 0 }];
    
    // Marquer la génération 0 (point de référence)
    generations[rootPerson.id] = 0;
    
    while (queue.length > 0) {
      const { id, gen } = queue.shift();
      if (!visited.has(id)) {
        visited.add(id);
        
        // Trouver toutes les relations
        const relationships = familyData.relationships.filter(r => r.from === id || r.to === id);
        
        for (const rel of relationships) {
          const nextId = rel.from === id ? rel.to : rel.from;
          
          if (!visited.has(nextId)) {
            let nextGen = gen;
            
            // Déterminer la différence de génération selon le type de relation
            if (rel.type === 'parent-child') {
              // Si la personne actuelle est parent de la suivante
              if (rel.from === id) {
                nextGen = gen + 1; // Descendant (enfant) = génération +1
              } else {
                nextGen = gen - 1; // Ascendant (parent) = génération -1
              }
            } else if (rel.type === 'spouse' || rel.type === 'sibling') {
              // Même génération pour époux/épouse et frères/sœurs
              nextGen = gen;
            }
            
            generations[nextId] = nextGen;
            queue.push({ id: nextId, gen: nextGen });
          }
        }
      }
    }
    
    return generations;
  }, [rootPerson, familyData.relationships]);

  // Construire les données structurées pour l'arbre
  const buildTreeData = useCallback(() => {
    if (!rootPerson) return { nodes: [], links: [] };
    
    const generations = calculateGenerations();
    const nodes = [];
    const links = [];
    const visited = new Set();
    
    // Créer tous les nœuds avec leur génération
    familyData.persons.forEach(person => {
      if (generations[person.id] !== undefined) {
        nodes.push({
          id: person.id,
          name: person.name,
          gender: person.gender,
          birthYear: person.birthYear,
          deathYear: person.deathYear,
          metadata: person.metadata || {},
          generation: generations[person.id],
          person: person
        });
      }
    });
    
    // Créer les liens entre les nœuds
    familyData.relationships.forEach(rel => {
      if (generations[rel.from] !== undefined && generations[rel.to] !== undefined) {
        links.push({
          source: rel.from,
          target: rel.to,
          type: rel.type
        });
      }
    });
    
    return { nodes, links };
  }, [rootPerson, familyData.persons, familyData.relationships, calculateGenerations]);

  // Effet pour dessiner l'arbre
  useEffect(() => {
    if (!svgRef.current || !rootPerson) return;
    
    // Nettoyer le SVG existant
    d3.select(svgRef.current).selectAll("*").remove();
    
    // Récupérer les données structurées
    const { nodes, links } = buildTreeData();
    
    if (!nodes.length) return;
    
    // Dimensions et marges
    const margin = { top: 100, right: 100, bottom: 100, left: 100 };
    const width = 1200 - margin.left - margin.right;
    const height = 800 - margin.top - margin.bottom;
    
    const svg = d3.select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Définir les gradients et filtres
    const defs = svg.append("defs");
    
    // Gradient pour hommes
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
    
    // Gradient pour femmes
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
    
    // Filtre pour ombre
    defs.append("filter")
      .attr("id", "drop-shadow")
      .attr("height", "130%")
      .append("feDropShadow")
      .attr("dx", 0)
      .attr("dy", 3)
      .attr("stdDeviation", 3)
      .attr("flood-color", "rgba(0, 0, 0, 0.3)")
      .attr("flood-opacity", 0.5);
    
    // Gradient doré pour les liens de mariage
    defs.append("linearGradient")
      .attr("id", "gold-gradient")
      .attr("x1", "0%").attr("y1", "0%")
      .attr("x2", "100%").attr("y2", "0%")
      .selectAll("stop")
      .data([
        {offset: "0%", color: "#e6c200"},
        {offset: "50%", color: "#ffd700"},
        {offset: "100%", color: "#e6c200"}
      ])
      .enter().append("stop")
      .attr("offset", d => d.offset)
      .attr("stop-color", d => d.color);
    
    // Grouper les nœuds par génération
    const nodesByGeneration = {};
    nodes.forEach(node => {
      if (!nodesByGeneration[node.generation]) {
        nodesByGeneration[node.generation] = [];
      }
      nodesByGeneration[node.generation].push(node);
    });
    
    // Déterminer l'étendue des générations
    const generations = Object.keys(nodesByGeneration).map(Number);
    const minGeneration = Math.min(...generations);
    const maxGeneration = Math.max(...generations);
    
    // Positionner les nœuds en fonction de leur génération
    const nodePositions = {};
    
    if (isHorizontalLayout) {
      // Disposition horizontale (générations les plus anciennes à gauche)
      const genSpacing = width / (maxGeneration - minGeneration + 3); // Espace entre générations
      
      for (let gen = minGeneration; gen <= maxGeneration; gen++) {
        const nodesInGen = nodesByGeneration[gen] || [];
        const nodeSpacing = height / (nodesInGen.length + 1);
        
        nodesInGen.forEach((node, idx) => {
          nodePositions[node.id] = {
            x: (gen - minGeneration + 1) * genSpacing,
            y: (idx + 1) * nodeSpacing
          };
        });
      }
    } else {
      // Disposition verticale (générations les plus anciennes en haut)
      const genSpacing = height / (maxGeneration - minGeneration + 3);
      
      for (let gen = minGeneration; gen <= maxGeneration; gen++) {
        const nodesInGen = nodesByGeneration[gen] || [];
        const nodeSpacing = width / (nodesInGen.length + 1);
        
        nodesInGen.forEach((node, idx) => {
          nodePositions[node.id] = {
            x: (idx + 1) * nodeSpacing,
            y: (gen - minGeneration + 1) * genSpacing
          };
        });
      }
    }
    
    // Dessiner les lignes des générations
    for (let gen = minGeneration; gen <= maxGeneration; gen++) {
      if (isHorizontalLayout) {
        const x = (gen - minGeneration + 1) * (width / (maxGeneration - minGeneration + 3));
        
        svg.append("line")
          .attr("x1", x)
          .attr("y1", 0)
          .attr("x2", x)
          .attr("y2", height)
          .attr("stroke", "#e5e5e5")
          .attr("stroke-width", 1)
          .attr("stroke-dasharray", "5,5");
          
        svg.append("text")
          .attr("x", x)
          .attr("y", -20)
          .attr("text-anchor", "middle")
          .attr("fill", "#888")
          .attr("font-size", "14px")
          .attr("font-weight", "600")
          .text(`Génération ${gen === 0 ? '0' : gen > 0 ? '+' + gen : gen}`);
      } else {
        const y = (gen - minGeneration + 1) * (height / (maxGeneration - minGeneration + 3));
        
        svg.append("line")
          .attr("x1", 0)
          .attr("y1", y)
          .attr("x2", width)
          .attr("y2", y)
          .attr("stroke", "#e5e5e5")
          .attr("stroke-width", 1)
          .attr("stroke-dasharray", "5,5");
          
        svg.append("text")
          .attr("x", -70)
          .attr("y", y)
          .attr("dominant-baseline", "middle")
          .attr("fill", "#888")
          .attr("font-size", "14px")
          .attr("font-weight", "600")
          .text(`Génération ${gen === 0 ? '0' : gen > 0 ? '+' + gen : gen}`);
      }
    }
    
    // Dessiner les liens (d'abord ceux parent-enfant, puis époux)
    const familyLinks = links.filter(link => link.type === 'parent-child');
    const spouseLinks = links.filter(link => link.type === 'spouse');
    
    // Dessiner les liens parent-enfant
    svg.selectAll(".family-link")
      .data(familyLinks)
      .enter()
      .append("line")
      .attr("class", "family-link")
      .attr("x1", d => nodePositions[d.source].x)
      .attr("y1", d => nodePositions[d.source].y)
      .attr("x2", d => nodePositions[d.target].x)
      .attr("y2", d => nodePositions[d.target].y)
      .attr("stroke", "#333")
      .attr("stroke-width", 2)
      .attr("id", d => `link-${d.source}-${d.target}`);
    
    // Dessiner les liens d'époux en pointillés dorés
    svg.selectAll(".spouse-link")
      .data(spouseLinks)
      .enter()
      .append("line")
      .attr("class", "spouse-link")
      .attr("x1", d => nodePositions[d.source].x)
      .attr("y1", d => nodePositions[d.source].y)
      .attr("x2", d => nodePositions[d.target].x)
      .attr("y2", d => nodePositions[d.target].y)
      .attr("stroke", "url(#gold-gradient)")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "6,4")
      .attr("id", d => `link-${d.source}-${d.target}`);
    
    // Dessiner les nœuds
    const nodeGroups = svg.selectAll(".node")
      .data(nodes)
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", d => `translate(${nodePositions[d.id].x}, ${nodePositions[d.id].y})`)
      .attr("cursor", "pointer")
      .on("click", (event, d) => handleNodeClick(d.person));
    
    // Fond des nœuds
    nodeGroups.append("rect")
      .attr("width", 180)
      .attr("height", 90)
      .attr("x", -90)
      .attr("y", -45)
      .attr("rx", 12)
      .attr("ry", 12)
      .attr("fill", d => {
        const gender = d.gender;
        if (gender === 'male') return "url(#male-gradient)";
        if (gender === 'female') return "url(#female-gradient)";
        return "url(#neutral-gradient)";
      })
      .attr("stroke", d => {
        if (d.id === rootPerson.id) return "#ff6b00"; // Personne centrale en surbrillance
        const gender = d.gender;
        if (gender === 'male') return "#8bbdbd";
        if (gender === 'female') return "#d8a0b4";
        return "#aaaaaa";
      })
      .attr("stroke-width", d => d.id === rootPerson.id ? 3 : 2)
      .attr("filter", "url(#drop-shadow)")
      .on("mouseover", function() {
        d3.select(this).attr("opacity", 0.8).attr("stroke-width", 3);
      })
      .on("mouseout", function(event, d) {
        d3.select(this).attr("opacity", 1).attr("stroke-width", d.id === rootPerson.id ? 3 : 2);
      });
    
    // Cercles de genre
    nodeGroups.append("circle")
      .attr("r", 18)
      .attr("cx", -65)
      .attr("cy", -20)
      .attr("fill", d => {
        const gender = d.gender;
        if (gender === 'male') return "#4f86c6";
        if (gender === 'female') return "#c66493";
        return "#888888";
      });
    
    // Symboles homme/femme
    nodeGroups.append("text")
      .attr("x", -65)
      .attr("y", -14)
      .attr("text-anchor", "middle")
      .attr("font-family", "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif")
      .attr("font-size", "14px")
      .attr("fill", "white")
      .attr("font-weight", "bold")
      .text(d => {
        const gender = d.gender;
        if (gender === 'male') return "♂";
        if (gender === 'female') return "♀";
        return "?";
      });
    
    // Noms
    nodeGroups.append("text")
      .attr("x", 0)
      .attr("y", -15)
      .attr("text-anchor", "middle")
      .attr("font-family", "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif")
      .attr("font-weight", "600")
      .attr("font-size", "15px")
      .attr("fill", "#2d2d2d")
      .text(d => d.name);
    
    // Dates
    nodeGroups.append("text")
      .attr("x", 0)
      .attr("y", 12)
      .attr("text-anchor", "middle")
      .attr("font-family", "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif")
      .attr("font-size", "13px")
      .attr("fill", "#555")
      .text(d => {
        if (d.birthYear) {
          return d.deathYear 
            ? `${d.birthYear} - ${d.deathYear}`
            : `${d.birthYear} - présent`;
        }
        return "";
      });
    
    // Indicateur de métadonnées
    nodeGroups.filter(d => d.metadata && Object.keys(d.metadata).length > 0)
      .append("circle")
      .attr("r", 10)
      .attr("cx", 65)
      .attr("cy", -20)
      .attr("fill", "#f0ad4e")
      .attr("opacity", 0.8);
      
    nodeGroups.filter(d => d.metadata && Object.keys(d.metadata).length > 0)
      .append("text")
      .attr("x", 65)
      .attr("y", -16)
      .attr("text-anchor", "middle")
      .attr("font-family", "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif")
      .attr("font-size", "12px")
      .attr("font-weight", "bold")
      .attr("fill", "white")
      .text("i");
    
    // Mettre en évidence le chemin relationnel
    if (relationshipPath.length > 0) {
      highlightRelationshipPath(relationshipPath);
    }
    
  }, [rootPerson, isHorizontalLayout, buildTreeData, handleNodeClick, relationshipPath]);
  
  // Fonction pour mettre en évidence le chemin relationnel
  const highlightRelationshipPath = (path) => {
    path.forEach(rel => {
      d3.select(svgRef.current)
        .select(`#link-${rel.from}-${rel.to}, #link-${rel.to}-${rel.from}`)
        .attr("stroke", rel.type === 'spouse' ? "#ffcc00" : "#ff6b00")
        .attr("stroke-width", 4)
        .attr("opacity", 1);
    });
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
              "🔄 Vue Verticale" : 
              "🔄 Vue Horizontale"
            }
          </button>
        </div>
      </div>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Panneau principal de l'arbre */}
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
          
          <div 
            className="transform origin-center transition-transform duration-200"
            style={{ transform: `scale(${zoom})` }}
          >
            <svg ref={svgRef} width="1200" height="800">
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
          
          {/* Légende */}
          <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-md p-3 z-10">
            <h3 className="text-sm font-bold mb-2 text-gray-700">Légende</h3>
            <div className="flex items-center mb-1">
              <div className="w-6 h-1 bg-black mr-2"></div>
              <span className="text-xs text-gray-700">Relation parent-enfant</span>
            </div>
            <div className="flex items-center">
              <div className="w-6 h-1 bg-yellow-500 mr-2" style={{ strokeDasharray: '3,2' }}></div>
              <span className="text-xs text-gray-700">Relation conjugale</span>
            </div>
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
                      selectedPerson.gender === 'female