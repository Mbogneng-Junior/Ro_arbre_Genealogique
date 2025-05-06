import { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { 
  User, Users, Heart, Search, UserPlus, Network, Activity, CheckCircle2,
  CircleAlert, Award, Zap, Sparkles, BadgePercent, Compass, Link, ArrowLeft
} from 'lucide-react';
import { GiFamilyTree } from 'react-icons/gi';

interface Person {
  id: string;
  name: string;
  gender?: 'male' | 'female';
  birthYear?: number;
  deathYear?: number;
  imageUrl?: string;
}

interface Relationship {
  type: 'parent-child' | 'spouse' | 'other' | 'sibling';
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

const buildAdjacencyList = (familyData: FamilyTreeData) => {
  const adjList = new Map();
  familyData.persons.forEach(person => adjList.set(person.id, []));
  
  familyData.relationships.forEach(rel => {
    if (!adjList.has(rel.from)) adjList.set(rel.from, []);
    if (!adjList.has(rel.to)) adjList.set(rel.to, []);
    
    adjList.get(rel.from).push({ to: rel.to, weight: rel.weight, relationship: rel });
    if (rel.type === 'spouse') {
      adjList.get(rel.to).push({ to: rel.from, weight: rel.weight, relationship: rel });
    }
  });
  
  return adjList;
};

const findRelationshipPath = (familyData, sourceId, targetId) => {
  if (sourceId === targetId) return [];
  
  const graph = {};
  familyData.persons.forEach(person => { graph[person.id] = []; });
  
  familyData.relationships.forEach(rel => {
    graph[rel.from].push({ to: rel.to, relationshipData: rel });
    graph[rel.to].push({ to: rel.from, relationshipData: rel });
  });
  
  const queue = [{ id: sourceId, path: [] }];
  const visited = new Set([sourceId]);
  
  while (queue.length > 0) {
    const { id: currentId, path } = queue.shift();
    
    for (const connection of graph[currentId]) {
      const nextId = connection.to;
      
      if (nextId === targetId) {
        return [...path, connection.relationshipData];
      }
      
      if (!visited.has(nextId)) {
        visited.add(nextId);
        queue.push({ id: nextId, path: [...path, connection.relationshipData] });
      }
    }
  }
  
  return [];
};

// Fonction modifiée pour gérer les cas où les personnes ne sont pas définies
const getRelationshipDescription = (path, persons, sourcePerson, targetPerson) => {
  if (!path || path.length === 0 || !sourcePerson || !targetPerson) {
    return sourcePerson && targetPerson ? 
      `${sourcePerson.name} ne semble pas avoir de lien familial avec ${targetPerson.name}` : 
      "Pas de lien familial trouvé";
  }

  if (path.length === 1) {
    const relation = path[0];
    
    if (relation.type === 'parent-child') {
      if (relation.from === sourcePerson.id) {
        return `${sourcePerson.name} est ${sourcePerson.gender === 'male' ? 'le père' : 'la mère'} de ${targetPerson.name}`;
      } else {
        return `${sourcePerson.name} est ${sourcePerson.gender === 'male' ? 'le fils' : 'la fille'} de ${targetPerson.name}`;
      }
    } else if (relation.type === 'spouse') {
      return `${sourcePerson.name} est ${sourcePerson.gender === 'male' ? 'l\'époux' : 'l\'épouse'} de ${targetPerson.name}`;
    } else if (relation.type === 'sibling') {
      return `${sourcePerson.name} est ${sourcePerson.gender === 'male' ? 'le frère' : 'la sœur'} de ${targetPerson.name}`;
    }
  }

  if (path.length === 2) {
    const intermediateId = path[0].from === sourcePerson.id ? path[0].to : path[0].from;
    if (intermediateId === path[1].from || intermediateId === path[1].to) {
      const intermediatePerson = persons.find(p => p.id === intermediateId);
      
      if (intermediatePerson && path[0].type === 'parent-child' && path[1].type === 'parent-child') {
        if ((path[0].from === sourcePerson.id) && (path[1].to === targetPerson.id)) {
          return `${sourcePerson.name} est ${sourcePerson.gender === 'male' ? 'le grand-père' : 'la grand-mère'} de ${targetPerson.name}`;
        } else if ((path[0].to === sourcePerson.id) && (path[1].from === targetPerson.id)) {
          return `${sourcePerson.name} est ${sourcePerson.gender === 'male' ? 'le petit-fils' : 'la petite-fille'} de ${targetPerson.name}`;
        }
      }
      
      if (intermediatePerson && ((path[0].type === 'spouse' && path[1].type === 'parent-child') || 
          (path[0].type === 'parent-child' && path[1].type === 'spouse'))) {
        if (path[0].type === 'spouse' && path[1].from === intermediateId) {
          return `${sourcePerson.name} est ${sourcePerson.gender === 'male' ? 'le beau-père' : 'la belle-mère'} de ${targetPerson.name}`;
        } else if (path[0].type === 'parent-child' && path[0].to === sourcePerson.id) {
          return `${sourcePerson.name} est ${sourcePerson.gender === 'male' ? 'le beau-fils' : 'la belle-fille'} de ${targetPerson.name}`;
        }
      }
      
      if (intermediatePerson && path[0].type === 'spouse' && path[1].type === 'sibling') {
        return `${sourcePerson.name} est ${sourcePerson.gender === 'male' ? 'le beau-frère' : 'la belle-sœur'} de ${targetPerson.name}`;
      }
      
      if (intermediatePerson && ((path[0].type === 'sibling' && path[1].type === 'parent-child') ||
          (path[0].type === 'parent-child' && path[1].type === 'sibling'))) {
        if ((path[0].type === 'sibling' && path[1].from === intermediateId) ||
            (path[1].type === 'sibling' && path[0].to === intermediateId)) {
          return `${sourcePerson.name} est ${sourcePerson.gender === 'male' ? 'l\'oncle' : 'la tante'} de ${targetPerson.name}`;
        } else {
          return `${sourcePerson.name} est ${sourcePerson.gender === 'male' ? 'le neveu' : 'la nièce'} de ${targetPerson.name}`;
        }
      }
    }
  }

  if (path.length === 3) {
    const isCousinPattern = path.every(rel => rel.type === 'parent-child' || rel.type === 'sibling');
    if (isCousinPattern) {
      return `${sourcePerson.name} est ${sourcePerson.gender === 'male' ? 'le cousin' : 'la cousine'} de ${targetPerson.name}`;
    }
  }

  return `${sourcePerson.name} et ${targetPerson.name} sont liés par une relation familiale de ${path.length} ${path.length > 1 ? 'degrés' : 'degré'}`;
};

const PathFinder = ({ familyData }: PathFinderProps) => {
  const [sourcePersonId, setSourcePersonId] = useState('');
  const [targetPersonId, setTargetPersonId] = useState('');
  const [algorithm, setAlgorithm] = useState('dijkstra');
  const [error, setError] = useState<string | null>(null);
  const [relationshipData, setRelationshipData] = useState(null);
  const [fromPerson, setFromPerson] = useState(null);
  const [toPerson, setToPerson] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('form');
  
  const svgRef = useRef(null);

  const getRelationshipIcon = (relationship) => {
    if (!relationship) return <Link size={16} />;
    
    switch (relationship.type) {
      case 'parent-child': return <User size={16} />;
      case 'spouse': return <Heart size={16} />;
      default: return <Link size={16} />;
    }
  };

  const handleFindPath = () => {
    if (!sourcePersonId || !targetPersonId) {
      setError("Veuillez sélectionner deux personnes");
      setRelationshipData(null);
      return;
    }

    if (sourcePersonId === targetPersonId) {
      setError("Veuillez sélectionner deux personnes différentes");
      setRelationshipData(null);
      return;
    }

    setLoading(true);
    setError(null);

    setTimeout(() => {
      try {
        const sourcePerson = familyData.persons.find(p => p.id === sourcePersonId);
        const targetPerson = familyData.persons.find(p => p.id === targetPersonId);
        
        if (!sourcePerson || !targetPerson) {
          throw new Error("Personnes introuvables");
        }
        
        const path = findRelationshipPath(familyData, sourcePersonId, targetPersonId);
        const description = getRelationshipDescription(path, familyData.persons, sourcePerson, targetPerson);
        
        if (!path || path.length === 0) {
          setError("Aucune relation trouvée entre ces deux personnes");
          setRelationshipData(null);
        } else {
          const pathPersons = [{ person: sourcePerson }];
          let currentPersonId = sourcePersonId;
          
          for (const rel of path) {
            const nextPersonId = rel.from === currentPersonId ? rel.to : rel.from;
            const nextPerson = familyData.persons.find(p => p.id === nextPersonId);
            
            if (nextPerson) {
              pathPersons.push({ person: nextPerson });
              currentPersonId = nextPersonId;
            }
          }
          
          setRelationshipData({ path, description, pathPersons });
          setError(null);
          setActiveTab('results');
          setFromPerson(sourcePerson);
          setToPerson(targetPerson);
        }
        
        setLoading(false);
      } catch (err) {
        setError("Erreur lors de la recherche du chemin: " + (err instanceof Error ? err.message : String(err)));
        setRelationshipData(null);
        setLoading(false);
      }
    }, 800);
  };

  useEffect(() => {
    if (activeTab === 'graph' && svgRef.current && relationshipData && fromPerson && toPerson) {
      const svg = d3.select(svgRef.current);
      svg.selectAll("*").remove();
      
      const nodes = familyData.persons.map(person => ({
        id: person.id,
        name: person.name,
        gender: person.gender,
        isOnPath: relationshipData.path.some(rel => rel.from === person.id || rel.to === person.id),
        isSource: person.id === fromPerson.id,
        isTarget: person.id === toPerson.id
      }));
      
      const links = familyData.relationships.map(rel => ({
        source: rel.from,
        target: rel.to,
        type: rel.type,
        isOnPath: relationshipData.path.some(pathRel => 
          (pathRel.from === rel.from && pathRel.to === rel.to) ||
          (pathRel.from === rel.to && pathRel.to === rel.from)
        )
      }));
      
      const width = svg.node().getBoundingClientRect().width;
      const height = svg.node().getBoundingClientRect().height;
      
      svg.append("defs").append("marker")
        .attr("id", "arrowhead")
        .attr("viewBox", "-0 -5 10 10")
        .attr("refX", 20)
        .attr("refY", 0)
        .attr("orient", "auto")
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .append("path")
        .attr("d", "M 0,-5 L 10 ,0 L 0,5")
        .attr("fill", "#999");
      
      const g = svg.append("g");
      
      const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id(d => d.id).distance(150))
        .force("charge", d3.forceManyBody().strength(-400))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("x", d3.forceX(width / 2).strength(0.05))
        .force("y", d3.forceY(height / 2).strength(0.05));
      
      const link = g.append("g")
        .selectAll("line")
        .data(links)
        .enter()
        .append("line")
        .attr("stroke", d => d.isOnPath ? "#8BBDBD" : (d.type === "spouse" ? "#F472B6" : "#999"))
        .attr("stroke-width", d => d.isOnPath ? 3 : 1)
        .attr("stroke-dasharray", d => d.type === "spouse" ? "5,5" : "none")
        .attr("marker-end", d => d.type === "parent-child" ? "url(#arrowhead)" : "");
      
      const node = g.append("g")
        .selectAll(".node")
        .data(nodes)
        .enter()
        .append("g")
        .attr("class", "node")
        .call(d3.drag()
          .on("start", dragStarted)
          .on("drag", dragged)
          .on("end", dragEnded));
      
      node.append("path")
        .attr("d", d => {
          if (d.gender === "male") {
            return "M-10,-10 L10,-10 L10,10 L-10,10 Z";
          } else {
            return d3.symbol().type(d3.symbolCircle).size(300)();
          }
        })
        .attr("fill", d => {
          if (d.isSource || d.isTarget) {
            return d.gender === "male" ? "#2563EB" : "#EC4899";
          }
          return d.gender === "male" ? "#93C5FD" : "#F9A8D4";
        })
        .attr("stroke", d => d.isOnPath ? "#8BBDBD" : "none")
        .attr("stroke-width", 3);
      
      node.append("text")
        .attr("dy", 25)
        .attr("text-anchor", "middle")
        .text(d => d.name)
        .attr("font-size", "10px")
        .attr("font-weight", d => (d.isSource || d.isTarget) ? "bold" : "normal");
      
      function dragStarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      }
      
      function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
      }
      
      function dragEnded(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      }
      
      simulation.on("tick", () => {
        link
          .attr("x1", d => d.source.x)
          .attr("y1", d => d.source.y)
          .attr("x2", d => d.target.x)
          .attr("y2", d => d.target.y);
        
        node.attr("transform", d => `translate(${d.x},${d.y})`);
      });
      
      const zoom = d3.zoom()
        .scaleExtent([0.5, 3])
        .on("zoom", (event) => {
          g.attr("transform", event.transform);
        });
      
      svg.call(zoom);
    }
  }, [activeTab, svgRef, relationshipData, fromPerson, toPerson, familyData]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 bg-gray-50 min-h-screen">
      <div className="bg-gradient-to-r from-teal-600 to-emerald-600 rounded-xl shadow-xl p-6 text-white mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <div className="bg-white bg-opacity-20 p-3 text-teal-800 rounded-full">
            <GiFamilyTree size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Explorateur de liens familiaux</h1>
            <p className="text-teal-100">Découvrez les liens de parenté entre les membres de votre arbre généalogique</p>
          </div>
        </div>
        
        <div className="flex flex-wrap text-black items-center gap-4 mt-4">
          <div className="flex items-center text-teal-800 bg-white bg-opacity-10 px-4 py-2 rounded-lg">
            <Users size={18} className="mr-2" />
            <span>{familyData.persons.length} personnes</span>
          </div>
          <div className="flex items-center text-teal-800 bg-white bg-opacity-10 px-4 py-2 rounded-lg">
            <Network size={18} className="mr-2" />
            <span>{familyData.relationships.length} liens</span>
          </div>
          <div className="flex items-center text-teal-800 bg-white bg-opacity-10 px-4 py-2 rounded-lg">
            <Compass size={18} className="mr-2" />
            <span>Algorithmes avancés</span>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
        <div className="flex border-b">
          <button 
            className={`flex items-center px-6 py-4 text-lg font-medium transition-all ${activeTab === 'form' ? 'text-teal-600 border-b-2 border-teal-600' : 'text-gray-500 hover:text-teal-500'}`}
            onClick={() => setActiveTab('form')}
          >
            <Search size={20} className="mr-2" />
            Rechercher un lien
          </button>
          {relationshipData && (
            <button 
              className={`flex items-center px-6 py-4 text-lg font-medium transition-all ${activeTab === 'results' ? 'text-teal-600 border-b-2 border-teal-600' : 'text-gray-500 hover:text-teal-500'}`}
              onClick={() => setActiveTab('results')}
            >
              <Award size={20} className="mr-2" />
              Résultats
            </button>
          )}
          {relationshipData && (
            <button 
              className={`flex items-center px-6 py-4 text-lg font-medium transition-all ${activeTab === 'graph' ? 'text-teal-600 border-b-2 border-teal-600' : 'text-gray-500 hover:text-teal-500'}`}
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
                  <User size={16} className="text-teal-500" />
                  Personne source
                </label>
                <div className="relative">
                  <select
                    className="w-full rounded-lg border-gray-300 pl-10 pr-4 py-3 focus:ring-teal-500 focus:border-teal-500 shadow-sm"
                    value={sourcePersonId}
                    onChange={(e) => setSourcePersonId(e.target.value)}
                  >
                    <option value="">Sélectionnez une personne</option>
                    {familyData.persons.map((person) => (
                      <option key={person.id} value={person.id}>{person.name}</option>
                    ))}
                  </select>
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <User size={18} className="text-teal-500" />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                  <UserPlus size={16} className="text-teal-500" />
                  Personne cible
                </label>
                <div className="relative">
                  <select
                    className="w-full rounded-lg border-gray-300 pl-10 pr-4 py-3 focus:ring-teal-500 focus:border-teal-500 shadow-sm"
                    value={targetPersonId}
                    onChange={(e) => setTargetPersonId(e.target.value)}
                  >
                    <option value="">Sélectionnez une personne</option>
                    {familyData.persons.map((person) => (
                      <option key={person.id} value={person.id}>{person.name}</option>
                    ))}
                  </select>
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <UserPlus size={18} className="text-teal-500" />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                <Activity size={16} className="text-teal-500" />
                Algorithme de recherche
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div 
                  className={`group border-2 rounded-xl p-5 cursor-pointer transition-all hover:bg-teal-50 ${algorithm === 'dijkstra' ? 'border-teal-500 bg-teal-50' : 'border-gray-200'}`}
                  onClick={() => setAlgorithm('dijkstra')}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`rounded-full p-3 ${algorithm === 'dijkstra' ? 'bg-teal-100' : 'bg-gray-100 group-hover:bg-teal-100'}`}>
                        <Zap size={24} className={algorithm === 'dijkstra' ? 'text-teal-600' : 'text-gray-500 group-hover:text-teal-600'} />
                      </div>
                      <div>
                        <h3 className={`font-medium text-lg ${algorithm === 'dijkstra' ? 'text-teal-600' : 'text-gray-700'}`}>Dijkstra</h3>
                        <p className="text-sm text-gray-500">Optimal pour les poids positifs</p>
                      </div>
                    </div>
                    {algorithm === 'dijkstra' && <CheckCircle2 size={24} className="text-teal-600" />}
                  </div>
                </div>
                
                <div 
                  className={`group border-2 rounded-xl p-5 cursor-pointer transition-all hover:bg-teal-50 ${algorithm === 'bellmanFord' ? 'border-teal-500 bg-teal-50' : 'border-gray-200'}`}
                  onClick={() => setAlgorithm('bellmanFord')}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`rounded-full p-3 ${algorithm === 'bellmanFord' ? 'bg-teal-100' : 'bg-gray-100 group-hover:bg-teal-100'}`}>
                        <Network size={24} className={algorithm === 'bellmanFord' ? 'text-teal-600' : 'text-gray-500 group-hover:text-teal-600'} />
                      </div>
                      <div>
                        <h3 className={`font-medium text-lg ${algorithm === 'bellmanFord' ? 'text-teal-600' : 'text-gray-700'}`}>Bellman-Ford</h3>
                        <p className="text-sm text-gray-500">Supporte les poids négatifs</p>
                      </div>
                    </div>
                    {algorithm === 'bellmanFord' && <CheckCircle2 size={24} className="text-teal-600" />}
                  </div>
                </div>
              </div>
            </div>
            
            <button
              className={`w-full py-4 rounded-xl shadow-lg font-semibold text-white flex items-center justify-center gap-3 transition-all ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700'}`}
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
        
        {activeTab === 'results' && relationshipData && (
          <div className="p-8">
            <div className="bg-gradient-to-r from-[#8BBDBD]/20 to-[#8BBDBD]/40 p-6 rounded-xl mb-8">
              <div className="flex items-center space-x-4">
                <div className="bg-[#8BBDBD] p-3 rounded-full text-white">
                  <Sparkles size={24} />
                </div>
                <div>
                  <p className="text-lg font-medium text-[#2a5a5a] mb-1">{relationshipData.description}</p>
                  <p className="text-gray-600">Distance : {relationshipData.path.length} {relationshipData.path.length > 1 ? 'degrés' : 'degré'} de séparation</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Compass size={20} className="text-[#8BBDBD] mr-2" />
                Chemin détaillé
              </h3>
              
              <div className="space-y-4">
                {relationshipData.pathPersons.map((item, index) => (
                  <div key={index}>
                    {item && item.person ? (
                      <>
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-[#8BBDBD]/10 rounded-full flex items-center justify-center">
                            <User size={20} />
                          </div>
                          <div className="ml-4">
                            <p className="font-medium text-gray-800">{item.person.name}</p>
                            {index === 0 && <p className="text-sm text-gray-500">Point de départ</p>}
                            {index === relationshipData.pathPersons.length - 1 && <p className="text-sm text-gray-500">Destination</p>}
                          </div>
                        </div>
                        
                        {index < relationshipData.pathPersons.length - 1 && (
                          <div className="flex items-center my-3 ml-6">
                            <div className="w-0.5 h-8 bg-gray-300 mx-auto"></div>
                            <div className="ml-6 flex items-center">
                              <div className="bg-[#8BBDBD]/10 p-2 rounded-full">
                                {getRelationshipIcon(relationshipData.path[index])}
                              </div>
                              <div className="ml-3">
                                <p className="text-sm text-gray-600">
                                  {relationshipData.path[index].type === 'parent-child' 
                                    ? (relationshipData.path[index].from === item.person.id 
                                      ? `${item.person.name} est ${item.person.gender === 'male' ? 'le parent de' : 'la parent de'}`
                                      : `${item.person.name} est ${item.person.gender === 'male' ? 'l\'enfant de' : 'l\'enfant de'}`)
                                    : relationshipData.path[index].type === 'spouse'
                                      ? `${item.person.name} est ${item.person.gender === 'male' ? 'l\'époux de' : 'l\'épouse de'}`
                                      : relationshipData.path[index].type === 'sibling'
                                        ? `${item.person.name} est ${item.person.gender === 'male' ? 'le frère de' : 'la sœur de'}`
                                        : `${item.person.name} est lié(e) à`
                                  }
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex justify-center">
              <button
                className="px-6 py-3 bg-[#8BBDBD] hover:bg-[#6d9d9d] text-white rounded-lg shadow-md flex items-center gap-2 transition-all"
                onClick={() => setActiveTab('graph')}
              >
                <Network size={18} />
                Voir la visualisation graphique
              </button>
            </div>
          </div>
        )}
  
        {/* Graphe */}
        {activeTab === 'graph' && fromPerson && toPerson && (
          <div className="p-6">
            <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
                <Network size={20} className="text-[#8BBDBD] mr-2" />
                Visualisation de l'arbre généalogique
              </h3>
              <p className="text-gray-600 mb-4">
                Le chemin en surbrillance montre la relation entre <span className="font-medium">{fromPerson.name}</span> et <span className="font-medium">{toPerson.name}</span>
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
                  <div className="w-12 h-1 bg-gradient-to-r from-[#8BBDBD] to-[#6d9d9d] mr-2"></div>
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
                className="px-6 py-3 bg-[#8BBDBD] hover:bg-[#6d9d9d] text-white rounded-lg shadow-md flex items-center gap-2 transition-all"
                onClick={() => setActiveTab('form')}
              >
                <ArrowLeft size={18} />
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
          <BadgePercent size={20} className="text-[#8BBDBD] mr-2" />
          À propos de l'algorithme
        </h2>
        <div className="prose max-w-none text-gray-600">
          <p>
            Cette application utilise des algorithmes de recherche de chemin pour trouver les relations 
            entre les membres d'une famille. Ces algorithmes sont couramment utilisés dans la théorie des graphes.
          </p>
          
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-[#8BBDBD]/30 rounded-lg p-4 bg-[#8BBDBD]/10">
              <h3 className="text-lg font-medium text-[#2a5a5a] mb-2 flex items-center">
                <Zap size={18} className="mr-2" />
                Dijkstra
              </h3>
              <p className="text-sm">
                L'algorithme de Dijkstra trouve le chemin le plus court entre deux nœuds 
                dans un graphe avec des poids positifs. Il est efficace pour les arbres généalogiques 
                où les relations ont des distances positives.
              </p>
            </div>
            
            <div className="border border-[#8BBDBD]/30 rounded-lg p-4 bg-[#8BBDBD]/10">
              <h3 className="text-lg font-medium text-[#2a5a5a] mb-2 flex items-center">
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