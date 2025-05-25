// src/components/SimplexSolverWrapper.tsx

import { useSimplexSolver } from "@/hooks/useSimplexSolver";
import SimplexTable from "./SimplexTable";
import StepControls from "./StepsControls";
import ResultDisplay from "./ResultDisplay";

// ... imports ...

export default function SimplexSolverWrapper({ initialTableau, baseVars, variableNames, onReset }: Props) {
    const solver = useSimplexSolver(initialTableau, baseVars, variableNames);
    const {
        tableaux,
        baseVariables,
        pivotToHighlight, // <- Nouveau nom
        currentStep,
        step, prev, reset, // reset du hook, on utilisera onReset du parent
        done,
        solution,
        z,
        statusMessage,
      } = solver;
    
      if (!tableaux || tableaux.length === 0 || !tableaux[currentStep]) {
        return <div className="text-center p-8"><p className="text-lg text-gray-600">{statusMessage || "Chargement..."}</p></div>;
      }
    
      const currentTableauToDisplay = tableaux[currentStep];
      const currentBasesToDisplay = baseVariables[currentStep];
    
      return (
        <>
          <SimplexTable
            tableau={currentTableauToDisplay}
            headers={[...variableNames, "b"]}
            baseVariables={currentBasesToDisplay}
            // Passer les informations du pivot pour mise en évidence
            pivotInfo={!done ? pivotToHighlight : null} // pivotToHighlight contient {row, col, enteringVarName, leavingVarName}
            // Les props `entering` et `leaving` ne sont plus nécessaires si `pivotInfo` fait le job
          />
    
          {/* Les contrôles ne s'affichent que si l'on n'est pas 'done' OU s'il y a des étapes précédentes */}
          {(!done || currentStep > 0) && (
            <StepControls
              onNext={step}
              onPrev={prev}
              onReset={() => { // Appelle le onReset du parent (HomePage)
                onReset();
              }}
              step={currentStep} // step est l'index actuel
              // maxStep est maintenant dynamique et peut augmenter
              // Pour l'instant, on peut le laisser comme tableaux.length.
              // Si 'done' est vrai, le bouton 'next' sera désactivé par la logique interne de StepControls
              // ou par une désactivation explicite ici.
              maxStep={done ? tableaux.length : tableaux.length + (pivotToHighlight ? 1 : 0) } // Approximatif, le bouton Next doit se désactiver si 'done'
                                                                                          // ou si pivotToHighlight est null
            />
          )}
          {/* Afficher ResultDisplay quand 'done' est vrai */}
          {done && (
            <ResultDisplay
              solution={solution}
              z={z}
              statusMessage={statusMessage}
            />
          )}
          {/* Optionnel: afficher le statusMessage même si pas 'done' */}
          {!done && statusMessage && <p className="text-center mt-4 text-sm text-gray-500">{statusMessage}</p>}
        </>
      );
  
    
  
    
  }