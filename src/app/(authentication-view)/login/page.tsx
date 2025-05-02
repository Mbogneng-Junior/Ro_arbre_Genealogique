"use client";
import Link from "next/link"
import Image from "next/image"
import React, {JSX, useState} from "react";
import {LoginFormType} from "@/lib/type";
import {useAuthentication} from "@/utils/Provider";
import {useRouter} from "next/navigation";
import Loader from "@/components/Loader";

export default function LoginPage(): JSX.Element {

    const [loginForm, setLoginForm] = useState<LoginFormType>({
        email:"",
        password:""
    });

    const [errorMessage, setErrorMessage] = useState<string>("");

    const router = useRouter();

    const {login, isLoading} = useAuthentication();

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const {name, value} = e.target;
        setLoginForm({
            ...loginForm,
            [name]: value
        })
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
        e.preventDefault();
        console.log(loginForm);
        const response = await login(loginForm);
        if(response==200)
        {
            router.push("/dashboard");
        }
        else
        {
            setErrorMessage("Une erreur est survenue lors de la connexion, reessayez plutard");
        }
    }



    return (
        <>
            <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
                <div className="w-full max-w-md bg-base-color rounded-xl shadow-lg overflow-hidden">
                    <div className="p-8">
                        <div className="text-center mb-8">
                            <Image src="/logo.jpg" alt="Logo" width={120} height={120} className="mx-auto" />
                            <h1 className="text-2xl font-bold mt-4 text-gray-800">Connexion</h1>
                        </div>

                        <form className="space-y-4" onSubmit={handleSubmit}>
                            {errorMessage && <p className="text-red-500 font-semibold m-2">{errorMessage}</p>}
                            <div className="flex flex-col space-y-1">
                                <label htmlFor="email" className="text-sm font-medium text-gray-700">
                                    Email
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    onChange={handleChange}
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
                                    onChange={handleChange}
                                    required
                                    className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8BBDBD]"
                                />
                            </div>

                            {/*  <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                name="remember-me"
                                type="checkbox"
                                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                            />
                            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                                Se souvenir de moi
                            </label>
                        </div>
                        <div className="text-sm">
                            <Link href="/forgot-password" className="text-primary hover:underline">
                                Mot de passe oublié?
                            </Link>
                        </div>
                    </div>*/}

                            <button
                                type="submit"
                                className="cursor-pointer w-full py-2 px-4 bg-primary text-white font-bold rounded-md hover:bg-[#7AACAC] transition-colors"
                            >
                                Se connecter
                            </button>
                        </form>

                        <p className="mt-6 text-center text-gray-600">
                            {"Vous n'avez pas de compte? "}
                            <Link href="/register" className="text-primary hover:underline font-medium">
                                Inscrivez-vous
                            </Link>
                        </p>
                    </div>
                </div>
                {isLoading && <Loader/>}
            </main>

    </>

    )
}
