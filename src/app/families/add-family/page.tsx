"use client";
import FamilyCreationForm from "@/components/NewFamilyComponents/family-creation-form"
import Sidebar from "@/components/global/Sidebar";
import {useAuthentication} from "@/utils/Provider";
import Header from "@/components/global/Header";

export default function CreateFamilyPage() {

    const {userData} = useAuthentication();
    return (
        <>
            <div className="flex h-screen bg-gray-50">
                {/* Sidebar */}
                <Sidebar/>
                {/* Main content */}
                <div className="flex flex-1 flex-col min-h-screen overflow-hidden">
                    {/* Top header */}
                   <Header userData={userData}/>
                    <main className=" bg-gray-50 mt-5  overflow-y-auto px-4 sm:px-6 lg:px-8">
                        <div className="max-w-4xl mx-auto">
                            <div className="text-center mb-8">
                                <h1 className="text-3xl font-bold text-gray-900">Créer votre famille</h1>
                                <p className="mt-2 text-lg text-gray-600">
                                    Commencez votre arbre généalogique en créant une famille et en ajoutant ses membres
                                </p>
                            </div>
                            <FamilyCreationForm/>
                        </div>
                    </main>
                </div>
            </div>
        </>
    )
}
