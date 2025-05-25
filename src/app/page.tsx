// Dans Page.tsx (ou HomePage.tsx)
"use client";

import { useState } from "react";
import ProblemConfig from "@/components/ProblemConfig";
import SimplexSolverWrapper from "@/components/SimplexSolverWrapper";
import DualProblemDisplay from "@/components/DualProblemDisplay"; // Nouveau composant à créer

// Types pour le problème primal et dual (peuvent être affinés)
interface ProblemData {
  numVariables: number;
  numConstraints: number;
  objective: number[];
  constraints: number[][];
  variableNames?: string[]; // Optionnel pour l'affichage du dual
  constraintNames?: string[]; // Optionnel pour l'affichage du dual
  objectiveType?: "maximize" | "minimize"; // Pour le dual
}

export default function HomePage() {
  const [viewMode, setViewMode] = useState<"configPrimal" | "displayDual" | "solvePrimal">("configPrimal");

  // États pour le problème PRIMAL (ceux que vous aviez déjà)
  const [primalNumVariables, setPrimalNumVariables] = useState(2);
  const [primalNumConstraints, setPrimalNumConstraints] = useState(2);
  const [primalObjective, setPrimalObjective] = useState<number[]>(Array(2).fill(0));
  const [primalConstraints, setPrimalConstraints] = useState<number[][]>(
    Array.from({ length: 2 }, () => Array(2 + 1).fill(0)) // var + RHS
  );

  // États pour le solveur simplexe (ceux que vous aviez déjà)
  const [solverKey, setSolverKey] = useState(0);
  const [initialTableau, setInitialTableau] = useState<number[][]>([]);
  const [baseVars, setBaseVars] = useState<string[]>([]);
  const [variableNames, setVariableNames] = useState<string[]>([]);

  // État pour stocker les données du problème DUAL
  const [dualProblemData, setDualProblemData] = useState<ProblemData | null>(null);


  // Fonction de conversion en DUAL
  const convertToDual = () => {
    // Primal: Maximiser Z = cX, Ax <= b, X >= 0
    // Dual: Minimiser W = bY, A^T Y >= c, Y >= 0

    const dualNumVariables = primalNumConstraints; // Nombre de variables du dual = nombre de contraintes du primal
    const dualNumConstraints = primalNumVariables; // Nombre de contraintes du dual = nombre de variables du primal

    // Coefficients de la fonction objectif du dual = RHS des contraintes du primal
    const dualObjectiveCoefficients = primalConstraints.map(constraintRow => constraintRow[primalNumVariables]);

    // Matrice des coefficients des contraintes du dual (transposée de A)
    const dualConstraintsCoefficients: number[][] = [];
    for (let j = 0; j < primalNumVariables; j++) { // Colonnes du primal deviennent lignes du dual
      const newDualConstraintRow: number[] = [];
      for (let i = 0; i < primalNumConstraints; i++) { // Lignes du primal deviennent colonnes du dual
        newDualConstraintRow.push(primalConstraints[i][j]);
      }
      dualConstraintsCoefficients.push(newDualConstraintRow);
    }

    // RHS des contraintes du dual = coefficients de l'objectif du primal
    const dualConstraintsRHS = [...primalObjective];

    // Assembler les contraintes du dual (coefficients + RHS)
    const fullDualConstraints = dualConstraintsCoefficients.map((row, index) => [
      ...row,
      dualConstraintsRHS[index]
    ]);

    // Noms des variables pour l'affichage (optionnel, mais bien pour la clarté)
    const dualVarNames = Array.from({ length: dualNumVariables }, (_, i) => `y${i + 1}`);
    const dualConstrNames = Array.from({ length: dualNumConstraints }, (_, i) => `C'${i + 1}`);


    setDualProblemData({
      numVariables: dualNumVariables,
      numConstraints: dualNumConstraints,
      objective: dualObjectiveCoefficients,
      constraints: fullDualConstraints,
      variableNames: dualVarNames,
      constraintNames: dualConstrNames,
      objectiveType: "minimize",
    });
    setViewMode("displayDual");
  };


  const handlePrimalProblemSubmit = () => {
    // ... (votre logique existante pour préparer le tableau simplexe pour le PRIMAL)
    const m = primalNumConstraints;
    const n = primalNumVariables;
    const tableau: number[][] = [];
    const base: string[] = [];
    const variables: string[] = [];

    for (let i = 0; i < n; i++) { variables.push(`x${i + 1}`); }
    for (let i = 0; i < m; i++) { variables.push(`s${i + 1}`); base.push(`s${i + 1}`); }

    for (let i = 0; i < m; i++) {
      const row = [...primalConstraints[i].slice(0, n)];
      for (let j = 0; j < m; j++) { row.push(i === j ? 1 : 0); }
      row.push(primalConstraints[i][n]);
      tableau.push(row);
    }
    const lastRow = [...primalObjective];
    for (let i = 0; i < m; i++) { lastRow.push(0); }
    lastRow.push(0);
    tableau.push(lastRow.map((val) => -val)); // Supposant maximisation

    setInitialTableau(tableau);
    setBaseVars(base);
    setVariableNames(variables);
    setSolverKey((prev) => prev + 1);
    setViewMode("solvePrimal"); // Changer le mode de vue
  };

  const resetToPrimalConfig = () => {
    setViewMode("configPrimal");
    // Optionnel: réinitialiser aussi les états du solveur si nécessaire
    setInitialTableau([]);
    // ...
  };


  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-center text-indigo-700 mb-10">
        Résolution Simplexe & Forme Duale
      </h1>

      {viewMode === "configPrimal" && (
        <ProblemConfig
          numVariables={primalNumVariables}
          setNumVariables={setPrimalNumVariables}
          numConstraints={primalNumConstraints}
          setNumConstraints={setPrimalNumConstraints}
          objective={primalObjective}
          setObjective={setPrimalObjective}
          constraints={primalConstraints}
          setConstraints={setPrimalConstraints}
          onConfirm={handlePrimalProblemSubmit}
          onConvertToDual={convertToDual} // Passer la fonction
        />
      )}

      {viewMode === "displayDual" && dualProblemData && (
        <DualProblemDisplay
          problemData={dualProblemData}
          onBackToPrimalConfig={resetToPrimalConfig}
          // onSolveDual={() => { /* Logique pour résoudre le dual à implémenter */ setViewMode('solveDual'); }}
        />
      )}

      {viewMode === "solvePrimal" && (
        <SimplexSolverWrapper
          key={solverKey} // Important pour forcer le remontage et la réinitialisation du solveur
          initialTableau={initialTableau}
          baseVars={baseVars}
          variableNames={variableNames}
          onReset={resetToPrimalConfig} // Revenir à la configuration du primal
        />
      )}
    </main>
  );
}