// src/hooks/useSimplexSolver.tsx
import { useState, useCallback } from "react";

// --- Types pour la communication interne et l'état ---
interface PivotInfo {
  row: number;
  col: number;
  enteringVarName: string;
  leavingVarName: string;
}

interface StatusInfo {
  status: "optimal" | "unbounded_primal" | "infeasible_primal";
}

type PivotResult = PivotInfo | StatusInfo | null;

interface SimplexState {
  tableaux: number[][][];
  baseVariables: string[][];
  pivotToHighlight: PivotInfo | null;
  currentStep: number;
  done: boolean;
  solution: Record<string, number>;
  z: number;
  statusMessage: string;
  currentAlgorithm: "primal" | "dual" | "none";
}

// --- Fonctions Utilitaires PURES ---

function getPrimalPivotPosition(
  tableau: number[][],
  currentBases: string[],
  allColumnVarNames: string[]
): PivotResult {
  if (!tableau || tableau.length === 0 || !tableau[0] || tableau[0].length === 0) {
    console.error("getPrimalPivotPosition: Tableau invalide.");
    return null;
  }
  const numRows = tableau.length;
  const numCols = tableau[0].length;
  const objectiveRowIdx = numRows - 1;
  const objectiveRow = tableau[objectiveRowIdx];

  let pivotCol = -1;
  let minObjectiveVal = -1e-9;

  for (let j = 0; j < numCols - 1; j++) {
    if (objectiveRow[j] < minObjectiveVal) {
      minObjectiveVal = objectiveRow[j];
      pivotCol = j;
    }
  }

  if (pivotCol === -1) return { status: "optimal" };

  let minRatio = Infinity;
  let pivotRow = -1;
  for (let i = 0; i < objectiveRowIdx; i++) {
    const valInPivotCol = tableau[i][pivotCol];
    if (valInPivotCol > 1e-9) {
      const rhsVal = tableau[i][numCols - 1];
      const ratio = rhsVal / valInPivotCol;
      if (ratio >= -1e-9 && ratio < minRatio - 1e-9) {
        minRatio = ratio;
        pivotRow = i;
      }
    }
  }

  if (pivotRow === -1) return { status: "unbounded_primal" };

  if (pivotCol >= allColumnVarNames.length || pivotRow >= currentBases.length) {
    console.error("getPrimalPivotPosition: Indices de pivot hors limites pour les noms de variables.");
    return null;
  }

  return {
    row: pivotRow,
    col: pivotCol,
    enteringVarName: allColumnVarNames[pivotCol],
    leavingVarName: currentBases[pivotRow],
  };
}

function getDualPivotPosition(
  tableau: number[][],
  currentBases: string[],
  allColumnVarNames: string[]
): PivotResult {
  if (!tableau || tableau.length === 0 || !tableau[0] || tableau[0].length === 0) {
    console.error("getDualPivotPosition: Tableau invalide.");
    return null;
  }
  const numRows = tableau.length;
  const numCols = tableau[0].length;
  const objectiveRowIdx = numRows - 1;
  const objectiveRow = tableau[objectiveRowIdx];

  let pivotRow = -1;
  let maxNegativeRhs = -1e-9;

  for (let i = 0; i < objectiveRowIdx; i++) {
    const rhsVal = tableau[i][numCols - 1];
    if (rhsVal < maxNegativeRhs) {
      maxNegativeRhs = rhsVal;
      pivotRow = i;
    }
  }

  if (pivotRow === -1) return { status: "optimal" };

  let pivotCol = -1;
  let minAbsRatio = Infinity;
  const leavingRowCoeffs = tableau[pivotRow];

  for (let j = 0; j < numCols - 1; j++) {
    const a_kj = leavingRowCoeffs[j];
    if (a_kj < -1e-9) {
      const zj_cj_val = objectiveRow[j];
      const ratio = Math.abs(zj_cj_val / a_kj);
      if (ratio < minAbsRatio - 1e-9) {
        minAbsRatio = ratio;
        pivotCol = j;
      }
    }
  }

  if (pivotCol === -1) return { status: "infeasible_primal" };

  if (pivotCol >= allColumnVarNames.length || pivotRow >= currentBases.length) {
    console.error("getDualPivotPosition: Indices de pivot hors limites pour les noms de variables.");
    return null;
  }

  return {
    row: pivotRow,
    col: pivotCol,
    enteringVarName: allColumnVarNames[pivotCol],
    leavingVarName: currentBases[pivotRow],
  };
}

