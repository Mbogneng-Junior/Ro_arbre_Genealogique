import {PlusCircle, Search} from "lucide-react";
import Link from "next/link";

export default function QuickAction()
{
    return (
        <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-2">
            <div className="rounded-lg bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-800">Créer une famille</h3>
                    <PlusCircle className="h-5 w-5 text-teal-500"/>
                </div>
                <p className="mb-4 text-sm text-gray-600">
                    Commencez un nouvel arbre généalogique en créant une famille.
                </p>
                <Link
                    href="/families/add-family"
                    className="inline-flex items-center justify-center rounded-md bg-teal-500 px-4 py-2 text-sm font-medium text-white hover:bg-teal-600"
                >
                    Nouvelle famille
                </Link>
            </div>

            <div className="rounded-lg bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-800">Rechercher une relation</h3>
                    <Search className="h-5 w-5 text-teal-500"/>
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
    )
}