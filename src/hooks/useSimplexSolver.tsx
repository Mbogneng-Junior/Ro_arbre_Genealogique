import { useState, useEffect, useCallback } from "react";

// Vos fonctions getPivotPosition et pivotTableau restent essentielles
// function getPivotPosition(tableau: number[][]): { pivotRow: number, pivotCol: number, enteringVarName: string, leavingVarName: string } | { status: 'optimal' | 'unbounded' } { ... }
// function pivotTableau(tableau: number[][], pivotRow: number, pivotCol: number): number[][] { ... }
// function extractSolutionAndZ(...)

interface SimplexState {
  tableaux: number[][][];
  baseVariables: string[][];
  // Pour mettre en évidence le pivot *sur le tableau actuel* qui mènera à l'étape suivante
  pivotInfoForCurrentStep: { // Informations sur le pivot à effectuer sur le tableau actuel
    row?: number;            // Index de la ligne de la variable sortante
    col?: number;            // Index de la colonne de la variable entrante
    enteringVarName?: string;
    leavingVarName?: string;
  } | null;
  // Ou, si vous préférez stocker l'historique des pivots :
  // enteringHistory: string[]; // Variable entrante qui a conduit à tableaux[i+1] depuis tableaux[i]
  // leavingHistory: string[];  // Variable sortante qui a conduit à tableaux[i+1] depuis tableaux[i]

  currentStep: number;
  done: boolean;
  solution: Record<string, number>;
  z: number;
  statusMessage: string;
}

