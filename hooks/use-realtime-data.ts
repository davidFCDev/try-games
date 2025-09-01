"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

interface Team {
  id: string;
  name: string;
  avatar_url?: string;
  member1?: string;
  member2?: string;
  member3?: string;
  heat?: number | null;
}

interface Workout {
  id: string;
  name: string;
  workout_number: number;
  is_visible?: boolean;
  description?: string;
}

interface Result {
  id: string;
  team_id: string;
  workout_id: string;
  time_seconds: number;
  points: number;
  teams: { name: string };
  workouts: { name: string; workout_number: number };
}

interface TeamRanking {
  team_id: string;
  team_name: string;
  total_points: number;
  completed_workouts: number;
}

export function useRealtimeData() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [teamRankings, setTeamRankings] = useState<TeamRanking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const supabase = createClient();

  // Función para calcular rankings
  const calculateRankings = (teamsData: Team[], resultsData: Result[]) => {
    return teamsData
      .map((team) => {
        const teamResults = resultsData.filter((r) => r.team_id === team.id);
        const totalPoints = teamResults.reduce((sum, r) => sum + r.points, 0);

        return {
          team_id: team.id,
          team_name: team.name,
          total_points: totalPoints,
          completed_workouts: teamResults.length,
        };
      })
      .sort((a, b) => b.total_points - a.total_points);
  };

  // Función para cargar datos iniciales
  const loadInitialData = async () => {
    try {
      const [teamsResult, workoutsResult, resultsResult] = await Promise.all([
        supabase.from("teams").select("*").order("name"),
        supabase
          .from("workouts")
          .select("*, is_visible")
          .order("workout_number"),
        supabase
          .from("results")
          .select(
            `
            *,
            teams(name),
            workouts(name, workout_number)
          `
          )
          .order("points", { ascending: false }),
      ]);

      const teamsData = teamsResult.data || [];
      const workoutsData = workoutsResult.data || [];
      const resultsData = resultsResult.data || [];

      setTeams(teamsData);
      setWorkouts(workoutsData);
      setResults(resultsData);
      setTeamRankings(calculateRankings(teamsData, resultsData));
      setLastUpdate(new Date());
    } catch (error) {
      console.error("Error loading initial data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Función para refrescar resultados con datos completos
  const refreshResults = async () => {
    try {
      const { data: resultsData } = await supabase
        .from("results")
        .select(
          `
          *,
          teams(name),
          workouts(name, workout_number)
        `
        )
        .order("points", { ascending: false });

      if (resultsData) {
        setResults(resultsData);
        setTeamRankings(calculateRankings(teams, resultsData));
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error("Error refreshing results:", error);
    }
  };

  useEffect(() => {
    loadInitialData();

    // Suscribirse a cambios en tiempo real en la tabla de resultados
    const resultsSubscription = supabase
      .channel("results-changes")
      .on(
        "postgres_changes",
        {
          event: "*", // Escuchar todos los eventos (INSERT, UPDATE, DELETE)
          schema: "public",
          table: "results",
        },
        (payload) => {
          console.log("[v0] Realtime update received:", payload);
          // Refrescar los resultados cuando hay cambios
          refreshResults();
        }
      )
      .subscribe();

    // Suscribirse a cambios en equipos (por si se añaden nuevos)
    const teamsSubscription = supabase
      .channel("teams-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "teams",
        },
        () => {
          console.log("[v0] Teams update received");
          loadInitialData();
        }
      )
      .subscribe();

    // Cleanup al desmontar
    return () => {
      resultsSubscription.unsubscribe();
      teamsSubscription.unsubscribe();
    };
  }, []);

  return {
    teams,
    workouts,
    results,
    teamRankings,
    isLoading,
    lastUpdate,
    refresh: refreshResults,
  };
}

// Hook específico para datos de un entrenamiento
export function useRealtimeWorkoutData(workoutId: string) {
  const [workoutResults, setWorkoutResults] = useState<Result[]>([]);
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const supabase = createClient();

  const loadWorkoutData = async () => {
    try {
      const [workoutResult, resultsResult] = await Promise.all([
        supabase.from("workouts").select("*").eq("id", workoutId).single(),
        supabase
          .from("results")
          .select(
            `
            *,
            teams(name)
          `
          )
          .eq("workout_id", workoutId)
          .order("points", { ascending: false }),
      ]);

      setWorkout(workoutResult.data);
      setWorkoutResults(resultsResult.data || []);
      setLastUpdate(new Date());
    } catch (error) {
      console.error("Error loading workout data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!workoutId) return;

    loadWorkoutData();

    // Suscribirse solo a cambios de este entrenamiento
    const subscription = supabase
      .channel(`workout-${workoutId}-changes`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "results",
          filter: `workout_id=eq.${workoutId}`,
        },
        (payload) => {
          console.log(`[v0] Workout ${workoutId} update received:`, payload);
          loadWorkoutData();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [workoutId]);

  return {
    workout,
    workoutResults,
    isLoading,
    lastUpdate,
    refresh: loadWorkoutData,
  };
}
