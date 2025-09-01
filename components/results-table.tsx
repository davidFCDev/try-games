"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createClient } from "@/lib/supabase/client";
import { formatTime } from "@/lib/utils";
import { Trash2 } from "lucide-react";
import { useState } from "react";

interface Result {
  id: string;
  team_id: string;
  workout_id: string;
  time_seconds: number;
  points: number;
  teams: { name: string };
  workouts: { name: string; workout_number: number };
}

interface ResultsTableProps {
  results: Result[];
  onResultDeleted?: () => void; // Callback para refrescar datos después de borrar
}

export function ResultsTable({ results, onResultDeleted }: ResultsTableProps) {
  const [deletingResults, setDeletingResults] = useState<Set<string>>(
    new Set()
  );
  const supabase = createClient();

  const handleDeleteResult = async (
    resultId: string,
    teamName: string,
    workoutName: string
  ) => {
    if (
      !confirm(
        `¿Estás seguro de que quieres borrar el resultado de ${teamName} en ${workoutName}?`
      )
    ) {
      return;
    }

    setDeletingResults((prev) => new Set(prev).add(resultId));

    try {
      const { error } = await supabase
        .from("results")
        .delete()
        .eq("id", resultId);

      if (error) {
        console.error("Error al borrar resultado:", error);
        alert("Error al borrar el resultado");
        return;
      }

      // Llamar al callback para refrescar los datos
      if (onResultDeleted) {
        onResultDeleted();
      }
    } catch (error) {
      console.error("Error al borrar resultado:", error);
      alert("Error al borrar el resultado");
    } finally {
      setDeletingResults((prev) => {
        const newSet = new Set(prev);
        newSet.delete(resultId);
        return newSet;
      });
    }
  };
  if (results.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        <p>No hay resultados registrados aún.</p>
      </div>
    );
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
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {results.map((result) => (
            <TableRow key={result.id}>
              <TableCell className="font-medium">{result.teams.name}</TableCell>
              <TableCell>{result.workouts.name}</TableCell>
              <TableCell className="font-mono">
                {formatTime(result.time_seconds)}
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    result.points >= 18
                      ? "default"
                      : result.points >= 15
                      ? "secondary"
                      : "outline"
                  }
                >
                  {result.points} pts
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handleDeleteResult(
                      result.id,
                      result.teams.name,
                      result.workouts.name
                    )
                  }
                  disabled={deletingResults.has(result.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300"
                >
                  {deletingResults.has(result.id) ? (
                    <span className="flex items-center space-x-1">
                      <div className="w-3 h-3 border border-red-600 border-t-transparent rounded-full animate-spin"></div>
                      <span>Borrando...</span>
                    </span>
                  ) : (
                    <span className="flex items-center space-x-1">
                      <Trash2 className="w-4 h-4" />
                      <span>Borrar</span>
                    </span>
                  )}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
