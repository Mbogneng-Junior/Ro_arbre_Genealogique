import {Save, User, Users} from "lucide-react";
import type React from "react";
import {FamilyMember} from "@/lib/type";



export type FinalStepProps = {
    familyName: string,
    familyDescription?: string,
    members: FamilyMember[],
    prevStep: () => void,
    isSubmitting: boolean,
    addMember: () => void
}

export default function FinalStep({familyName, familyDescription, members, prevStep, isSubmitting, addMember}: FinalStepProps)
{
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-center mb-6">
                <div className="w-20 h-20 bg-[#8BBDBD] rounded-full flex items-center justify-center text-white">
                    <Save size={40}/>
                </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Récapitulatif de votre famille</h2>

                <div className="space-y-4">
                    <div>
                        <h3 className="text-sm font-medium text-gray-500">Nom de la famille</h3>
                        <p className="text-lg font-medium text-gray-900">{familyName}</p>
                    </div>

                    {familyDescription && (
                        <div>
                            <h3 className="text-sm font-medium text-gray-500">Description</h3>
                            <p className="text-base text-gray-900">{familyDescription}</p>
                        </div>
                    )}

                    <div>
                        <h3 className="text-sm font-medium text-gray-500 flex items-center">
                            <Users size={16} className="mr-1"/>
                            Membres ({members.length})
                        </h3>

                        {members.length > 0 ? (
                            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {members.map((member) => (
                                    <div
                                        key={member.id}
                                        className="flex items-center p-2 bg-white rounded-md border border-gray-200"
                                    >
                                        <div
                                            className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden mr-2">
                                            {member.imagePreview ? (
                                                <img
                                                    src={member.imagePreview || "/placeholder.svg"}
                                                    alt={member.firstName}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <User size={16} className="text-gray-400"/>
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{member.firstName}</p>
                                            <p className="text-xs text-gray-500">
                                                {member.role === "parent" ? "Parent" : member.role === "child" ? "Enfant" : "Autre"}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 italic">Aucun membre ajouté</p>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex justify-between mt-8">
                <button
                    type="button"
                    onClick={prevStep}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8BBDBD]"
                >
                    Retour
                </button>
                <button
                    type="button"
                    onClick={addMember}
                    disabled={isSubmitting}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-[#8BBDBD] hover:bg-[#7AACAC] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8BBDBD] disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? (
                        <>
                            <svg
                                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                ></circle>
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                            </svg>
                            Ajout en cours...
                        </>
                    ) : (
                        <>
                            <Save className="mr-2" size={20}/>
                            Ajouter les membres
                        </>
                    )}
                </button>
            </div>
        </div>
    )
}