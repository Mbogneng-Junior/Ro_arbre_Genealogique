"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import {
    PlusCircle,
    Search,
    Filter,
    ChevronRight,
    Edit2,
    Trash2,
    Users,
    AlertCircle,
    Loader2,
    RefreshCw,
    X,
} from "lucide-react"
import Sidebar from "@/components/global/Sidebar"
import axiosInstance from "@/lib/axiosConfig/axiosInstance"
import type { FamilyType } from "@/lib/type"

export default function FamiliesPage() {
    const [userFamilies, setUserFamilies] = useState<FamilyType[] | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState("")
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    async function retrieveAllFamilies(username: string) {
        setIsLoading(true)
        setErrorMessage(null)

        try {
            const response = await axiosInstance.get(`/userFamilies/${username}`)
            console.log(response?.data)
            setUserFamilies(response?.data?.data)
            setErrorMessage(null)
        } catch (error) {
            console.error("Error fetching families:", error)
            setErrorMessage(
                "Quelque chose a mal tourné durant la récupération de la liste de vos familles, veuillez réessayer plus tard.",
            )
        } finally {
            setIsLoading(false)
        }
    }

    async function handleDeleteFamily(familyId: string) {
        if (!familyId) return

        setIsDeleting(true)
        try {
            // Uncomment and adjust when API is ready
            // await axiosInstance.delete(`/families/${familyId}`)

            // For now, just simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1000))

            // Update the local state to remove the deleted family
            if (userFamilies) {
                setUserFamilies(userFamilies.filter((family) => family.id !== familyId))
            }

            setShowDeleteConfirm(null)
        } catch (error) {
            console.error("Error deleting family:", error)
            setErrorMessage("Erreur lors de la suppression de la famille. Veuillez réessayer.")
        } finally {
            setIsDeleting(false)
        }
    }

    useEffect(() => {
        const username = localStorage.getItem("username") as string
        if (username && username !== "" && username !== null) {
            retrieveAllFamilies(username)
        } else {
            setIsLoading(false)
            setErrorMessage("Utilisateur non connecté. Veuillez vous connecter pour voir vos familles.")
        }
    }, [])

    // Filter families based on search query
    const filteredFamilies = userFamilies
        ? userFamilies.filter((family) => family.familyName.toLowerCase().includes(searchQuery.toLowerCase()))
        : null

    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar />

            <div className="flex flex-1 flex-col overflow-hidden">
                {/* Header */}
                <header className="bg-white border-b border-gray-200">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex h-16 items-center justify-between">
                            <h1 className="text-xl font-semibold text-gray-800">Mes familles</h1>
                            <Link
                                href="/families/add-family"
                                className="inline-flex items-center rounded-md bg-[#8BBDBD] px-4 py-2 text-sm font-medium text-white hover:bg-[#7AACAC] transition-colors"
                            >
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Nouvelle famille
                            </Link>
                        </div>
                    </div>
                </header>

                {/* Main content */}
                <main className="flex-1 overflow-auto">
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                        {/* Search and filter */}
                        <div className="mb-6 flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                            <div className="relative max-w-md flex-1">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <Search className="h-4 w-4 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Rechercher une famille..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="block w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm placeholder-gray-500 focus:border-[#8BBDBD] focus:outline-none focus:ring-1 focus:ring-[#8BBDBD]"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery("")}
                                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                            <button className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                                <Filter className="mr-2 h-4 w-4 text-gray-500" />
                                Filtrer
                            </button>
                        </div>

                        {/* Error message */}
                        {errorMessage && (
                            <div className="mb-6 rounded-md bg-red-50 p-4">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <AlertCircle className="h-5 w-5 text-red-400" />
                                    </div>
                                    <div className="ml-3 flex-1">
                                        <p className="text-sm text-red-700">{errorMessage}</p>
                                    </div>
                                    <div className="ml-auto pl-3">
                                        <button
                                            onClick={() => {
                                                const username = localStorage.getItem("username") as string
                                                if (username) retrieveAllFamilies(username)
                                            }}
                                            className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-100"
                                        >
                                            <RefreshCw className="mr-1 h-3 w-3" />
                                            Réessayer
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Loading state */}
                        {isLoading ? (
                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {[1, 2, 3, 4, 5, 6].map((item) => (
                                    <div
                                        key={item}
                                        className="animate-pulse overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm"
                                    >
                                        <div className="p-5">
                                            <div className="flex items-start justify-between">
                                                <div className="space-y-2 flex-1">
                                                    <div className="h-5 w-3/4 rounded bg-gray-200"></div>
                                                    <div className="h-4 w-1/2 rounded bg-gray-200"></div>
                                                </div>
                                                <div className="h-8 w-8 rounded-full bg-gray-200"></div>
                                            </div>
                                            <div className="mt-4 h-4 w-1/3 rounded bg-gray-200"></div>
                                        </div>
                                        <div className="flex border-t border-gray-200 bg-gray-50 h-12">
                                            <div className="flex-1"></div>
                                            <div className="h-6 border-l border-gray-200"></div>
                                            <div className="flex-1"></div>
                                            <div className="h-6 border-l border-gray-200"></div>
                                            <div className="flex-1"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : userFamilies === null ? (
                            // This should never happen if isLoading is false, but just in case
                            <div className="text-center py-12">
                                <p>Aucune donnée disponible</p>
                            </div>
                        ) : userFamilies.length === 0 || filteredFamilies?.length === 0 ? (
                            // Empty state - will show when no families exist or no search results
                            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white p-12 text-center">
                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#8BBDBD]/20">
                                    <Users className="h-6 w-6 text-[#8BBDBD]" />
                                </div>
                                {searchQuery && filteredFamilies?.length === 0 ? (
                                    <>
                                        <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun résultat trouvé</h3>
                                        <p className="mt-1 text-sm text-gray-500">
                                            Aucune famille ne correspond à votre recherche "{searchQuery}".
                                        </p>
                                        <div className="mt-6">
                                            <button
                                                onClick={() => setSearchQuery("")}
                                                className="inline-flex items-center rounded-md bg-[#8BBDBD] px-4 py-2 text-sm font-medium text-white hover:bg-[#7AACAC] transition-colors"
                                            >
                                                Effacer la recherche
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune famille</h3>
                                        <p className="mt-1 text-sm text-gray-500">Commencez par créer votre première famille.</p>
                                        <div className="mt-6">
                                            <Link
                                                href="/families/add-family"
                                                className="inline-flex items-center rounded-md bg-[#8BBDBD] px-4 py-2 text-sm font-medium text-white hover:bg-[#7AACAC] transition-colors"
                                            >
                                                <PlusCircle className="mr-2 h-4 w-4" />
                                                Nouvelle famille
                                            </Link>
                                        </div>
                                    </>
                                )}
                            </div>
                        ) : (
                            // Families grid
                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {filteredFamilies?.map((family) => (
                                    <div
                                        key={family.id}
                                        className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
                                    >
                                        <div className="p-5">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h3 className="text-lg font-medium text-gray-900">{family.familyName}</h3>
                                                    <p className="mt-1 text-sm text-gray-500">
                                                        {/*family.description ||*/ "Une description superbe"}
                                                    </p>
                                                </div>
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#8BBDBD]/20 text-[#8BBDBD]">
                                                    <Users className="h-4 w-4" />
                                                </div>
                                            </div>
                                            <div className="mt-4 flex items-center justify-between text-sm">
                                                <div className="text-gray-500">
                                                    {family.numberOfMembers} membre{Number(family.numberOfMembers) !== 1 ? "s" : ""}
                                                </div>
                                                {/*family.createdAt && (
                                                    <div className="text-gray-500">
                                                        Créée le {new Date(family.createdAt).toLocaleDateString()}
                                                    </div>
                                                )*/}
                                            </div>
                                        </div>
                                        <div className="flex border-t border-gray-200 bg-gray-50">
                                            <Link
                                                href={`/families/${family.id}`}
                                                className="flex flex-1 items-center justify-center py-3 text-sm font-medium text-[#8BBDBD] hover:bg-gray-100 hover:text-[#7AACAC] transition-colors"
                                            >
                                                Voir
                                                <ChevronRight className="ml-1 h-4 w-4" />
                                            </Link>
                                            <div className="h-6 border-l border-gray-200 py-3"></div>
                                            <Link
                                                href={`/families/${family.id}/edit`}
                                                className="flex flex-1 items-center justify-center py-3 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                                            >
                                                <Edit2 className="mr-1 h-4 w-4" />
                                                Modifier
                                            </Link>
                                            <div className="h-6 border-l border-gray-200 py-3"></div>
                                            <button
                                                onClick={() => setShowDeleteConfirm(family.id)}
                                                className="flex flex-1 items-center justify-center py-3 text-sm font-medium text-red-500 hover:bg-gray-100 hover:text-red-600 transition-colors"
                                            >
                                                <Trash2 className="mr-1 h-4 w-4" />
                                                Supprimer
                                            </button>
                                        </div>

                                        {/* Delete confirmation dialog */}
                                        {showDeleteConfirm === family.id && (
                                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                                                <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
                                                    <h3 className="text-lg font-medium text-gray-900">Confirmer la suppression</h3>
                                                    <p className="mt-2 text-sm text-gray-500">
                                                        Êtes-vous sûr de vouloir supprimer la famille "{family.familyName}" ? Cette action est
                                                        irréversible.
                                                    </p>
                                                    <div className="mt-4 flex justify-end space-x-3">
                                                        <button
                                                            onClick={() => setShowDeleteConfirm(null)}
                                                            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                                            disabled={isDeleting}
                                                        >
                                                            Annuler
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteFamily(family.id)}
                                                            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors disabled:opacity-50"
                                                            disabled={isDeleting}
                                                        >
                                                            {isDeleting ? (
                                                                <>
                                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin inline" />
                                                                    Suppression...
                                                                </>
                                                            ) : (
                                                                "Supprimer"
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}

                                {/* Add new family card */}
                                <Link
                                    href="/families/add-family"
                                    className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white p-6 text-center hover:border-[#8BBDBD] hover:bg-gray-50 transition-colors"
                                >
                                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#8BBDBD]/20">
                                        <PlusCircle className="h-6 w-6 text-[#8BBDBD]" />
                                    </div>
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">Ajouter une famille</h3>
                                    <p className="mt-1 text-sm text-gray-500">Créez une nouvelle famille pour votre arbre généalogique</p>
                                </Link>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    )
}
