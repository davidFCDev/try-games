import { createClient } from "@/lib/supabase/server";
import { ArrowLeft, Calendar, Users } from "lucide-react";
import Link from "next/link";

interface Team {
  id: string;
  name: string;
  avatar_url?: string;
  member1?: string;
  member2?: string;
  member3?: string;
  heat?: number | null;
  lane?: string | null;
}

interface Workout {
  id: string;
  name: string;
  workout_number: number;
  description?: string;
  is_visible?: boolean;
}

interface HeatSchedule {
  heatNumber: number;
  teams: Team[];
  startTime: Date;
  endTime: Date;
}

interface WorkoutSchedule {
  workout: Workout;
  heats: HeatSchedule[];
}

export default async function HeatsPage() {
  const supabase = await createClient();

  // Obtener equipos, workouts y configuración de heats
  const [teamsResult, workoutsResult, configResult] = await Promise.all([
    supabase.from("teams").select("*").order("name"),
    supabase.from("workouts").select("*").order("workout_number"),
    supabase.from("heat_config").select("start_time").limit(1).single(),
  ]);

  const teamsData = teamsResult.data || [];
  const workoutsData = workoutsResult.data || [];
  const savedStartTime = configResult.data?.start_time || "08:00";

  // Calcular estadísticas de heats
  const teamsWithHeats = teamsData.filter((team) => team.heat);
  const totalHeats = Math.max(
    ...teamsWithHeats.map((team) => team.heat || 0),
    0
  );
  const hasHeats = totalHeats > 0;

  // Calcular horarios de heats
  const calculateSchedule = (): WorkoutSchedule[] => {
    if (!hasHeats) return [];

    const [hours, minutes] = savedStartTime.split(":").map(Number);
    const startDateTime = new Date();
    startDateTime.setHours(hours, minutes, 0, 0);

    const sortedWorkouts = [...workoutsData].sort(
      (a, b) => a.workout_number - b.workout_number
    );
    const schedule: WorkoutSchedule[] = [];

    let currentTime = new Date(startDateTime);

    for (const workout of sortedWorkouts) {
      const workoutSchedule: WorkoutSchedule = {
        workout: workout,
        heats: [],
      };

      // Calcular horarios para cada heat de este workout
      for (let heatNumber = 1; heatNumber <= totalHeats; heatNumber++) {
        const teamsInHeat = teamsData.filter(
          (team) => team.heat === heatNumber
        );

        if (teamsInHeat.length > 0) {
          workoutSchedule.heats.push({
            heatNumber,
            teams: teamsInHeat,
            startTime: new Date(currentTime),
            endTime: new Date(currentTime.getTime() + 10 * 60 * 1000), // 10 minutos
          });

          // Agregar 10 minutos de WOD + 5 minutos de intercambio
          currentTime = new Date(currentTime.getTime() + 15 * 60 * 1000);
        }
      }

      // Quitar los últimos 5 minutos de intercambio del último heat
      if (workoutSchedule.heats.length > 0) {
        currentTime = new Date(currentTime.getTime() - 5 * 60 * 1000);
      }

      schedule.push(workoutSchedule);

      // Agregar 10 minutos de descanso entre WODs (excepto el último)
      if (workout !== sortedWorkouts[sortedWorkouts.length - 1]) {
        currentTime = new Date(currentTime.getTime() + 10 * 60 * 1000);
      }
    }

    return schedule;
  };

  // Formatear hora
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  // Función para obtener el color de la zona
  const getZoneColor = (lane: string) => {
    switch (lane) {
      case "A":
        return "bg-green-500 text-white";
      case "B":
        return "bg-green-600 text-white";
      case "C":
        return "bg-green-700 text-white";
      default:
        return "bg-gray-600 text-white";
    }
  };

  // Función para ordenar equipos por zona (A, B, C)
  const sortTeamsByZone = (teams: Team[]) => {
    return teams.sort((a, b) => {
      const zoneOrder = { A: 1, B: 2, C: 3 };
      const aOrder = a.lane
        ? zoneOrder[a.lane as keyof typeof zoneOrder] || 999
        : 999;
      const bOrder = b.lane
        ? zoneOrder[b.lane as keyof typeof zoneOrder] || 999
        : 999;
      return aOrder - bOrder;
    });
  };

  const schedule = calculateSchedule();

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-gray-900/95 backdrop-blur-sm shadow-lg border-b border-green-500/30">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-6">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center space-x-2 sm:space-x-4 flex-1 min-w-0">
              <Link href="/">
                <button className="flex items-center space-x-1 sm:space-x-2 px-1.5 sm:px-3 py-1 sm:py-2 text-green-400 hover:text-white hover:bg-green-500/20 transition-colors cursor-pointer min-w-0">
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Volver</span>
                </button>
              </Link>
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-500 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                <Calendar className="w-6 h-6 sm:w-10 sm:h-10 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-sm sm:text-4xl font-bold title-games text-white truncate">
                  HEATS
                </h1>
                <div className="flex items-center space-x-2 sm:space-x-4">
                  <p className="text-green-400 font-medium text-xs sm:text-base truncate">
                    WODs y horarios
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-6 sm:py-8">
        {/* Mostrar cronograma de heats si existen */}
        {hasHeats && schedule.length > 0 ? (
          <div className="space-y-4 sm:space-y-6">
            <div className="p-3 sm:p-4 lg:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-3">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  📅 Horarios
                </h2>
                <div className="bg-green-100 text-green-800 px-3 sm:px-4 py-2 rounded-lg self-start">
                  <span className="font-medium text-sm sm:text-base">
                    Inicio: {savedStartTime}
                  </span>
                </div>
              </div>

              <div className="space-y-4 sm:space-y-6">
                {schedule.map((workoutSchedule, workoutIndex) => (
                  <div
                    key={workoutSchedule.workout.id}
                    className="border-2 border-gray-200 rounded-lg p-3 sm:p-4 lg:p-6 bg-gray-50"
                  >
                    <div className="flex items-center justify-between mb-3 sm:mb-4 gap-3">
                      <h3 className="text-xl sm:text-2xl font-bold text-gray-900 flex-1 min-w-0">
                        {workoutSchedule.workout.name}
                      </h3>
                      <span className="bg-green-600 text-white text-sm sm:text-lg font-bold px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg flex-shrink-0">
                        WOD {workoutSchedule.workout.workout_number}
                      </span>
                    </div>
                    <div className="grid gap-3 sm:gap-4">
                      {workoutSchedule.heats.map((heat) => (
                        <div
                          key={`${workoutSchedule.workout.id}-${heat.heatNumber}`}
                          className="bg-white border border-gray-300 rounded-lg p-3 sm:p-4 shadow-sm"
                        >
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 gap-2">
                            <div className="flex items-center space-x-2 sm:space-x-3">
                              <span className="bg-gray-600 text-white text-sm sm:text-lg font-bold px-2 sm:px-3 py-1 rounded">
                                Heat {heat.heatNumber}
                              </span>
                              <div className="text-sm sm:text-lg font-semibold text-gray-800">
                                {formatTime(heat.startTime)} -{" "}
                                {formatTime(heat.endTime)}
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3">
                            {sortTeamsByZone(heat.teams).map((team) => (
                              <div
                                key={team.id}
                                className="bg-gray-50 border border-gray-200 p-2 sm:p-3 rounded-lg"
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <div className="font-semibold text-gray-900 text-sm sm:text-base truncate pr-2">
                                    {team.name}
                                  </div>
                                  {team.lane && (
                                    <span
                                      className={`text-xs font-bold px-1.5 sm:px-2 py-1 rounded flex-shrink-0 ${getZoneColor(
                                        team.lane
                                      )}`}
                                    >
                                      {team.lane}
                                    </span>
                                  )}
                                </div>
                                {(team.member1 ||
                                  team.member2 ||
                                  team.member3) && (
                                  <div className="text-xs sm:text-sm text-gray-600 line-clamp-2">
                                    {[team.member1, team.member2, team.member3]
                                      .filter(Boolean)
                                      .join(", ")}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-2xl font-bold mb-2 text-black">
              Heats aún no sorteados
            </h2>
            <p className="text-gray-600">
              Los heats aparecerán aquí cuando se sorteen
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
