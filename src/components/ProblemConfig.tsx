      
// /components/ProblemConfig.tsx
import { ChangeEvent } from "react";

// Définition plus stricte des props pour une meilleure maintenabilité
interface ProblemConfigProps {
  numVariables: number;
  setNumVariables: (value: number) => void;
  numConstraints: number;
  setNumConstraints: (value: number) => void;
  objective: number[];
  setObjective: (value: number[]) => void;
  constraints: number[][];
  setConstraints: (value: number[][]) => void;
  onConfirm: () => void;
  onConvertToDual: () => void; // Nouvelle prop pour gérer la conversion en dual
}

export default function ProblemConfig({
  numVariables,
  setNumVariables,
  numConstraints,
  setNumConstraints,
  objective,
  setObjective,
  constraints,
  setConstraints,
  onConfirm,
  
  onConvertToDual
}: ProblemConfigProps) {

  const handleNumVariablesChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (isNaN(value) || value < 1) return;
    setNumVariables(value);
    setObjective(Array(value).fill(0));
    setConstraints(Array.from({ length: numConstraints }, () => Array(value + 1).fill(0)));
  };

  const handleNumConstraintsChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (isNaN(value) || value < 1) return;
    setNumConstraints(value);
    setConstraints(Array.from({ length: value }, () => Array(numVariables + 1).fill(0)));
  };

  const handleChangeObjective = (index: number, event: ChangeEvent<HTMLInputElement>) => {
    const newObj = [...objective];
    newObj[index] = parseFloat(event.target.value) || 0;
    setObjective(newObj);
  };

  const handleChangeConstraint = (rowIndex: number, colIndex: number, event: ChangeEvent<HTMLInputElement>) => {
    const newConstr = constraints.map(row => [...row]);
    newConstr[rowIndex][colIndex] = parseFloat(event.target.value) || 0;
    setConstraints(newConstr);
  };

  // Classes Tailwind communes pour les inputs
  const inputBaseClasses = "block w-full px-3 py-2 text-base border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-150";
  const smallInputClasses = "w-20 text-center px-2 py-1 text-base border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-150";
  const labelBaseClasses = "text-sm font-medium text-gray-700 mb-1 block";


  return (
    <div className="max-w-3xl mx-auto p-6 md:p-8 bg-white shadow-xl rounded-lg border border-gray-200 space-y-8">
      {/* Section: Configuration Initiale */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 items-end">
        <div>
          <label htmlFor="numVariables" className={labelBaseClasses}>
            Nombre de variables (x₁, x₂, ...)
          </label>
          <input
            id="numVariables"
            type="number"
            value={numVariables}
            onChange={handleNumVariablesChange}
            min="1"
            className={inputBaseClasses}
          />
        </div>
        <div>
          <label htmlFor="numConstraints" className={labelBaseClasses}>
            Nombre de contraintes
          </label>
          <input
            id="numConstraints"
            type="number"
            value={numConstraints}
            onChange={handleNumConstraintsChange}
            min="1"
            className={inputBaseClasses}
          />
        </div>
      </div>

      <hr className="border-gray-200" />

      {/* Section: Fonction Objectif */}
      <div>
        <h2 className="text-lg font-semibold text-indigo-700 mb-3">
          Fonction Objectif (Maximiser Z)
        </h2>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <span className="text-gray-800 font-medium text-lg">Z =</span>
          {objective.map((val, i) => (
            <div key={i} className="flex items-center">
              <input
                type="number"
                value={val}
                onChange={(e) => handleChangeObjective(i, e)}
                className={smallInputClasses}
                aria-label={`Coefficient de x${i + 1}`}
              />
              <span className="ml-1.5 mr-2 text-gray-700 text-base">
                x<sub>{i + 1}</sub>
              </span>
              {i < objective.length - 1 && <span className="text-gray-700 text-lg mx-1">+</span>}
            </div>
          ))}
        </div>
      </div>

      <hr className="border-gray-200" />

      {/* Section: Contraintes */}
      <div>
        <h2 className="text-lg font-semibold text-indigo-700 mb-3">
          Contraintes <span className="text-sm font-normal text-gray-500">(de type ≤)</span>
        </h2>
        <div className="space-y-4">
          {constraints.map((row, i) => (
            <div key={i} className="flex flex-wrap items-center gap-x-3 gap-y-2 p-3 bg-gray-50 rounded-md border border-gray-200">
              <span className="text-gray-600 font-medium mr-1">C{i + 1}:</span>
              {row.slice(0, -1).map((val, j) => (
                <div key={j} className="flex items-center">
                  <input
                    type="number"
                    value={val}
                    onChange={(e) => handleChangeConstraint(i, j, e)}
                    className={smallInputClasses}
                    aria-label={`Coefficient de x${j + 1} pour la contrainte ${i + 1}`}
                  />
                  <span className="ml-1.5 mr-2 text-gray-700 text-base">
                    x<sub>{j + 1}</sub>
                  </span>
                  {j < numVariables - 1 && <span className="text-gray-700 text-lg mx-1">+</span>}
                </div>
              ))}
              <span className="text-gray-700 text-lg mx-1">≤</span>
              <input // Terme de droite (RHS)
                type="number"
                value={row[row.length - 1]}
                onChange={(e) => handleChangeConstraint(i, row.length - 1, e)}
                className={`${smallInputClasses} w-24`} // Un peu plus large pour le RHS
                aria-label={`Terme de droite pour la contrainte ${i + 1}`}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="pt-4 flex flex-col sm:flex-row justify-center items-center gap-4">
        <button
          onClick={onConfirm}
          className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-150 ease-in-out text-base"
        >
          Valider et Résoudre (Primal)
        </button>
        <button
          onClick={onConvertToDual} // Appel de la nouvelle fonction
          className="w-full sm:w-auto px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all duration-150 ease-in-out text-base"
        >
          Trouver la Forme Duale
        </button>
      </div>

    </div>
  );
}

    