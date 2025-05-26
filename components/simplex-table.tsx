import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

interface SimplexTableProps {
  tableau: number[][]
  basicVariables: string[]
  pivotRow?: number
  pivotCol?: number
  showArtificial?: boolean
}

export function SimplexTable({
  tableau,
  basicVariables,
  pivotRow,
  pivotCol,
  showArtificial = false,
}: SimplexTableProps) {
  const numRows = tableau.length
  const numCols = tableau[0]?.length || 0

  // Génération des en-têtes de colonnes
  const generateHeaders = () => {
    const headers = ["Base"]
    const numVars = Math.floor((numCols - 1) / 2) // Estimation du nombre de variables

    // Variables de décision
    for (let i = 1; i <= numVars; i++) {
      headers.push(`x${i}`)
    }

    // Variables d'écart/surplus
    for (let i = 1; i <= numVars; i++) {
      headers.push(`s${i}`)
    }

    // Variables artificielles si nécessaire
    if (showArtificial) {
      for (let i = 1; i <= Math.max(1, numVars - 2); i++) {
        headers.push(`a${i}`)
      }
    }

    headers.push("RHS")
    return headers.slice(0, numCols + 1) // Ajuster à la taille réelle
  }

  const headers = generateHeaders()

  const formatNumber = (num: number) => {
    if (Math.abs(num) < 0.0001) return "0"
    if (Number.isInteger(num)) return num.toString()
    return num.toFixed(3)
  }

  const getCellClassName = (rowIndex: number, colIndex: number) => {
    let className = "text-center font-mono"

    // Ligne pivot
    if (pivotRow !== undefined && rowIndex === pivotRow) {
      className += " bg-blue-50"
    }

    // Colonne pivot
    if (pivotCol !== undefined && colIndex === pivotCol) {
      className += " bg-yellow-50"
    }

    // Élément pivot
    if (pivotRow !== undefined && pivotCol !== undefined && rowIndex === pivotRow && colIndex === pivotCol) {
      className += " bg-red-100 font-bold border-2 border-red-300"
    }

    // Dernière ligne (fonction objectif)
    if (rowIndex === numRows - 1) {
      className += " border-t-2 border-gray-300 font-semibold"
    }

    return className
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            {headers.map((header, index) => (
              <TableHead key={index} className="text-center font-semibold">
                {header}
                {pivotCol !== undefined && index === pivotCol + 1 && (
                  <Badge variant="outline" className="ml-1 text-xs">
                    Pivot Col
                  </Badge>
                )}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {tableau.map((row, rowIndex) => (
            <TableRow key={rowIndex}>
              <TableCell className="font-semibold text-center">
                {basicVariables[rowIndex] || (rowIndex === numRows - 1 ? "Z" : `R${rowIndex + 1}`)}
                {pivotRow !== undefined && rowIndex === pivotRow && (
                  <Badge variant="outline" className="ml-1 text-xs">
                    Pivot Row
                  </Badge>
                )}
              </TableCell>
              {row.map((cell, colIndex) => (
                <TableCell key={colIndex} className={getCellClassName(rowIndex, colIndex)}>
                  {formatNumber(cell)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {(pivotRow !== undefined || pivotCol !== undefined) && (
        <div className="mt-4 flex flex-wrap gap-2 text-sm">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-50 border mr-2"></div>
            <span>Ligne pivot</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-yellow-50 border mr-2"></div>
            <span>Colonne pivot</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-100 border-2 border-red-300 mr-2"></div>
            <span>Élément pivot</span>
          </div>
        </div>
      )}
    </div>
  )
}
