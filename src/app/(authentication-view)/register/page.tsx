import Image from "next/image"
import Link from "next/link"
import {JSX} from "react";
import RegistrationForm from "@/components/RegistrationForm";

export default function RegisterPage(): JSX.Element {
    return (
        <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-100">
            <div className="w-full max-w-4xl flex flex-col md:flex-row bg-base-color rounded-xl shadow-lg overflow-hidden">
                <div className="w-full md:w-1/2 bg-primary p-8 flex flex-col justify-center items-center text-white">
                    <div className="mb-8">
                        <Image
                            src="/logo.jpg"
                            alt="Logo"
                            width={200}
                            height={200}
                            className="mx-auto rounded-full"
                        />
                    </div>
                    <h1 className="text-3xl font-bold mb-4 text-center">Votre Histoire Familiale</h1>
                    <p className="text-center mb-6">
                        Créez et explorez votre arbre généalogique. Connectez-vous avec votre histoire familiale.
                    </p>
                    <div className="space-y-4 w-full max-w-xs">
                        <div className="flex items-center space-x-2">
                            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="text-white"
                                >
                                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="9" cy="7" r="4"></circle>
                                    <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                </svg>
                            </div>
                            <span>Créez votre profil personnel</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-10 h-10 rounded-full bg-base-color/20 flex items-center justify-center">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="text-white"
                                >
                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="9" cy="7" r="4"></circle>
                                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                </svg>
                            </div>
                            <span>Ajoutez des membres de famille</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-10 h-10 rounded-full bg-base-color/20 flex items-center justify-center">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="text-white"
                                >
                                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                                </svg>
                            </div>
                            <span>Construisez votre arbre généalogique</span>
                        </div>
                    </div>
                </div>
                <div className="w-full md:w-1/2 p-8">
                    <div className="max-w-md mx-auto">
                        <h2 className="text-2xl font-semibold mb-6 text-gray-800">Créez votre compte</h2>
                        <RegistrationForm />
                        <p className="mt-6 text-center text-gray-600">
                            Vous avez déjà un compte?{" "}
                            <Link href="/login" className="text-primary hover:underline font-medium">
                                Connectez-vous
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </main>
    )
}
