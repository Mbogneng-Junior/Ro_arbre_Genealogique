"use client";

import { useState, useEffect } from 'react';
import { FamilyTreeData, Person, Relationship } from '../lib/types';
import { runPrim } from '../lib/algorithms/prim';
import { runKruskal } from '../lib/algorithms/Kruskal';

interface SubfamilyAnalysisProps {
  familyData: FamilyTreeData;
}

interface Subfamily {
  id: number;
  members: Person[];
  connections: Relationship[];
}

const SubfamilyAnalysis: React.FC<SubfamilyAnalysisProps> = ({ familyData }) => {
  const [minSpanningTree, setMinSpanningTree] = useState<Relationship[]>([]);
  const [subfamilies, setSubfamilies] = useState<Subfamily[]>([]);
  const [algorithm, setAlgorithm] = useState<'prim' | 'kruskal'>('kruskal');
  const [subfamilyCount, setSubfamilyCount] = useState<number>(2);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Run analysis when algorithm changes or user clicks button
  const runAnalysis = () => {
    setLoading(true);
    setError(null);
    
    try {
      if (familyData.persons.length === 0) {
        throw new Error("Aucune personne dans l'arbre généalogique");
      }

      // For MST (Minimum Spanning Tree)
      if (algorithm === 'prim') {
        const result = runPrim(familyData);
        setMinSpanningTree(result);
        // Prim doesn't divide into subfamilies, so clear that state
        setSubfamilies([]);
      } 
      // For subfamily division
      else if (algorithm === 'kruskal') {
        const result = runKruskal(familyData, subfamilyCount);
        
        // Group persons by subfamily
        const subfamilyGroups: Map<number, Person[]> = new Map();
        const subfamilyConnections: Map<number, Relationship[]> = new Map();
        
        // Initialize subfamily groups
        for (let i = 0; i < subfamilyCount; i++) {
          subfamilyGroups.set(i, []);
          subfamilyConnections.set(i, []);
        }
        
        // Sort persons into subfamilies based on result
        for (const assignment of result.assignments) {
          const person = familyData.persons.find(p => p.id === assignment.personId);
          const subfamilyId = assignment.subfamilyId;
          
          if (person) {
            const members = subfamilyGroups.get(subfamilyId) || [];
            members.push(person);
            subfamilyGroups.set(subfamilyId, members);
          }
        }
        
        // Get connections within each subfamily
        for (const relationship of result.includedRelationships) {
          const fromPersonSubfamily = result.assignments.find(a => a.personId === relationship.from)?.subfamilyId;
          const toPersonSubfamily = result.assignments.find(a => a.personId === relationship.to)?.subfamilyId;
          
          // Only include if both persons are in the same subfamily
          if (typeof fromPersonSubfamily === 'number' && fromPersonSubfamily === toPersonSubfamily) {
            const connections = subfamilyConnections.get(fromPersonSubfamily) || [];
            connections.push(relationship);
            subfamilyConnections.set(fromPersonSubfamily, connections);
          }
        }
        
        // Convert maps to array of subfamily objects
        const subfamilyArray: Subfamily[] = [];
        for (let i = 0; i < subfamilyCount; i++) {
          subfamilyArray.push({
            id: i,
            members: subfamilyGroups.get(i) || [],
            connections: subfamilyConnections.get(i) || []
          });
        }
        
        setSubfamilies(subfamilyArray);
        setMinSpanningTree(result.includedRelationships);
      }
    } catch (err) {
      setError("Erreur lors de l'analyse: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  };

  const getPersonName = (personId: string): string => {
    const person = familyData.persons.find(p => p.id === personId);
    return person ? person.name : 'Inconnu';
  };

  const getRelationshipType = (relationship: Relationship): string => {
    switch (relationship.type) {
      case 'parent-child':
        return relationship.weight === 1 ? 'parent de' : 
               relationship.weight === 2 ? 'grand-parent de' : 
               `${relationship.weight}e degré de parenté avec`;
      case 'spouse':
        return 'conjoint de';
      case 'other':
        return 'relation avec';
      default:
        return 'lié à';
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Analyse de Sous-familles</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Algorithme</label>
          <div className="mt-2 space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio"
                name="subfamily-algorithm"
                value="prim"
                checked={algorithm === 'prim'}
                onChange={() => setAlgorithm('prim')}
              />
              <span className="ml-2">Prim (Arbre couvrant minimal)</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio"
                name="subfamily-algorithm"
                value="kruskal"
                checked={algorithm === 'kruskal'}
                onChange={() => setAlgorithm('kruskal')}
              />
              <span className="ml-2">Kruskal (Partitionnement en sous-familles)</span>
            </label>
          </div>
        </div>
        
        {algorithm === 'kruskal' && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre de sous-familles</label>
            <input
              type="number"
              min="2"
              max={Math.max(2, Math.floor(familyData.persons.length / 2))}
              value={subfamilyCount}
              onChange={(e) => setSubfamilyCount(Math.max(2, Math.min(familyData.persons.length, parseInt(e.target.value) || 2)))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        )}
      </div>
      
      <div>
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          onClick={runAnalysis}
          disabled={loading}
        >
          {loading ? 'Analyse en cours...' : 'Lancer l\'analyse'}
        </button>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}
      
      {/* Display MST for Prim algorithm */}
      {algorithm === 'prim' && minSpanningTree.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <h3 className="font-medium text-green-800 mb-2">Arbre couvrant minimal trouvé</h3>
          <p className="mb-4">Cet arbre représente la façon la plus efficace de relier toutes les personnes de la famille.</p>
          
          <div className="overflow-auto max-h-96">
            <h4 className="font-medium mb-2">Relations dans l'arbre couvrant:</h4>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">De</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Relation</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">À</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Poids</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {minSpanningTree.map((relationship) => (
                  <tr key={relationship.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{getPersonName(relationship.from)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{getRelationshipType(relationship)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{getPersonName(relationship.to)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{relationship.weight}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Display subfamilies for Kruskal algorithm */}
      {algorithm === 'kruskal' && subfamilies.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-lg font-medium">Sous-familles identifiées</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {subfamilies.map((subfamily) => (
              <div 
                key={subfamily.id} 
                className="border rounded-lg p-4 bg-white shadow"
                style={{ borderColor: `hsl(${(subfamily.id * 137) % 360}, 70%, 80%)` }}
              >
                <h4 className="font-medium text-lg mb-2" style={{ color: `hsl(${(subfamily.id * 137) % 360}, 70%, 50%)` }}>
                  Sous-famille {subfamily.id + 1}
                </h4>
                
                <div className="mb-4">
                  <h5 className="font-medium mb-1">Membres ({subfamily.members.length}):</h5>
                  <ul className="list-disc pl-5">
                    {subfamily.members.map((person) => (
                      <li key={person.id}>{person.name}</li>
                    ))}
                  </ul>
                </div>
                
                {subfamily.connections.length > 0 && (
                  <div>
                    <h5 className="font-medium mb-1">Relations internes:</h5>
                    <ul className="list-disc pl-5">
                      {subfamily.connections.map((relationship) => (
                        <li key={relationship.id}>
                          {getPersonName(relationship.from)} est {getRelationshipType(relationship)} {getPersonName(relationship.to)}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SubfamilyAnalysis;