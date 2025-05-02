"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
    AxiosRegistrationResponse,
    FamilyFormType,
    RegistrationFormType
} from "@/lib/type";
import axios, {AxiosResponse} from "axios";


export default function RegistrationForm() {

    const router = useRouter()
    const [step, setStep] = useState<number>(1)
    const [formData, setFormData] = useState<RegistrationFormType>({
        dateOfBirth: "",
        email: "",
        firstName: "",
        lastName: "",
        password: "",
    });

    const [createFamily, setCreateFamily] = useState<boolean>(false);

    const [familyForm, setFamilyForm] = useState<FamilyFormType>({familyName: "", username: ""});


    function handleChange  (e: React.ChangeEvent<HTMLInputElement>): void
        {
        const { name, value} = e.target;
        setFormData({
            ...formData,
            [name]:  value,
        })
    }

    function handleFamilyFormChange (e: React.ChangeEvent<HTMLInputElement>):void
    {
        const { name, value} = e.target;
        setFamilyForm({
            ...familyForm,
            [name]:  value,
        })
    }

    function nextStep ():void
        {
        setStep(step + 1);
    }

    function prevStep ():void
    {
        setStep(step - 1)
    }

    async function handleSubmit(e: React.FormEvent): Promise<void> {
        e.preventDefault();
        console.log("Form submitted:", formData);
        console.log("Family form submitted:", familyForm);

        try {
            const response: AxiosResponse<AxiosRegistrationResponse> = await axios.post(
                "http://localhost:8019/api/register",
                formData
            );

            let familySuccess = true;

            if (createFamily) {
                const familyResponse: AxiosResponse = await axios.post(
                    "http://localhost:8019/api/create_family",
                    familyForm
                );
                familySuccess = familyResponse.status === 200;
            }

            if (response.status === 200 && familySuccess) {
                alert("Création réussie");
                router.push("/login");
            } else {
                alert("Une erreur est survenue lors de la création.");
            }

        } catch (error) {
            console.error("Erreur lors de la création :", error);
            alert("Échec de la création");
        }
    }


    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {step === 1 && (
                <div className="space-y-4">
                    <div className="flex flex-col space-y-1">
                        <label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                            Nom
                        </label>
                        <input
                            id="firstName"
                            name="firstName"
                            type="text"
                            required
                            value={formData.firstName}
                            onChange={handleChange}
                            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8BBDBD]"
                        />
                    </div>

                    <div className="flex flex-col space-y-1">
                        <label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                            Prénom
                        </label>
                        <input
                            id="lastName"
                            name="lastName"
                            type="text"
                            required
                            value={formData.lastName}
                            onChange={handleChange}
                            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8BBDBD]"
                        />
                    </div>

                    <div className="flex flex-col space-y-1">
                        <label htmlFor="email" className="text-sm font-medium text-gray-700">
                            Email
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8BBDBD]"
                        />
                    </div>

                    <div className="flex flex-col space-y-1">
                        <label htmlFor="password" className="text-sm font-medium text-gray-700">
                            Mot de passe
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            value={formData.password}
                            onChange={handleChange}
                            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8BBDBD]"
                        />
                    </div>

                    <button
                        type="button"
                        onClick={nextStep}
                        className="w-full py-2 px-4 bg-[#8BBDBD] text-white font-medium rounded-md hover:bg-[#7AACAC] transition-colors"
                    >
                        Continuer
                    </button>
                </div>
            )}

            {step === 2 && (
                <div className="space-y-4">
                    <div className="flex flex-col space-y-1">
                        <label htmlFor="birthDate" className="text-sm font-medium text-gray-700">
                            Date de naissance
                        </label>
                        <input
                            id="birthDate"
                            name="birthDate"
                            type="date"
                            value={formData.dateOfBirth}
                            onChange={handleChange}
                            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8BBDBD]"
                        />
                    </div>


                    <div className="flex items-center space-x-2 pt-2">
                        <input
                            id="createFamily"
                            name="createFamily"
                            type="checkbox"
                            checked={createFamily}
                            onChange={()=> setCreateFamily(!createFamily)}
                            className="h-4 w-4 text-[#8BBDBD] focus:ring-[#8BBDBD] border-gray-300 rounded"
                        />
                        <label htmlFor="createFamily" className="text-sm font-medium text-gray-700">
                            Je souhaite créer une famille
                        </label>
                    </div>

                    {createFamily && (
                        <>
                            <div className="flex flex-col space-y-1">
                                <label htmlFor="familyName" className="text-sm font-medium text-gray-700">
                                    Nom de la famille
                                </label>
                                <input
                                    id="familyName"
                                    name="familyName"
                                    type="text"
                                    value={familyForm.familyName}
                                    onChange={handleFamilyFormChange}
                                    className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8BBDBD]"
                                />
                            </div>

                            <div className="flex flex-col space-y-1">
                                <label htmlFor="familyName" className="text-sm font-medium text-gray-700">
                                    Identifiant unique (nom d'utilisateur)
                                </label>
                                <input
                                    id="familyName"
                                    name="familyName"
                                    type="text"
                                    value={familyForm.username}
                                    onChange={handleFamilyFormChange}
                                    className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8BBDBD]"
                                />
                            </div>
                        </>


                    )}

                    <div className="flex space-x-4">
                        <button
                            type="button"
                            onClick={prevStep}
                            className="w-1/2 py-2 px-4 bg-gray-200 text-gray-800 font-medium rounded-md hover:bg-gray-300 transition-colors"
                        >
                            Retour
                        </button>
                        <button
                            type="submit"
                            className="w-1/2 py-2 px-4 bg-[#8BBDBD] text-white font-medium rounded-md hover:bg-[#7AACAC] transition-colors"
                        >
                            {"S'inscrire"}
                        </button>
                    </div>
                </div>
            )}

            <div className="flex justify-center space-x-2 mt-4">
                <span className={`h-2 w-2 rounded-full ${step === 1 ? "bg-primary" : "bg-gray-300"}`}></span>
                <span className={`h-2 w-2 rounded-full ${step === 2 ? "bg-primary" : "bg-gray-300"}`}></span>
            </div>
        </form>
    )
}
