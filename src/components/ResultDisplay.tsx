// Dans ResultDisplay.tsx
import { BadgeCheck, AlertTriangle, Info } from "lucide-react"; // Ajout d'icônes pour différents statuts

interface ResultDisplayProps {
  solution: Record<string, number>; // Modifié pour correspondre à useSimplexSolver
  z: number;
  statusMessage: string; // Ajouté
}

export default function ResultDisplay({ solution, z, statusMessage }: ResultDisplayProps) {
  const isOptimal = statusMessage.toLowerCase().includes("optimale");
  const isUnbounded = statusMessage.toLowerCase().includes("non borné");
  // Vous pouvez ajouter d'autres conditions si nécessaire (ex: "max iterations")

  let IconComponent = Info;
  let iconColor = "text-blue-600";
  let borderColor = "border-blue-300";
  let bgColor = "bg-blue-50";
  let titleColor = "text-blue-800";
  let valueColor = "text-blue-700";

  if (isOptimal) {
    IconComponent = BadgeCheck;
    iconColor = "text-green-600";
    borderColor = "border-green-300";
    bgColor = "bg-green-50";
    titleColor = "text-green-800";
    valueColor = "text-green-700";
  } else if (isUnbounded) {
    IconComponent = AlertTriangle;
    iconColor = "text-yellow-600";
    borderColor = "border-yellow-300";
    bgColor = "bg-yellow-50";
    titleColor = "text-yellow-800";
    valueColor = "text-yellow-700";
  }
  // Ajoutez d'autres `else if` pour d'autres statuts si besoin

  const decisionVariables = Object.entries(solution)
    .filter(([variable, value]) => variable.startsWith("x") && Math.abs(value) > 1e-9) // Afficher x vars non nulles
    .sort(([varA], [varB]) => { // Trier les variables (ex: x1, x2, x10)
        const numA = parseInt(varA.substring(1));
        const numB = parseInt(varB.substring(1));
        return numA - numB;
    });


  return (
    <div className={`mt-8 p-6 rounded-2xl shadow-md border ${borderColor} ${bgColor}`}>
      <div className="flex items-center gap-3 mb-4">
        <IconComponent className={`${iconColor} h-6 w-6`} />
        <h2 className={`text-xl font-bold ${titleColor}`}>{statusMessage}</h2>
      </div>

      {/* Afficher la valeur de Z si elle est pertinente (pas pour "non borné" typiquement) */}
      {!isUnbounded && (
        <p className="text-lg text-gray-800">
          Valeur {isOptimal ? "optimale" : ""} de Z :{" "}
          <span className={`font-semibold ${valueColor}`}>{z.toFixed(2)}</span>
        </p>
      )}
       {isUnbounded && (
        <p className="text-lg text-gray-800">
          La fonction objectif peut augmenter indéfiniment.
        </p>
      )}


      {/* Afficher les variables de décision si une solution finie est trouvée */}
      {(isOptimal || (!isUnbounded && decisionVariables.length > 0)) && (
        <>
          <p className="mt-3 text-gray-700">Variables de décision :</p>
          <ul className="mt-1 space-y-1 text-gray-700 list-disc list-inside">
            {decisionVariables.length > 0 ? (
              decisionVariables.map(([variable, value]) => (
                <li key={variable}>
                  {variable} = <span className="font-semibold">{value.toFixed(2)}</span>
                </li>
              ))
            ) : (
              <li>Aucune variable de décision avec une valeur non nulle.</li>
            )}
          </ul>
        </>
      )}
       {isOptimal && decisionVariables.length === 0 && Object.values(solution).every(v => Math.abs(v) < 1e-9) && (
         <p className="mt-2 text-sm text-gray-600"> (Toutes les variables de décision sont nulles dans la solution optimale)</p>
       )}
    </div>
  );
}