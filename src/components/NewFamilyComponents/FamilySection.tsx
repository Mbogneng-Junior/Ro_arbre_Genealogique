import Link from "next/link";
import {FamilyType} from "@/lib/type";
import {ChevronRight} from "lucide-react";

export default function FamilySection({userFamilies, errorMessage}: {userFamilies: [FamilyType]|null, errorMessage: string|null})
{
    return(
        <>
            <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-800">Mes familles</h2>
                <Link href="/families" className="text-sm font-medium text-teal-600 hover:text-teal-700">
                    Voir tout
                </Link>
            </div>

            {userFamilies ? (
                userFamilies.length > 0 ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {userFamilies.map((family: FamilyType) => (
                            <Link
                                key={family?.id}
                                href={`/src/app/families/${family?.id}`}
                                className="group rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
                            >
                                <div className="mb-2 flex items-center justify-between">
                                    <h3 className="font-medium text-gray-800 group-hover:text-teal-600">{family?.familyName}</h3>
                                    <ChevronRight
                                        className="h-4 w-4 text-gray-400 group-hover:text-teal-500"/>
                                </div>
                                <div
                                    className="flex items-center justify-between text-sm text-gray-500">
                                    <span>{family?.numberOfMembers} membres</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (<p className="text-md font-bold text-gray-600">Aucune famille encore enregistree.</p>)
            ) : (
                errorMessage ? (
                    <div className="text-md font-bold text-gray-600">{errorMessage}</div>
                ) : (<p className="text-md font-bold text-gray-600">Aucune famille encore enregistree.</p>)
            )}
        </>
    )
}