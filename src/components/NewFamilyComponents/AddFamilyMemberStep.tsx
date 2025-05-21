import {CalendarIcon, MapPin, Upload, User} from "lucide-react";
import type React from "react";
import {FamilyMember} from "@/lib/type";



export type AddFamilyMemberStepProps  = {
    currentMember: FamilyMember;
    addMember: (event: React.FormEvent<HTMLFormElement>) => void;
    handleChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
    handleChangeRole: (event: React.ChangeEvent<HTMLSelectElement>) => void;
    handleMemberChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    handleImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    setShowAddMemberForm: React.Dispatch<React.SetStateAction<boolean>>
}


export default function AddFamilyMemberStep({currentMember, addMember, handleMemberChange, handleImageChange, setShowAddMemberForm, handleChange, handleChangeRole}: AddFamilyMemberStepProps)
{
    return (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Ajouter un nouveau membre</h3>
            <form onSubmit={addMember} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Photo de profil */}
                <div className="md:col-span-2 flex justify-center mb-2">
                    <div className="relative">
                        <div
                            className="w-36 h-36 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                            {currentMember.imagePreview ? (
                                <img
                                    src={currentMember.imagePreview}
                                    alt="Preview"
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        // Fallback en cas d'erreur avec l'image
                                        e.currentTarget.src = "/placeholder.svg";
                                    }}
                                />
                            ) : (
                                <User size={40} className="text-gray-400"/>
                            )}
                        </div>
                        <label
                            className="absolute bottom-0 right-0 bg-[#8BBDBD] rounded-full p-2 cursor-pointer hover:bg-[#7AACAC] transition-colors">
                            <Upload size={16} className="text-white"/>
                            <input type="file" accept="image/*" className="hidden" onChange={handleImageChange}/>
                        </label>
                    </div>
                </div>

                {/* Nom */}
                <div className="md:col-span-2">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Nom complet *
                    </label>
                    <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        value={currentMember.name}
                        onChange={handleMemberChange}
                        placeholder="Prénom NOM"
                        className="block w-full rounded-md  border-gray-400 border-2 py-2 px-3 shadow-sm sm:text-sm focus:border-primary focus:border-2 focus:outline-none"
                    />
                </div>

                {/* Date de naissance*/}
                <div>
                    <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 mb-1">
                        Date de naissance
                    </label>
                    <div className="relative">
                        <input
                            id="birthDate"
                            name="birthDate"
                            type="date"
                            value={currentMember.birthDate}
                            onChange={handleMemberChange}
                            className="pl-10 block w-full rounded-md  border-gray-400 border-2 py-2 px-3 shadow-sm sm:text-sm focus:border-primary focus:border-2 focus:outline-none"
                        />
                        <CalendarIcon
                            size={18}
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        />
                    </div>
                </div>


                {/* Lieu de naissance */}
                <div>
                    <label htmlFor="birthPlace" className="block text-sm font-medium text-gray-700 mb-1">
                        Lieu de naissance
                    </label>
                    <div className="relative">
                        <input
                            id="birthPlace"
                            name="birthPlace"
                            type="text"
                            value={currentMember.birthPlace}
                            onChange={handleMemberChange}
                            placeholder="Ville, Pays"
                            className="pl-10 block w-full rounded-md  border-gray-400 border-2 py-2 px-3 shadow-sm sm:text-sm focus:border-primary focus:border-2 focus:outline-none"
                        />
                        <MapPin size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"/>
                    </div>
                </div>

                {/* Genre */}
                <div>
                    <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                        Genre
                    </label>
                    <select
                        id="gender"
                        name="gender"
                        value={currentMember.gender}
                        onChange={handleChange}
                        className="block w-full rounded-md  border-gray-400 border-2 py-2 px-3 shadow-sm sm:text-sm focus:border-primary focus:border-2 focus:outline-none"
                    >
                        <option value="male">Homme</option>
                        <option value="female">Femme</option>
                        <option value="other">Autre</option>
                    </select>
                </div>

                {/* Rôle dans la famille */}
                <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                        Rôle dans la famille
                    </label>
                    <select
                        id="role"
                        name="role"
                        value={currentMember.role}
                        onChange={handleChangeRole}
                        className="block w-full rounded-md  border-gray-400 border-2 py-2 px-3 shadow-sm sm:text-sm focus:border-primary focus:border-2 focus:outline-none"
                    >
                        <option value="parent">Parent</option>
                        <option value="child">Enfant</option>
                        <option value="other">Autre</option>
                    </select>
                </div>

                {/* Boutons d'action */}
                <div className="md:col-span-2 flex justify-end space-x-3 mt-2">
                    <button
                        type="button"
                        onClick={() => setShowAddMemberForm(false)}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8BBDBD]"
                    >
                        Annuler
                    </button>
                    <button
                        type="submit"
                        disabled={!currentMember.name}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#8BBDBD] hover:bg-[#7AACAC] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8BBDBD] disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                        Ajouter
                    </button>
                </div>
            </form>
        </div>
    )
}