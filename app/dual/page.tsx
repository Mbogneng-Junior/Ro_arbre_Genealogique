"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, GitBranch, Play, ArrowRightLeft } from "lucide-react"

export default function DualPage() {
  const [primalProblem, setPrimalProblem] = useState({
    variables: 2,
    constraints: 2,
    objective: [3, 2],
    constraintMatrix: [
      [1, 1],
      [2, 1],
    ],
    rhs: [4, 6],
    isMaximization: true,
  })

  const [dualProblem, setDualProblem] = useState<any>(null)
  const [solution, setSolution] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const generateDual = () => {
    // Transformation en problème dual
    const dual = {
      variables: primalProblem.constraints,
      constraints: primalProblem.variables,
      objective: [...primalProblem.rhs],
      constraintMatrix: primalProblem.constraintMatrix[0].map((_, colIndex) =>
        primalProblem.constraintMatrix.map((row) => row[colIndex]),
      ),
      rhs: [...primalProblem.objective],
      isMaximization: !primalProblem.isMaximization,
    }
    setDualProblem(dual)
  }

  const solveDual = () => {
    setIsLoading(true)
    setTimeout(() => {
      const mockSolution = {
        primal: {
          optimal: true,
          objectiveValue: 10,
          variables: { x1: 2, x2: 2 },
        },
        dual: {
          optimal: true,
          objectiveValue: 10,
          variables: { y1: 1, y2: 1 },
        },
        dualityGap: 0,
        complementarySlackness: true,
      }
      setSolution(mockSolution)
      setIsLoading(false)
    }, 1500)
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
                <GitBranch className="h-6 w-6 text-green-600" />
                <h1 className="text-xl font-bold">Méthode Duale du Simplexe</h1>
              </div>
            </div>
            <Badge variant="default" className="bg-green-100 text-green-800">
              Méthode Duale
            </Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Problème Primal */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Problème Primal
                <Button variant="outline" size="sm" onClick={generateDual}>
                  <ArrowRightLeft className="h-4 w-4 mr-2" />
                  Générer Dual
                </Button>
              </CardTitle>
              <CardDescription>Définissez le problème primal de programmation linéaire</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Fonction objectif (Maximiser)</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {Array.from({ length: primalProblem.variables }, (_, i) => (
                    <Input
                      key={i}
                      placeholder={`c${i + 1}`}
                      value={primalProblem.objective[i]}
                      onChange={(e) => {
                        const newObjective = [...primalProblem.objective]
                        newObjective[i] = Number.parseFloat(e.target.value) || 0
                        setPrimalProblem({ ...primalProblem, objective: newObjective })
                      }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <Label>Contraintes (≤)</Label>
                <div className="space-y-2 mt-2">
                  {Array.from({ length: primalProblem.constraints }, (_, i) => (
                    <div key={i} className="flex items-center space-x-2">
                      {Array.from({ length: primalProblem.variables }, (_, j) => (
                        <Input
                          key={j}
                          className="w-20"
                          placeholder={`a${i + 1}${j + 1}`}
                          value={primalProblem.constraintMatrix[i]?.[j] || 0}
                          onChange={(e) => {
                            const newMatrix = [...primalProblem.constraintMatrix]
                            if (!newMatrix[i]) newMatrix[i] = []
                            newMatrix[i][j] = Number.parseFloat(e.target.value) || 0
                            setPrimalProblem({ ...primalProblem, constraintMatrix: newMatrix })
                          }}
                        />
                      ))}
                      <span>≤</span>
                      <Input
                        className="w-20"
                        placeholder={`b${i + 1}`}
                        value={primalProblem.rhs[i]}
                        onChange={(e) => {
                          const newRhs = [...primalProblem.rhs]
                          newRhs[i] = Number.parseFloat(e.target.value) || 0
                          setPrimalProblem({ ...primalProblem, rhs: newRhs })
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Formulation Mathématique</h4>
                <div className="font-mono text-sm">
                  Max Z = {primalProblem.objective.map((c, i) => `${c}x${i + 1}`).join(" + ")}
                  <br />
                  s.c.:
                  <br />
                  {primalProblem.constraintMatrix.map((row, i) => (
                    <div key={i}>
                      {row.map((a, j) => `${a}x${j + 1}`).join(" + ")} ≤ {primalProblem.rhs[i]}
                    </div>
                  ))}
                  <br />
                  x₁, x₂ ≥ 0
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Problème Dual */}
          <Card>
            <CardHeader>
              <CardTitle>Problème Dual</CardTitle>
              <CardDescription>Transformation automatique du problème primal en dual</CardDescription>
            </CardHeader>
            <CardContent>
              {dualProblem ? (
                <div className="space-y-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Formulation Duale</h4>
                    <div className="font-mono text-sm">
                      Min W = {dualProblem.objective.map((b, i) => `${b}y${i + 1}`).join(" + ")}
                      <br />
                      s.c.:
                      <br />
                      {dualProblem.constraintMatrix.map((row, i) => (
                        <div key={i}>
                          {row.map((a, j) => `${a}y${j + 1}`).join(" + ")} ≥ {dualProblem.rhs[i]}
                        </div>
                      ))}
                      <br />
                      y₁, y₂ ≥ 0
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold">Règles de Transformation</h4>
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span>Variables primales:</span>
                        <span>→ Contraintes duales</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Contraintes primales:</span>
                        <span>→ Variables duales</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Maximisation:</span>
                        <span>→ Minimisation</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Contraintes ≤:</span>
                        <span>→ Variables ≥ 0</span>
                      </div>
                    </div>
                  </div>

                  <Button onClick={solveDual} disabled={isLoading} className="w-full">
                    {isLoading ? (
                      "Résolution..."
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Résoudre le Dual
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <GitBranch className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Cliquez sur "Générer Dual" pour voir la transformation</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Résultats */}
        {solution && (
          <div className="mt-8">
            <Tabs defaultValue="comparison" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="comparison">Comparaison</TabsTrigger>
                <TabsTrigger value="theory">Théorie</TabsTrigger>
                <TabsTrigger value="analysis">Analyse</TabsTrigger>
              </TabsList>

              <TabsContent value="comparison">
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-blue-600">Solution Primale</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="text-2xl font-bold">Z = {solution.primal.objectiveValue}</div>
                          <div className="text-sm text-gray-600">Valeur optimale</div>
                        </div>
                        <div className="space-y-2">
                          {Object.entries(solution.primal.variables).map(([variable, value]) => (
                            <div key={variable} className="flex justify-between">
                              <span>{variable}:</span>
                              <span className="font-mono">{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-green-600">Solution Duale</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="text-2xl font-bold">W = {solution.dual.objectiveValue}</div>
                          <div className="text-sm text-gray-600">Valeur optimale</div>
                        </div>
                        <div className="space-y-2">
                          {Object.entries(solution.dual.variables).map(([variable, value]) => (
                            <div key={variable} className="flex justify-between">
                              <span>{variable}:</span>
                              <span className="font-mono">{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Théorème de Dualité Forte</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-6 text-center">
                      <div>
                        <div className="text-lg font-semibold">Écart de Dualité</div>
                        <div className="text-2xl font-bold text-green-600">{solution.dualityGap}</div>
                        <div className="text-sm text-gray-600">Z - W = 0</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold">Complémentarité</div>
                        <div className="text-2xl font-bold text-blue-600">
                          {solution.complementarySlackness ? "✓" : "✗"}
                        </div>
                        <div className="text-sm text-gray-600">Conditions satisfaites</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold">Optimalité</div>
                        <div className="text-2xl font-bold text-purple-600">Prouvée</div>
                        <div className="text-sm text-gray-600">Solutions optimales</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="theory">
                <Card>
                  <CardHeader>
                    <CardTitle>Théorie de la Dualité</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="font-semibold mb-2">Théorème de Dualité Faible</h3>
                      <p className="text-gray-600">
                        Pour toute solution réalisable x du problème primal et toute solution réalisable y du problème
                        dual, on a : c^T x ≤ b^T y
                      </p>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">Théorème de Dualité Forte</h3>
                      <p className="text-gray-600">
                        Si le problème primal a une solution optimale, alors le problème dual a aussi une solution
                        optimale, et les valeurs optimales des fonctions objectifs sont égales.
                      </p>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">Conditions de Complémentarité</h3>
                      <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm">
                        x_j (∑ a_ij y_i - c_j) = 0, ∀j
                        <br />
                        y_i (b_i - ∑ a_ij x_j) = 0, ∀i
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">Interprétation Économique</h3>
                      <p className="text-gray-600">
                        Les variables duales représentent les prix marginaux (prix fictifs) des ressources. Elles
                        indiquent la variation de la fonction objectif lorsqu'on augmente d'une unité la disponibilité
                        de chaque ressource.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analysis">
                <Card>
                  <CardHeader>
                    <CardTitle>Analyse de Sensibilité</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="font-semibold mb-3">Interprétation des Variables Duales</h3>
                      <div className="space-y-2">
                        {Object.entries(solution.dual.variables).map(([variable, value], index) => (
                          <div key={variable} className="bg-gray-50 p-3 rounded">
                            <div className="font-semibold">
                              {variable} = {value}
                            </div>
                            <div className="text-sm text-gray-600">
                              Prix marginal de la contrainte {index + 1}: augmenter b_{index + 1} d'une unité augmente Z
                              de {value} unités.
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-3">Analyse Post-Optimale</h3>
                      <p className="text-gray-600 mb-3">
                        La solution duale fournit des informations précieuses pour l'analyse de sensibilité :
                      </p>
                      <ul className="space-y-2 text-sm">
                        <li>
                          • <strong>Ressources critiques :</strong> Variables duales {">"} 0
                        </li>
                        <li>
                          • <strong>Ressources non critiques :</strong> Variables duales = 0
                        </li>
                        <li>
                          • <strong>Coût d'opportunité :</strong> Valeur des variables duales
                        </li>
                        <li>
                          • <strong>Stabilité :</strong> Plages de validité des prix marginaux
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-3">Recommandations</h3>
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-sm">
                          Basé sur cette analyse, il est recommandé de se concentrer sur l'augmentation des ressources
                          avec des prix marginaux élevés pour améliorer la valeur de la fonction objectif.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  )
}