export function useSimplexSolver(
  initialTableauData: number[][],
  initialBasesData: string[],
  variableNames: string[] // Important pour identifier les variables par nom
) {
  const [state, setState] = useState<SimplexState>(() => { // Utiliser une fonction pour l'état initial
    // Initialisation de pivotInfoForCurrentStep dès le début
    let initialPivotInfo = null;
    if (initialTableauData && initialTableauData.length > 0) {
        const pivotResult = getPivotPosition(initialTableauData, initialBasesData, variableNames); // getPivotPosition doit retourner plus d'infos
        if (pivotResult && 'pivotRow' in pivotResult) {
            initialPivotInfo = {
                row: pivotResult.pivotRow,
                col: pivotResult.pivotCol,
                enteringVarName: pivotResult.enteringVarName,
                leavingVarName: pivotResult.leavingVarName
            };
        }
    }
    return {
      tableaux: initialTableauData && initialTableauData.length > 0 ? [JSON.parse(JSON.stringify(initialTableauData))] : [],
      baseVariables: initialBasesData && initialBasesData.length > 0 ? [JSON.parse(JSON.stringify(initialBasesData))] : [],
      pivotInfoForCurrentStep: initialPivotInfo,
      currentStep: 0,
      done: false,
      solution: {},
      z: 0,
      statusMessage: initialTableauData && initialTableauData.length > 0 ? "Prêt à commencer. Cliquez sur 'Étape suivante'." : "Données initiales manquantes.",
    };
  });


  // useEffect pour réinitialiser si les props initiales changent (si la clé ne change pas)
  // Si la clé du wrapper change toujours, cet useEffect est moins critique pour la réinitialisation
  // mais utile pour calculer le premier pivotInfo.
  useEffect(() => {
    // Si initialTableauData est vide ou invalide, on ne fait rien ou on met un état d'erreur
    if (!initialTableauData || initialTableauData.length === 0 || !initialTableauData[0] || initialTableauData[0].length === 0) {
        setState({
            tableaux: [[]], baseVariables: [[]], pivotInfoForCurrentStep: null, currentStep: 0,
            done: true, solution: {}, z: 0, statusMessage: "Données initiales invalides."
        });
        return;
    }

    // Calcule le pivot potentiel pour le tableau initial
    const currentTableau = initialTableauData; // Le tableau initial
    const currentBases = initialBasesData;     // Les bases initiales

    const pivotResult = getPivotPosition(currentTableau, currentBases, variableNames);
    let nextPivotInfo = null;
    let initialDone = false;
    let initialStatus = "Prêt. Cliquez sur 'Étape suivante'.";

    if (pivotResult) {
      if ('status' in pivotResult) { // Optimal ou non borné dès le départ
        initialDone = true;
        if (pivotResult.status === 'optimal') {
          initialStatus = "Solution Optimale trouvée (tableau initial).";
        } else {
          initialStatus = "Problème Non Borné (tableau initial).";
        }
        const { solution: sol, z: valZ } = extractSolutionAndZ(currentTableau, currentBases, variableNames);
        setState(s => ({
          ...s, // Garder tableaux et baseVariables déjà initialisés avec les données initiales
          tableaux: [JSON.parse(JSON.stringify(initialTableauData))],
          baseVariables: [JSON.parse(JSON.stringify(initialBasesData))],
          pivotInfoForCurrentStep: null,
          currentStep: 0,
          done: initialDone,
          statusMessage: initialStatus,
          solution: sol,
          z: valZ,
        }));
        return; // Important de sortir ici
      } else { // Pivot possible
        nextPivotInfo = {
          row: pivotResult.pivotRow,
          col: pivotResult.pivotCol,
          enteringVarName: pivotResult.enteringVarName,
          leavingVarName: pivotResult.leavingVarName,
        };
      }
    } else { // Cas où getPivotPosition renvoie null (imprévu si non optimal/unbounded)
        initialDone = true;
        initialStatus = "Erreur: Impossible de déterminer le pivot initial.";
    }

    setState({
      tableaux: [JSON.parse(JSON.stringify(initialTableauData))],
      baseVariables: [JSON.parse(JSON.stringify(initialBasesData))],
      pivotInfoForCurrentStep: nextPivotInfo,
      currentStep: 0,
      done: initialDone, // Si déjà optimal/unbounded
      solution: initialDone ? extractSolutionAndZ(currentTableau, currentBases, variableNames).solution : {},
      z: initialDone ? extractSolutionAndZ(currentTableau, currentBases, variableNames).z : 0,
      statusMessage: initialStatus,
    });

  }, [initialTableauData, initialBasesData, variableNames]); // Dépendances

  const step = useCallback(() => {
    setState(s => {
      if (s.done || !s.pivotInfoForCurrentStep || s.pivotInfoForCurrentStep.row === undefined || s.pivotInfoForCurrentStep.col === undefined) {
        // Si déjà terminé ou pas d'info de pivot valide, ne rien faire
        return s;
      }

      const { row: pivotRow, col: pivotCol } = s.pivotInfoForCurrentStep;
      const currentTableau = s.tableaux[s.currentStep];
      const currentBases = s.baseVariables[s.currentStep];

      const newTableau = pivotTableau(currentTableau, pivotRow, pivotCol);
      const newBases = [...currentBases];
      newBases[pivotRow] = variableNames[pivotCol]; // La variable entrante prend la place de la sortante

      // Après avoir fait le pivot, déterminer le prochain pivot ou si c'est terminé
      const nextPivotResult = getPivotPosition(newTableau, newBases, variableNames);
      let nextPivotInfo = null;
      let isNowDone = false;
      let newStatusMessage = s.statusMessage; // Conserver le message sauf si on termine
      let finalSolution = s.solution;
      let finalZ = s.z;

      if (nextPivotResult) {
        if ('status' in nextPivotResult) { // Optimal ou non borné
          isNowDone = true;
          if (nextPivotResult.status === 'optimal') {
            newStatusMessage = "Solution Optimale trouvée.";
          } else {
            newStatusMessage = "Problème Non Borné.";
          }
          const {solution: sol, z: valZ} = extractSolutionAndZ(newTableau, newBases, variableNames);
          finalSolution = sol;
          finalZ = valZ;
        } else { // Pivot suivant possible
          nextPivotInfo = {
            row: nextPivotResult.pivotRow,
            col: nextPivotResult.pivotCol,
            enteringVarName: nextPivotResult.enteringVarName,
            leavingVarName: nextPivotResult.leavingVarName,
          };
          newStatusMessage = `Étape ${s.currentStep + 2}. Variable entrante: ${nextPivotInfo.enteringVarName}, Sortante: ${nextPivotInfo.leavingVarName}.`;
        }
      } else { // Imprévu
          isNowDone = true;
          newStatusMessage = "Erreur: Impossible de déterminer le pivot suivant.";
      }


      return {
        ...s,
        tableaux: [...s.tableaux, newTableau],
        baseVariables: [...s.baseVariables, newBases],
        currentStep: s.currentStep + 1,
        pivotInfoForCurrentStep: nextPivotInfo, // Mettre à jour pour le *nouveau* tableau affiché
        done: isNowDone,
        statusMessage: newStatusMessage,
        solution: finalSolution,
        z: finalZ,
      };
    });
  }, [variableNames]); // extractSolutionAndZ et pivotTableau doivent être stables ou incluses si elles utilisent des props/state

  const prev = useCallback(() => {
    setState(s => {
      if (s.currentStep > 0) {
        const prevStep = s.currentStep - 1;
        // Recalculer pivotInfo pour l'étape précédente
        const prevTableau = s.tableaux[prevStep];
        const prevBases = s.baseVariables[prevStep];
        const prevPivotResult = getPivotPosition(prevTableau, prevBases, variableNames);
        let prevPivotInfoForDisplay = null;
        if (prevPivotResult && 'pivotRow' in prevPivotResult) {
            prevPivotInfoForDisplay = {
                row: prevPivotResult.pivotRow, col: prevPivotResult.pivotCol,
                enteringVarName: prevPivotResult.enteringVarName, leavingVarName: prevPivotResult.leavingVarName
            };
        }

        return {
          ...s,
          currentStep: prevStep,
          done: false, // Si on recule, on n'est plus sur un état "done" (sauf si l'étape 0 était done)
          pivotInfoForCurrentStep: prevPivotInfoForDisplay,
          statusMessage: `Retour à l'étape ${prevStep + 1}.`
        };
      }
      return s;
    });
  }, [variableNames]);

  const reset = useCallback(() => {
    // La réinitialisation est mieux gérée par le parent qui change la clé du SimplexSolverWrapper,
    // ce qui forcera le useSimplexSolver à se réexécuter avec les nouvelles initialTableauData/initialBasesData
    // et donc le useEffect se chargera de la réinitialisation complète.
    // Si on voulait un reset "soft" sans changer la clé :
    // setState(s => ({...initialStateFromProps(initialTableauData, initialBasesData, variableNames)}));
    // Mais cela nécessite d'externaliser la logique d'état initial.
    // Pour l'instant, on suppose que le parent gère le reset complet.
  }, [/* initialTableauData, initialBasesData, variableNames */]);


  // MODIFICATION IMPORTANTE pour getPivotPosition:
  // Elle doit retourner plus d'informations pour l'affichage
  function getPivotPosition(tableau: number[][], bases: string[], allVarNames: string[]):
    { pivotRow: number, pivotCol: number, enteringVarName: string, leavingVarName: string } |
    { status: 'optimal' | 'unbounded' } |
    null // Pour cas d'erreur/inattendu
  {
    if (!tableau || tableau.length === 0 || !tableau[0] || tableau[0].length === 0) return null;
    const lastRowIdx = tableau.length - 1;
    const objectiveRow = tableau[lastRowIdx];
    
    let pivotCol = -1;
    let minObjectiveVal = -1e-9; 

    for (let j = 0; j < objectiveRow.length - 1; j++) {
        if (objectiveRow[j] < minObjectiveVal) {
            minObjectiveVal = objectiveRow[j];
            pivotCol = j;
        }
    }

    if (pivotCol === -1) return { status: 'optimal' };

    let minRatio = Infinity;
    let pivotRow = -1;
    for (let i = 0; i < lastRowIdx; i++) {
      const valInPivotCol = tableau[i][pivotCol];
      if (valInPivotCol > 1e-9) {
        const ratio = tableau[i][tableau[i].length - 1] / valInPivotCol;
        // Le ratio doit être >= 0 pour être considéré
        if (ratio >= -1e-9 && ratio < minRatio - 1e-9) { // ratio >= 0 et plus petit
          minRatio = ratio;
          pivotRow = i;
        } else if (ratio >= -1e-9 && Math.abs(ratio - minRatio) < 1e-9) {
            // Gérer les égalités de ratio (ex: règle de Bland pour éviter cyclage)
            // Pour l'instant, on prend le premier trouvé.
            // Ou vous pourriez comparer les variables sortantes (ex: celle avec le plus petit index dans `allVarNames`)
        }
      }
    }
    if (pivotRow === -1) return { status: 'unbounded' };
    
    return {
        pivotRow,
        pivotCol,
        enteringVarName: allVarNames[pivotCol],
        leavingVarName: bases[pivotRow]
    };
  }
  // extractSolutionAndZ et pivotTableau (pas de changement majeur attendu ici)
  // ...
  function extractSolutionAndZ(finalTableau: number[][], finalBases: string[], allVars: string[]): { solution: Record<string, number>, z: number } {
    const sol: Record<string, number> = {};
    allVars.forEach(vName => { // Initialiser toutes les variables (Xn et Sn)
        if (vName.startsWith("x")) sol[vName] = 0;
    });

    finalBases.forEach((baseVar, rowIndex) => {
      if (baseVar.startsWith("x")) {
        sol[baseVar] = finalTableau[rowIndex][finalTableau[rowIndex].length - 1];
      }
    });
    const zValue = finalTableau[finalTableau.length - 1][finalTableau[0].length - 1];
    return { solution: sol, z: zValue };
  };
  function pivotTableau(tableau: number[][], pivotRow: number, pivotCol: number): number[][] {
    const newTableau = tableau.map(row => [...row]); // Copie profonde
    const pivotVal = newTableau[pivotRow][pivotCol];

    if (Math.abs(pivotVal) < 1e-9) {
        console.error("Erreur: Élément pivot est trop proche de zéro.", pivotVal);
        // Gérer cette erreur, peut-être retourner le tableau original ou lancer une exception
        return tableau; // Pour l'instant, retourner l'original pour éviter division par zéro
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


  return {
    tableaux: state.tableaux,
    baseVariables: state.baseVariables,
    pivotToHighlight: state.pivotInfoForCurrentStep, // Renommé pour clarté
    currentStep: state.currentStep,
    step,
    prev,
    reset, // Laisser le parent gérer le reset via la `key` est souvent plus propre
    done: state.done,
    solution: state.solution,
    z: state.z,
    statusMessage: state.statusMessage,
  };
}