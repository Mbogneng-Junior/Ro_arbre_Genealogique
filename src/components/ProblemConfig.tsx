// /components/ProblemConfig.tsx
import { ChangeEvent } from "react";

// Définition plus stricte des props pour une meilleure maintenabilité
interface ProblemConfigProps {
  numVariables: number;
  setNumVariables: (value: number) => void;
  numConstraints: number;
  setNumConstraints: (value: number) => void;
  objective: number[] | undefined; // Permettre undefined pour être robuste
  setObjective: (value: number[]) => void;
  constraints: number[][] | undefined; // Permettre undefined pour être robuste
  setConstraints: (value: number[][]) => void;
  onConfirm: () => void;
  onConvertToDual: () => void;
}

export default function ProblemConfig({
  numVariables,
  setNumVariables,
  numConstraints,
  setNumConstraints,
  objective, // Peut maintenant être undefined selon la prop
  setObjective,
  constraints, // Peut maintenant être undefined selon la prop
  setConstraints,
  onConfirm,
  onConvertToDual,
}: ProblemConfigProps) {
  const handleNumVariablesChange = (e: ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const value = parseInt(rawValue, 10);

    if (rawValue === "" || isNaN(value) || value < 1) {
      // Si le champ est vidé, on pourrait vouloir mettre numVariables à 0
      // et réinitialiser objective/constraints à [].
      // Pour l'instant, on se contente de ne pas propager une valeur invalide.
      // Si vous souhaitez autoriser 0 variables, cette logique devrait changer.
      // Par exemple, si value devient 0, vous pourriez faire:
      // setNumVariables(0);
      // setObjective([]);
      // setConstraints(Array.from({ length: numConstraints }, () => Array(0 + 1).fill(0)));
      // Mais pour l'instant, on exige au moins 1 variable, donc on retourne.
      return;
    }
    setNumVariables(value);
    setObjective(Array(value).fill(0));
    setConstraints(
      Array.from({ length: numConstraints }, () => Array(value + 1).fill(0))
    );
  };

  const handleNumConstraintsChange = (e: ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const value = parseInt(rawValue, 10);
    if (rawValue === "" || isNaN(value) || value < 0) { // Permettre 0 contraintes
        if (rawValue === "" && numConstraints > 0) {
            // Gérer l'effacement du champ si nécessaire
        }
        // Si vous voulez que 0 contraintes soit valide:
        // setNumConstraints(0);
        // setConstraints([]);
        // return;
        return; // Pour l'instant, on ne fait rien si < 0 ou NaN.
    }
    setNumConstraints(value);
    // Si value est 0, constraints deviendra [].
    // Si numVariables est 0, Array(0+1) est Array(1).
    setConstraints(
      Array.from({ length: value }, () => Array(numVariables + 1).fill(0))
    );
  };

  const handleChangeObjective = (
    index: number,
    event: ChangeEvent<HTMLInputElement>
  ) => {
    // S'assurer que objective est un tableau avant de le copier
    const currentObjective = Array.isArray(objective) ? objective : [];
    const newObj = [...currentObjective];
    newObj[index] = parseFloat(event.target.value) || 0;
    setObjective(newObj);
  };

  const handleChangeConstraint = (
    rowIndex: number,
    colIndex: number,
    event: ChangeEvent<HTMLInputElement>
  ) => {
    // S'assurer que constraints est un tableau avant de le mapper
    const currentConstraints = Array.isArray(constraints) ? constraints : [];
    const newConstr = currentConstraints.map((row) => Array.isArray(row) ? [...row] : []); // Assurer que row est aussi un tableau
    if (newConstr[rowIndex]) { // Vérifier que la ligne existe
        newConstr[rowIndex][colIndex] = parseFloat(event.target.value) || 0;
    }
    setConstraints(newConstr);
  };

  // Classes Tailwind communes pour les inputs
  const inputBaseClasses =
    "block w-full px-3 py-2 text-base border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-150";
  const smallInputClasses =
    "w-20 text-center px-2 py-1 text-base border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-150";
  const labelBaseClasses = "text-sm font-medium text-gray-700 mb-1 block";

  // Garde pour s'assurer que objective et constraints sont des tableaux avant d'appeler .map
  const objectiveArray = Array.isArray(objective) ? objective : [];
  const constraintsArray = Array.isArray(constraints) ? constraints : [];

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
            value={numVariables} // Doit être un nombre, pas undefined
            onChange={handleNumVariablesChange}
            min="1" // HTML5 validation
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
            value={numConstraints} // Doit être un nombre, pas undefined
            onChange={handleNumConstraintsChange}
            min="0" // Permettre 0 contraintes
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
          {objectiveArray.map((val, i) => (
            <div key={`obj-${i}`} className="flex items-center">
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
              {i < objectiveArray.length - 1 && (
                <span className="text-gray-700 text-lg mx-1">+</span>
              )}
            </div>
          ))}
          {objectiveArray.length === 0 && numVariables > 0 && (
            <span className="text-sm text-gray-500 italic">
              (Les coefficients apparaîtront une fois le nombre de variables défini)
            </span>
          )}
        </div>
      </div>

      <hr className="border-gray-200" />

      {/* Section: Contraintes */}
      <div>
        <h2 className="text-lg font-semibold text-indigo-700 mb-3">
          Contraintes{" "}
          <span className="text-sm font-normal text-gray-500">
            (de type ≤)
          </span>
        </h2>
        <div className="space-y-4">
          {constraintsArray.map((row, i) => (
            <div
              key={`constr-${i}`}
              className="flex flex-wrap items-center gap-x-3 gap-y-2 p-3 bg-gray-50 rounded-md border border-gray-200"
            >
              <span className="text-gray-600 font-medium mr-1">C{i + 1}:</span>
              {Array.isArray(row) && row.slice(0, -1).map((val, j) => (
                <div key={`constr-${i}-var-${j}`} className="flex items-center">
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
                  {j < numVariables - 1 && ( // numVariables est la prop, indiquant combien de x_j afficher
                    <span className="text-gray-700 text-lg mx-1">+</span>
                  )}
                </div>
              ))}
              <span className="text-gray-700 text-lg mx-1">≤</span>
              {Array.isArray(row) && row.length > 0 && (
                <input
                  type="number"
                  value={row[row.length - 1]}
                  onChange={(e) => handleChangeConstraint(i, row.length - 1, e)}
                  className={`${smallInputClasses} w-24`}
                  aria-label={`Terme de droite pour la contrainte ${i + 1}`}
                />
              )}
            </div>
          ))}
          {constraintsArray.length === 0 && numConstraints > 0 && (
            <span className="text-sm text-gray-500 italic">
              (Les contraintes apparaîtront une fois leur nombre défini)
            </span>
          )}
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
          onClick={onConvertToDual}
          className="w-full sm:w-auto px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all duration-150 ease-in-out text-base"
        >
          Trouver la Forme Duale
        </button>
      </div>
    </div>
  );
}