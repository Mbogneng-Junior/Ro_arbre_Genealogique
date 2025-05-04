import Link from "next/link";
import {Home, LogOut, Settings, Users} from "lucide-react";
import {JSX} from "react";
import {useAuthentication} from "@/utils/Provider";
import {usePathname, useRouter} from "next/navigation";


export default function Sidebar(): JSX.Element
{
    const {logout} = useAuthentication();
    const currentPath = usePathname();


    function isActive (path: string): boolean
    {
       return currentPath === path;

    }


    function getLinkClasses  (path: string): string
    {
        const baseClasses = "flex items-center rounded-md px-3 py-2 text-sm font-medium";
        const activeClasses = "bg-teal-50 text-teal-700";
        const inactiveClasses = "text-gray-600 hover:bg-gray-50 hover:text-gray-900";

        return `${baseClasses} ${isActive(path) ? activeClasses : inactiveClasses}`;
    }


    function getIconClasses  (path: string): string
    {
        const baseClasses = "mr-3 h-5 w-5";
        const activeClasses = "text-teal-500";
        const inactiveClasses = "text-gray-400";

        return `${baseClasses} ${isActive(path) ? activeClasses : inactiveClasses}`;
    }

    const router = useRouter();

    return (
        <div className="hidden w-64 flex-shrink-0 border-r border-gray-200 bg-white md:flex md:flex-col">
            <div onClick={()=> router.push("/")} className="cursor-pointer flex h-16 items-center justify-center border-b border-gray-200">
                <h1 className="text-xl font-semibold text-teal-600">Family Tree App</h1>
            </div>
            <div className="flex flex-1 flex-col overflow-y-auto">
                <nav className="flex-1 space-y-1 px-2 py-4">
                    <Link
                        href="/dashboard"
                        className={getLinkClasses('/dashboard')}
                    >
                        <Home className={getIconClasses('/dashboard')} />
                        Tableau de bord
                    </Link>
                    <Link
                        href="/dashboard/families"
                        className={getLinkClasses('/dashboard/families')}
                    >
                        <Users className={getIconClasses('/dashboard/families')} />
                        Mes familles
                    </Link>
                    <Link
                        href="/dashboard/settings"
                        className={getLinkClasses('/dashboard/settings')}
                    >
                        <Settings className={getIconClasses('/dashboard/settings')} />
                        Paramètres
                    </Link>
                </nav>
                <div className="border-t border-gray-200 p-4">
                    <button
                        onClick={logout}
                        className="cursor-pointer flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    >
                        <LogOut className="mr-3 h-5 w-5 text-gray-400" />
                        Déconnexion
                    </button>
                </div>
            </div>
        </div>
    );
}