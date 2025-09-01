"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { formatTime } from "@/lib/utils"

interface Result {
  id: string
  team_id: string
  workout_id: string
  time_seconds: number
  points: number
  teams: { name: string }
  workouts: { name: string; workout_number: number }
}

interface ResultsTableProps {
  results: Result[]
}

export function ResultsTable({ results }: ResultsTableProps) {
  if (results.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        <p>No hay resultados registrados aún.</p>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Equipo</TableHead>
            <TableHead>Entrenamiento</TableHead>
            <TableHead>Tiempo</TableHead>
            <TableHead>Puntos</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {results.map((result) => (
            <TableRow key={result.id}>
              <TableCell className="font-medium">{result.teams.name}</TableCell>
              <TableCell>{result.workouts.name}</TableCell>
              <TableCell className="font-mono">{formatTime(result.time_seconds)}</TableCell>
              <TableCell>
                <Badge variant={result.points >= 18 ? "default" : result.points >= 15 ? "secondary" : "outline"}>
                  {result.points} pts
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
