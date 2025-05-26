"use client"

import { useEffect, useRef } from "react"

interface GraphVisualizationProps {
  constraints: number[][]
  rhs: number[]
  objective: number[]
  solution?: { [key: string]: number }
}

export function GraphVisualization({ constraints, rhs, objective, solution }: GraphVisualizationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Configuration du canvas
    const width = canvas.width
    const height = canvas.height
    const margin = 50
    const plotWidth = width - 2 * margin
    const plotHeight = height - 2 * margin

    // Effacer le canvas
    ctx.clearRect(0, 0, width, height)

    // Échelle
    const maxX = Math.max(...rhs, 10)
    const maxY = Math.max(...rhs, 10)
    const scaleX = plotWidth / maxX
    const scaleY = plotHeight / maxY

    // Fonction pour convertir les coordonnées
    const toCanvasX = (x: number) => margin + x * scaleX
    const toCanvasY = (y: number) => height - margin - y * scaleY

    // Dessiner les axes
    ctx.strokeStyle = "#374151"
    ctx.lineWidth = 2
    ctx.beginPath()
    // Axe X
    ctx.moveTo(margin, height - margin)
    ctx.lineTo(width - margin, height - margin)
    // Axe Y
    ctx.moveTo(margin, margin)
    ctx.lineTo(margin, height - margin)
    ctx.stroke()

    // Labels des axes
    ctx.fillStyle = "#374151"
    ctx.font = "14px sans-serif"
    ctx.textAlign = "center"
    ctx.fillText("x₁", width - margin + 20, height - margin + 5)
    ctx.save()
    ctx.translate(margin - 20, height / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.fillText("x₂", 0, 0)
    ctx.restore()

    // Grille
    ctx.strokeStyle = "#E5E7EB"
    ctx.lineWidth = 1
    for (let i = 0; i <= maxX; i++) {
      const x = toCanvasX(i)
      ctx.beginPath()
      ctx.moveTo(x, margin)
      ctx.lineTo(x, height - margin)
      ctx.stroke()

      if (i > 0) {
        ctx.fillStyle = "#6B7280"
        ctx.font = "12px sans-serif"
        ctx.textAlign = "center"
        ctx.fillText(i.toString(), x, height - margin + 20)
      }
    }

    for (let i = 0; i <= maxY; i++) {
      const y = toCanvasY(i)
      ctx.beginPath()
      ctx.moveTo(margin, y)
      ctx.lineTo(width - margin, y)
      ctx.stroke()

      if (i > 0) {
        ctx.fillStyle = "#6B7280"
        ctx.font = "12px sans-serif"
        ctx.textAlign = "right"
        ctx.fillText(i.toString(), margin - 10, y + 5)
      }
    }

    // Dessiner les contraintes
    const colors = ["#EF4444", "#10B981", "#3B82F6", "#F59E0B", "#8B5CF6"]

    constraints.forEach((constraint, index) => {
      const [a, b] = constraint
      const rhs_val = rhs[index]

      if (b !== 0) {
        // Ligne: ax + by = rhs
        const x1 = 0
        const y1 = rhs_val / b
        const x2 = rhs_val / a
        const y2 = 0

        ctx.strokeStyle = colors[index % colors.length]
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(toCanvasX(x1), toCanvasY(y1))
        ctx.lineTo(toCanvasX(x2), toCanvasY(y2))
        ctx.stroke()

        // Label de la contrainte
        const midX = (x1 + x2) / 2
        const midY = (y1 + y2) / 2
        ctx.fillStyle = colors[index % colors.length]
        ctx.font = "12px sans-serif"
        ctx.fillText(`C${index + 1}`, toCanvasX(midX) + 10, toCanvasY(midY) - 10)
      }
    })

    // Région réalisable (approximation simple)
    ctx.fillStyle = "rgba(59, 130, 246, 0.1)"
    ctx.beginPath()
    ctx.moveTo(toCanvasX(0), toCanvasY(0))

    // Points d'intersection approximatifs
    const feasiblePoints = [
      [0, 0],
      [0, Math.min(...rhs.map((r, i) => (constraints[i][1] !== 0 ? r / constraints[i][1] : Number.POSITIVE_INFINITY)))],
      [Math.min(...rhs.map((r, i) => (constraints[i][0] !== 0 ? r / constraints[i][0] : Number.POSITIVE_INFINITY))), 0],
    ]

    feasiblePoints.forEach(([x, y]) => {
      if (x >= 0 && y >= 0 && x <= maxX && y <= maxY) {
        ctx.lineTo(toCanvasX(x), toCanvasY(y))
      }
    })

    ctx.closePath()
    ctx.fill()

    // Dessiner la fonction objectif
    if (objective.length >= 2) {
      const [c1, c2] = objective
      if (c2 !== 0) {
        // Lignes iso-profit
        for (let z = 0; z <= 20; z += 5) {
          const x1 = 0
          const y1 = z / c2
          const x2 = z / c1
          const y2 = 0

          ctx.strokeStyle = "#8B5CF6"
          ctx.lineWidth = 1
          ctx.setLineDash([5, 5])
          ctx.beginPath()
          ctx.moveTo(toCanvasX(x1), toCanvasY(y1))
          ctx.lineTo(toCanvasX(x2), toCanvasY(y2))
          ctx.stroke()
        }
        ctx.setLineDash([])
      }
    }

    // Point solution optimal
    if (solution && solution.x1 !== undefined && solution.x2 !== undefined) {
      const x = Number(solution.x1)
      const y = Number(solution.x2)

      ctx.fillStyle = "#DC2626"
      ctx.beginPath()
      ctx.arc(toCanvasX(x), toCanvasY(y), 8, 0, 2 * Math.PI)
      ctx.fill()

      ctx.strokeStyle = "#FFFFFF"
      ctx.lineWidth = 2
      ctx.stroke()

      // Label du point optimal
      ctx.fillStyle = "#DC2626"
      ctx.font = "bold 14px sans-serif"
      ctx.fillText(`Optimal (${x}, ${y})`, toCanvasX(x) + 15, toCanvasY(y) - 15)
    }

    // Légende
    const legendY = margin + 20
    ctx.fillStyle = "#374151"
    ctx.font = "bold 14px sans-serif"
    ctx.textAlign = "left"
    ctx.fillText("Légende:", margin, legendY)

    constraints.forEach((_, index) => {
      const y = legendY + 25 + index * 20
      ctx.strokeStyle = colors[index % colors.length]
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.moveTo(margin, y)
      ctx.lineTo(margin + 20, y)
      ctx.stroke()

      ctx.fillStyle = "#374151"
      ctx.font = "12px sans-serif"
      ctx.fillText(`Contrainte ${index + 1}`, margin + 25, y + 5)
    })
  }, [constraints, rhs, objective, solution])

  return (
    <div className="w-full">
      <canvas
        ref={canvasRef}
        width={600}
        height={400}
        className="border border-gray-200 rounded-lg w-full max-w-full"
        style={{ maxHeight: "400px" }}
      />
      <div className="mt-4 text-sm text-gray-600">
        <p>
          <strong>Zone bleue :</strong> Région réalisable
        </p>
        <p>
          <strong>Lignes colorées :</strong> Contraintes du problème
        </p>
        <p>
          <strong>Lignes pointillées violettes :</strong> Lignes iso-profit
        </p>
        <p>
          <strong>Point rouge :</strong> Solution optimale
        </p>
      </div>
    </div>
  )
}