function pivotTableau(
  currentTableau: number[][], // Nom du paramètre corrigé
  pivotRow: number,
  pivotCol: number
): number[][] {
  const newTableau = currentTableau.map((row) => [...row]);
  const pivotVal = newTableau[pivotRow][pivotCol];

  if (Math.abs(pivotVal) < 1e-9) {
    console.error("pivotTableau Erreur: Élément pivot est ~0.", pivotVal);
    return currentTableau;
  }

  for (let j = 0; j < newTableau[pivotRow].length; j++) {
    newTableau[pivotRow][j] /= pivotVal;
  }

  for (let i = 0; i < newTableau.length; i++) {
    if (i !== pivotRow) {
      const factor = newTableau[i][pivotCol];
      for (let j = 0; j < newTableau[i].length; j++) {
        newTableau[i][j] -= factor * newTableau[pivotRow][j];
      }
    }
  }
  return newTableau;
}

function extractSolutionAndZ(
  tableauPourSolution: number[][], // Nom du paramètre corrigé
  basesPourSolution: string[],   // Nom du paramètre corrigé
  allColumnVarNames: string[]
): { solution: Record<string, number>; z: number } {
  const sol: Record<string, number> = {};
  const decisionVarNamesInThisProblem = allColumnVarNames.filter(
    (name) => name.startsWith("x") || name.startsWith("y")
  );
  decisionVarNamesInThisProblem.forEach((varName) => { sol[varName] = 0; });

  basesPourSolution.forEach((baseVarName, rowIndex) => {
    if (rowIndex >= tableauPourSolution.length - 1) {
      console.error(`extractSolutionAndZ: rowIndex ${rowIndex} (pour ${baseVarName}) est invalide pour tableauPourSolution de longueur ${tableauPourSolution.length}.`);
      return;
    }
    const currentRow = tableauPourSolution[rowIndex];
    if (!currentRow || currentRow.length === 0) {
      console.error(`extractSolutionAndZ: Ligne ${rowIndex} (pour ${baseVarName}) dans tableauPourSolution est invalide.`);
      return;
    }
    if (decisionVarNamesInThisProblem.includes(baseVarName)) {
      const rhsColumnIndex = currentRow.length - 1;
      if (rhsColumnIndex < 0) {
        console.error(`extractSolutionAndZ: Ligne ${rowIndex} (pour ${baseVarName}) dans tableauPourSolution est vide.`);
        return;
      }
      sol[baseVarName] = currentRow[rhsColumnIndex];
    }
  });

  const objectiveRowIndex = tableauPourSolution.length - 1;
  let zValue = 0;
  if (
    objectiveRowIndex >= 0 &&
    tableauPourSolution[objectiveRowIndex] &&
    tableauPourSolution[objectiveRowIndex].length > 0
  ) {
    const rhsIndexOfObjectiveRow = tableauPourSolution[objectiveRowIndex].length - 1;
    zValue = tableauPourSolution[objectiveRowIndex][rhsIndexOfObjectiveRow];
  } else {
    console.error("extractSolutionAndZ: ZValue illisible, tableauPourSolution mal formé.");
  }
  return { solution: sol, z: zValue };
}

