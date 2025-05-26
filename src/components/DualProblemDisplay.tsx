// /components/DualProblemDisplay.tsx

// Interface pour les données du problème (identique à celle dans HomePage)
interface ProblemData {
    numVariables: number;
    numConstraints: number;
    objective: number[]; // Coefficients de la fonction objectif du dual
    constraints: number[][]; // Matrice des contraintes du dual [coefficients | RHS]
    variableNames?: string[]; // Noms des variables du dual (ex: y1, y2)
    constraintNames?: string[]; // Noms/Labels pour les contraintes du dual
    objectiveType?: "maximize" | "minimize"; // Typiquement "minimize" pour le dual d'un primal de maximisation
  }
  
  interface DualProblemDisplayProps {
    problemData: ProblemData;
    onBackToPrimalConfig: () => void;
    onSolveDual: () => void; // Décommenter et utiliser quand vous implémenterez la résolution du dual
  }
  
  export default function DualProblemDisplay({
    problemData,
    onBackToPrimalConfig,
    onSolveDual,
  }: DualProblemDisplayProps) {
    const {
      objective,
      constraints,
      variableNames = [],
      // constraintNames = [], // Pas utilisé dans cette version d'affichage, mais pourrait l'être
      objectiveType = "minimize",
    } = problemData;
  
    // Classes Tailwind pour simuler l'apparence des inputs désactivés
    const displayFieldClasses = "inline-block min-w-[4rem] text-center px-3 py-1.5 text-base bg-gray-100 border border-gray-300 rounded-md shadow-sm";
    const labelBaseClasses = "text-sm font-medium text-gray-700 mb-1 block"; // Si vous aviez des labels complexes
  
    return (
      <div className="max-w-3xl mx-auto p-6 md:p-8 bg-white shadow-xl rounded-lg border border-gray-200 space-y-8">
        <h2 className="text-2xl font-bold text-center text-teal-700 mb-2">
          Problème Dual Correspondant
        </h2>
  
        {/* Section: Fonction Objectif du Dual */}
        <div>
          <h3 className="text-lg font-semibold text-teal-600 mb-3">
            Fonction Objectif ({objectiveType === "minimize" ? "Minimiser W" : "Maximiser W"})
          </h3>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 p-4 bg-gray-50 rounded-md border border-gray-200">
            <span className="text-gray-800 font-medium text-lg">W =</span>
            {objective.map((val, i) => (
              <div key={`obj-dual-${i}`} className="flex items-center">
                <span className={displayFieldClasses}>
                  {val.toFixed(2)}
                </span>
                <span className="ml-1.5 mr-2 text-gray-700 text-base">
                  {variableNames[i] || `y${i + 1}`} {/* Utilise les noms fournis ou y par défaut */}
                </span>
                {i < objective.length - 1 && <span className="text-gray-700 text-lg mx-1">+</span>}
              </div>
            ))}
          </div>
        </div>
  
        <hr className="border-gray-200" />
  
        {/* Section: Contraintes du Dual */}
        <div>
          <h3 className="text-lg font-semibold text-teal-600 mb-3">
            Contraintes <span className="text-sm font-normal text-gray-500">(de type ≥)</span>
          </h3>
          <div className="space-y-4">
            {constraints.map((row, i) => (
              <div key={`constr-dual-${i}`} className="flex flex-wrap items-center gap-x-3 gap-y-2 p-3 bg-gray-50 rounded-md border border-gray-200">
                <span className="text-gray-600 font-medium mr-1">
                  {/* {constraintNames[i] || `C'${i + 1}`}: */} {/* Optionnel: Label de contrainte */}
                  Contrainte {i + 1}:
                </span>
                {row.slice(0, -1).map((val, j) => ( // Coefficients des variables
                  <div key={`constr-dual-${i}-var-${j}`} className="flex items-center">
                    <span className={displayFieldClasses}>
                      {val.toFixed(2)}
                    </span>
                    <span className="ml-1.5 mr-2 text-gray-700 text-base">
                      {variableNames[j] || `y${j + 1}`}
                    </span>
                    {j < row.length - 2 && <span className="text-gray-700 text-lg mx-1">+</span>} {/* -2 car slice et RHS */}
                  </div>
                ))}
                <span className="text-gray-700 text-lg mx-1">≥</span> {/* Le dual est typiquement >= */}
                <span className={`${displayFieldClasses} min-w-[5rem]`}> {/* Terme de droite (RHS) */}
                  {row[row.length - 1].toFixed(2)}
                </span>
              </div>
            ))}
             <p className="text-xs text-center text-gray-500 mt-2">
                  Toutes les variables {variableNames.length > 0 ? variableNames.join(', ') : 'yᵢ'} ≥ 0
              </p>
          </div>
        </div>
  
        {/* Espace pour la méthode de résolution du dual (à venir) */}
        <div className="mt-6 pt-6 border-t border-gray-200 text-center">
        <button
          onClick={onSolveDual} // Utiliser la prop
          className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-150 ease-in-out text-base"
        >
          Résoudre le Problème Dual (via Transformation)
        </button>
      </div>

  
        <div className="pt-4 text-center">
          <button
            onClick={onBackToPrimalConfig}
            className="px-6 py-2 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-all duration-150 ease-in-out"
          >
            Retourner à la Configuration du Primal
          </button>
        </div>
      </div>
    );
  }