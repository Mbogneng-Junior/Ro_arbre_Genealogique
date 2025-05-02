"use client";

import { useState } from 'react';
import { Person, Relationship } from '../lib/types';

interface AddPersonFormProps {
  persons: Person[];
  onAddPerson: (person: Person) => void;
  onAddRelationship: (relationship: Relationship) => void;
}

const AddPersonForm: React.FC<AddPersonFormProps> = ({ persons, onAddPerson, onAddRelationship }) => {
  const [activeTab, setActiveTab] = useState<'person' | 'relationship'>('person');
  
  // Person form state
  const [personName, setPersonName] = useState('');
  const [birthYear, setBirthYear] = useState<string>('');
  const [deathYear, setDeathYear] = useState<string>('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('other');
  const [imageUrl, setImageUrl] = useState('');
  
  // Relationship form state
  const [fromPersonId, setFromPersonId] = useState('');
  const [toPersonId, setToPersonId] = useState('');
  const [relationshipType, setRelationshipType] = useState<'parent-child' | 'spouse' | 'other'>('parent-child');
  const [relationshipWeight, setRelationshipWeight] = useState<number>(1);
  
  const handleSubmitPerson = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newPerson: Person = {
      id: `person-${Date.now()}`,
      name: personName,
      birthYear: birthYear ? parseInt(birthYear) : undefined,
      deathYear: deathYear ? parseInt(deathYear) : undefined,
      gender,
      imageUrl: imageUrl || undefined,
    };
    
    onAddPerson(newPerson);
    
    // Reset form
    setPersonName('');
    setBirthYear('');
    setDeathYear('');
    setGender('other');
    setImageUrl('');
  };
  
  const handleSubmitRelationship = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newRelationship: Relationship = {
      id: `rel-${Date.now()}`,
      from: fromPersonId,
      to: toPersonId,
      type: relationshipType,
      weight: relationshipWeight,
    };
    
    onAddRelationship(newRelationship);
    
    // Reset form
    setFromPersonId('');
    setToPersonId('');
    setRelationshipType('parent-child');
    setRelationshipWeight(1);
  };
  
  return (
    <div>
      <div className="flex justify-center mb-6">
        <div className="flex bg-gray-100 rounded-lg">
          <button 
            className={`px-4 py-2 ${activeTab === 'person' ? 'bg-blue-500 text-white' : ''} rounded-l-lg`}
            onClick={() => setActiveTab('person')}
          >
            Ajouter une personne
          </button>
          <button 
            className={`px-4 py-2 ${activeTab === 'relationship' ? 'bg-blue-500 text-white' : ''} rounded-r-lg`}
            onClick={() => setActiveTab('relationship')}
          >
            Ajouter une relation
          </button>
        </div>
      </div>
      
      {activeTab === 'person' && (
        <form onSubmit={handleSubmitPerson} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nom</label>
            <input
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={personName}
              onChange={(e) => setPersonName(e.target.value)}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Année de naissance</label>
              <input
                type="number"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={birthYear}
                onChange={(e) => setBirthYear(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Année de décès</label>
              <input
                type="number"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={deathYear}
                onChange={(e) => setDeathYear(e.target.value)}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Genre</label>
            <select
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={gender}
              onChange={(e) => setGender(e.target.value as 'male' | 'female' | 'other')}
            >
              <option value="male">Homme</option>
              <option value="female">Femme</option>
              <option value="other">Autre</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">URL de l'image (optionnel)</label>
            <input
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Ajouter la personne
            </button>
          </div>
        </form>
      )}
      
      {activeTab === 'relationship' && (
        <form onSubmit={handleSubmitRelationship} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Personne source</label>
            <select
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={fromPersonId}
              onChange={(e) => setFromPersonId(e.target.value)}
              required
            >
              <option value="">Sélectionnez une personne</option>
              {persons.map((person) => (
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
              value={toPersonId}
              onChange={(e) => setToPersonId(e.target.value)}
              required
            >
              <option value="">Sélectionnez une personne</option>
              {persons.map((person) => (
                <option key={person.id} value={person.id}>
                  {person.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Type de relation</label>
            <select
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={relationshipType}
              onChange={(e) => setRelationshipType(e.target.value as 'parent-child' | 'spouse' | 'other')}
            >
              <option value="parent-child">Parent-Enfant</option>
              <option value="spouse">Conjoint</option>
              <option value="other">Autre</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Poids de la relation (1: parent, 2: grand-parent, etc.)
            </label>
            <input
              type="number"
              min="1"
              max="10"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={relationshipWeight}
              onChange={(e) => setRelationshipWeight(parseInt(e.target.value))}
              required
            />
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Ajouter la relation
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default AddPersonForm;