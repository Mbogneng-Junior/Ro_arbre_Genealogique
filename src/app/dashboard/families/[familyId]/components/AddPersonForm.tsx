import { useState } from 'react';
import { UserPlus, UserMinus, User, Users, Heart, Upload, X, Trash2, AlertCircle, CalendarIcon } from 'lucide-react';
import { Person, Relationship } from '../lib/types';

interface FamilyTreeTabsProps {
  persons: Person[];
  onAddPerson: (person: Person) => void;
  onAddRelationship: (relationship: Relationship) => void;
  onRemovePerson: (personId: string) => void;
  onRemoveRelationship: (relationshipIds: string[]) => void;
}

const AddPersonForm: React.FC<FamilyTreeTabsProps> = ({ 
  persons, 
  onAddPerson, 
  onAddRelationship, 
  onRemovePerson,
  onRemoveRelationship
}) => {
  const [activeTab, setActiveTab] = useState<'add' | 'remove'>('add');
  
  // États pour l'ajout de personne
  const [personName, setPersonName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [isDeceased, setIsDeceased] = useState(false);
  const [deathDate, setDeathDate] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('other');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // Relations familiales pour l'ajout
  const [fatherId, setFatherId] = useState('');
  const [motherId, setMotherId] = useState('');
  const [children, setChildren] = useState<Array<{
    id: string,
    name: string,
    birthDate: string,
    gender: 'male' | 'female' | 'other',
    imageFile: File | null,
    imagePreview: string | null
  }>>([]);

  // État pour la suppression de personne
  const [selectedPersonToRemove, setSelectedPersonToRemove] = useState<string>('');
  const [confirmRemoval, setConfirmRemoval] = useState(false);
  const [relatedMembers, setRelatedMembers] = useState<Person[]>([]);

  // Liste filtrée pour les sélecteurs de père/mère
  const males = persons.filter(person => person.gender === 'male');
  const females = persons.filter(person => person.gender === 'female');

  // Fonctions pour l'ajout de personne
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChildImageChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const updatedChildren = [...children];
      updatedChildren[index].imageFile = file;
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const updatedChildrenWithPreview = [...children];
        updatedChildrenWithPreview[index].imagePreview = reader.result as string;
        setChildren(updatedChildrenWithPreview);
      };
      reader.readAsDataURL(file);
    }
  };

  const addChild = () => {
    setChildren([
      ...children, 
      { 
        id: `temp-${Date.now()}`, 
        name: '', 
        birthDate: '', 
        gender: 'other', 
        imageFile: null, 
        imagePreview: null 
      }
    ]);
  };

  const removeChild = (index: number) => {
    const updatedChildren = [...children];
    updatedChildren.splice(index, 1);
    setChildren(updatedChildren);
  };

  const updateChild = (index: number, field: string, value: any) => {
    const updatedChildren = [...children];
    updatedChildren[index] = { ...updatedChildren[index], [field]: value };
    setChildren(updatedChildren);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convertir les dates en années
    const birthYear = birthDate ? new Date(birthDate).getFullYear() : undefined;
    const deathYear = deathDate ? new Date(deathDate).getFullYear() : undefined;
    
    // Créer la personne principale
    const newPerson: Person = {
      id: `person-${Date.now()}`,
      name: personName,
      birthYear,
      deathYear: isDeceased ? deathYear : undefined,
      gender,
      imageUrl: imagePreview || undefined,
    };
    
    onAddPerson(newPerson);
    
    // Créer les relations avec les parents
    if (fatherId) {
      const fatherRelationship: Relationship = {
        id: `rel-father-${Date.now()}`,
        from: fatherId,
        to: newPerson.id,
        type: 'parent-child',
        weight: 1,
      };
      onAddRelationship(fatherRelationship);
    }
    
    if (motherId) {
      const motherRelationship: Relationship = {
        id: `rel-mother-${Date.now()}`,
        from: motherId,
        to: newPerson.id,
        type: 'parent-child',
        weight: 1,
      };
      onAddRelationship(motherRelationship);
    }
    
    // Créer les enfants et leurs relations
    children.forEach((child, index) => {
      const childBirthYear = child.birthDate ? new Date(child.birthDate).getFullYear() : undefined;
      
      const childPerson: Person = {
        id: `child-${Date.now()}-${index}`,
        name: child.name,
        birthYear: childBirthYear,
        gender: child.gender,
        imageUrl: child.imagePreview || undefined,
      };
      
      onAddPerson(childPerson);
      
      // Relation parent-enfant
      const childRelationship: Relationship = {
        id: `rel-child-${Date.now()}-${index}`,
        from: newPerson.id,
        to: childPerson.id,
        type: 'parent-child',
        weight: 1,
      };
      
      onAddRelationship(childRelationship);
    });
    
    // Réinitialiser le formulaire
    resetAddForm();
  };
  
  const resetAddForm = () => {
    setPersonName('');
    setBirthDate('');
    setIsDeceased(false);
    setDeathDate('');
    setGender('other');
    setImageFile(null);
    setImagePreview(null);
    setFatherId('');
    setMotherId('');
    setChildren([]);
  };

  // Fonctions pour la suppression de personne
  const handlePersonSelectionChange = (personId: string) => {
    setSelectedPersonToRemove(personId);
    setConfirmRemoval(false);
    
    // Trouver les membres reliés à la personne sélectionnée
    // Ceci est une implémentation simplifiée - vous devriez adapter cela en fonction de votre modèle de données
    const selectedPerson = persons.find(p => p.id === personId);
    if (selectedPerson) {
      // Dans une implémentation réelle, vous devriez utiliser les relations pour trouver les membres reliés
      // Ceci est juste un exemple
      const relatedPersons = persons.filter(p => p.id !== personId).slice(0, 3); // Simule une recherche
      setRelatedMembers(relatedPersons);
    } else {
      setRelatedMembers([]);
    }
  };

  const handleRemoveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPersonToRemove) return;
    
    // Supprimer la personne et toutes ses relations
    onRemovePerson(selectedPersonToRemove);
    
    // Dans une implémentation réelle, vous devriez trouver toutes les relations liées à cette personne
    // et les supprimer également
    // Ceci est un exemple simplifié
    const relationshipIdsToRemove = [`rel-${selectedPersonToRemove}`]; // Simulé
    onRemoveRelationship(relationshipIdsToRemove);
    
    // Réinitialiser le formulaire
    resetRemoveForm();
  };
  
  const resetRemoveForm = () => {
    setSelectedPersonToRemove('');
    setConfirmRemoval(false);
    setRelatedMembers([]);
  };

  return (
    <div className="bg-white rounded-xl p-6 mb-8">
      {/* Onglets */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('add')}
          className={`flex items-center py-3 px-6 border-b-2 font-medium text-sm ${
            activeTab === 'add'
              ? 'border-[#8BBDBD] text-[#8BBDBD]'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <UserPlus className="mr-2" size={18} />
          Ajouter un membre
        </button>
        <button
          onClick={() => setActiveTab('remove')}
          className={`flex items-center py-3 px-6 border-b-2 font-medium text-sm ${
            activeTab === 'remove'
              ? 'border-[#8BBDBD] text-[#8BBDBD]'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <UserMinus className="mr-2" size={18} />
          Supprimer un membre
        </button>
      </div>

      {/* Contenu des onglets */}
      {activeTab === 'add' ? (
        <form onSubmit={handleAddSubmit}>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Première colonne - Informations personnelles */}
            <div className="space-y-6 p-4 bg-gray-50 rounded-lg shadow-lg">
              <h3 className="text-lg font-medium text-[#8BBDBD] border-b border-[#8BBDBD] border-opacity-30 pb-2">
                Informations personnelles
              </h3>
              
              {/* Photo de profil */}
              <div className="flex justify-center">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <User size={64} className="text-gray-400" />
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 bg-[#8BBDBD] rounded-full p-2 cursor-pointer hover:bg-[#7aa9a9] transition-colors">
                    <Upload size={16} className="text-white" />
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleImageChange}
                    />
                  </label>
                </div>
              </div>
              
              {/* Nom */}
              <div>
                <label className="block text-sm font-medium text-[#171717] mb-1">Nom complet *</label>
                <input
                  type="text"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#8BBDBD] focus:ring-[#8BBDBD]"
                  value={personName}
                  onChange={(e) => setPersonName(e.target.value)}
                  required
                  placeholder="Prénom NOM"
                />
              </div>
              
              {/* Date de naissance */}
              <div>
                <label className="block text-sm font-medium text-[#171717] mb-1">
                  Date de naissance *
                </label>
                <div className="relative">
                  <input
                    type="date"
                    className="block w-full pl-10 rounded-md border-gray-300 shadow-sm focus:border-[#8BBDBD] focus:ring-[#8BBDBD]"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    required
                  />
                  <CalendarIcon size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>
              
              {/* Statut de vie */}
              <div>
                <div className="flex items-center mb-2">
                  <input
                    id="deceased"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-[#8BBDBD] focus:ring-[#8BBDBD]"
                    checked={isDeceased}
                    onChange={() => setIsDeceased(!isDeceased)}
                  />
                  <label htmlFor="deceased" className="ml-2 block text-sm text-[#171717]">
                    Personne décédée
                  </label>
                </div>
                
                {isDeceased && (
                  <div className="relative mt-2">
                    <input
                      type="date"
                      className="block w-full pl-10 rounded-md border-gray-300 shadow-sm focus:border-[#8BBDBD] focus:ring-[#8BBDBD]"
                      value={deathDate}
                      onChange={(e) => setDeathDate(e.target.value)}
                    />
                    <CalendarIcon size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  </div>
                )}
              </div>
              
              {/* Genre */}
              <div>
                <label className="block text-sm font-medium text-[#171717] mb-2">Genre</label>
                <div className="flex space-x-4">
                  <label className={`flex flex-col items-center p-3 border rounded-lg cursor-pointer transition-colors ${gender === 'male' ? 'bg-[#8BBDBD] bg-opacity-20 border-[#8BBDBD]' : 'border-gray-300 hover:bg-gray-50'}`}>
                    <input
                      type="radio"
                      name="gender"
                      className="sr-only"
                      value="male"
                      checked={gender === 'male'}
                      onChange={() => setGender('male')}
                    />
                    <User size={24} className={gender === 'male' ? 'text-[#8BBDBD]' : 'text-gray-400'} />
                    <span className="mt-1 text-sm">Homme</span>
                  </label>
                  
                  <label className={`flex flex-col items-center p-3 border rounded-lg cursor-pointer transition-colors ${gender === 'female' ? 'bg-[#8BBDBD] bg-opacity-20 border-[#8BBDBD]' : 'border-gray-300 hover:bg-gray-50'}`}>
                    <input
                      type="radio"
                      name="gender"
                      className="sr-only"
                      value="female"
                      checked={gender === 'female'}
                      onChange={() => setGender('female')}
                    />
                    <User size={24} className={gender === 'female' ? 'text-[#8BBDBD]' : 'text-gray-400'} />
                    <span className="mt-1 text-sm">Femme</span>
                  </label>
                  
                  <label className={`flex flex-col items-center p-3 border rounded-lg cursor-pointer transition-colors ${gender === 'other' ? 'bg-[#8BBDBD] bg-opacity-20 border-[#8BBDBD]' : 'border-gray-300 hover:bg-gray-50'}`}>
                    <input
                      type="radio"
                      name="gender"
                      className="sr-only"
                      value="other"
                      checked={gender === 'other'}
                      onChange={() => setGender('other')}
                    />
                    <User size={24} className={gender === 'other' ? 'text-[#8BBDBD]' : 'text-gray-400'} />
                    <span className="mt-1 text-sm">Autre</span>
                  </label>
                </div>
              </div>
            </div>
            
            {/* Deuxième colonne - Relations familiales */}
            <div className="space-y-6 p-4 bg-gray-50 shadow-lg rounded-lg">
              <h3 className="text-lg font-medium text-[#8BBDBD] border-b border-[#8BBDBD] border-opacity-30 pb-2">
                Relations familiales
              </h3>
              
              {/* Parents */}
              <div className="space-y-4">
                <h4 className="flex items-center text-md font-medium text-[#171717]">
                  <Users size={18} className="mr-1" /> Parents
                </h4>
                
                {/* Père */}
                <div>
                  <label className="block text-sm font-medium text-[#171717] mb-1">Père</label>
                  <select
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#8BBDBD] focus:ring-[#8BBDBD]"
                    value={fatherId}
                    onChange={(e) => setFatherId(e.target.value)}
                  >
                    <option value="">Sélectionnez le père</option>
                    {males.map((person) => (
                      <option key={person.id} value={person.id}>
                        {person.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Mère */}
                <div>
                  <label className="block text-sm font-medium text-[#171717] mb-1">Mère</label>
                  <select
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#8BBDBD] focus:ring-[#8BBDBD]"
                    value={motherId}
                    onChange={(e) => setMotherId(e.target.value)}
                  >
                    <option value="">Sélectionnez la mère</option>
                    {females.map((person) => (
                      <option key={person.id} value={person.id}>
                        {person.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                {(!fatherId && !motherId) && (
                  <p className="text-sm text-red-500">Veuillez sélectionner au moins un parent</p>
                )}
              </div>
              
              {/* Enfants */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="flex items-center text-md font-medium text-[#171717]">
                    <Heart size={18} className="mr-1" /> Enfants (optionnels)
                  </h4>
                  
                  <button
                    type="button"
                    onClick={addChild}
                    className="inline-flex items-center rounded-md bg-[#8BBDBD] px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-[#7aa9a9] focus:outline-none"
                  >
                    <UserPlus size={16} className="mr-1" />
                    Ajouter un enfant
                  </button>
                </div>
                
                {children.length === 0 && (
                  <p className="text-sm text-gray-500 italic">Aucun enfant ajouté</p>
                )}
                
                {children.map((child, index) => (
                  <div key={index} className="border border-[#8BBDBD] border-opacity-30 rounded-lg p-4 relative bg-white">
                    <button
                      type="button"
                      onClick={() => removeChild(index)}
                      className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                    >
                      <X size={18} />
                    </button>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2 flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                          {child.imagePreview ? (
                            <img src={child.imagePreview} alt="Preview" className="w-full h-full object-cover" />
                          ) : (
                            <User size={20} className="text-gray-400" />
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <input
                            type="text"
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#8BBDBD] focus:ring-[#8BBDBD]"
                            value={child.name}
                            onChange={(e) => updateChild(index, 'name', e.target.value)}
                            placeholder="Nom de l'enfant"
                            required
                          />
                        </div>
                        
                        <label className="bg-[#8BBDBD] rounded-full p-1 cursor-pointer hover:bg-[#7aa9a9] transition-colors">
                          <Upload size={14} className="text-white" />
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={(e) => handleChildImageChange(index, e)}
                          />
                        </label>
                      </div>
                      
                      <div>
                        <div className="relative">
                          <input
                            type="date"
                            className="block w-full pl-8 rounded-md border-gray-300 shadow-sm focus:border-[#8BBDBD] focus:ring-[#8BBDBD] text-sm"
                            value={child.birthDate}
                            onChange={(e) => updateChild(index, 'birthDate', e.target.value)}
                            required
                          />
                          <CalendarIcon size={16} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        </div>
                      </div>
                      
                      <div>
                        <select
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#8BBDBD] focus:ring-[#8BBDBD] text-sm"
                          value={child.gender}
                          onChange={(e) => updateChild(index, 'gender', e.target.value as 'male' | 'female' | 'other')}
                        >
                          <option value="male">Homme</option>
                          <option value="female">Femme</option>
                          <option value="other">Autre</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Bouton de soumission */}
          <div className="mt-8 flex justify-end">
            <button
              type="submit"
              disabled={!personName || !birthDate || (!fatherId && !motherId)}
              className="inline-flex justify-center items-center py-3 px-6 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-[#8BBDBD] hover:bg-[#7aa9a9] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8BBDBD] disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <UserPlus className="mr-2" size={20} />
              Ajouter à l'arbre familial
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleRemoveSubmit}>
          <div className="space-y-6 p-4 bg-gray-50 rounded-lg shadow-lg">
            <h3 className="text-lg font-medium text-[#8BBDBD] border-b border-[#8BBDBD] border-opacity-30 pb-2">
              Supprimer un membre de l'arbre familial
            </h3>
            
            {/* Sélection de la personne à supprimer */}
            <div>
              <label className="block text-sm font-medium text-[#171717] mb-1">
                Sélectionnez la personne à supprimer *
              </label>
              <select
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#8BBDBD] focus:ring-[#8BBDBD]"
                value={selectedPersonToRemove}
                onChange={(e) => handlePersonSelectionChange(e.target.value)}
                required
              >
                <option value="">Choisir une personne</option>
                {persons.map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.name} {person.birthYear ? `(${person.birthYear})` : ''}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Afficher les informations de la personne sélectionnée */}
            {selectedPersonToRemove && (
              <div className="mt-4">
                {/* Détails de la personne */}
                {(() => {
                  const person = persons.find(p => p.id === selectedPersonToRemove);
                  if (!person) return null;
                  
                  return (
                    <div className="border border-[#8BBDBD] border-opacity-30 rounded-lg p-4 bg-white">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                          {person.imageUrl ? (
                            <img src={person.imageUrl} alt={person.name} className="w-full h-full object-cover" />
                          ) : (
                            <User size={32} className="text-gray-400" />
                          )}
                        </div>
                        
                        <div>
                          <h4 className="text-lg font-semibold">{person.name}</h4>
                          <p className="text-sm text-gray-600">
                            {person.birthYear && `Né(e) en ${person.birthYear}`}
                            {person.deathYear && ` - Décédé(e) en ${person.deathYear}`}
                          </p>
                          <p className="text-sm text-gray-600">
                            Genre: {person.gender === 'male' ? 'Homme' : person.gender === 'female' ? 'Femme' : 'Autre'}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })()}
                
                {/* Membres reliés */}
                {relatedMembers.length > 0 && (
                  <div className="mt-4">
                    <div className="flex items-center mb-2">
                      <AlertCircle size={18} className="text-amber-500 mr-2" />
                      <h4 className="text-md font-medium text-amber-500">Attention</h4>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">
                      La suppression de cette personne affectera également les relations familiales suivantes:
                    </p>
                    
                    <div className="space-y-2">
                      {relatedMembers.map(member => (
                        <div key={member.id} className="flex items-center p-2 bg-gray-100 rounded-lg">
                          <User size={18} className="text-gray-500 mr-2" />
                          <span className="text-sm">{member.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Confirmation */}
                <div className="mt-4">
                  <div className="flex items-center mb-2">
                    <input
                      id="confirmRemoval"
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                      checked={confirmRemoval}
                      onChange={() => setConfirmRemoval(!confirmRemoval)}
                      required
                    />
                    <label htmlFor="confirmRemoval" className="ml-2 block text-sm text-gray-700">
                      Je confirme vouloir supprimer cette personne et toutes ses relations associées de l'arbre familial
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Bouton de soumission */}
          <div className="mt-8 flex justify-end">
            <button
              type="submit"
              disabled={!selectedPersonToRemove || !confirmRemoval}
              className="inline-flex justify-center items-center py-3 px-6 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <Trash2 className="mr-2" size={20} />
              Supprimer définitivement
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default AddPersonForm;