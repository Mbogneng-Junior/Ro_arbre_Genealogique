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
import { ArrowLeft, Calculator, Play, RotateCcw, Download } from "lucide-react"
import { SimplexTable } from "@/components/simplex-table"
import { GraphVisualization } from "@/components/graph-visualization"

interface Problem {
  variables: number
  constraints: number
  objective: number[]
  constraintMatrix: number[][]
  rhs: number[]
  constraintTypes: string[]
  isMaximization: boolean
}

export default function SimplexPage() {
  const [problem, setProblem] = useState<Problem>({
    variables: 2,
    constraints: 2,
    objective: [3, 2],
    constraintMatrix: [
      [1, 1],
      [2, 1],
    ],
    rhs: [4, 6],
    constraintTypes: ["≤", "≤"],
    isMaximization: true,
  })

  const [solution, setSolution] = useState<any>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  const solveSimplex = () => {
    setIsLoading(true)
    // Simulation de la résolution
    setTimeout(() => {
      const mockSolution = {
        optimal: true,
        objectiveValue: 10,
        variables: { x1: 2, x2: 2 },
        iterations: [
          {
            tableau: [
              [1, 1, 1, 0, 4],
              [2, 1, 0, 1, 6],
              [-3, -2, 0, 0, 0],
            ],
            basicVariables: ["s1", "s2"],
            pivotRow: 1,
            pivotCol: 0,
          },
          {
            tableau: [
              [0, 0.5, 1, -0.5, 1],
              [1, 0.5, 0, 0.5, 3],
              [0, -0.5, 0, 1.5, 9],
            ],
            basicVariables: ["s1", "x1"],
            pivotRow: 0,
            pivotCol: 1,
          },
          {
            tableau: [
              [0, 1, 2, -1, 2],
              [1, 0, -1, 1, 2],
              [0, 0, 1, 1, 10],
            ],
            basicVariables: ["x2", "x1"],
            optimal: true,
          },
        ],
      }
      setSolution(mockSolution)
      setIsLoading(false)
    }, 1500)
  }

  const resetProblem = () => {
    setSolution(null)
    setCurrentStep(0)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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
                <Calculator className="h-6 w-6 text-blue-600" />
                <h1 className="text-xl font-bold">Méthode du Simplexe Tabulaire</h1>
              </div>
            </div>
            <Badge variant="default" className="bg-blue-100 text-blue-800">
              Méthode Primale
            </Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Configuration du problème */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Configuration du Problème</CardTitle>
                <CardDescription>Définissez votre problème de programmation linéaire</CardDescription>
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
                  <Label>Type d'optimisation</Label>
                  <Select
                    value={problem.isMaximization ? "max" : "min"}
                    onValueChange={(value) => setProblem({ ...problem, isMaximization: value === "max" })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="max">Maximisation</SelectItem>
                      <SelectItem value="min">Minimisation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Fonction objectif</Label>
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

                <div className="flex space-x-2">
                  <Button onClick={solveSimplex} disabled={isLoading} className="flex-1">
                    {isLoading ? (
                      "Résolution..."
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Résoudre
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={resetProblem}>
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
                  <TabsTrigger value="steps">Étapes</TabsTrigger>
                  <TabsTrigger value="graph">Graphique</TabsTrigger>
                  <TabsTrigger value="report">Rapport</TabsTrigger>
                </TabsList>

                <TabsContent value="solution">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        Solution Optimale
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          Optimal
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="font-semibold mb-3">Valeur de la fonction objectif</h3>
                          <div className="text-3xl font-bold text-blue-600">Z = {solution.objectiveValue}</div>
                        </div>
                        <div>
                          <h3 className="font-semibold mb-3">Variables de décision</h3>
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
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="steps">
                  <Card>
                    <CardHeader>
                      <CardTitle>Étapes de Résolution</CardTitle>
                      <CardDescription>Suivez chaque itération de l'algorithme du simplexe</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {solution.iterations.map((iteration: any, index: number) => (
                          <div key={index}>
                            <h3 className="font-semibold mb-3">
                              Itération {index + 1}
                              {iteration.optimal && (
                                <Badge className="ml-2 bg-green-100 text-green-800">Solution optimale</Badge>
                              )}
                            </h3>
                            <SimplexTable
                              tableau={iteration.tableau}
                              basicVariables={iteration.basicVariables}
                              pivotRow={iteration.pivotRow}
                              pivotCol={iteration.pivotCol}
                            />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="graph">
                  <Card>
                    <CardHeader>
                      <CardTitle>Visualisation Graphique</CardTitle>
                      <CardDescription>Représentation graphique de la région réalisable</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <GraphVisualization
                        constraints={problem.constraintMatrix}
                        rhs={problem.rhs}
                        objective={problem.objective}
                        solution={solution.variables}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="report">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        Rapport Détaillé
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Exporter PDF
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div>
                          <h3 className="font-semibold mb-2">Problème Initial</h3>
                          <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm">
                            {problem.isMaximization ? "Maximiser" : "Minimiser"} Z ={" "}
                            {problem.objective.map((c, i) => `${c}x${i + 1}`).join(" + ")}
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
                          <h3 className="font-semibold mb-2">Analyse de la Solution</h3>
                          <p className="text-gray-600">
                            La méthode du simplexe a convergé vers la solution optimale en {solution.iterations.length}{" "}
                            itérations. La valeur optimale de la fonction objectif est {solution.objectiveValue}.
                          </p>
                        </div>

                        <div>
                          <h3 className="font-semibold mb-2">Interprétation</h3>
                          <p className="text-gray-600">
                            Cette solution représente le point optimal dans l'espace des solutions réalisables. Les
                            variables de décision indiquent les quantités optimales à produire ou allouer.
                          </p>
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
                    <Calculator className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">Prêt à résoudre</h3>
                    <p className="text-gray-500">Configurez votre problème et cliquez sur "Résoudre" pour commencer</p>
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
