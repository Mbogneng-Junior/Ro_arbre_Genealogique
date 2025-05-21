import {Home} from "lucide-react";
import type React from "react";


export type  FamilyInfosProps = {
    familyName: string;
    setFamilyName: React.Dispatch<React.SetStateAction<string>>;
    familyDescription: string;
    setFamilyDescription: React.Dispatch<React.SetStateAction<string>>;
    handleSubmit: React.FormEventHandler<HTMLFormElement>;
    isLoading: boolean
}


export default function FamilyInfos({familyName, setFamilyName, familyDescription, setFamilyDescription, handleSubmit, isLoading}: FamilyInfosProps)
{
    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center justify-center mb-6">
                <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center text-white">
                    <Home size={40}/>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                <div>
                    <label htmlFor="familyName" className="block text-sm font-medium text-gray-700 mb-1">
                        Nom de la famille *
                    </label>
                    <input
                        id="familyName"
                        name="familyName"
                        type="text"
                        required
                        value={familyName}
                        onChange={(e) => setFamilyName(e.target.value)}
                        placeholder="Ex: Famille NGOUPAYE"
                        className="block w-full rounded-md  border-gray-400 border-2 py-2 px-3 shadow-sm sm:text-sm focus:border-primary focus:border-2 focus:outline-none"
                    />
                </div>

                <div>
                    <label htmlFor="familyDescription" className="block text-sm font-medium text-gray-700 mb-1">
                        Description de la famille
                    </label>
                    <textarea
                        id="familyDescription"
                        name="familyDescription"
                        rows={3}
                        value={familyDescription}
                        onChange={(e) => setFamilyDescription(e.target.value)}
                        placeholder="Quelques mots sur l'histoire de votre famille..."
                        className="block w-full rounded-md  border-gray-400 border-2 py-2 px-3 shadow-sm sm:text-sm focus:border-primary focus:border-2 focus:outline-none"
                    />
                </div>
            </div>
            <div className="flex justify-end mt-8">
                <button
                    type="submit"
                    disabled={!familyName}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-[#8BBDBD] hover:bg-[#7AACAC] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8BBDBD] disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                    {isLoading ? " Chargement..." : "Creer la famille"}
                </button>
            </div>
        </form>
    )
}