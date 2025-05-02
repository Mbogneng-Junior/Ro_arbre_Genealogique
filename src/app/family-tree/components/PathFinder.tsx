"use client";

import { useState } from 'react';
import { FamilyTreeData, Person, Path } from '../lib/types';
import { runDijkstra } from '../lib/algorithms/djikstra';
import { runBellmanFord } from '../lib/algorithms/djikstra';
import { buildAdjacencyList } from '../lib/utils';

interface PathFinderProps {
  familyData: FamilyTreeData;
}

const PathFinder: React.FC<PathFinderProps> = ({ familyData }) => {
  const [sourcePersonId, setSourcePersonId] = useState('');
  const [targetPersonId, setTargetPersonId] = useState('');
  const [algorithm, setAlgorithm] = useState<'dijkstra' | 'bellmanFord'>('dijkstra');
  const [path, setPath] = useState<Path | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFindPath = () => {
    if (!sourcePersonId || !targetPersonId) {
      setError("Veuillez sélectionner deux personnes");
      return;
    }

    if (sourcePersonId === targetPersonId) {
      setError("Veuillez sélectionner deux personnes différentes");
      return;
    }

    try {
      const adjacencyList = buildAdjacencyList(familyData);
      let result: Path;

      if (algorithm === 'dijkstra') {
        result = runDijkstra(adjacencyList, sourcePersonId, targetPersonId, familyData.relationships);
      } else {
        result = runBellmanFord(adjacencyList, sourcePersonId, targetPersonId, familyData.relationships);
      }

      if (!result || result.path.length === 0) {
        setError("Aucun chemin trouvé entre ces deux personnes");
        setPath(null);
      } else {
        setPath(result);
        setError(null);
      }
    } catch (err) {
      setError("Erreur lors de la recherche du chemin: " + (err instanceof Error ? err.message : String(err)));
      setPath(null);
    }
  };

  const getPersonName = (personId: string): string => {
    const person = familyData.persons.find(p => p.id === personId);
    return person ? person.name : 'Inconnu';
  };

  const getRelationshipType = (relationship: any): string => {
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
      <h2 className="text-xl font-semibold">Recherche de chemin de parenté</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Personne source</label>
          <select
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Personne cible</label>
          <select
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">Algorithme</label>
        <div className="mt-2 space-x-4">
          <label className="inline-flex items-center">
            <input
              type="radio"
              className="form-radio"
              name="algorithm"
              value="dijkstra"
              checked={algorithm === 'dijkstra'}
              onChange={() => setAlgorithm('dijkstra')}
            />
            <span className="ml-2">Dijkstra (poids positifs)</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              className="form-radio"
              name="algorithm"
              value="bellmanFord"
              checked={algorithm === 'bellmanFord'}
              onChange={() => setAlgorithm('bellmanFord')}
            />
            <span className="ml-2">Bellman-Ford (poids négatifs autorisés)</span>
          </label>
        </div>
      </div>
      
      <div>
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          onClick={handleFindPath}
        >
          Trouver le chemin
        </button>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}
      
      {path && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <h3 className="font-medium text-green-800 mb-2">Chemin trouvé!</h3>
          <p>Distance totale (poids): {path.totalWeight}</p>
          
          <div className="mt-4">
            <h4 className="font-medium mb-2">Détail du chemin:</h4>
            <ul className="list-disc pl-5 space-y-2">
              {path.path.map((personId, index) => {
                // Skip rendering relationship for the first person in the path
                if (index === 0) {
                  return (
                    <li key={personId}>
                      {getPersonName(personId)}
                    </li>
                  );
                }
                
                // For other persons, show the relationship with previous person
                const previousPersonId = path.path[index - 1];
                const relationship = path.relationshipPath.find(
                  r => (r.from === previousPersonId && r.to === personId) || 
                       (r.from === personId && r.to === previousPersonId)
                );
                
                return (
                  <li key={personId} className="flex items-center">
                    <svg className="w-6 h-6 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                    {relationship ? (
                      <>
                        <span className="font-medium">{getPersonName(personId)}</span>
                        <span className="text-gray-500 ml-2">
                          ({relationship.from === previousPersonId 
                            ? `est ${getRelationshipType(relationship)} ${getPersonName(previousPersonId)}` 
                            : `est ${getRelationshipType(relationship)} ${getPersonName(personId)}`})
                        </span>
                      </>
                    ) : (
                      getPersonName(personId)
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default PathFinder;