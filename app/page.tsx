import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calculator, TrendingUp, GitBranch, BarChart3, BookOpen, Zap } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calculator className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">SimplexSolver</h1>
            </div>
            <nav className="hidden md:flex space-x-6">
              <Link href="#features" className="text-gray-600 hover:text-blue-600 transition-colors">
                Fonctionnalités
              </Link>
              <Link href="#methods" className="text-gray-600 hover:text-blue-600 transition-colors">
                Méthodes
              </Link>
              <Link href="/comparison" className="text-gray-600 hover:text-blue-600 transition-colors">
                Comparaison
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <Badge variant="secondary" className="mb-4">
            Recherche Opérationnelle
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Maîtrisez la{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Programmation Linéaire
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Une application complète pour comprendre et résoudre les problèmes de programmation linéaire avec les
            méthodes du simplexe, duale et du grand M. Visualisez, comparez et apprenez !
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              <Zap className="mr-2 h-5 w-5" />
              Commencer maintenant
            </Button>
            <Button size="lg" variant="outline">
              <BookOpen className="mr-2 h-5 w-5" />
              Documentation
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Fonctionnalités Avancées</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Découvrez tous les outils nécessaires pour maîtriser la programmation linéaire
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <BarChart3 className="h-12 w-12 text-blue-600 mb-4" />
                <CardTitle>Visualisation Graphique</CardTitle>
                <CardDescription>Représentation graphique des contraintes et de la région réalisable</CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <TrendingUp className="h-12 w-12 text-green-600 mb-4" />
                <CardTitle>Solutions Détaillées</CardTitle>
                <CardDescription>Étapes complètes de résolution avec explications pédagogiques</CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <GitBranch className="h-12 w-12 text-purple-600 mb-4" />
                <CardTitle>Comparaison de Méthodes</CardTitle>
                <CardDescription>Analyse comparative des différentes approches de résolution</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Methods Section */}
      <section id="methods" className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Méthodes de Résolution</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Choisissez la méthode qui correspond à votre problème</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all hover:scale-105">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant="default" className="bg-blue-100 text-blue-800">
                    Méthode Primale
                  </Badge>
                  <Calculator className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-xl">Simplexe Tabulaire</CardTitle>
                <CardDescription>La méthode classique du simplexe avec tableau de base</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600 mb-6">
                  <li>• Résolution étape par étape</li>
                  <li>• Tableau du simplexe interactif</li>
                  <li>• Identification des variables de base</li>
                </ul>
                <Link href="/simplex">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">Résoudre avec Simplexe</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all hover:scale-105">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    Méthode Duale
                  </Badge>
                  <GitBranch className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle className="text-xl">Simplexe Dual</CardTitle>
                <CardDescription>Résolution par la méthode duale du simplexe</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600 mb-6">
                  <li>• Transformation du problème dual</li>
                  <li>• Théorème de dualité forte</li>
                  <li>• Interprétation économique</li>
                </ul>
                <Link href="/dual">
                  <Button className="w-full bg-green-600 hover:bg-green-700">Résoudre avec Dual</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all hover:scale-105">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant="default" className="bg-purple-100 text-purple-800">
                    Méthode Artificielle
                  </Badge>
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle className="text-xl">Grand M</CardTitle>
                <CardDescription>Méthode du grand M pour les contraintes d'égalité</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600 mb-6">
                  <li>• Variables artificielles</li>
                  <li>• Pénalisation par grand M</li>
                  <li>• Gestion des contraintes mixtes</li>
                </ul>
                <Link href="/grand-m">
                  <Button className="w-full bg-purple-600 hover:bg-purple-700">Résoudre avec Grand M</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Prêt à explorer la programmation linéaire ?</h2>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            Commencez dès maintenant avec notre outil interactif et découvrez la puissance des méthodes d'optimisation
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/comparison">
              <Button size="lg" variant="secondary">
                Comparer les méthodes
              </Button>
            </Link>
            <Link href="/simplex">
              <Button
                size="lg"
                variant="outline"
                className="text-white border-white hover:bg-white hover:text-blue-600"
              >
                Commencer un problème
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Calculator className="h-6 w-6" />
                <span className="font-bold">SimplexSolver</span>
              </div>
              <p className="text-gray-400 text-sm">
                Votre compagnon pour maîtriser la programmation linéaire et la recherche opérationnelle.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Méthodes</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="/simplex" className="hover:text-white">
                    Simplexe Tabulaire
                  </Link>
                </li>
                <li>
                  <Link href="/dual" className="hover:text-white">
                    Méthode Duale
                  </Link>
                </li>
                <li>
                  <Link href="/grand-m" className="hover:text-white">
                    Grand M
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Outils</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="/comparison" className="hover:text-white">
                    Comparaison
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Visualisation
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Rapports
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Ressources</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="#" className="hover:text-white">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Exemples
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Tutoriels
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; 2024 SimplexSolver. Projet éducatif de recherche opérationnelle.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
