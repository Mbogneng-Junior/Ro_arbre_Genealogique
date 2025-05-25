// /components/SimplexTable.tsx
import { motion } from "framer-motion";
import classNames from "classnames";

interface SimplexTableProps {
  tableau: number[][];
  headers: string[];
  baseVariables: string[];
  pivotInfo: {
    row?: number;
    col?: number;
    enteringVarName?: string;
    leavingVarName?: string;
  } | null;
}

export default function SimplexTable({ tableau, headers, baseVariables, pivotInfo }: SimplexTableProps) {
  if (!tableau || tableau.length === 0 || !tableau[0] || tableau[0].length === 0) {
    return <p className="text-center text-red-500">Données du tableau non disponibles.</p>;
  }

  return (
    <div className="overflow-x-auto mt-6 bg-white p-4 shadow-lg rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-300 border border-gray-300">
        <thead className="bg-indigo-600 text-white">
          <tr>
            <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider border-r border-indigo-400">
              Base
            </th>
            {headers.map((header, index) => {
              const isPivotColHeader = pivotInfo?.col === index && index < headers.length -1; // Exclure 'b'
              return (
                <th
                  key={header}
                  className={`px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider 
                              ${index < headers.length - 1 ? 'border-r border-indigo-400' : ''}
                              ${isPivotColHeader ? 'bg-blue-500 ring-1 ring-white' : ''}`} // Style pour la colonne entrante
                >
                  {header}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {tableau.map((row, i) => {
            const isPivotRow = pivotInfo?.row === i && i < tableau.length - 1;
            const isObjectiveRow = i === tableau.length - 1;

            return (
              <tr
                key={i}
                className={`${isPivotRow ? "bg-orange-100" : ""} 
                            ${isObjectiveRow ? "border-t-2 border-gray-700 bg-gray-100" : ""}`}
              >
                <td
                  className={`px-3 py-2 border border-gray-300 font-medium 
                              ${isPivotRow ? "text-orange-700 font-bold" : "text-gray-700"}
                              ${isObjectiveRow ? "text-indigo-700 font-bold" : ""}`}
                >
                  {isObjectiveRow ? "Z" : (baseVariables[i] || "")}
                </td>
                {row.map((cell, j) => {
                  const isPivotCol = pivotInfo?.col === j && j < headers.length -1; // Exclure 'b'
                  const isPivotElement = isPivotRow && isPivotCol;

                  let cellClasses = "px-3 py-2 border border-gray-300 text-right tabular-nums";
                  if (isPivotElement) {
                    cellClasses += " bg-orange-300 text-orange-900 font-bold ring-2 ring-orange-500";
                  } else if (isPivotRow) {
                    cellClasses += " bg-orange-100 text-orange-700";
                  } else if (isPivotCol && !isObjectiveRow) {
                    cellClasses += " bg-blue-100 text-blue-700";
                  }
                  // Style spécifique pour la valeur de Zj-Cj dans la colonne entrante
                  if (isObjectiveRow && isPivotCol){
                    cellClasses += " text-blue-800 font-bold bg-blue-100";
                  } else if (isObjectiveRow) {
                    cellClasses += " font-semibold text-gray-800";
                  }

                  return (
                    <td key={j} className={cellClasses}>
                      {cell.toFixed(2)}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
      {/* Affichage des informations du pivot si disponibles */}
      {pivotInfo && pivotInfo.enteringVarName && pivotInfo.leavingVarName && !isObjectiveRow(tableau.length-1, pivotInfo.row) && ( // Assurez-vous que pivotInfo.row n'est pas la ligne Z
        <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-md text-sm">
          <p>
            Variable entrante : <span className="font-semibold text-blue-700">{pivotInfo.enteringVarName}</span>
          </p>
          <p>
            Variable sortante : <span className="font-semibold text-orange-700">{pivotInfo.leavingVarName}</span>
          </p>
           <p>
            Élément pivot : <span className="font-semibold text-orange-900">{ (pivotInfo.row !== undefined && pivotInfo.col !== undefined && tableau[pivotInfo.row] && tableau[pivotInfo.row][pivotInfo.col] !== undefined) ? tableau[pivotInfo.row][pivotInfo.col].toFixed(2) : 'N/A'}</span>
          </p>
        </div>
      )}
    </div>
  );
}

// Helper function to check if a row index corresponds to the objective function row.
// Needed because pivotInfo.row could potentially (though unlikely by design) point to the objective row.
function isObjectiveRow(totalRows: number, rowIndex?: number): boolean {
    return rowIndex !== undefined && rowIndex === totalRows -1;
}