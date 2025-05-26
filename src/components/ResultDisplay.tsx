import { BadgeCheck, AlertTriangle, Info } from "lucide-react";

interface SolutionRecord { [key: string]: number; }

interface ResultDisplayProps {
  currentSolution: SolutionRecord; // Solution du problème qui vient d'être résolu (variables de base du tableau final)
  currentZ: number;               // Valeur de l'objectif du problème résolu (Z* ou (-W)*)
  statusMessage: string;
  isDualProblemBeingDisplayed?: boolean; // Vrai si le problème *actuel* est le dual (transformé)
  finalOptimalTableau: number[][];       // Le tableau simplexe final complet du problème résolu
  allColumnNamesInFinalTableau: string[];// Noms des variables dans les colonnes de ce tableau (ex: x1,s_x1 ou y1,s_y1). NE PAS INCLURE 'b'
  namesForOtherProblemSolution: string[];// Noms des variables de l'autre problème (ex: ['y1', 'y2'] ou ['x1', 'x2'])
}

export default function ResultDisplay({
  currentSolution,
  currentZ,
  statusMessage,
  isDualProblemBeingDisplayed = false,
  finalOptimalTableau,
  allColumnNamesInFinalTableau, // Ces noms doivent correspondre aux colonnes du tableau avant la colonne 'b'
  namesForOtherProblemSolution,
}: ResultDisplayProps) {
  const isOptimal = statusMessage.toLowerCase().includes("optimale");
  const isUnbounded = statusMessage.toLowerCase().includes("non borné");

  // Pour le problème ACTUELLEMENT affiché/résolu
  const currentSolvedObjectiveName = isDualProblemBeingDisplayed ? "-W" : "Z"; // Ce qui a été optimisé
  const currentFinalObjectiveName = isDualProblemBeingDisplayed ? "W" : "Z";  // Ce que l'utilisateur s'attend à voir
  const currentFinalObjectiveValue = isDualProblemBeingDisplayed ? -currentZ : currentZ; // W* = -(-W)*

  // Filtrer les variables de décision (x_i ou y_i) de la solution actuelle
  const currentDecisionVariables = Object.entries(currentSolution)
    .filter(([variableName, value]) => {
      const varPrefix = isDualProblemBeingDisplayed ? "y" : "x";
      return variableName.startsWith(varPrefix) && Math.abs(value) > 1e-9;
    })
    .sort(([varA], [varB]) => (parseInt(varA.substring(1), 10) - parseInt(varB.substring(1), 10)));

  // Pour la solution de l'AUTRE problème (déduite)
  let otherProblemSolutionValues: SolutionRecord = {};
  const otherProblemFullName = isDualProblemBeingDisplayed ? "Primal (variables xᵢ)" : "Dual (variables yᵢ)";
  const otherProblemObjectiveShortName = isDualProblemBeingDisplayed ? "Z" : "W";
  // La valeur optimale de l'objectif de l'autre problème est la même que celle du problème actuel
  let otherProblemOptimalValueText = isOptimal ? currentFinalObjectiveValue.toFixed(2) : "N/A";

  if (isOptimal && finalOptimalTableau && finalOptimalTableau.length > 0 && allColumnNamesInFinalTableau.length > 0) {
    const objectiveRowOfFinalTableau = finalOptimalTableau[finalOptimalTableau.length - 1];
    // Le préfixe des variables d'écart DANS LE TABLEAU ACTUEL
    // sous lesquelles on lit la solution de l'AUTRE problème.
    const slackPrefixInCurrentTableau = isDualProblemBeingDisplayed ? "s_y" : "s_x";

    namesForOtherProblemSolution.forEach((otherVarName, index) => {
      // La `otherVarName` (ex: y1 ou x1) correspond à une variable d'écart du tableau actuel.
      // Par exemple, si on a résolu le primal, `otherVarName` est 'y1' (dual),
      // qui correspond à la 1ère contrainte du primal, donc à la variable d'écart 's_x1' dans le tableau primal.
      const correspondingSlackNameInTableau = `${slackPrefixInCurrentTableau}${index + 1}`;
      const columnIndex = allColumnNamesInFinalTableau.indexOf(correspondingSlackNameInTableau);

      if (columnIndex !== -1 && objectiveRowOfFinalTableau[columnIndex] !== undefined) {
        // CONVENTION IMPORTANTE:
        // On suppose que la ligne Z du tableau optimal (pour un problème de Max) contient les Zj-Cj (ou équivalents),
        // qui sont >= 0 à l'optimalité. Ces valeurs sous les colonnes des slacks initiaux
        // sont directement les valeurs des variables de l'autre problème (y_i* ou x_i*).
        // Si votre convention de ligne Z est différente (ex: Cj-Zj <= 0), vous devrez peut-être inverser le signe ici.
        otherProblemSolutionValues[otherVarName] = objectiveRowOfFinalTableau[columnIndex];
      } else {
        otherProblemSolutionValues[otherVarName] = 0; // Valeur par défaut si la colonne n'est pas trouvée
        console.warn(
          `Colonne pour la variable d'écart ${correspondingSlackNameInTableau} non trouvée dans le tableau final. Impossible de lire la variable ${otherVarName} de l'autre problème.`
        );
      }
    });
  }

  const otherDecisionVariablesToDisplay = Object.entries(otherProblemSolutionValues)
    .filter(([_, value]) => Math.abs(value) > 1e-9)
    .sort(([varA], [varB]) => (parseInt(varA.substring(1), 10) - parseInt(varB.substring(1), 10)));

  // Logique des icônes et couleurs (inchangée)
  let IconComponent = Info;
  let iconColor = "text-blue-600", borderColor = "border-blue-300", bgColor = "bg-blue-50", titleColor = "text-blue-800", valueColor = "text-blue-700";

  if (isOptimal) {
    IconComponent = BadgeCheck; iconColor = "text-green-600"; borderColor = "border-green-300"; bgColor = "bg-green-50"; titleColor = "text-green-800"; valueColor = "text-green-700";
  } else if (isUnbounded) {
    IconComponent = AlertTriangle; iconColor = "text-yellow-600"; borderColor = "border-yellow-300"; bgColor = "bg-yellow-50"; titleColor = "text-yellow-800"; valueColor = "text-yellow-700";
  }

  return (
    <div className={`mt-8 p-6 rounded-2xl shadow-md border ${borderColor} ${bgColor}`}>
      <div className="flex items-center gap-3 mb-4">
        <IconComponent className={`${iconColor} h-6 w-6`} />
        <h2 className={`text-xl font-bold ${titleColor}`}>
          {isDualProblemBeingDisplayed && isOptimal
            ? `Solution Optimale du Dual (obtenue via Max ${currentSolvedObjectiveName})`
            : statusMessage}
        </h2>
      </div>

      {!isUnbounded && (
        <p className="text-lg text-gray-800">
          Valeur optimale de {currentFinalObjectiveName} :{" "}
          <span className={`font-semibold ${valueColor}`}>{currentFinalObjectiveValue.toFixed(2)}</span>
          {isDualProblemBeingDisplayed && isOptimal && (
            <span className="text-sm text-gray-600">
              {" "} (où {currentSolvedObjectiveName}* = {currentZ.toFixed(2)})
            </span>
          )}
        </p>
      )}
      {isUnbounded && (
        <p className="text-lg text-gray-800">
          La fonction objectif ({currentFinalObjectiveName}) peut{" "}
          {isDualProblemBeingDisplayed ? "diminuer" : "augmenter"} indéfiniment.
        </p>
      )}

      {(isOptimal || (!isUnbounded && currentDecisionVariables.length > 0)) && (
        <div className="mt-3">
          <p className="text-gray-700">
            Variables de décision ({isDualProblemBeingDisplayed ? "yᵢ" : "xᵢ"}) :
          </p>
          <ul className="mt-1 space-y-1 text-gray-700 list-disc list-inside">
            {currentDecisionVariables.length > 0 ? (
              currentDecisionVariables.map(([variable, value]) => (
                <li key={variable}>
                  {variable} = <span className="font-semibold">{value.toFixed(2)}</span>
                </li>
              ))
            ) : (<li>(Toutes les variables de décision de ce problème sont nulles)</li>)}
          </ul>
        </div>
      )}
      {isOptimal && currentDecisionVariables.length === 0 && Object.values(currentSolution).every(v => Math.abs(v) < 1e-9) && (
         <p className="mt-2 text-sm text-gray-600">(Toutes les variables de décision de la solution actuelle sont nulles)</p>
      )}

      {/* Affichage de la solution de l'AUTRE problème (déduite) */}
      {isOptimal && (
        <div className="mt-6 pt-4 border-t border-gray-300">
          <h3 className="text-md font-semibold text-gray-700 mb-2">
            Solution déduite du Problème {otherProblemFullName} :
          </h3>
          <p className="text-gray-800">
            Valeur optimale de {otherProblemObjectiveShortName} :{" "}
            <span className={`font-semibold ${valueColor}`}>{otherProblemOptimalValueText}</span>
          </p>
          {otherDecisionVariablesToDisplay.length > 0 ? (
            <div className="mt-1">
              <p className="text-gray-700">Variables de décision :</p>
              <ul className="mt-1 space-y-1 text-sm text-gray-700 list-disc list-inside">
                {otherDecisionVariablesToDisplay.map(([variable, value]) => (
                  <li key={`other-deduced-${variable}`}>
                    {variable} = <span className="font-semibold">{value.toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-sm text-gray-600 italic mt-1">(Toutes les variables de décision déduites sont nulles ou non trouvées à partir de ce tableau)</p>
          )}
        </div>
      )}
    </div>
  );
}
    


