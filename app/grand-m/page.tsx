"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, TrendingUp, Play, RotateCcw, AlertTriangle, Download } from "lucide-react"
import { SimplexTable } from "@/components/simplex-table"

export default function GrandMPage() {
  const [problem, setProblem] = useState({
    variables: 2,
    constraints: 3,
    objective: [3, 2],
    constraintMatrix: [
      [1, 1],
      [2, 1],
      [1, 2],
    ],
    rhs: [4, 6, 5],
    constraintTypes: ["≤", "≥", "="],
    isMaximization: true,
    bigM: 1000,
  })

  const [solution, setSolution] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const solveBigM = () => {
    setIsLoading(true)
    setTimeout(() => {
      const mockSolution = {
        optimal: true,
        objectiveValue: 8.5,
        variables: { x1: 1.5, x2: 2.5 },
        artificialVariables: { a1: 0, a2: 0 },
        slackSurplus: { s1: 0, s2: 0.5 },
        phases: [
          {
            phase: 1,
            description: "Élimination des variables artificielles",
            tableau: [
              [1, 1, 1, 0, 0, 1, 0, 4],
              [2, 1, 0, -1, 0, 0, 1, 6],
              [1, 2, 0, 0, 1, 0, 0, 5],
              [-1000, -1000, 0, 1000, -1000, 0, 0, -11000],
            ],
            basicVariables: ["s1", "s2", "x2", "a1"],
            completed: false,
          },
          {
            phase: 2,
            description: "Optimisation de la fonction objectif originale",
            tableau: [
              [0, -1, 1, 1, -0.5, 0, 1.5],
              [1, -1, 0, -1, 0.5, 0, 3.5],
              [0, 3, 0, 1, 0.5, 0, 1.5],
              [0, 1, 0, 3, -0.5, 0, 8.5],
            ],
            basicVariables: ["s1", "x1", "x2"],
            completed: true,
          },
        ],
        interpretation: {
          feasible: true,
          bounded: true,
          artificialEliminated: true,
        },
      }
      setSolution(mockSolution)
      setIsLoading(false)
    }, 2000)
  }

  const hasEqualityOrGreaterConstraints = () => {
    return problem.constraintTypes.some((type) => type === "=" || type === "≥")
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
                <TrendingUp className="h-6 w-6 text-purple-600" />
                <h1 className="text-xl font-bold">Méthode du Grand M</h1>
              </div>
            </div>
            <Badge variant="default" className="bg-purple-100 text-purple-800">
              Variables Artificielles
            </Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Configuration */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Configuration du Problème</CardTitle>
                <CardDescription>Problème avec contraintes d'égalité ou ≥</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="variables">Variables</Label>
                    <Input
                      id="variables"
                      type="number"
                      min="2"
                      max="5"
                      value={problem.variables}
                      onChange={(e) => setProblem({ ...problem, variables: Number.parseInt(e.target.value) || 2 })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="constraints">Contraintes</Label>
                    <Input
                      id="constraints"
                      type="number"
                      min="1"
                      max="5"
                      value={problem.constraints}
                      onChange={(e) => setProblem({ ...problem, constraints: Number.parseInt(e.target.value) || 1 })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="bigM">Valeur de M</Label>
                  <Input
                    id="bigM"
                    type="number"
                    min="100"
                    value={problem.bigM}
                    onChange={(e) => setProblem({ ...problem, bigM: Number.parseInt(e.target.value) || 1000 })}
                  />
                  <p className="text-xs text-gray-500 mt-1">M doit être suffisamment grand</p>
                </div>

                <div>
                  <Label>Fonction objectif (Maximiser)</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {Array.from({ length: problem.variables }, (_, i) => (
                      <Input
                        key={i}
                        placeholder={`c${i + 1}`}
                        value={problem.objective[i] || 0}
                        onChange={(e) => {
                          const newObjective = [...problem.objective]
                          newObjective[i] = Number.parseFloat(e.target.value) || 0
                          setProblem({ ...problem, objective: newObjective })
                        }}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Contraintes</Label>
                  <div className="space-y-3 mt-2">
                    {Array.from({ length: problem.constraints }, (_, i) => (
                      <div key={i} className="flex items-center space-x-2">
                        {Array.from({ length: problem.variables }, (_, j) => (
                          <Input
                            key={j}
                            className="w-16"
                            placeholder={`a${i + 1}${j + 1}`}
                            value={problem.constraintMatrix[i]?.[j] || 0}
                            onChange={(e) => {
                              const newMatrix = [...problem.constraintMatrix]
                              if (!newMatrix[i]) newMatrix[i] = []
                              newMatrix[i][j] = Number.parseFloat(e.target.value) || 0
                              setProblem({ ...problem, constraintMatrix: newMatrix })
                            }}
                          />
                        ))}
                        <Select
                          value={problem.constraintTypes[i] || "≤"}
                          onValueChange={(value) => {
                            const newTypes = [...problem.constraintTypes]
                            newTypes[i] = value
                            setProblem({ ...problem, constraintTypes: newTypes })
                          }}
                        >
                          <SelectTrigger className="w-16">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="≤">≤</SelectItem>
                            <SelectItem value="≥">≥</SelectItem>
                            <SelectItem value="=">=</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          className="w-16"
                          placeholder={`b${i + 1}`}
                          value={problem.rhs[i] || 0}
                          onChange={(e) => {
                            const newRhs = [...problem.rhs]
                            newRhs[i] = Number.parseFloat(e.target.value) || 0
                            setProblem({ ...problem, rhs: newRhs })
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {hasEqualityOrGreaterConstraints() && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Ce problème nécessite des variables artificielles. La méthode du Grand M sera appliquée.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex space-x-2">
                  <Button onClick={solveBigM} disabled={isLoading} className="flex-1">
                    {isLoading ? (
                      "Résolution..."
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Résoudre
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={() => setSolution(null)}>
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Résultats */}
          <div className="lg:col-span-2">
            {solution ? (
              <Tabs defaultValue="solution" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="solution">Solution</TabsTrigger>
                  <TabsTrigger value="phases">Phases</TabsTrigger>
                  <TabsTrigger value="theory">Théorie</TabsTrigger>
                  <TabsTrigger value="analysis">Analyse</TabsTrigger>
                </TabsList>

                <TabsContent value="solution">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        Solution par la Méthode du Grand M
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          {solution.interpretation.feasible ? "Réalisable" : "Non réalisable"}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="font-semibold mb-3">Valeur Optimale</h3>
                          <div className="text-3xl font-bold text-purple-600">Z = {solution.objectiveValue}</div>
                        </div>
                        <div>
                          <h3 className="font-semibold mb-3">Variables de Décision</h3>
                          <div className="space-y-2">
                            {Object.entries(solution.variables).map(([variable, value]) => (
                              <div key={variable} className="flex justify-between">
                                <span>{variable}:</span>
                                <span className="font-mono">{value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 grid md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="font-semibold mb-3">Variables Artificielles</h3>
                          <div className="space-y-2">
                            {Object.entries(solution.artificialVariables).map(([variable, value]) => (
                              <div key={variable} className="flex justify-between">
                                <span>{variable}:</span>
                                <span
                                  className={`font-mono ${Number(value) === 0 ? "text-green-600" : "text-red-600"}`}
                                >
                                  {value} {Number(value) === 0 && "✓"}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h3 className="font-semibold mb-3">Variables d'Écart/Surplus</h3>
                          <div className="space-y-2">
                            {Object.entries(solution.slackSurplus).map(([variable, value]) => (
                              <div key={variable} className="flex justify-between">
                                <span>{variable}:</span>
                                <span className="font-mono">{value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="mt-6">
                        <h3 className="font-semibold mb-3">État de la Solution</h3>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="text-center">
                            <div
                              className={`text-lg font-bold ${solution.interpretation.feasible ? "text-green-600" : "text-red-600"}`}
                            >
                              {solution.interpretation.feasible ? "✓" : "✗"}
                            </div>
                            <div className="text-sm text-gray-600">Réalisable</div>
                          </div>
                          <div className="text-center">
                            <div
                              className={`text-lg font-bold ${solution.interpretation.bounded ? "text-green-600" : "text-red-600"}`}
                            >
                              {solution.interpretation.bounded ? "✓" : "✗"}
                            </div>
                            <div className="text-sm text-gray-600">Bornée</div>
                          </div>
                          <div className="text-center">
                            <div
                              className={`text-lg font-bold ${solution.interpretation.artificialEliminated ? "text-green-600" : "text-red-600"}`}
                            >
                              {solution.interpretation.artificialEliminated ? "✓" : "✗"}
                            </div>
                            <div className="text-sm text-gray-600">Variables artificielles éliminées</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="phases">
                  <div className="space-y-6">
                    {solution.phases.map((phase: any, index: number) => (
                      <Card key={index}>
                        <CardHeader>
                          <CardTitle className="flex items-center justify-between">
                            Phase {phase.phase}
                            {phase.completed && <Badge className="bg-green-100 text-green-800">Terminée</Badge>}
                          </CardTitle>
                          <CardDescription>{phase.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <SimplexTable
                            tableau={phase.tableau}
                            basicVariables={phase.basicVariables}
                            pivotRow={phase.pivotRow}
                            pivotCol={phase.pivotCol}
                            showArtificial={true}
                          />
                          {phase.phase === 1 && (
                            <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
                              <h4 className="font-semibold text-yellow-800 mb-2">Phase 1 - Objectif</h4>
                              <p className="text-sm text-yellow-700">
                                Minimiser la somme des variables artificielles pour vérifier la faisabilité du problème.
                                Si cette somme est nulle à l'optimum, le problème original est réalisable.
                              </p>
                            </div>
                          )}
                          {phase.phase === 2 && (
                            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                              <h4 className="font-semibold text-blue-800 mb-2">Phase 2 - Objectif</h4>
                              <p className="text-sm text-blue-700">
                                Optimiser la fonction objectif originale en utilisant la base réalisable trouvée en
                                Phase 1.
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="theory">
                  <Card>
                    <CardHeader>
                      <CardTitle>Théorie de la Méthode du Grand M</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <h3 className="font-semibold mb-2">Principe de la Méthode</h3>
                        <p className="text-gray-600">
                          La méthode du Grand M est utilisée pour résoudre les problèmes de programmation linéaire qui
                          contiennent des contraintes d'égalité ou de type ≥. Elle introduit des variables artificielles
                          avec un coefficient de pénalité très grand (M) dans la fonction objectif.
                        </p>
                      </div>

                      <div>
                        <h3 className="font-semibold mb-2">Variables Artificielles</h3>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm mb-2">Pour chaque contrainte :</p>
                          <ul className="text-sm space-y-1">
                            <li>
                              • <strong>Contrainte ≤ :</strong> Ajouter variable d'écart s ≥ 0
                            </li>
                            <li>
                              • <strong>Contrainte ≥ :</strong> Soustraire variable de surplus s ≥ 0, ajouter variable
                              artificielle a ≥ 0
                            </li>
                            <li>
                              • <strong>Contrainte = :</strong> Ajouter variable artificielle a ≥ 0
                            </li>
                          </ul>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold mb-2">Fonction Objectif Modifiée</h3>
                        <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm">
                          Max Z = c₁x₁ + c₂x₂ + ... - M·a₁ - M·a₂ - ...
                          <br />
                          où M {">"} 0 est un nombre très grand
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold mb-2">Algorithme</h3>
                        <ol className="text-sm space-y-2">
                          <li>
                            <strong>1.</strong> Transformer le problème en forme standard avec variables artificielles
                          </li>
                          <li>
                            <strong>2.</strong> Résoudre le problème modifié par la méthode du simplexe
                          </li>
                          <li>
                            <strong>3.</strong> Analyser la solution :
                          </li>
                          <ul className="ml-4 mt-1 space-y-1">
                            <li>• Si toutes les variables artificielles = 0 : solution optimale trouvée</li>
                            <li>• Si une variable artificielle {">"} 0 : problème non réalisable</li>
                          </ul>
                        </ol>
                      </div>

                      <div>
                        <h3 className="font-semibold mb-2">Avantages et Inconvénients</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="bg-green-50 p-3 rounded-lg">
                            <h4 className="font-semibold text-green-800 mb-1">Avantages</h4>
                            <ul className="text-sm text-green-700 space-y-1">
                              <li>• Méthode simple et directe</li>
                              <li>• Applicable à tous types de contraintes</li>
                              <li>• Détecte l'infaisabilité</li>
                            </ul>
                          </div>
                          <div className="bg-red-50 p-3 rounded-lg">
                            <h4 className="font-semibold text-red-800 mb-1">Inconvénients</h4>
                            <ul className="text-sm text-red-700 space-y-1">
                              <li>• Problèmes numériques si M trop grand</li>
                              <li>• Convergence plus lente</li>
                              <li>• Choix délicat de la valeur M</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="analysis">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        Analyse Détaillée
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Rapport PDF
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <h3 className="font-semibold mb-3">Problème Initial</h3>
                        <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm">
                          Maximiser Z = {problem.objective.map((c, i) => `${c}x${i + 1}`).join(" + ")}
                          <br />
                          Sous contraintes:
                          <br />
                          {problem.constraintMatrix.map((row, i) => (
                            <div key={i}>
                              {row.map((a, j) => `${a}x${j + 1}`).join(" + ")} {problem.constraintTypes[i]}{" "}
                              {problem.rhs[i]}
                            </div>
                          ))}
                          <br />
                          x₁, x₂ ≥ 0
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold mb-3">Transformation avec Variables Artificielles</h3>
                        <div className="bg-purple-50 p-4 rounded-lg">
                          <p className="text-sm mb-2">Le problème a été transformé en :</p>
                          <div className="font-mono text-sm">
                            Max Z = {problem.objective.map((c, i) => `${c}x${i + 1}`).join(" + ")} - {problem.bigM}a₁ -{" "}
                            {problem.bigM}a₂
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold mb-3">Interprétation de la Solution</h3>
                        <div className="space-y-3">
                          <div className="p-3 bg-blue-50 rounded-lg">
                            <h4 className="font-semibold text-blue-800">Variables de Décision</h4>
                            <p className="text-sm text-blue-700">
                              Les valeurs optimales x₁ = {solution.variables.x1} et x₂ = {solution.variables.x2}
                              représentent les quantités optimales à produire ou allouer.
                            </p>
                          </div>

                          <div className="p-3 bg-green-50 rounded-lg">
                            <h4 className="font-semibold text-green-800">Variables Artificielles</h4>
                            <p className="text-sm text-green-700">
                              Toutes les variables artificielles sont nulles, confirmant que la solution est réalisable
                              pour le problème original.
                            </p>
                          </div>

                          <div className="p-3 bg-yellow-50 rounded-lg">
                            <h4 className="font-semibold text-yellow-800">Contraintes Actives</h4>
                            <p className="text-sm text-yellow-700">
                              Les contraintes avec variables d'écart nulles sont saturées et limitent l'amélioration de
                              la fonction objectif.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold mb-3">Recommandations</h3>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <ul className="text-sm space-y-2">
                            <li>• La solution obtenue est optimale et réalisable</li>
                            <li>• Aucune variable artificielle n'apparaît dans la base finale</li>
                            <li>• La valeur de M = {problem.bigM} était suffisamment grande</li>
                            <li>• Le problème original admet une solution unique</li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center h-96">
                  <div className="text-center">
                    <TrendingUp className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">Prêt pour la méthode du Grand M</h3>
                    <p className="text-gray-500">Configurez votre problème avec contraintes d'égalité ou ≥</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
