"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRealtimeData } from "@/hooks/use-realtime-data";
import { ArrowLeft, Clock, Dumbbell, Trophy, Users } from "lucide-react";
import Link from "next/link";

export default function WODsPage() {
  const { workouts, results, teamRankings, isLoading, lastUpdate } =
    useRealtimeData();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-500 rounded-xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Dumbbell className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-black mb-2">
            Cargando WODs...
          </h2>
          <p className="text-gray-600">Obteniendo entrenamientos</p>
        </div>
      </div>
    );
  }

  const getWorkoutStats = (workoutId: string) => {
    const workoutResults = results.filter((r) => r.workout_id === workoutId);
    const completedTeams = workoutResults.length;
    const totalTeams = teamRankings.length;
    const completionRate =
      totalTeams > 0 ? Math.round((completedTeams / totalTeams) * 100) : 0;

    const fastestResult = workoutResults.reduce(
      (fastest, current) =>
        !fastest || current.time_seconds < fastest.time_seconds
          ? current
          : fastest,
      null as any
    );

    return {
      completedTeams,
      totalTeams,
      completionRate,
      fastestResult,
    };
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-gray-900/95 backdrop-blur-sm shadow-lg border-b border-green-500/30">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-6">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center space-x-2 sm:space-x-4 flex-1 min-w-0">
              <Link href="/">
                <Button
                  variant="ghost"
                  size="sm"
                  className="mr-2 text-green-400 hover:text-white hover:bg-green-500/20 cursor-pointer px-1.5 sm:px-3 min-w-0"
                >
                  <ArrowLeft className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Volver</span>
                </Button>
              </Link>
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-500 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                <Dumbbell className="w-6 h-6 sm:w-10 sm:h-10 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-sm sm:text-4xl font-bold title-games text-white truncate">
                  WODs
                </h1>
                <div className="flex items-center space-x-2 sm:space-x-4">
                  <p className="text-green-400 font-medium text-xs sm:text-base truncate">
                    Comprueba cada workout
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid gap-8 md:grid-cols-2 items-stretch">
          {workouts
            .sort((a, b) => a.workout_number - b.workout_number)
            .map((workout) => {
              const stats = getWorkoutStats(workout.id);
              const isHidden = workout.is_visible === false;

              return (
                <Card
                  key={workout.id}
                  className={`bg-white border border-black shadow-lg hover:shadow-xl hover:border-green-500 transition-all duration-300 relative flex flex-col h-full ${
                    isHidden ? "opacity-60" : ""
                  }`}
                >
                  <CardHeader className="bg-gray-50">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0 pr-2">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-sm sm:text-base">
                            {workout.workout_number}
                          </span>
                        </div>
                        <span className="text-lg sm:text-xl font-bold text-black truncate">
                          {isHidden ? "WOD Oculto" : workout.name}
                        </span>
                      </CardTitle>
                      <div className="flex items-center space-x-2">
                        {isHidden && (
                          <Badge
                            variant="secondary"
                            className="bg-gray-200 text-gray-700 border border-gray-300"
                          >
                            🔒 Próximamente
                          </Badge>
                        )}
                        <Badge
                          variant={
                            stats.completionRate === 100
                              ? "default"
                              : "secondary"
                          }
                          className={`hidden sm:inline-flex ${
                            stats.completionRate === 100
                              ? "bg-green-500 text-white"
                              : "bg-gray-200 text-gray-700 border border-gray-300"
                          }`}
                        >
                          {stats.completionRate}% Completado
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent
                    className={`p-4 sm:p-6 flex-1 flex flex-col ${
                      isHidden ? "filter blur-sm pointer-events-none" : ""
                    }`}
                  >
                    <div className="flex flex-col h-full">
                      {/* Descripción del WOD - se expande */}
                      <div className="flex-1 mb-3 sm:mb-4">
                        {workout.description ? (
                          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 h-full flex items-start">
                            <p className="text-gray-700 font-semibold whitespace-pre-line">
                              {workout.description}
                            </p>
                          </div>
                        ) : (
                          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 h-full flex items-center justify-center">
                            <p className="text-gray-500 italic text-center">
                              Sin descripción disponible
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Contenido fijo en la parte inferior */}
                      <div className="space-y-3 sm:space-y-4">
                        {/* Estadísticas */}
                        <div className="grid grid-cols-2 gap-3 sm:gap-4">
                          <div className="text-center p-2.5 sm:p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <Users className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1.5 sm:mb-2 text-green-600" />
                            <div className="font-bold text-base sm:text-lg text-black">
                              {stats.completedTeams}/{stats.totalTeams}
                            </div>
                            <div className="text-xs sm:text-sm text-gray-600">
                              Equipos
                            </div>
                          </div>

                          {stats.fastestResult ? (
                            <div className="text-center p-2.5 sm:p-3 bg-gray-50 rounded-lg border border-gray-200">
                              <Clock className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1.5 sm:mb-2 text-green-600" />
                              <div className="font-bold text-base sm:text-lg text-black">
                                {formatTime(stats.fastestResult.time_seconds)}
                              </div>
                              <div className="text-xs sm:text-sm text-gray-600">
                                Mejor Tiempo
                              </div>
                            </div>
                          ) : (
                            <div className="text-center p-2.5 sm:p-3 bg-gray-50 rounded-lg border border-gray-200">
                              <Clock className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1.5 sm:mb-2 text-gray-400" />
                              <div className="font-bold text-base sm:text-lg text-gray-400">
                                --:--
                              </div>
                              <div className="text-xs sm:text-sm text-gray-600">
                                Mejor Tiempo
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Mejor resultado */}
                        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                          <div className="flex items-center space-x-2 mb-2">
                            <Trophy className="w-5 h-5 text-green-600" />
                            <span className="font-semibold text-black">
                              Mejor Resultado
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-lg text-black">
                              {stats.fastestResult
                                ? stats.fastestResult.teams?.name
                                : "Ningún equipo"}
                            </span>
                            <div className="text-right">
                              <div
                                className={`font-bold ${
                                  stats.fastestResult
                                    ? "text-green-600"
                                    : "text-gray-400"
                                }`}
                              >
                                {stats.fastestResult
                                  ? formatTime(stats.fastestResult.time_seconds)
                                  : "--:--"}
                              </div>
                              <div className="text-sm text-gray-600">
                                {stats.fastestResult
                                  ? `${stats.fastestResult.points} puntos`
                                  : "0 puntos"}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Botón para ver detalles */}
                        <Link href={`/workout/${workout.id}`}>
                          <Button className="w-full bg-green-500 hover:bg-green-600 text-white cursor-pointer">
                            Ver Ranking Completo
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>

                  {/* Overlay para WODs ocultos */}
                  {isHidden && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100/80 rounded-lg">
                      <div className="text-center bg-white p-6 rounded-lg shadow-lg max-w-xs border border-gray-200">
                        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Trophy className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="font-bold text-lg text-black mb-2">
                          WOD {workout.workout_number}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          Este entrenamiento se revelará durante la competición
                        </p>
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
        </div>

        {workouts.length === 0 && (
          <div className="text-center py-12">
            <Dumbbell className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold text-black mb-2">
              No hay WODs disponibles
            </h3>
            <p className="text-gray-600">
              Los entrenamientos aparecerán aquí cuando el admin los publique.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
