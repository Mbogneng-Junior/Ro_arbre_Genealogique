import Link from "next/link"
import { ArrowRight, Users, Search, BarChart3, Leaf } from "lucide-react"
import Image from "next/image";
import React from "react";

export default function LandingPage() {
  return (
      <div className="flex min-h-screen flex-col bg-white">
        <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-primary/40 backdrop-blur">
          <div className="container flex h-16 items-center justify-between px-4 md:px-6">
            <div className="flex items-center gap-2 font-bold text-gray-800">
              <Image src="/logo.jpg" alt="Logo" width={50} height={60} className="rounded-full" />
              <span>Family Tree App</span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                  href="/login"
                  className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-teal-600"
              >
                Connexion
              </Link>
              <Link
                  href="/register"
                  className="inline-flex items-center justify-center rounded-md bg-teal-500 px-4 py-2 text-sm font-medium text-white hover:bg-teal-600"
              >
                S&apos;inscrire
              </Link>
            </div>
          </div>
        </header>
        <main className="flex-1">
          <section className="relative w-full overflow-hidden py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-b from-white to-teal-50">
            {/* Éléments décoratifs animés */}
            <div className="absolute inset-0 z-0 overflow-hidden">
              <div className="tree-branch absolute -top-10 -left-10 h-64 w-64 rounded-full border-2 border-teal-200 opacity-20"></div>
              <div className="tree-branch absolute top-1/4 -right-20 h-80 w-80 rounded-full border-2 border-teal-200 opacity-20"></div>
              <div className="tree-leaf absolute bottom-1/4 -left-10 h-40 w-40 rounded-full border-2 border-teal-300 opacity-20"></div>
              <div className="tree-leaf absolute -bottom-20 right-1/4 h-60 w-60 rounded-full border-2 border-teal-300 opacity-20"></div>

              <div className="absolute left-1/4 top-10">
                <svg width="40" height="40" viewBox="0 0 40 40" className="text-teal-300 opacity-20 floating-icon">
                  <path d="M20 5 L30 30 L10 30 Z" fill="currentColor" />
                </svg>
              </div>
              <div className="absolute right-1/3 top-1/3">
                <svg width="30" height="30" viewBox="0 0 30 30" className="text-teal-400 opacity-20 floating-icon-slow">
                  <circle cx="15" cy="15" r="10" fill="currentColor" />
                </svg>
              </div>
              <div className="absolute left-1/3 bottom-1/4">
                <svg
                    width="25"
                    height="25"
                    viewBox="0 0 25 25"
                    className="text-teal-500 opacity-20 floating-icon-reverse"
                >
                  <rect x="5" y="5" width="15" height="15" fill="currentColor" />
                </svg>
              </div>

              {/* Illustration d'arbre stylisé */}
              <div className="absolute left-0 right-0 bottom-0 mx-auto w-full max-w-6xl opacity-10">
                <svg viewBox="0 0 800 400" className="w-full">
                  <path
                      d="M400,380 L400,300 Q400,280 380,260 T350,220 T330,180 T320,140 T310,100 T300,60 T290,30 T280,10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                      className="text-teal-700"
                  />
                  <path
                      d="M400,380 L400,300 Q400,280 420,260 T450,220 T470,180 T480,140 T490,100 T500,60 T510,30 T520,10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                      className="text-teal-700"
                  />
                  <path
                      d="M400,300 L350,300"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="none"
                      className="text-teal-700"
                  />
                  <path
                      d="M400,300 L450,300"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="none"
                      className="text-teal-700"
                  />
                  <path
                      d="M350,300 L320,260"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                      className="text-teal-700"
                  />
                  <path
                      d="M350,300 L380,260"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                      className="text-teal-700"
                  />
                  <path
                      d="M450,300 L420,260"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                      className="text-teal-700"
                  />
                  <path
                      d="M450,300 L480,260"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                      className="text-teal-700"
                  />
                  <circle cx="400" cy="380" r="5" fill="currentColor" className="text-teal-700" />
                  <circle cx="350" cy="300" r="4" fill="currentColor" className="text-teal-700" />
                  <circle cx="450" cy="300" r="4" fill="currentColor" className="text-teal-700" />
                  <circle cx="320" cy="260" r="3" fill="currentColor" className="text-teal-700" />
                  <circle cx="380" cy="260" r="3" fill="currentColor" className="text-teal-700" />
                  <circle cx="420" cy="260" r="3" fill="currentColor" className="text-teal-700" />
                  <circle cx="480" cy="260" r="3" fill="currentColor" className="text-teal-700" />
                </svg>
              </div>
            </div>

            {/* Contenu principal */}
            <div className="container relative z-10 px-4 md:px-6">
              <div className="flex flex-col items-center gap-8 text-center">
                <div className="relative">
                  <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-teal-400 to-teal-600 opacity-20 blur"></div>
                  <h1 className="relative text-3xl font-bold tracking-tighter text-gray-800 sm:text-4xl md:text-5xl lg:text-6xl">
                    Explorez votre histoire familiale
                  </h1>
                </div>
                <p className="max-w-[700px] text-gray-600 md:text-xl">
                  Créez, enrichissez et visualisez votre arbre généalogique avec une interface simple et interactive.
                </p>
                <div className="flex flex-col gap-3 min-[400px]:flex-row">
                  <Link
                      href="/login"
                      className="inline-flex items-center justify-center gap-1.5 rounded-md bg-teal-500 px-8 py-3 text-base font-medium text-white shadow-md hover:bg-teal-600 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1"
                  >
                    Commencer <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </section>
          <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-50">
            <div className="container px-4 md:px-6">
              <h2 className="text-2xl font-semibold text-center mb-12 text-gray-800">Nos fonctionnalités</h2>
              <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
                <div className="flex flex-col items-center gap-4 text-center p-6 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-teal-100 text-teal-600">
                    <Users className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">Gestion des membres</h3>
                  <p className="text-gray-600">
                    Ajoutez facilement des membres à votre arbre et définissez leurs relations familiales.
                  </p>
                </div>
                <div className="flex flex-col items-center gap-4 text-center p-6 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-teal-100 text-teal-600">
                    <Search className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">Recherche de liens</h3>
                  <p className="text-gray-600">Découvrez les liens de parenté entre deux membres de votre famille.</p>
                </div>
                <div className="flex flex-col items-center gap-4 text-center p-6 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-teal-100 text-teal-600">
                    <BarChart3 className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">Analyse familiale</h3>
                  <p className="text-gray-600">Visualisez les branches familiales et la structure de votre arbre.</p>
                </div>
              </div>
            </div>
          </section>
          <section className="w-full py-16 md:py-24 bg-white">
            <div className="container px-4 md:px-6 text-center">
              <div className="mx-auto max-w-3xl rounded-2xl bg-gradient-to-r from-teal-50 to-teal-100 p-8 md:p-12">
                <h2 className="text-2xl font-semibold mb-6 text-gray-800">Prêt à découvrir votre histoire familiale ?</h2>
                <p className="max-w-[600px] mx-auto mb-8 text-gray-600">
                  Commencez dès aujourd&apos;hui et créez un héritage numérique pour les générations futures.
                </p>
                <Link
                    href="/register"
                    className="inline-flex items-center justify-center rounded-md bg-teal-500 px-8 py-3 text-base font-medium text-white hover:bg-teal-600"
                >
                  Créer mon arbre généalogique
                </Link>
              </div>
            </div>
          </section>
        </main>
        <footer className="w-full border-t border-gray-100 py-8 bg-gray-50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center gap-6 md:flex-row md:justify-between">
              <div className="flex items-center gap-2">
                <Leaf className="h-5 w-5 text-teal-500" />
                <span className="font-semibold text-gray-800">ArbreGénéalogique</span>
              </div>
              <p className="text-center text-sm text-gray-600">
                © {new Date().getFullYear()} ArbreGénéalogique. Tous droits réservés.
              </p>
              <div className="flex gap-6">
                <Link href="/terms" className="text-sm text-gray-600 hover:text-teal-500 transition-colors">
                  Conditions d&apos;utilisation
                </Link>
                <Link href="/privacy" className="text-sm text-gray-600 hover:text-teal-500 transition-colors">
                  Politique de confidentialité
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
  )
}
