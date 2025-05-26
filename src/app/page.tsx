"use client";

import { useState, useEffect } from "react";
import ProblemConfig from "@/components/ProblemConfig";
import SimplexSolverWrapper from "@/components/SimplexSolverWrapper";
import DualProblemDisplay from "@/components/DualProblemDisplay";

interface ProblemData {
  numVariables: number;
  numConstraints: number;
  objective: number[];
  constraints: number[][];
  variableNames?: string[]; // Noms des variables de décision (x_i ou y_i)
  constraintNames?: string[];
  objectiveType?: "maximize" | "minimize";
}

export default function HomePage() {
  const [viewMode, setViewMode] = useState<"configPrimal" | "displayDual" | "solvePrimal" | "solveDual">("configPrimal");

  // États pour le problème PRIMAL
  const [primalNumVariables, setPrimalNumVariables] = useState(2);
  const [primalNumConstraints, setPrimalNumConstraints] = useState(2);
  const [primalObjective, setPrimalObjective] = useState<number[]>(Array(primalNumVariables).fill(0));
  const [primalConstraints, setPrimalConstraints] = useState<number[][]>(
    Array.from({ length: primalNumConstraints }, () => Array(primalNumVariables + 1).fill(0))
  );

  // États pour le solveur simplexe
  const [solverKey, setSolverKey] = useState(0);
  const [initialTableau, setInitialTableau] = useState<number[][]>([]);
  const [baseVars, setBaseVars] = useState<string[]>([]); // Noms des variables de base initiales pour le solveur
  const [variableNamesInTableau, setVariableNamesInTableau] = useState<string[]>([]); // Noms de TOUTES les vars DANS le tableau actuel
  const [problemBeingSolved, setProblemBeingSolved] = useState<"primal" | "dual">("primal");

  // État pour stocker les données du problème DUAL
  const [dualProblemData, setDualProblemData] = useState<ProblemData | null>(null);

  // Noms des variables DONT on veut déduire la solution à partir de la ligne Z de l'autre problème
  const [namesOfOtherProblemVars, setNamesOfOtherProblemVars] = useState<string[]>([]);

  // Effet pour synchroniser la taille des structures de données du primal
  useEffect(() => {
    setPrimalObjective(prevObj => {
        const newObj = Array(primalNumVariables).fill(0);
        for(let i=0; i < Math.min(prevObj.length, newObj.length); i++){
            newObj[i] = prevObj[i];
        }
        return newObj;
    });
    setPrimalConstraints(prevConstraints =>
      Array.from({ length: primalNumConstraints }, (_, i) => {
        const existingRow = prevConstraints[i] || [];
        const newRow = Array(primalNumVariables + 1).fill(0); // +1 pour RHS
        for (let j = 0; j <= primalNumVariables; j++) { // <= pour inclure RHS
          newRow[j] = existingRow[j] !== undefined ? existingRow[j] : 0;
        }
        return newRow.slice(0, primalNumVariables + 1);
      })
    );
  }, [primalNumVariables, primalNumConstraints]);


  const convertToDual = () => {
    const dualNumVars = primalNumConstraints;
    const dualNumConstrs = primalNumVariables;

    const rhsIndexInPrimal = primalNumVariables;
    const dualObjectiveCoeffs = primalConstraints.map(
      (constraintRow) => constraintRow[rhsIndexInPrimal]
    );

    const dualConstraintsCoeffsMatrix: number[][] = [];
    for (let j = 0; j < primalNumVariables; j++) {
      const newDualConstraintRow: number[] = [];
      for (let i = 0; i < primalNumConstraints; i++) {
        newDualConstraintRow.push(primalConstraints[i][j]);
      }
      dualConstraintsCoeffsMatrix.push(newDualConstraintRow);
    }

    const dualConstraintsRHS = [...primalObjective];
    const fullDualConstraints = dualConstraintsCoeffsMatrix.map((row, index) => [
      ...row,
      dualConstraintsRHS[index],
    ]);

    const dualVarDecisionNames = Array.from({ length: dualNumVars }, (_, i) => `y${i + 1}`);

    setDualProblemData({
      numVariables: dualNumVars,
      numConstraints: dualNumConstrs,
      objective: dualObjectiveCoeffs,
      constraints: fullDualConstraints,
      variableNames: dualVarDecisionNames,
      objectiveType: "minimize",
    });
    setViewMode("displayDual");
  };

  const handlePrimalProblemSubmit = () => {
    setProblemBeingSolved("primal");
    const m = primalNumConstraints; // Nombre de contraintes
    const n = primalNumVariables;   // Nombre de variables de décision x_i

    const tableau: number[][] = [];
    const initialBaseVarNames: string[] = [];
    const tableauColVarNames: string[] = [];

    for (let i = 0; i < n; i++) { tableauColVarNames.push(`x${i + 1}`); }
    for (let i = 0; i < m; i++) {
      const slackName = `s_x${i + 1}`; // Variables d'écart du primal
      tableauColVarNames.push(slackName);
      initialBaseVarNames.push(slackName);
    }
    // Lorsqu'on résout le primal, on voudra lire les y_i (variables du dual)
    // à partir des colonnes des s_x_i. Il y a 'm' (primalNumConstraints) de ces variables.
    setNamesOfOtherProblemVars(Array.from({ length: m }, (_, i) => `y${i + 1}`));

    for (let i = 0; i < m; i++) {
      const constraintCoeffs = primalConstraints[i].slice(0, n);
      const rhs = primalConstraints[i][n];
      const row = [...constraintCoeffs];
      for (let j = 0; j < m; j++) { row.push(i === j ? 1 : 0); } // Colonnes des slack s_x_j
      row.push(rhs);
      tableau.push(row);
    }

    const objectiveCoeffsForTableau = [...primalObjective].map(val => -val); // -Cj pour Max Z
    const lastRow = [...objectiveCoeffsForTableau];
    for (let i = 0; i < m; i++) { lastRow.push(0); } // Coeffs des slacks dans Z
    lastRow.push(0); // Valeur de Z initiale
    tableau.push(lastRow);

    setInitialTableau(tableau);
    setBaseVars(initialBaseVarNames);
    setVariableNamesInTableau(tableauColVarNames);
    setSolverKey((prev) => prev + 1);
    setViewMode("solvePrimal");
  };

  const handleSolveDualProblem = () => {
    if (!dualProblemData) return;
    setProblemBeingSolved("dual");

    const {
        numVariables: numDualDecisionVars,       // Nombre de variables y_i
        numConstraints: numOriginalDualConstrs,  // Nombre de contraintes originales du dual (A^T Y >= c)
        objective: dualObjectiveOriginalCoeffs,  // Coeffs b_j de Min W = bY
        constraints: dualOriginalConstraintsWithRHS, // Tableau [A^T | c]
        variableNames: dualDecisionVarNames,     // Noms des y_i
    } = dualProblemData;

    const tableau: number[][] = [];
    const initialBaseVarNames: string[] = [];
    const tableauColVarNames: string[] = [];

    for (let i = 0; i < numDualDecisionVars; i++) {
      tableauColVarNames.push(dualDecisionVarNames?.[i] || `y${i + 1}`);
    }
    // Les variables d'écart s_y_j sont ajoutées pour chaque contrainte originale du dual
    for (let i = 0; i < numOriginalDualConstrs; i++) {
      const slackName = `s_y${i + 1}`; // Variables d'écart du dual transformé
      tableauColVarNames.push(slackName);
      initialBaseVarNames.push(slackName);
    }
    // Lorsqu'on résout le dual, on voudra lire les x_i (variables du primal)
    // à partir des colonnes des s_y_i. Il y a 'primalNumVariables' de ces variables.
    // (car numOriginalDualConstrs === primalNumVariables)
    setNamesOfOtherProblemVars(Array.from({ length: primalNumVariables }, (_, i) => `x${i + 1}`));

    // Transformation: Min W = bY  => Max (-W) = -bY
    // Contraintes: (A^T Y)_k >= c_k   => -(A^T Y)_k <= -c_k
    for (let i = 0; i < numOriginalDualConstrs; i++) {
      const originalDualConstraint = dualOriginalConstraintsWithRHS[i]; // Ligne k: [ (A^T)_k | c_k ]
      const coeffs_A_T_k = originalDualConstraint.slice(0, numDualDecisionVars);
      const c_k = originalDualConstraint[numDualDecisionVars];

      const tableauRowCoeffs = coeffs_A_T_k.map(val => -val); // Coeffs de -(A^T)_k
      const tableauRowRHS = -c_k;                           // Terme de droite -c_k

      const tableauRow = [...tableauRowCoeffs];
      for (let j = 0; j < numOriginalDualConstrs; j++) { // Colonnes des slacks s_y_j
        tableauRow.push(i === j ? 1 : 0); // Matrice identité pour les slacks
      }
      tableauRow.push(tableauRowRHS);
      tableau.push(tableauRow);
    }

    // Ligne Objectif pour Max (-W) = sum (-b_j * y_j)
    // Si le solveur met -Cj dans la ligne Z pour Max Obj = sum(Cj*Var),
    // les Cj pour (-W) sont les -b_j.
    // Donc, la ligne Z du tableau contiendra -(-b_j) = b_j.
    // dualObjectiveOriginalCoeffs contient déjà les b_j.
    const lastRowObjectiveCoeffs = [...dualObjectiveOriginalCoeffs];

    const lastRow: number[] = [...lastRowObjectiveCoeffs];
    for (let i = 0; i < numOriginalDualConstrs; i++) { lastRow.push(0); } // Coeffs des s_y dans Z (qui est -W)
    lastRow.push(0); // Valeur de Z (qui est -W) initiale
    tableau.push(lastRow);

    setInitialTableau(tableau);
    setBaseVars(initialBaseVarNames);
    setVariableNamesInTableau(tableauColVarNames);
    setSolverKey((prev) => prev + Date.now()); // Pour une clé plus unique
    setViewMode("solveDual");
  };

  const resetToPrimalConfig = () => {
    setViewMode("configPrimal");
    setDualProblemData(null);
    setNamesOfOtherProblemVars([]);
    // Optionnel : Réinitialiser les états du primal à leurs valeurs par défaut
    // setPrimalNumVariables(2);
    // setPrimalNumConstraints(2);
    // setPrimalObjective(Array(2).fill(0));
    // setPrimalConstraints(Array.from({ length: 2 }, () => Array(2 + 1).fill(0)));
  };

  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-center text-indigo-700 mb-10">
        {problemBeingSolved === "primal" && viewMode.startsWith("solve") ? "Solveur Simplexe: Problème Primal" :
         problemBeingSolved === "dual" && viewMode.startsWith("solve") ? "Solveur Simplexe: Problème Dual (Max -W)" :
         "Résolution Simplexe & Forme Duale"}
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
          onConvertToDual={convertToDual}
        />
      )}

      {viewMode === "displayDual" && dualProblemData && (
        <DualProblemDisplay
          problemData={dualProblemData}
          onBackToPrimalConfig={resetToPrimalConfig}
          onSolveDual={handleSolveDualProblem}
        />
      )}

      {(viewMode === "solvePrimal" || viewMode === "solveDual") && initialTableau.length > 0 && (
        <SimplexSolverWrapper
          key={solverKey}
          initialTableau={initialTableau}
          baseVars={baseVars} // Variables de base initiales pour CE tableau
          variableNames={variableNamesInTableau} // Noms de TOUTES les colonnes de CE tableau
          onReset={resetToPrimalConfig}
          isSolvingDual={viewMode === "solveDual"}
          originalVariablesOfOtherProblem={namesOfOtherProblemVars} // Noms des vars de l'autre pb (x_i ou y_i)
        />
      )}
    </main>
  );
}