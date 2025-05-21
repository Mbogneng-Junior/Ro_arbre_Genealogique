"use client";

import Sidebar from "@/components/global/Sidebar";
import {useAuthentication} from "@/utils/Provider";
import {useEffect, useState} from "react";
import axiosInstance from "@/lib/axiosConfig/axiosInstance";
import {FamilyType} from "@/lib/type";
import Header from "@/components/global/Header";
import QuickAction from "@/components/NewFamilyComponents/QuickAction";
import FamilySection from "@/components/NewFamilyComponents/FamilySection";

export default function Dashboard() {



    const {userData} = useAuthentication();
    const [userFamilies, setUserFamilies] = useState<[FamilyType]|null>(null);
    const [errorMessage, setErrorMessage] = useState<string|null>(null);



    async function retrieveAllFamilies(username: string)
    {
        try {
            const response = await axiosInstance.get(`/userFamilies/${username}`);
            console.log(response?.data);
            setUserFamilies(response?.data?.data);
            setErrorMessage(null);
        } catch (error)
        {
            setErrorMessage("Quelque chose a mal tourne durant la recuperation de la liste de vos familles, veuillez reessayer plutard");
            console.log(error);

        }
    }

    useEffect(() => {
        const username = localStorage.getItem("username") as string;
        if(username && username != "" && username != null)
        {
            retrieveAllFamilies(username);
        }
        else
        {
            throw new Error("Username not found in local storage");
        }
    }, []);




    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar/>
            <div className="flex flex-1 flex-col overflow-hidden">
                <Header userData={userData}/>
                <main className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-6">
                    <div className="mx-auto max-w-7xl">
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-gray-800">Bonjour, {userData?.firstName}</h2>
                            <p className="text-gray-600">Bienvenue dans votre espace personnel</p>
                        </div>
                       <QuickAction/>
                      <FamilySection userFamilies={userFamilies} errorMessage={errorMessage}/>
                    </div>
                </main>
            </div>
        </div>
    )
}
