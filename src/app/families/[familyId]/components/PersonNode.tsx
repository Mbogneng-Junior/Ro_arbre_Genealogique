"use client";

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Person } from '../lib/types';

const PersonNode = ({ data }: NodeProps<Person>) => {
  const person = data;
  const lifespan = person.birthYear 
    ? (person.deathYear 
      ? `${person.birthYear} - ${person.deathYear}` 
      : `${person.birthYear} - présent`)
    : '';
  
  let borderColor = 'border-gray-300';
  if (person.gender === 'male') {
    borderColor = 'border-blue-400';
  } else if (person.gender === 'female') {
    borderColor = 'border-pink-400';
  }

  return (
    <div className={`bg-white rounded-lg shadow-md p-3 border-2 ${borderColor} w-48`}>
      <Handle type="target" position={Position.Top} className="w-2 h-2" />
      
      <div className="flex items-center mb-2">
        {person.imageUrl ? (
          <img 
            src={person.imageUrl} 
            alt={person.name} 
            className="w-10 h-10 rounded-full mr-2 object-cover"
          />
        ) : (
          <div className={`w-10 h-10 rounded-full mr-2 flex items-center justify-center
            ${person.gender === 'male' ? 'bg-blue-100' : 
              person.gender === 'female' ? 'bg-pink-100' : 'bg-gray-100'}`}>
            <span className="text-lg font-semibold">
              {person.name.charAt(0)}
            </span>
          </div>
        )}
        <div>
          <h3 className="font-semibold text-sm">{person.name}</h3>
          {lifespan && <p className="text-xs text-gray-500">{lifespan}</p>}
        </div>
      </div>

      {/* Additional metadata could be displayed here */}
      {person.metadata && Object.keys(person.metadata).length > 0 && (
        <div className="mt-2 pt-2 border-t border-gray-200 text-xs">
          {Object.entries(person.metadata).map(([key, value]) => (
            <div key={key} className="flex justify-between">
              <span className="font-medium">{key}:</span>
              <span>{String(value)}</span>
            </div>
          ))}
        </div>
      )}
      
      <Handle type="source" position={Position.Bottom} className="w-2 h-2" />
    </div>
  );
};

export default memo(PersonNode);