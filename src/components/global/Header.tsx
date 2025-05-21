import {UserType} from "@/lib/type";

export default function Header({userData}: {userData: UserType | null} )
{
    return (
        <header className="flex h-16 py-6 items-center justify-between border-b border-gray-200 bg-white px-4 md:px-6">
            <h1 className="text-lg font-semibold text-gray-800 md:hidden">Family Tree App</h1>
            <div className="flex items-center">
                <div className="relative ml-3">
                    <div className="flex items-center">
                        <div
                            className="h-8 w-8 rounded-full bg-teal-500 flex items-center justify-center text-white font-medium">
                            {userData?.firstName && userData?.firstName.charAt(0).toUpperCase()}{userData?.lastName && userData?.lastName.charAt(0).toUpperCase()}
                        </div>
                        <span
                            className="ml-2 text-sm font-medium text-gray-700">{userData?.firstName + " " + userData?.lastName}</span>
                    </div>
                </div>
            </div>
        </header>
    )
}