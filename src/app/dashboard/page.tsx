import Link from "next/link"
import { PlusCircle, Search, Users, Home, Settings, LogOut, ChevronRight, Clock } from "lucide-react"

export default function Dashboard() {
    // Données simulées pour les familles
    const families = [
        { id: 1, name: "Famille Dupont", members: 12, lastUpdated: "Il y a 2 jours" },
        { id: 2, name: "Famille Martin", members: 8, lastUpdated: "Il y a 1 semaine" },
        { id: 3, name: "Famille Dubois", members: 15, lastUpdated: "Aujourd'hui" },
        { id: 4, name: "Famille Lefèvre", members: 6, lastUpdated: "Il y a 3 jours" },
    ]

    // Données simulées pour l'activité récente
    const recentActivity = [
        { id: 1, action: "Ajout d'un membre", family: "Famille Dupont", time: "Il y a 2 heures" },
        { id: 2, action: "Modification de relation", family: "Famille Martin", time: "Il y a 1 jour" },
        { id: 3, action: "Recherche de relation", family: "Famille Dubois", time: "Aujourd'hui" },
    ]

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <div className="hidden w-64 flex-shrink-0 border-r border-gray-200 bg-white md:flex md:flex-col">
                <div className="flex h-16 items-center justify-center border-b border-gray-200">
                    <h1 className="text-xl font-semibold text-teal-600">ArbreGénéalogique</h1>
                </div>
                <div className="flex flex-1 flex-col overflow-y-auto">
                    <nav className="flex-1 space-y-1 px-2 py-4">
                        <Link
                            href="/dashboard"
                            className="flex items-center rounded-md bg-teal-50 px-3 py-2 text-sm font-medium text-teal-700"
                        >
                            <Home className="mr-3 h-5 w-5 text-teal-500" />
                            Tableau de bord
                        </Link>
                        <Link
                            href="/dashboard/families"
                            className="flex items-center rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        >
                            <Users className="mr-3 h-5 w-5 text-gray-400" />
                            Mes familles
                        </Link>
                        <Link
                            href="/dashboard/settings"
                            className="flex items-center rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        >
                            <Settings className="mr-3 h-5 w-5 text-gray-400" />
                            Paramètres
                        </Link>
                    </nav>
                    <div className="border-t border-gray-200 p-4">
                        <button className="flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900">
                            <LogOut className="mr-3 h-5 w-5 text-gray-400" />
                            Déconnexion
                        </button>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="flex flex-1 flex-col overflow-hidden">
                {/* Top header */}
                <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 md:px-6">
                    <h1 className="text-lg font-semibold text-gray-800 md:hidden">Family Tree App</h1>
                    <div className="flex items-center">
                        <div className="relative ml-3">
                            <div className="flex items-center">
                                <div className="h-8 w-8 rounded-full bg-teal-500 flex items-center justify-center text-white font-medium">
                                    JD
                                </div>
                                <span className="ml-2 text-sm font-medium text-gray-700">Jean Dupont</span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Dashboard content */}
                <main className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-6">
                    <div className="mx-auto max-w-7xl">
                        {/* Welcome section */}
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-gray-800">Bonjour, Jean</h2>
                            <p className="text-gray-600">Bienvenue dans votre espace personnel</p>
                        </div>

                        {/* Quick actions */}
                        <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-2">
                            <div className="rounded-lg bg-white p-6 shadow-sm">
                                <div className="mb-4 flex items-center justify-between">
                                    <h3 className="text-lg font-medium text-gray-800">Créer une famille</h3>
                                    <PlusCircle className="h-5 w-5 text-teal-500" />
                                </div>
                                <p className="mb-4 text-sm text-gray-600">
                                    Commencez un nouvel arbre généalogique en créant une famille.
                                </p>
                                <Link
                                    href="/dashboard/families/new"
                                    className="inline-flex items-center justify-center rounded-md bg-teal-500 px-4 py-2 text-sm font-medium text-white hover:bg-teal-600"
                                >
                                    Nouvelle famille
                                </Link>
                            </div>

                            <div className="rounded-lg bg-white p-6 shadow-sm">
                                <div className="mb-4 flex items-center justify-between">
                                    <h3 className="text-lg font-medium text-gray-800">Rechercher une relation</h3>
                                    <Search className="h-5 w-5 text-teal-500" />
                                </div>
                                <p className="mb-4 text-sm text-gray-600">
                                    Trouvez le lien de parenté entre deux membres d'une famille.
                                </p>
                                <Link
                                    href="/dashboard/search"
                                    className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Rechercher
                                </Link>
                            </div>
                        </div>

                        {/* Families section */}
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-gray-800">Mes familles</h2>
                            <Link href="/dashboard/families" className="text-sm font-medium text-teal-600 hover:text-teal-700">
                                Voir tout
                            </Link>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {families.map((family) => (
                                <Link
                                    key={family.id}
                                    href={`/dashboard/families/${family.id}`}
                                    className="group rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
                                >
                                    <div className="mb-2 flex items-center justify-between">
                                        <h3 className="font-medium text-gray-800 group-hover:text-teal-600">{family.name}</h3>
                                        <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-teal-500" />
                                    </div>
                                    <div className="flex items-center justify-between text-sm text-gray-500">
                                        <span>{family.members} membres</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}
