// src/components/SimplexSolverWrapper.tsx

import { useSimplexSolver } from "@/hooks/useSimplexSolver"; // Assurez-vous que le chemin est correct
import SimplexTable from "./SimplexTable";
import StepControls from "./StepsControls";
import ResultDisplay from "./ResultDisplay";
// import { useEffect } from "react"; // Pas besoin de useEffect ici pour le moment

// Définition des Props
interface Props {
  initialTableau: number[][];
  baseVars: string[]; // Noms des variables de base initiales pour CE tableau
  variableNames: string[]; // Noms de TOUTES les colonnes de CE tableau (ex: x1, x2, s_x1, s_x2)
  onReset: () => void;
  isSolvingDual?: boolean;
  originalVariablesOfOtherProblem?: string[]; // Noms des x_i ou y_i à lire depuis la ligne Z
}

export default function SimplexSolverWrapper({
  initialTableau,
  baseVars,
  variableNames,
  onReset,
  isSolvingDual = false,
  originalVariablesOfOtherProblem = [], // Valeur par défaut pour éviter undefined
}: Props) {
  // Passer variableNames (tous les noms de colonnes du tableau actuel)
  // et baseVars (noms des variables de base initiales pour ce tableau) à useSimplexSolver.
  const solver = useSimplexSolver(initialTableau, variableNames, baseVars);

  const {
    tableaux,
    baseVariables, // Tableau des noms des variables de base à chaque étape
    pivotToHighlight,
    currentStep,
    step,
    prev,
    // reset, // La fonction reset du parent (via onReset et changement de clé) est souvent plus robuste
    done,
    solution, // Record<string, number> des variables de base optimales du tableau actuel
    z,        // Valeur de l'objectif du problème que le solveur a résolu (Z* ou (-W)*)
    statusMessage,
  } = solver;

  // Garde pour le rendu initial ou si les données ne sont pas prêtes
  if (
    !tableaux || tableaux.length === 0 || !tableaux[currentStep] ||
    !baseVariables || baseVariables.length === 0 || !baseVariables[currentStep]
  ) {
    return (
      <div className="text-center p-8">
        <p className="text-lg text-gray-600">{statusMessage || "Chargement ou initialisation du solveur..."}</p>
      </div>
    );
  }

  const currentTableauToDisplay = tableaux[currentStep];
  const currentBasesToDisplay = baseVariables[currentStep];
  const finalTableauForResults = done ? tableaux[tableaux.length - 1] : null;

  return (
    <>
      <SimplexTable
        tableau={currentTableauToDisplay}
        // `variableNames` devrait contenir les noms de toutes les colonnes AVANT 'b'
        // Si votre `initialTableau` contient déjà la colonne 'b', alors `SimplexTable`
        // doit être conscient de cela et ne pas s'attendre à un `headers` qui inclut 'b' si `variableNames` le fait déjà.
        // Pour l'instant, je suppose que `variableNames` sont les noms des variables (x1, s1 etc.) et 'b' est ajouté.
        headers={[...variableNames, "b"]}
        baseVariables={currentBasesToDisplay}
        pivotInfo={!done ? pivotToHighlight : null}
      />

      {(!done || currentStep > 0) && (
        <StepControls
          onNext={step}
          onPrev={prev}
          onReset={onReset} // Appelle le onReset du parent (HomePage)
          step={currentStep}
          maxStep={done ? tableaux.length : tableaux.length + (pivotToHighlight ? 1 : 0)}
        />
      )}

      {done && solution && typeof z === 'number' && finalTableauForResults && (
        <ResultDisplay
          currentSolution={solution}
          currentZ={z}
          statusMessage={statusMessage}
          isDualProblemBeingDisplayed={isSolvingDual}
          finalOptimalTableau={finalTableauForResults}
          allColumnNamesInFinalTableau={variableNames} // Noms de toutes les colonnes (sans 'b') du tableau résolu
          namesForOtherProblemSolution={originalVariablesOfOtherProblem}
        />
      )}

      {/* Afficher le message initial seulement, ou des messages d'étape si vous en avez */}
      {!done && statusMessage && currentStep === 0 && (
        <p className="text-center mt-4 text-sm text-gray-500">{statusMessage}</p>
      )}
    </>
  );
}