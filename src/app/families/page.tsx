"use client";
import Link from "next/link"
import { PlusCircle, Search, Filter, ChevronRight, Edit2, Trash2, Users } from "lucide-react"
import Sidebar from "@/components/global/Sidebar";
import axiosInstance from "@/lib/axiosConfig/axiosInstance";
import {useState} from "react";
import {AxiosResponse} from "axios";

export default function FamiliesPage() {
    // Données simulées pour les familles
    const families = [
        {
            id: 1,
            name: "Famille Dupont",
            members: 12,
            lastUpdated: "Il y a 2 jours",
            description: "Branche paternelle originaire de Normandie",
            createdAt: "12 janvier 2023",
        },
        {
            id: 2,
            name: "Famille Martin",
            members: 8,
            lastUpdated: "Il y a 1 semaine",
            description: "Branche maternelle avec origines italiennes",
            createdAt: "3 mars 2023",
        },
        {
            id: 3,
            name: "Famille Dubois",
            members: 15,
            lastUpdated: "Aujourd'hui",
            description: "Famille étendue incluant cousins éloignés",
            createdAt: "17 avril 2023",
        },
        {
            id: 4,
            name: "Famille Lefèvre",
            members: 6,
            lastUpdated: "Il y a 3 jours",
            description: "Branche de la belle-famille",
            createdAt: "5 juin 2023",
        },
        {
            id: 5,
            name: "Famille Bernard",
            members: 9,
            lastUpdated: "Il y a 2 semaines",
            description: "Ancêtres du côté paternel",
            createdAt: "22 juillet 2023",
        },
        {
            id: 6,
            name: "Famille Moreau",
            members: 11,
            lastUpdated: "Il y a 1 mois",
            description: "Branche familiale du sud de la France",
            createdAt: "14 septembre 2023",
        },
    ]


    const [familyList, setFamilyList]= useState({});


    async function getFamiles(): Promise<void>
    {
        try
        {
            const response: AxiosResponse = await axiosInstance.get("/families");
            if(response.status === 200)
            {
                setFamilyList(response.data);
            }
        }
        catch (error)
        {
            console.log(error);
        }
    }



    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar/>


            <div className="flex flex-1 flex-col overflow-hidden">
                {/* Header */}
                <header className="bg-white border-b border-gray-200">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex h-16 items-center justify-between">
                            <h1 className="text-xl font-semibold text-gray-800">Mes familles</h1>
                            <Link
                                href="/src/app/families/new"
                                className="inline-flex items-center rounded-md bg-teal-500 px-4 py-2 text-sm font-medium text-white hover:bg-teal-600"
                            >
                                <PlusCircle className="mr-2 h-4 w-4"/>
                                Nouvelle famille
                            </Link>
                        </div>
                    </div>
                </header>


                {/* Main content */}
                <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                    {/* Search and filter */}
                    <div
                        className="mb-6 flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                        <div className="relative max-w-md flex-1">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <Search className="h-4 w-4 text-gray-400"/>
                            </div>
                            <input
                                type="text"
                                placeholder="Rechercher une famille..."
                                className="block w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm placeholder-gray-500 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                            />
                        </div>
                        <button
                            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                            <Filter className="mr-2 h-4 w-4 text-gray-500"/>
                            Filtrer
                        </button>
                    </div>

                    {/* Families grid */}
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {families.map((family) => (
                            <div
                                key={family.id}
                                className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
                            >
                                <div className="p-5">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="text-lg font-medium text-gray-900">{family.name}</h3>
                                            <p className="mt-1 text-sm text-gray-500">{family.description}</p>
                                        </div>
                                        <div
                                            className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-100 text-teal-600">
                                            <Users className="h-4 w-4"/>
                                        </div>
                                    </div>
                                    <div className="mt-4 flex items-center justify-between text-sm">
                                        <div className="text-gray-500">{family.members} membres</div>
                                        <div className="text-gray-500">Créée le {family.createdAt}</div>
                                    </div>
                                    <div className="mt-1 text-xs text-gray-400">Mise à jour: {family.lastUpdated}</div>
                                </div>
                                <div className="flex border-t border-gray-200 bg-gray-50">
                                    <Link
                                        href={`/src/app/families/${family.id}`}
                                        className="flex flex-1 items-center justify-center py-3 text-sm font-medium text-teal-600 hover:bg-gray-100 hover:text-teal-700"
                                    >
                                        Voir
                                        <ChevronRight className="ml-1 h-4 w-4"/>
                                    </Link>
                                    <div className="h-6 border-l border-gray-200 py-3"></div>
                                    <Link
                                        href={`/src/app/families/${family.id}/edit`}
                                        className="flex flex-1 items-center justify-center py-3 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-700"
                                    >
                                        <Edit2 className="mr-1 h-4 w-4"/>
                                        Modifier
                                    </Link>
                                    <div className="h-6 border-l border-gray-200 py-3"></div>
                                    <button
                                        className="flex flex-1 items-center justify-center py-3 text-sm font-medium text-red-500 hover:bg-gray-100 hover:text-red-600">
                                        <Trash2 className="mr-1 h-4 w-4"/>
                                        Supprimer
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Empty state - will show when no families exist */}
                    {families.length === 0 && (
                        <div
                            className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white p-12 text-center">
                            <div
                                className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-teal-100">
                                <Users className="h-6 w-6 text-teal-600"/>
                            </div>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune famille</h3>
                            <p className="mt-1 text-sm text-gray-500">Commencez par créer votre première famille.</p>
                            <div className="mt-6">
                                <Link
                                    href="/src/app/families/new"
                                    className="inline-flex items-center rounded-md bg-teal-500 px-4 py-2 text-sm font-medium text-white hover:bg-teal-600"
                                >
                                    <PlusCircle className="mr-2 h-4 w-4"/>
                                    Nouvelle famille
                                </Link>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>

    )
}
