import { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { 
  User, Users, Heart, Search, UserPlus, GitPullRequest, 
  Network, Activity, ArrowRight, CornerDownRight, CheckCircle2,
  CircleAlert, Award, Zap, Home, Map, ChevronRight, Check, Sparkles,
  BadgePercent, Compass, ListFilter, Family
} from 'lucide-react';
import { GiFamilyTree } from 'react-icons/gi';

// Types pour le code (simplifiés par rapport aux imports originaux)
interface Person {
  id: string;
  name: string;
  gender?: 'male' | 'female';
  birthYear?: number;
  deathYear?: number;
  imageUrl?: string;
}

interface Relationship {
  type: 'parent-child' | 'spouse' | 'other';
  from: string;
  to: string;
  weight: number;
}

interface FamilyTreeData {
  persons: Person[];
  relationships: Relationship[];
}

interface Path {
  path: string[];
  relationshipPath: Relationship[];
  totalWeight: number;
}

interface PathFinderProps {
  familyData: FamilyTreeData;
}

// Fonctions mock pour simuler les algorithmes et fonctions utilitaires
const buildAdjacencyList = (familyData: FamilyTreeData) => {
  // Simulation de la création d'une liste d'adjacence
  const adjList = new Map();
  familyData.persons.forEach(person => {
    adjList.set(person.id, []);
  });
  
  familyData.relationships.forEach(rel => {
    if (!adjList.has(rel.from)) adjList.set(rel.from, []);
    if (!adjList.has(rel.to)) adjList.set(rel.to, []);
    
    adjList.get(rel.from).push({ to: rel.to, weight: rel.weight, relationship: rel });
    // Pour les relations non directionnelles comme "spouse"
    if (rel.type === 'spouse') {
      adjList.get(rel.to).push({ to: rel.from, weight: rel.weight, relationship: rel });
    }
  });
  
  return adjList;
};

const runDijkstra = (adjacencyList, sourceId, targetId, relationships) => {
  // Simulation de l'algorithme de Dijkstra
  // Dans une implémentation réelle, ceci serait l'algorithme complet
  
  // Pour démonstration, renvoyons un chemin fictif
  const relationshipsMap = new Map();
  relationships.forEach(rel => {
    const key = `${rel.from}-${rel.to}`;
    relationshipsMap.set(key, rel);
    const reverseKey = `${rel.to}-${rel.from}`;
    relationshipsMap.set(reverseKey, { ...rel, from: rel.to, to: rel.from });
  });
  
  // Trouver des relations connectant source et cible
  let path = [];
  let relationshipPath = [];
  let totalWeight = 0;
  
  // Dans une démo réelle, nous exécuterions l'algorithme ici
  // Pour cette simulation, trouvons un chemin simple s'il existe des relations directes
  
  // Vérifions s'il y a une relation directe
  const directRelKey = `${sourceId}-${targetId}`;
  if (relationshipsMap.has(directRelKey)) {
    const rel = relationshipsMap.get(directRelKey);
    path = [sourceId, targetId];
    relationshipPath = [rel];
    totalWeight = rel.weight;
  } else {
    // Sinon créons un chemin fictif à 2 étapes pour la démonstration
    // Trouvons un point intermédiaire
    let intermediate = null;
    
    // Cherchons un intermédiaire dans les relations
    for (const [key, rel] of relationshipsMap.entries()) {
      if (rel.from === sourceId) {
        const secondKey = `${rel.to}-${targetId}`;
        if (relationshipsMap.has(secondKey)) {
          intermediate = rel.to;
          break;
        }
      }
    }
    
    if (intermediate) {
      const firstRel = relationshipsMap.get(`${sourceId}-${intermediate}`);
      const secondRel = relationshipsMap.get(`${intermediate}-${targetId}`);
      
      path = [sourceId, intermediate, targetId];
      relationshipPath = [firstRel, secondRel];
      totalWeight = firstRel.weight + secondRel.weight;
    } else {
      // Pas de chemin trouvé
      return null;
    }
  }
  
  return { path, relationshipPath, totalWeight };
};

const runBellmanFord = (adjacencyList, sourceId, targetId, relationships) => {
  // Pour cette démonstration, utilisez la même simulation que Dijkstra
  return runDijkstra(adjacencyList, sourceId, targetId, relationships);
};

// Composant principal
const PathFinder = ({ familyData }: PathFinderProps) => {
  const [sourcePersonId, setSourcePersonId] = useState('');
  const [targetPersonId, setTargetPersonId] = useState('');
  const [algorithm, setAlgorithm] = useState('dijkstra');
  const [path, setPath] = useState<Path | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [relationship, setRelationship] = useState('');
  const [showGraph, setShowGraph] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('form'); // 'form' ou 'graph'
  
  const svgRef = useRef<SVGSVGElement>(null);
  
  // Fonction pour déterminer une relation textuelle entre les personnes
  const determineRelationship = (path) => {
    if (!path || !path.path || path.path.length < 2) return "Relation inconnue";
    
    const sourceId = path.path[0];
    const targetId = path.path[path.path.length - 1];
    
    const sourcePerson = familyData.persons.find(p => p.id === sourceId);
    const targetPerson = familyData.persons.find(p => p.id === targetId);
    
    if (!sourcePerson || !targetPerson) return "Relation inconnue";
    
    // Logique améliorée pour déterminer la relation
    if (path.relationshipPath.length === 1) {
      const rel = path.relationshipPath[0];
      if (rel.type === 'spouse') return "Conjoint(e)";
      if (rel.type === 'parent-child') {
        if (rel.from === sourceId) return "Parent";
        return "Enfant";
      }
    }
    
    // Pour les chemins plus longs
    if (path.totalWeight === 2) {
      // Vérifier les relations grand-parent/petit-enfant
      const isGrandparent = path.relationshipPath.every(r => r.type === 'parent-child');
      if (isGrandparent) {
        return path.relationshipPath[0].from === sourceId ? "Grand-parent" : "Petit-enfant";
      }
      
      // Vérifier les relations frère/sœur
      const isSibling = path.relationshipPath.some(r => r.type === 'parent-child');
      if (isSibling) return "Frère/Sœur";
    }
    
    // Cousin, oncle/tante, etc.
    if (path.totalWeight === 3) {
      return "Oncle/Tante ou Neveu/Nièce";
    } else if (path.totalWeight === 4) {
      return "Cousin(e)";
    }
    
    return `Parent au ${path.totalWeight}ème degré`;
  };

  const handleFindPath = () => {
    if (!sourcePersonId || !targetPersonId) {
      setError("Veuillez sélectionner deux personnes");
      setPath(null);
      setRelationship("");
      return;
    }

    if (sourcePersonId === targetPersonId) {
      setError("Veuillez sélectionner deux personnes différentes");
      setPath(null);
      setRelationship("");
      return;
    }

    setLoading(true);
    setError(null);

    // Simuler un temps de calcul
    setTimeout(() => {
      try {
        const adjacencyList = buildAdjacencyList(familyData);
        let result;

        if (algorithm === 'dijkstra') {
          result = runDijkstra(adjacencyList, sourcePersonId, targetPersonId, familyData.relationships);
        } else {
          result = runBellmanFord(adjacencyList, sourcePersonId, targetPersonId, familyData.relationships);
        }

        if (!result || result.path.length === 0) {
          setError("Aucun chemin trouvé entre ces deux personnes");
          setPath(null);
          setRelationship("");
        } else {
          setPath(result);
          setError(null);
          setRelationship(determineRelationship(result));
          setShowGraph(true);
          setActiveTab('results');
          
          // Une fois les résultats disponibles, rendre l'arbre généalogique
          setTimeout(() => {
            renderFamilyTree(result);
          }, 100);
        }
        setLoading(false);
      } catch (err) {
        setError("Erreur lors de la recherche du chemin: " + (err instanceof Error ? err.message : String(err)));
        setPath(null);
        setRelationship("");
        setLoading(false);
      }
    }, 1000);
  };

  const getPersonName = (personId) => {
    const person = familyData.persons.find(p => p.id === personId);
    return person ? person.name : 'Inconnu';
  };

  const getRelationshipType = (relationship) => {
    switch (relationship.type) {
      case 'parent-child':
        return relationship.weight === 1 ? 'parent de' : 
               relationship.weight === 2 ? 'grand-parent de' : 
               `${relationship.weight}e degré de parenté avec`;
      case 'spouse':
        return 'conjoint(e) de';
      case 'other':
        return 'relation avec';
      default:
        return 'lié(e) à';
    }
  };

  const getPersonIcon = (personId, index) => {
    // Déterminer si c'est un homme ou une femme pour l'icône
    const person = familyData.persons.find(p => p.id === personId);
    const isFirst = index === 0;
    const isLast = index === (path?.path.length || 0) - 1;
    
    if (isFirst) {
      return <User size={24} className="text-blue-600" />;
    } else if (isLast) {
      return <UserPlus size={24} className="text-blue-600" />;
    } else if (person?.gender === 'male') {
      return <User size={24} className="text-gray-700" />;
    } else {
      return <User size={24} className="text-pink-500" />;
    }
  };

  const getRelationshipIcon = (relationship) => {
    switch (relationship?.type) {
      case 'parent-child':
        return <GitPullRequest size={18} className="text-gray-700" />;
      case 'spouse':
        return <Heart size={18} className="text-pink-500" />;
      default:
        return <Network size={18} className="text-gray-700" />;
    }
  };

  // Fonction pour rendre l'arbre généalogique avec D3
  const renderFamilyTree = (pathResult) => {
    if (!svgRef.current || !pathResult) return;

    // Nettoyage du SVG
    d3.select(svgRef.current).selectAll("*").remove();

    const width = 900;
    const height = 500;
    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet");

    // Définir les gradients et filtres
    const defs = svg.append("defs");
    
    // Gradient pour les hommes
    defs.append("linearGradient")
      .attr("id", "male-gradient")
      .attr("x1", "0%").attr("y1", "0%")
      .attr("x2", "100%").attr("y2", "100%")
      .selectAll("stop")
      .data([
        {offset: "0%", color: "#d9e8ff"},
        {offset: "100%", color: "#a0c8ff"}
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
        {offset: "0%", color: "#ffe0eb"},
        {offset: "100%", color: "#ffb0c6"}
      ])
      .enter().append("stop")
      .attr("offset", d => d.offset)
      .attr("stop-color", d => d.color);
      
    // Gradient pour le chemin
    defs.append("linearGradient")
      .attr("id", "path-gradient")
      .attr("x1", "0%").attr("y1", "0%")
      .attr("x2", "100%").attr("y2", "0%")
      .selectAll("stop")
      .data([
        {offset: "0%", color: "#ff3a45"},
        {offset: "50%", color: "#ff5e62"},
        {offset: "100%", color: "#ff9966"}
      ])
      .enter().append("stop")
      .attr("offset", d => d.offset)
      .attr("stop-color", d => d.color);

    // Filtres pour les ombres
    defs.append("filter")
      .attr("id", "drop-shadow")
      .attr("height", "130%")
      .append("feDropShadow")
      .attr("dx", 1)
      .attr("dy", 3)
      .attr("stdDeviation", 4)
      .attr("flood-color", "rgba(0, 0, 0, 0.3)")
      .attr("flood-opacity", 0.5);

    // Créer une disposition en force dirigée
    const simulation = d3.forceSimulation()
      .force("link", d3.forceLink().id(d => d.id).distance(150))
      .force("charge", d3.forceManyBody().strength(-500))
      .force("center", d3.forceCenter(width / 2, height / 2));

    // Créer les nœuds et liens pour la simulation
    const nodes = familyData.persons.map(person => ({...person}));
    const links = familyData.relationships.map(rel => ({
      source: rel.from,
      target: rel.to,
      type: rel.type,
      weight: rel.weight,
      highlighted: pathResult.relationshipPath.some(
        r => (r.from === rel.from && r.to === rel.to) || (r.from === rel.to && r.to === rel.from)
      )
    }));

    // Liens
    const link = svg.append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(links)
      .enter().append("line")
      .attr("stroke-width", d => d.highlighted ? 4 : 2)
      .attr("stroke", d => d.highlighted ? "url(#path-gradient)" : 
                           (d.type === 'spouse' ? "#ff69b4" : "#999"))
      .attr("stroke-dasharray", d => d.type === 'spouse' ? "5,5" : "")
      .attr("opacity", d => d.highlighted ? 1 : 0.6);

    // Nœuds
    const node = svg.append("g")
      .attr("class", "nodes")
      .selectAll("g")
      .data(nodes)
      .enter().append("g")
      .attr("class", "node")
      .attr("filter", "url(#drop-shadow)")
      .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

    // Créer des cercles pour les femmes et des rectangles pour les hommes
    node.each(function(d) {
      const nodeElement = d3.select(this);
      const isInPath = pathResult.path.includes(d.id);
      const nodeSize = 30;
      
      if (d.gender === 'female') {
        nodeElement.append("circle")
          .attr("r", nodeSize)
          .attr("fill", "url(#female-gradient)")
          .attr("stroke", isInPath ? "#ff3a45" : "#d8a0b4")
          .attr("stroke-width", isInPath ? 3 : 1.5);
      } else {
        nodeElement.append("rect")
          .attr("width", nodeSize * 2)
          .attr("height", nodeSize * 2)
          .attr("x", -nodeSize)
          .attr("y", -nodeSize)
          .attr("rx", 6)
          .attr("fill", "url(#male-gradient)")
          .attr("stroke", isInPath ? "#ff3a45" : "#8bbdbd")
          .attr("stroke-width", isInPath ? 3 : 1.5);
      }
      
      // Texte des noms
      nodeElement.append("text")
        .attr("dy", nodeSize + 15)
        .attr("text-anchor", "middle")
        .attr("fill", "#333")
        .attr("font-size", "12px")
        .attr("font-weight", isInPath ? "bold" : "normal")
        .text(d.name);
    });

    // Animation de la simulation
    simulation
      .nodes(nodes)
      .on("tick", ticked);

    simulation.force("link")
      .links(links);

    function ticked() {
      link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

      node
        .attr("transform", d => `translate(${d.x},${d.y})`);
    }

    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 bg-gray-50 min-h-screen">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-xl p-6 text-white mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <div className="bg-white bg-opacity-20 p-3 text-indigo-800 rounded-full">
            <GiFamilyTree size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Explorateur de liens familiaux</h1>
            <p className="text-indigo-100">
              Découvrez les liens de parenté entre les membres de votre arbre généalogique
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap text-black items-center gap-4 mt-4">
          <div className="flex items-center text-indigo-800 bg-white bg-opacity-10 px-4 py-2 rounded-lg">
            <Users size={18} className="mr-2" />
            <span>{familyData.persons.length} personnes</span>
          </div>
          <div className="flex items-center text-indigo-800 bg-white bg-opacity-10 px-4 py-2 rounded-lg">
            <Network size={18} className="mr-2" />
            <span>{familyData.relationships.length} liens</span>
          </div>
          <div className="flex items-center text-indigo-800 bg-white bg-opacity-10 px-4 py-2 rounded-lg">
            <Compass size={18} className="mr-2" />
            <span>Algorithmes avancés</span>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
        <div className="flex border-b">
          <button 
            className={`flex items-center px-6 py-4 text-lg font-medium transition-all ${activeTab === 'form' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-indigo-500'}`}
            onClick={() => setActiveTab('form')}
          >
            <Search size={20} className="mr-2" />
            Rechercher un lien
          </button>
          {path && (
            <button 
              className={`flex items-center px-6 py-4 text-lg font-medium transition-all ${activeTab === 'results' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-indigo-500'}`}
              onClick={() => setActiveTab('results')}
            >
              <Award size={20} className="mr-2" />
              Résultats
            </button>
          )}
          {showGraph && (
            <button 
              className={`flex items-center px-6 py-4 text-lg font-medium transition-all ${activeTab === 'graph' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-indigo-500'}`}
              onClick={() => setActiveTab('graph')}
            >
              <Network size={20} className="mr-2" />
              Visualisation
            </button>
          )}
        </div>
        
        {activeTab === 'form' && (
          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                  <User size={16} className="text-indigo-500" />
                  Personne source
                </label>
                <div className="relative">
                  <select
                    className="w-full rounded-lg border-gray-300 pl-10 pr-4 py-3 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                    value={sourcePersonId}
                    onChange={(e) => setSourcePersonId(e.target.value)}
                  >
                    <option value="">Sélectionnez une personne</option>
                    {familyData.persons.map((person) => (
                      <option key={person.id} value={person.id}>
                        {person.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <User size={18} className="text-indigo-500" />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                  <UserPlus size={16} className="text-indigo-500" />
                  Personne cible
                </label>
                <div className="relative">
                  <select
                    className="w-full rounded-lg border-gray-300 pl-10 pr-4 py-3 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                    value={targetPersonId}
                    onChange={(e) => setTargetPersonId(e.target.value)}
                  >
                    <option value="">Sélectionnez une personne</option>
                    {familyData.persons.map((person) => (
                      <option key={person.id} value={person.id}>
                        {person.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <UserPlus size={18} className="text-indigo-500" />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                <Activity size={16} className="text-indigo-500" />
                Algorithme de recherche
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div 
                  className={`group border-2 rounded-xl p-5 cursor-pointer transition-all hover:bg-indigo-50 ${algorithm === 'dijkstra' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200'}`}
                  onClick={() => setAlgorithm('dijkstra')}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`rounded-full p-3 ${algorithm === 'dijkstra' ? 'bg-indigo-100' : 'bg-gray-100 group-hover:bg-indigo-100'}`}>
                        <Zap size={24} className={algorithm === 'dijkstra' ? 'text-indigo-600' : 'text-gray-500 group-hover:text-indigo-600'} />
                      </div>
                      <div>
                        <h3 className={`font-medium text-lg ${algorithm === 'dijkstra' ? 'text-indigo-600' : 'text-gray-700'}`}>Dijkstra</h3>
                        <p className="text-sm text-gray-500">Optimal pour les poids positifs</p>
                      </div>
                    </div>
                    {algorithm === 'dijkstra' && <Check size={24} className="text-indigo-600" />}
                  </div>
                </div>
                
                <div 
                  className={`group border-2 rounded-xl p-5 cursor-pointer transition-all hover:bg-purple-50 ${algorithm === 'bellmanFord' ? 'border-purple-500 bg-purple-50' : 'border-gray-200'}`}
                  onClick={() => setAlgorithm('bellmanFord')}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`rounded-full p-3 ${algorithm === 'bellmanFord' ? 'bg-purple-100' : 'bg-gray-100 group-hover:bg-purple-100'}`}>
                        <Network size={24} className={algorithm === 'bellmanFord' ? 'text-purple-600' : 'text-gray-500 group-hover:text-purple-600'} />
                      </div>
                      <div>
                        <h3 className={`font-medium text-lg ${algorithm === 'bellmanFord' ? 'text-purple-600' : 'text-gray-700'}`}>Bellman-Ford</h3>
                        <p className="text-sm text-gray-500">Supporte les poids négatifs</p>
                      </div>
                    </div>
                    {algorithm === 'bellmanFord' && <Check size={24} className="text-purple-600" />}
                  </div>
                </div>
              </div>
            </div>
            
            <button
              className={`w-full py-4 rounded-xl shadow-lg font-semibold text-white flex items-center justify-center gap-3 transition-all ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'}`}
              onClick={handleFindPath}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  Recherche en cours...
                </>
              ) : (
                <>
                  <Search size={18} />
                  Rechercher le lien familial
                </>
              )}
            </button>
          </div>
        )}
        
        {activeTab === 'results' && path && (
          <div className="p-8">
            <div className="bg-gradient-to-r from-emerald-100 to-teal-100 p-6 rounded-xl mb-8">
              <div className="flex items-center space-x-4">
                <div className="bg-emerald-500 p-3 rounded-full text-white">
                  <Sparkles size={24} />
                </div>
                <div>
                  <p className="text-lg font-medium text-emerald-800 mb-1">Relation trouvée : {relationship}</p>
                  <p className="text-gray-600">Distance : {path.totalWeight} {path.totalWeight > 1 ? 'degrés' : 'degré'} de séparation</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Map size={20} className="text-indigo-500 mr-2" />
                Chemin détaillé
              </h3>
              
              <div className="space-y-4">
                {path.path.map((personId, index) => (
                  <div key={personId}>
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                        {getPersonIcon(personId, index)}
                      </div>
                      <div className="ml-4">
                        <p className="font-medium text-gray-800">{getPersonName(personId)}</p>
                        {index === 0 && <p className="text-sm text-gray-500">Point de départ</p>}
                        {index === path.path.length - 1 && <p className="text-sm text-gray-500">Destination</p>}
                      </div>
                    </div>
                    
                    {index < path.path.length - 1 && (
                      <div className="flex items-center my-3 ml-6">
                        <div className="w-0.5 h-8 bg-gray-300 mx-auto"></div>
                        <div className="ml-6 flex items-center">
                          <div className="bg-gray-100 p-2 rounded-full">
                            {getRelationshipIcon(path.relationshipPath[index])}
                          </div>
                          <div className="ml-3">
                            <p className="text-sm text-gray-600">
                              {path.relationshipPath[index].from === personId
                                ? `est ${getRelationshipType(path.relationshipPath[index])}`
                                : `a pour ${getRelationshipType({...path.relationshipPath[index], from: path.relationshipPath[index].to, to: path.relationshipPath[index].from})}`}
                              {" "}
                              <span className="font-medium">{getPersonName(path.path[index + 1])}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex justify-center">
              <button
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-md flex items-center gap-2 transition-all"
                onClick={() => setActiveTab('graph')}
              >
                <Network size={18} />
                Voir la visualisation graphique
              </button>
            </div>
          </div>
        )}
        
        {activeTab === 'graph' && (
          <div className="p-6">
            <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
                <Network size={20} className="text-indigo-500 mr-2" />
                Visualisation de l'arbre généalogique
              </h3>
              <p className="text-gray-600 mb-4">
                Le chemin en surbrillance montre la relation entre <span className="font-medium">{getPersonName(sourcePersonId)}</span> et <span className="font-medium">{getPersonName(targetPersonId)}</span>
              </p>
              <div className="bg-gray-50 rounded-lg p-2 flex items-center gap-6 mb-4">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-blue-500 rounded-md mr-2"></div>
                  <span className="text-sm text-gray-600">Homme</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-pink-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600">Femme</span>
                </div>
                <div className="flex items-center">
                  <div className="w-12 h-1 bg-gradient-to-r from-red-400 to-orange-400 mr-2"></div>
                  <span className="text-sm text-gray-600">Chemin trouvé</span>
                </div>
                <div className="flex items-center">
                  <div className="w-12 h-1 border-t-2 border-dashed border-pink-400 mr-2"></div>
                  <span className="text-sm text-gray-600">Lien conjugal</span>
                </div>
              </div>
              <div className="flex justify-center overflow-x-auto">
                <svg ref={svgRef} className="w-full h-[600px]" />
              </div>
              <p className="text-sm text-gray-500 mt-4 text-center italic">
                Conseil : Vous pouvez glisser-déposer les nœuds pour réorganiser l'arbre
              </p>
            </div>
            
            <div className="flex justify-center">
              <button
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-md flex items-center gap-2 transition-all"
                onClick={() => setActiveTab('form')}
              >
                <ArrowRight size={18} />
                Faire une nouvelle recherche
              </button>
            </div>
          </div>
        )}
        
        {error && (
          <div className="mx-8 mb-8 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
            <CircleAlert size={24} className="text-red-500 mr-3" />
            <p className="text-red-600">{error}</p>
          </div>
        )}
      </div>
      
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <BadgePercent size={20} className="text-indigo-500 mr-2" />
          À propos de l'algorithme
        </h2>
        <div className="prose max-w-none text-gray-600">
          <p>
            Cette application utilise des algorithmes de recherche de chemin pour trouver les relations 
            entre les membres d'une famille. Ces algorithmes sont couramment utilisés dans la théorie des graphes.
          </p>
          
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-indigo-100 rounded-lg p-4 bg-indigo-50">
              <h3 className="text-lg font-medium text-indigo-700 mb-2 flex items-center">
                <Zap size={18} className="mr-2" />
                Dijkstra
              </h3>
              <p className="text-sm">
                L'algorithme de Dijkstra trouve le chemin le plus court entre deux nœuds 
                dans un graphe avec des poids positifs. Il est efficace pour les arbres généalogiques 
                où les relations ont des distances positives.
              </p>
            </div>
            
            <div className="border border-purple-100 rounded-lg p-4 bg-purple-50">
              <h3 className="text-lg font-medium text-purple-700 mb-2 flex items-center">
                <Network size={18} className="mr-2" />
                Bellman-Ford
              </h3>
              <p className="text-sm">
                L'algorithme de Bellman-Ford peut traiter des graphes avec des poids négatifs. 
                Dans le contexte généalogique, cela peut être utile pour modéliser certains types 
                de relations complexes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PathFinder;