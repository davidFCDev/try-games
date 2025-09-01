"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";

interface Team {
  id: string;
  name: string;
  avatar_url?: string;
  member1?: string;
  member2?: string;
  member3?: string;
}

interface Workout {
  id: string;
  name: string;
  workout_number: number;
  description?: string;
  is_visible?: boolean;
}

interface AddResultFormProps {
  teams: Team[];
  workouts: Workout[];
}

export function AddResultForm({ teams, workouts }: AddResultFormProps) {
  const [selectedTeam, setSelectedTeam] = useState("");
  const [selectedWorkout, setSelectedWorkout] = useState("");
  const [minutes, setMinutes] = useState("");
  const [seconds, setSeconds] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const calculatePoints = async (workoutId: string, timeSeconds: number) => {
    const supabase = createClient();

    // Obtener todos los resultados para este entrenamiento
    const { data: workoutResults } = await supabase
      .from("results")
      .select("time_seconds")
      .eq("workout_id", workoutId)
      .order("time_seconds");

    if (!workoutResults) return 20; // Si no hay resultados, dar máxima puntuación

    // Encontrar la posición basada en el tiempo
    const position =
      workoutResults.filter((result) => result.time_seconds < timeSeconds)
        .length + 1;

    // Calcular puntos: 1er lugar = 20, 2do = 19, etc.
    const points = Math.max(1, 21 - position);

    return points;
  };

  const recalculateAllPoints = async (workoutId: string) => {
    const supabase = createClient();

    // Obtener todos los resultados para este entrenamiento ordenados por tiempo
    const { data: workoutResults } = await supabase
      .from("results")
      .select("id, time_seconds")
      .eq("workout_id", workoutId)
      .order("time_seconds");

    if (!workoutResults) return;

    // Actualizar puntos para cada resultado
    for (let i = 0; i < workoutResults.length; i++) {
      const points = Math.max(1, 21 - (i + 1)); // 1er lugar = 20, 2do = 19, etc.
      await supabase
        .from("results")
        .update({ points })
        .eq("id", workoutResults[i].id);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    if (!selectedTeam || !selectedWorkout || !minutes || !seconds) {
      setError("Por favor completa todos los campos");
      setIsLoading(false);
      return;
    }

    const totalSeconds =
      Number.parseInt(minutes) * 60 + Number.parseInt(seconds);

    if (totalSeconds <= 0) {
      setError("El tiempo debe ser mayor a 0");
      setIsLoading(false);
      return;
    }

    try {
      const supabase = createClient();

      // Verificar si ya existe un resultado para este equipo y entrenamiento
      const { data: existingResults } = await supabase
        .from("results")
        .select("id")
        .eq("team_id", selectedTeam)
        .eq("workout_id", selectedWorkout);

      if (existingResults && existingResults.length > 0) {
        setError(
          "Ya existe un resultado para este equipo en este entrenamiento"
        );
        setIsLoading(false);
        return;
      }

      // Calcular puntos iniciales
      const points = await calculatePoints(selectedWorkout, totalSeconds);

      // Insertar el nuevo resultado
      const { error: insertError } = await supabase.from("results").insert({
        team_id: selectedTeam,
        workout_id: selectedWorkout,
        time_seconds: totalSeconds,
        points,
      });

      if (insertError) throw insertError;

      // Recalcular todos los puntos para este entrenamiento
      await recalculateAllPoints(selectedWorkout);

      setSuccess(
        "Resultado añadido correctamente - Los rankings se actualizarán automáticamente"
      );
      setSelectedTeam("");
      setSelectedWorkout("");
      setMinutes("");
      setSeconds("");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Ha ocurrido un error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="team">Equipo</Label>
        <Select value={selectedTeam} onValueChange={setSelectedTeam}>
          <SelectTrigger>
            <SelectValue placeholder="Selecciona un equipo" />
          </SelectTrigger>
          <SelectContent>
            {teams.map((team) => (
              <SelectItem key={team.id} value={team.id}>
                {team.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="workout">Entrenamiento</Label>
        <Select value={selectedWorkout} onValueChange={setSelectedWorkout}>
          <SelectTrigger>
            <SelectValue placeholder="Selecciona un entrenamiento" />
          </SelectTrigger>
          <SelectContent>
            {workouts.map((workout) => (
              <SelectItem key={workout.id} value={workout.id}>
                {workout.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="minutes">Minutos</Label>
          <Input
            id="minutes"
            type="number"
            min="0"
            max="59"
            placeholder="0"
            value={minutes}
            onChange={(e) => setMinutes(e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="seconds">Segundos</Label>
          <Input
            id="seconds"
            type="number"
            min="0"
            max="59"
            placeholder="0"
            value={seconds}
            onChange={(e) => setSeconds(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-sm text-green-600">{success}</p>
        </div>
      )}

      <Button
        type="submit"
        className="w-full bg-red-500 hover:bg-red-600"
        disabled={isLoading}
      >
        {isLoading ? "Añadiendo..." : "Añadir Resultado"}
      </Button>
    </form>
  );
}
