"use client"

import { Label } from "@/components/ui/label"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, BarChart3, Clock, Zap, CheckCircle, XCircle, AlertCircle } from "lucide-react"

export default function ComparisonPage() {
  const [selectedProblem, setSelectedProblem] = useState("example1")

  const problems = {
    example1: {
      name: "Problème Standard",
      description: "Maximisation avec contraintes ≤",
      formulation: "Max Z = 3x₁ + 2x₂\ns.c.: x₁ + x₂ ≤ 4\n      2x₁ + x₂ ≤ 6\n      x₁, x₂ ≥ 0",
      results: {
        simplex: {
          iterations: 2,
          time: "0.15s",
          solution: { x1: 2, x2: 2, z: 10 },
          status: "optimal",
        },
        dual: {
          iterations: 2,
          time: "0.18s",
          solution: { y1: 1, y2: 1, w: 10 },
          status: "optimal",
        },
        grandM: {
          iterations: "N/A",
          time: "N/A",
          solution: "Non applicable",
          status: "not_applicable",
        },
      },
    },
    example2: {
      name: "Problème Mixte",
      description: "Contraintes ≤, ≥ et =",
      formulation: "Max Z = 2x₁ + 3x₂\ns.c.: x₁ + x₂ ≤ 5\n      x₁ - x₂ ≥ 1\n      2x₁ + x₂ = 6\n      x₁, x₂ ≥ 0",
      results: {
        simplex: {
          iterations: "N/A",
          time: "N/A",
          solution: "Non applicable",
          status: "not_applicable",
        },
        dual: {
          iterations: 3,
          time: "0.25s",
          solution: { y1: 0.5, y2: 1.5, y3: 1, w: 9 },
          status: "optimal",
        },
        grandM: {
          iterations: 4,
          time: "0.32s",
          solution: { x1: 1.5, x2: 3, z: 12 },
          status: "optimal",
        },
      },
    },
  }

  const methodComparison = [
    {
      aspect: "Applicabilité",
      simplex: "Contraintes ≤ uniquement",
      dual: "Tous types après transformation",
      grandM: "Contraintes ≥ et = directement",
    },
    {
      aspect: "Complexité",
      simplex: "Simple et direct",
      dual: "Transformation requise",
      grandM: "Variables artificielles",
    },
    {
      aspect: "Efficacité",
      simplex: "Très efficace",
      dual: "Efficace",
      grandM: "Moins efficace",
    },
    {
      aspect: "Stabilité numérique",
      simplex: "Excellente",
      dual: "Bonne",
      grandM: "Dépend de M",
    },
    {
      aspect: "Interprétation",
      simplex: "Directe",
      dual: "Prix marginaux",
      grandM: "Directe",
    },
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "optimal":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "not_applicable":
        return <XCircle className="h-4 w-4 text-gray-400" />
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "optimal":
        return <Badge className="bg-green-100 text-green-800">Optimal</Badge>
      case "not_applicable":
        return <Badge variant="secondary">Non applicable</Badge>
      default:
        return <Badge variant="outline">En cours</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-6 w-6 text-blue-600" />
                <h1 className="text-xl font-bold">Comparaison des Méthodes</h1>
              </div>
            </div>
            <Badge variant="default" className="bg-blue-100 text-blue-800">
              Analyse Comparative
            </Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="examples">Exemples</TabsTrigger>
            <TabsTrigger value="recommendations">Recommandations</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-blue-600 rounded"></div>
                    <span>Simplexe Tabulaire</span>
                  </CardTitle>
                  <CardDescription>Méthode primale classique</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Avantages</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Algorithme simple et intuitif</li>
                      <li>• Très efficace pour problèmes standards</li>
                      <li>• Excellente stabilité numérique</li>
                      <li>• Interprétation directe des résultats</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Limitations</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Contraintes ≤ uniquement</li>
                      <li>• Nécessite forme standard</li>
                      <li>• Pas de gestion directe des contraintes =</li>
                    </ul>
                  </div>
                  <div className="pt-2">
                    <Link href="/simplex">
                      <Button className="w-full bg-blue-600 hover:bg-blue-700">Utiliser cette méthode</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-green-600 rounded"></div>
                    <span>Méthode Duale</span>
                  </CardTitle>
                  <CardDescription>Approche par dualité</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Avantages</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Applicable à tous types de contraintes</li>
                      <li>• Fournit les prix marginaux</li>
                      <li>• Analyse de sensibilité intégrée</li>
                      <li>• Théorie mathématique riche</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Limitations</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Transformation préalable nécessaire</li>
                      <li>• Plus complexe conceptuellement</li>
                      <li>• Interprétation moins directe</li>
                    </ul>
                  </div>
                  <div className="pt-2">
                    <Link href="/dual">
                      <Button className="w-full bg-green-600 hover:bg-green-700">Utiliser cette méthode</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-purple-600 rounded"></div>
                    <span>Grand M</span>
                  </CardTitle>
                  <CardDescription>Variables artificielles</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Avantages</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Gestion directe des contraintes =</li>
                      <li>• Applicable aux contraintes ≥</li>
                      <li>• Détection d'infaisabilité</li>
                      <li>• Méthode unifiée</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Limitations</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Problèmes numériques potentiels</li>
                      <li>• Choix délicat de la valeur M</li>
                      <li>• Convergence plus lente</li>
                      <li>• Variables artificielles supplémentaires</li>
                    </ul>
                  </div>
                  <div className="pt-2">
                    <Link href="/grand-m">
                      <Button className="w-full bg-purple-600 hover:bg-purple-700">Utiliser cette méthode</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Comparaison Détaillée</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Aspect</TableHead>
                      <TableHead className="text-blue-600">Simplexe Tabulaire</TableHead>
                      <TableHead className="text-green-600">Méthode Duale</TableHead>
                      <TableHead className="text-purple-600">Grand M</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {methodComparison.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-semibold">{row.aspect}</TableCell>
                        <TableCell>{row.simplex}</TableCell>
                        <TableCell>{row.dual}</TableCell>
                        <TableCell>{row.grandM}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Analyse de Performance</CardTitle>
                  <CardDescription>Comparaison sur différents types de problèmes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <Label className="text-sm font-medium">Sélectionner un problème :</Label>
                    <select
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                      value={selectedProblem}
                      onChange={(e) => setSelectedProblem(e.target.value)}
                    >
                      {Object.entries(problems).map(([key, problem]) => (
                        <option key={key} value={key}>
                          {problem.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold mb-3">Formulation du Problème</h3>
                      <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm whitespace-pre-line">
                        {problems[selectedProblem as keyof typeof problems].formulation}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-3">Description</h3>
                      <p className="text-gray-600">{problems[selectedProblem as keyof typeof problems].description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-3 gap-6">
                {Object.entries(problems[selectedProblem as keyof typeof problems].results).map(([method, result]) => (
                  <Card key={method}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="capitalize">
                          {method === "grandM" ? "Grand M" : method === "simplex" ? "Simplexe" : "Dual"}
                        </span>
                        {getStatusIcon(result.status)}
                      </CardTitle>
                      <CardDescription>{getStatusBadge(result.status)}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-gray-500" />
                          Temps
                        </span>
                        <span className="font-mono">{result.time}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center">
                          <Zap className="h-4 w-4 mr-2 text-gray-500" />
                          Itérations
                        </span>
                        <span className="font-mono">{result.iterations}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Solution :</span>
                        <div className="mt-1 text-sm font-mono bg-gray-50 p-2 rounded">
                          {typeof result.solution === "object"
                            ? Object.entries(result.solution)
                                .map(([key, value]) => `${key} = ${value}`)
                                .join("\n")
                            : result.solution}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="examples">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Cas d'Usage Typiques</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="p-4 border border-blue-200 rounded-lg">
                      <h3 className="font-semibold text-blue-800 mb-2">Problèmes de Production</h3>
                      <p className="text-sm text-gray-600 mb-3">
                        Maximiser le profit avec contraintes de ressources limitées
                      </p>
                      <Badge className="bg-blue-100 text-blue-800">Simplexe Tabulaire</Badge>
                      <div className="mt-3 text-xs">
                        <strong>Exemple :</strong> Usine avec contraintes de matières premières et temps de production
                      </div>
                    </div>

                    <div className="p-4 border border-green-200 rounded-lg">
                      <h3 className="font-semibold text-green-800 mb-2">Analyse de Sensibilité</h3>
                      <p className="text-sm text-gray-600 mb-3">Étudier l'impact des variations de paramètres</p>
                      <Badge className="bg-green-100 text-green-800">Méthode Duale</Badge>
                      <div className="mt-3 text-xs">
                        <strong>Exemple :</strong> Déterminer les prix marginaux des ressources
                      </div>
                    </div>

                    <div className="p-4 border border-purple-200 rounded-lg">
                      <h3 className="font-semibold text-purple-800 mb-2">Problèmes de Transport</h3>
                      <p className="text-sm text-gray-600 mb-3">Contraintes d'égalité pour l'offre et la demande</p>
                      <Badge className="bg-purple-100 text-purple-800">Grand M</Badge>
                      <div className="mt-3 text-xs">
                        <strong>Exemple :</strong> Distribution avec contraintes d'équilibre
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Exemples Détaillés</h3>
                    <div className="space-y-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">Exemple 1 : Problème de Mélange</h4>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm mb-2">
                              Une entreprise produit deux types d'alliages. Maximiser le profit.
                            </p>
                            <div className="font-mono text-xs bg-white p-2 rounded">
                              Max Z = 40x₁ + 30x₂
                              <br />
                              s.c.: 2x₁ + x₂ ≤ 100 (matière A)
                              <br />
                              x₁ + 2x₂ ≤ 80 (matière B)
                              <br />
                              x₁, x₂ ≥ 0
                            </div>
                          </div>
                          <div>
                            <p className="text-sm mb-2">
                              <strong>Méthode recommandée :</strong> Simplexe Tabulaire
                            </p>
                            <p className="text-xs text-gray-600">
                              Problème standard avec contraintes ≤ uniquement. Le simplexe tabulaire est optimal.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">Exemple 2 : Problème de Régime</h4>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm mb-2">
                              Minimiser le coût d'un régime alimentaire avec contraintes nutritionnelles.
                            </p>
                            <div className="font-mono text-xs bg-white p-2 rounded">
                              Min Z = 2x₁ + 3x₂
                              <br />
                              s.c.: x₁ + 2x₂ ≥ 10 (protéines)
                              <br />
                              2x₁ + x₂ ≥ 8 (vitamines)
                              <br />
                              x₁ + x₂ = 6 (calories)
                              <br />
                              x₁, x₂ ≥ 0
                            </div>
                          </div>
                          <div>
                            <p className="text-sm mb-2">
                              <strong>Méthode recommandée :</strong> Grand M
                            </p>
                            <p className="text-xs text-gray-600">
                              Présence de contraintes ≥ et =. Le Grand M gère directement ces contraintes.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">Exemple 3 : Analyse de Portefeuille</h4>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm mb-2">
                              Maximiser le rendement d'un portefeuille avec contraintes de risque.
                            </p>
                            <div className="font-mono text-xs bg-white p-2 rounded">
                              Max Z = 0.12x₁ + 0.08x₂
                              <br />
                              s.c.: x₁ + x₂ ≤ 1000000
                              <br />
                              0.3x₁ + 0.1x₂ ≤ 200000
                              <br />
                              x₁, x₂ ≥ 0
                            </div>
                          </div>
                          <div>
                            <p className="text-sm mb-2">
                              <strong>Méthode recommandée :</strong> Méthode Duale
                            </p>
                            <p className="text-xs text-gray-600">
                              Intérêt pour l'analyse de sensibilité et l'interprétation des prix marginaux.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="recommendations">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Guide de Sélection de Méthode</CardTitle>
                  <CardDescription>Choisissez la méthode optimale selon votre problème</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="p-4 border-l-4 border-blue-500 bg-blue-50">
                      <h3 className="font-semibold text-blue-800 mb-2">Utilisez le Simplexe Tabulaire quand :</h3>
                      <ul className="text-sm space-y-1">
                        <li>✓ Toutes les contraintes sont de type ≤</li>
                        <li>✓ Vous voulez une solution rapide et directe</li>
                        <li>✓ Le problème est en forme standard</li>
                        <li>✓ Vous débutez en programmation linéaire</li>
                      </ul>
                    </div>

                    <div className="p-4 border-l-4 border-green-500 bg-green-50">
                      <h3 className="font-semibold text-green-800 mb-2">Utilisez la Méthode Duale quand :</h3>
                      <ul className="text-sm space-y-1">
                        <li>✓ Vous avez besoin d'une analyse de sensibilité</li>
                        <li>✓ Les prix marginaux sont importants</li>
                        <li>✓ Le problème dual est plus simple que le primal</li>
                        <li>✓ Vous voulez comprendre la théorie économique</li>
                      </ul>
                    </div>

                    <div className="p-4 border-l-4 border-purple-500 bg-purple-50">
                      <h3 className="font-semibold text-purple-800 mb-2">Utilisez le Grand M quand :</h3>
                      <ul className="text-sm space-y-1">
                        <li>✓ Vous avez des contraintes d'égalité</li>
                        <li>✓ Vous avez des contraintes de type ≥</li>
                        <li>✓ Vous voulez détecter l'infaisabilité</li>
                        <li>✓ Les autres méthodes ne s'appliquent pas</li>
                      </ul>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h3 className="font-semibold mb-4">Arbre de Décision</h3>
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <div className="text-center">
                        <div className="inline-block p-3 bg-white rounded-lg border-2 border-gray-300 mb-4">
                          <strong>Votre problème a-t-il des contraintes = ou ≥ ?</strong>
                        </div>

                        <div className="flex justify-center space-x-8 mb-4">
                          <div className="text-center">
                            <div className="w-16 h-8 bg-red-200 rounded mb-2 flex items-center justify-center text-sm font-semibold">
                              OUI
                            </div>
                            <div className="w-1 h-8 bg-gray-300 mx-auto"></div>
                          </div>
                          <div className="text-center">
                            <div className="w-16 h-8 bg-green-200 rounded mb-2 flex items-center justify-center text-sm font-semibold">
                              NON
                            </div>
                            <div className="w-1 h-8 bg-gray-300 mx-auto"></div>
                          </div>
                        </div>

                        <div className="flex justify-center space-x-8">
                          <div className="text-center">
                            <div className="p-3 bg-purple-100 rounded-lg border">
                              <strong className="text-purple-800">Grand M</strong>
                              <br />
                              <span className="text-xs">ou Méthode Duale</span>
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="p-3 bg-blue-100 rounded-lg border">
                              <strong className="text-blue-800">Simplexe Tabulaire</strong>
                              <br />
                              <span className="text-xs">Méthode recommandée</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h3 className="font-semibold mb-3">Conseils Pratiques</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <h4 className="font-semibold text-sm">Pour l'apprentissage :</h4>
                        <ul className="text-sm space-y-1">
                          <li>• Commencez par le simplexe tabulaire</li>
                          <li>• Étudiez ensuite la dualité</li>
                          <li>• Terminez par le Grand M</li>
                          <li>• Pratiquez avec des exemples simples</li>
                        </ul>
                      </div>
                      <div className="space-y-3">
                        <h4 className="font-semibold text-sm">Pour la pratique :</h4>
                        <ul className="text-sm space-y-1">
                          <li>• Analysez d'abord le type de contraintes</li>
                          <li>• Considérez l'objectif de l'analyse</li>
                          <li>• Vérifiez la stabilité numérique</li>
                          <li>• Validez toujours vos résultats</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Ressources Supplémentaires</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-semibold text-blue-800 mb-2">Documentation</h4>
                      <ul className="text-sm space-y-1">
                        <li>• Guide théorique complet</li>
                        <li>• Exemples pas à pas</li>
                        <li>• FAQ et dépannage</li>
                      </ul>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h4 className="font-semibold text-green-800 mb-2">Tutoriels</h4>
                      <ul className="text-sm space-y-1">
                        <li>• Vidéos explicatives</li>
                        <li>• Exercices interactifs</li>
                        <li>• Cas d'étude réels</li>
                      </ul>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <h4 className="font-semibold text-purple-800 mb-2">Outils</h4>
                      <ul className="text-sm space-y-1">
                        <li>• Générateur de problèmes</li>
                        <li>• Vérificateur de solutions</li>
                        <li>• Export de rapports</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
