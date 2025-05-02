import type React from "react"
import type { JSX } from "react"
import Link from "next/link"
import { ArrowRight, Users, Search, BarChart3, Leaf } from "lucide-react"
import { forwardRef } from "react"

function cn(...classes) {
  return classes.filter(Boolean).join(" ")
}

// Palette de couleurs personnalisée basée sur #8BBDBD
const colors = {
  primary: "#8BBDBD",
  primaryDark: "#6A9B9D",
  primaryLight: "#A5CECD",
  background: "#FFFFFF",
  foreground: "#333333",
  muted: "#F4F8F8",
  mutedForeground: "#637381",
  accent: "#E8F1F1",
  border: "#E2EDED"
}

const Button = forwardRef(({ className, variant = "default", size = "default", ...props }, ref) => {
  const baseClasses =
    "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"

  const variantClasses = {
    default: `bg-[${colors.primary}] text-white hover:bg-[${colors.primaryDark}]`,
    destructive: "bg-red-500 text-white hover:bg-red-600",
    outline: `border border-[${colors.border}] bg-white hover:bg-[${colors.accent}] hover:text-[${colors.primaryDark}]`,
    secondary: `bg-[${colors.accent}] text-[${colors.primaryDark}] hover:bg-[${colors.primaryLight}]`,
    ghost: `hover:bg-[${colors.accent}] hover:text-[${colors.primaryDark}]`,
    link: `text-[${colors.primary}] underline-offset-4 hover:underline`,
  }

  const sizeClasses = {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3",
    lg: "h-11 rounded-md px-8 text-base",
    icon: "h-10 w-10",
  }

  const classes = cn(baseClasses, variantClasses[variant], sizeClasses[size], className)

  return <button className={classes} ref={ref} {...props} />
})
Button.displayName = "Button"

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="sticky top-0 z-50 w-full border-b border-[#E2EDED] bg-white/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2 font-bold text-[#333333]">
            <Leaf className="h-5 w-5 text-[#8BBDBD]" />
            <span>ArbreGénéalogique</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Connexion</Button>
            </Link>
            <Link href="/register">
              <Button>S'inscrire</Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center gap-6 text-center">
              <h1 className="text-3xl font-bold tracking-tighter text-[#333333] sm:text-4xl md:text-5xl lg:text-6xl">
                Explorez votre histoire familiale
              </h1>
              <p className="max-w-[700px] text-[#637381] md:text-xl">
                Créez, enrichissez et visualisez votre arbre généalogique avec une interface simple et interactive.
              </p>
              <div className="flex flex-col gap-3 min-[400px]:flex-row">
                <Link href="/register">
                  <Button size="lg" className="gap-1.5 bg-[#8BBDBD] hover:bg-[#6A9B9D] text-white shadow-sm">
                    Commencer <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
               
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-[#F4F8F8]">
          <div className="container px-4 md:px-6">
            <h2 className="text-2xl font-semibold text-center mb-12 text-[#333333]">Nos fonctionnalités</h2>
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col items-center gap-4 text-center p-6 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#8BBDBD]/10 text-[#8BBDBD]">
                  <Users className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-[#333333]">Gestion des membres</h3>
                <p className="text-[#637381]">
                  Ajoutez facilement des membres à votre arbre et définissez leurs relations familiales.
                </p>
              </div>
              <div className="flex flex-col items-center gap-4 text-center p-6 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#8BBDBD]/10 text-[#8BBDBD]">
                  <Search className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-[#333333]">Recherche de liens</h3>
                <p className="text-[#637381]">
                  Découvrez les liens de parenté entre deux membres de votre famille.
                </p>
              </div>
              <div className="flex flex-col items-center gap-4 text-center p-6 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#8BBDBD]/10 text-[#8BBDBD]">
                  <BarChart3 className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-[#333333]">Analyse familiale</h3>
                <p className="text-[#637381]">
                  Visualisez les branches familiales et la structure de votre arbre.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-16 bg-white border-t border-[#E2EDED]">
          <div className="container px-4 md:px-6 text-center">
            <h2 className="text-2xl font-semibold mb-6 text-[#333333]">Prêt à découvrir votre histoire familiale ?</h2>
            <p className="max-w-[600px] mx-auto mb-8 text-[#637381]">
              Commencez dès aujourd'hui et créez un héritage numérique pour les générations futures.
            </p>
            <Link href="/register">
              <Button size="lg" className="bg-[#8BBDBD] hover:bg-[#6A9B9D] text-white">
                Créer mon arbre généalogique
              </Button>
            </Link>
          </div>
        </section>
      </main>
      <footer className="w-full border-t border-[#E2EDED] py-8 bg-[#F4F8F8]">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center gap-6 md:flex-row md:justify-between">
            <div className="flex items-center gap-2">
              <Leaf className="h-5 w-5 text-[#8BBDBD]" />
              <span className="font-semibold text-[#333333]">ArbreGénéalogique</span>
            </div>
            <p className="text-center text-sm text-[#637381]">
              © {new Date().getFullYear()} ArbreGénéalogique. Tous droits réservés.
            </p>
            <div className="flex gap-6">
              <Link href="/terms" className="text-sm text-[#637381] hover:text-[#8BBDBD] transition-colors">
                Conditions d'utilisation
              </Link>
              <Link href="/privacy" className="text-sm text-[#637381] hover:text-[#8BBDBD] transition-colors">
                Politique de confidentialité
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}