// --- Hook Principal ---
export function useSimplexSolver(
  initialTableauData: number[][],
  allColumnVarNames: string[],
  initialBaseVarNames: string[]
) {
  const determineAlgorithmAndPivot = useCallback(
    (tableau: number[][], bases: string[]): { algo: "primal" | "dual" | "none", pivotResult: PivotResult, statusMsg: string } => {
      const objectiveRow = tableau[tableau.length - 1];
      const numCols = tableau[0].length;

      let isZOptimalForPrimal = true;
      for (let j = 0; j < numCols - 1; j++) {
        if (objectiveRow[j] < -1e-9) {
          isZOptimalForPrimal = false;
          break;
        }
      }

      let isPrimalFeasible = true;
      for (let i = 0; i < tableau.length - 1; i++) {
        if (tableau[i][numCols - 1] < -1e-9) {
          isPrimalFeasible = false;
          break;
        }
      }

      if (isZOptimalForPrimal && isPrimalFeasible) {
        return { algo: "none", pivotResult: { status: "optimal" }, statusMsg: "Solution optimale et faisable." };
      } else if (isZOptimalForPrimal && !isPrimalFeasible) {
        const dualPivot = getDualPivotPosition(tableau, bases, allColumnVarNames);
        const statusMsg = dualPivot && "row" in dualPivot ? `Prêt pour dual simplexe. Entrante: ${dualPivot.enteringVarName}, Sortante: ${dualPivot.leavingVarName}.`
                        : dualPivot && "status" in dualPivot ? `État du dual: ${dualPivot.status}.`
                        : "Erreur pivot dual.";
        return { algo: "dual", pivotResult: dualPivot, statusMsg };
      } else if (!isZOptimalForPrimal && isPrimalFeasible) {
        const primalPivot = getPrimalPivotPosition(tableau, bases, allColumnVarNames);
        const statusMsg = primalPivot && "row" in primalPivot ? `Prêt pour primal simplexe. Entrante: ${primalPivot.enteringVarName}, Sortante: ${primalPivot.leavingVarName}.`
                        : primalPivot && "status" in primalPivot ? `État du primal: ${primalPivot.status}.`
                        : "Erreur pivot primal.";
        return { algo: "primal", pivotResult: primalPivot, statusMsg };
      } else { 
        console.warn("Cas mixte: Z non optimal et RHS négatifs. Tentative avec Primal Simplexe.");
        const primalPivot = getPrimalPivotPosition(tableau, bases, allColumnVarNames);
         const statusMsg = primalPivot && "row" in primalPivot ? `Tentative primal (mixte). Entrante: ${primalPivot.enteringVarName}, Sortante: ${primalPivot.leavingVarName}.`
                        : primalPivot && "status" in primalPivot ? `État du primal (mixte): ${primalPivot.status}.`
                        : "Erreur pivot primal (mixte).";
        return { algo: "primal", pivotResult: primalPivot, statusMsg };
      }
    },
    [allColumnVarNames]
  );

  const [state, setState] = useState<SimplexState>(() => {
    if (!initialTableauData || initialTableauData.length === 0 ||
        !allColumnVarNames || allColumnVarNames.length === 0 ||
        !initialBaseVarNames || initialBaseVarNames.length === 0) {
      return {
        tableaux: [], baseVariables: [], pivotToHighlight: null, currentStep: 0,
        done: true, solution: {}, z: 0, statusMessage: "Données initiales insuffisantes.",
        currentAlgorithm: "none"
      };
    }

    const firstTableau = JSON.parse(JSON.stringify(initialTableauData));
    const firstBases = JSON.parse(JSON.stringify(initialBaseVarNames));
    
    const initialDecision = determineAlgorithmAndPivot(firstTableau, firstBases);
    
    let initialPivotInfo: PivotInfo | null = null;
    let initialDone = false;
    let initialStatus = initialDecision.statusMsg;
    let initialSol = {};
    let initialZ = 0;

    if (initialDecision.pivotResult) {
      if ("status" in initialDecision.pivotResult) { // Type guard for StatusInfo
        initialDone = true;
      } else { // Type is PivotInfo
        initialPivotInfo = initialDecision.pivotResult;
      }
    } else { 
      initialDone = true;
      initialStatus = "Erreur critique : Impossible de déterminer le pivot initial (pivotResult est null).";
      console.error("useSimplexSolver init: initialDecision.pivotResult est null.");
    }
    
    // Correction ici: vérifier le type avant d'accéder à .status
    if (initialDone && initialDecision.pivotResult && "status" in initialDecision.pivotResult && initialDecision.pivotResult.status === "optimal") {
        const { solution, z } = extractSolutionAndZ(firstTableau, firstBases, allColumnVarNames);
        initialSol = solution;
        initialZ = z;
    }

    return {
      tableaux: [firstTableau],
      baseVariables: [firstBases],
      pivotToHighlight: initialPivotInfo,
      currentStep: 0,
      done: initialDone,
      solution: initialSol,
      z: initialZ,
      statusMessage: initialStatus,
      currentAlgorithm: initialDecision.algo,
    };
  });

  const step = useCallback(() => {
    setState(s => {
      if (s.done || !s.pivotToHighlight) {
        return s;
      }

      const { row: pivotRow, col: pivotCol } = s.pivotToHighlight;
      const currentTableau = s.tableaux[s.currentStep];
      const currentBases = s.baseVariables[s.currentStep];

      const newTableau = pivotTableau(currentTableau, pivotRow, pivotCol);
      const newBases = [...currentBases];
      newBases[pivotRow] = allColumnVarNames[pivotCol];

      const nextDecision = determineAlgorithmAndPivot(newTableau, newBases);
      
      let nextPivotHighlightInfo: PivotInfo | null = null;
      let isNowDone = false;
      let newStatusMessage = nextDecision.statusMsg;
      let stepSolution = s.solution;
      let stepZ = s.z;

      if (nextDecision.pivotResult) {
        if ("status" in nextDecision.pivotResult) { // Type guard
          isNowDone = true;
           if(nextDecision.pivotResult.status === "optimal"){
             const { solution, z } = extractSolutionAndZ(newTableau, newBases, allColumnVarNames);
             stepSolution = solution;
             stepZ = z;
           }
        } else { // Type is PivotInfo
          nextPivotHighlightInfo = nextDecision.pivotResult;
        }
      } else { 
        isNowDone = true;
        newStatusMessage = "Erreur : Impossible de déterminer le pivot suivant (pivotResult est null).";
        console.error("useSimplexSolver step: nextDecision.pivotResult est null.");
      }

      return {
        ...s,
        tableaux: [...s.tableaux, newTableau],
        baseVariables: [...s.baseVariables, newBases],
        currentStep: s.currentStep + 1,
        pivotToHighlight: nextPivotHighlightInfo,
        done: isNowDone,
        statusMessage: newStatusMessage,
        solution: isNowDone ? stepSolution : s.solution,
        z: isNowDone ? stepZ : s.z,
        currentAlgorithm: nextDecision.algo,
      };
    });
  }, [allColumnVarNames, determineAlgorithmAndPivot]);

  const prev = useCallback(() => {
    setState(s => {
      if (s.currentStep > 0) {
        const prevStep = s.currentStep - 1;
        const prevTableau = s.tableaux[prevStep];
        const prevBases = s.baseVariables[prevStep];
        
        const prevDecision = determineAlgorithmAndPivot(prevTableau, prevBases);
        let prevPivotHighlight: PivotInfo | null = null;
        if(prevDecision.pivotResult && "row" in prevDecision.pivotResult){ // Type guard
            prevPivotHighlight = prevDecision.pivotResult;
        }

        return {
          ...s,
          currentStep: prevStep,
          done: false, 
          pivotToHighlight: prevPivotHighlight,
          statusMessage: prevDecision.statusMsg || `Retour à l'étape ${prevStep + 1}.`,
          currentAlgorithm: prevDecision.algo,
        };
      }
      return s;
    });
  }, [allColumnVarNames, determineAlgorithmAndPivot]);

  const reset = useCallback(() => {
    console.log("useSimplexSolver reset function called (typically handled by parent key change).");
  }, []);

  return {
    tableaux: state.tableaux,
    baseVariables: state.baseVariables,
    pivotToHighlight: state.pivotToHighlight,
    currentStep: state.currentStep,
    step,
    prev,
    reset,
    done: state.done,
    solution: state.solution,
    z: state.z,
    statusMessage: state.statusMessage,
  };
}