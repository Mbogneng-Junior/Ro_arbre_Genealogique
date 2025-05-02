import Link from "next/link"
import Image from "next/image"
import {JSX} from "react";

export default function LoginPage(): JSX.Element {
    return (
        <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
            <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="p-8">
                    <div className="text-center mb-8">
                        <Image src="/logo.jpg" alt="Logo" width={100} height={100} className="mx-auto" />
                        <h1 className="text-2xl font-bold mt-4 text-gray-800">Connexion</h1>
                    </div>

                    <form className="space-y-4">
                        <div className="flex flex-col space-y-1">
                            <label htmlFor="email" className="text-sm font-medium text-gray-700">
                                Email
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8BBDBD]"
                            />
                        </div>

                        <div className="flex flex-col space-y-1">
                            <label htmlFor="password" className="text-sm font-medium text-gray-700">
                                Mot de passe
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8BBDBD]"
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 text-[#8BBDBD] focus:ring-[#8BBDBD] border-gray-300 rounded"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                                    Se souvenir de moi
                                </label>
                            </div>
                            <div className="text-sm">
                                <Link href="/forgot-password" className="text-[#8BBDBD] hover:underline">
                                    Mot de passe oublié?
                                </Link>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full py-2 px-4 bg-[#8BBDBD] text-white font-medium rounded-md hover:bg-[#7AACAC] transition-colors"
                        >
                            Se connecter
                        </button>
                    </form>

                    <p className="mt-6 text-center text-gray-600">
                       {"Vous n'avez pas de compte? "}
                        <Link href="/register" className="text-[#8BBDBD] hover:underline font-medium">
                            Inscrivez-vous
                        </Link>
                    </p>
                </div>
            </div>
        </main>
    )
}
