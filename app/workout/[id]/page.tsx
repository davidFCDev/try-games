"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRealtimeWorkoutData } from "@/hooks/use-realtime-data";
import { formatTime } from "@/lib/utils";
import { ArrowLeft, Clock, Trophy, Users } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function WorkoutPage() {
  const params = useParams();
  const workoutId = params.id as string;
  const { workout, workoutResults, isLoading, lastUpdate } =
    useRealtimeWorkoutData(workoutId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500 rounded-xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">
            Cargando entrenamiento...
          </h2>
          <p className="text-slate-600">Obteniendo los últimos resultados</p>
        </div>
      </div>
    );
  }

  if (!workout) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">
            Entrenamiento no encontrado
          </h2>
          <Link href="/">
            <Button>Volver al inicio</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Calcular estadísticas
  const averageTime =
    workoutResults.length > 0
      ? Math.round(
          workoutResults.reduce((sum, r) => sum + r.time_seconds, 0) /
            workoutResults.length
        )
      : 0;

  const fastestTime =
    workoutResults.length > 0
      ? Math.min(...workoutResults.map((r) => r.time_seconds))
      : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-2 bg-transparent"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Volver</span>
                </Button>
              </Link>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-slate-900">
                    {workout.name}
                  </h1>
                  <div className="flex items-center space-x-4">
                    <p className="text-slate-600">
                      Ranking Individual - Try Games
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <Link href="/admin">
              <Button className="bg-red-500 hover:bg-red-600">
                Panel Admin
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Estadísticas del entrenamiento */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Participantes
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold transition-all duration-300">
                {workoutResults.length}
              </div>
              <p className="text-xs text-muted-foreground">
                equipos completados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completado</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold transition-all duration-300">
                {workoutResults.length > 0
                  ? Math.round((workoutResults.length / 20) * 100)
                  : 0}
                %
              </div>
              <p className="text-xs text-muted-foreground">de la competición</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Tiempo Promedio
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono transition-all duration-300">
                {formatTime(averageTime)}
              </div>
              <p className="text-xs text-muted-foreground">tiempo medio</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Mejor Tiempo
              </CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono text-red-500 transition-all duration-300">
                {formatTime(fastestTime)}
              </div>
              <p className="text-xs text-muted-foreground">récord del WOD</p>
            </CardContent>
          </Card>
        </div>

        {/* Podio del entrenamiento */}
        {workoutResults.length >= 3 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">
              Podio {workout.name}
            </h2>
            <div className="flex justify-center items-end space-x-4 mb-8">
              {workoutResults.slice(0, 3).map((result, index) => (
                <div
                  key={result.id}
                  className={`text-center transition-all duration-500 ${
                    index === 0
                      ? "order-2"
                      : index === 1
                      ? "order-1"
                      : "order-3"
                  }`}
                >
                  <div
                    className={`
                    podium-gradient rounded-lg p-4 text-white mb-2 transition-all duration-500
                    ${
                      index === 0
                        ? "h-32 w-32"
                        : index === 1
                        ? "h-24 w-24"
                        : "h-20 w-20"
                    }
                    flex flex-col items-center justify-center
                  `}
                  >
                    <div className="text-2xl font-bold">#{index + 1}</div>
                    <div className="text-sm opacity-90 font-mono">
                      {formatTime(result.time_seconds)}
                    </div>
                  </div>
                  <p className="font-semibold text-slate-900 text-sm">
                    {result.teams.name}
                  </p>
                  <p className="text-xs text-slate-600">
                    {result.points} puntos
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ranking completo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="w-5 h-5" />
              <span>Ranking Completo - {workout.name}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {workoutResults.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">
                  No hay resultados aún
                </p>
                <p>
                  Los resultados aparecerán aquí cuando se añadan desde el panel
                  de administración.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {workoutResults.map((result, index) => (
                  <div
                    key={result.id}
                    className={`flex items-center justify-between p-4 rounded-lg transition-all duration-500 hover:scale-[1.02] ${
                      index < 3
                        ? "bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200"
                        : "bg-slate-50 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-3">
                        <Badge
                          variant={index < 3 ? "default" : "secondary"}
                          className={`border-2 ${
                            index === 0
                              ? "bg-gradient-to-br from-yellow-400 to-yellow-600 text-black border-yellow-600"
                              : index === 1
                              ? "bg-gradient-to-br from-gray-300 to-gray-500 text-black border-gray-500"
                              : index === 2
                              ? "bg-gradient-to-br from-amber-600 to-amber-800 text-white border-amber-800"
                              : "bg-gray-700 text-white border-gray-700"
                          }`}
                        >
                          #{index + 1}
                        </Badge>
                        <span className="font-semibold text-lg">
                          {result.teams.name}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6">
                      <div className="text-right">
                        <div className="font-mono text-xl font-bold transition-all duration-300">
                          {formatTime(result.time_seconds)}
                        </div>
                        <div className="text-sm text-slate-600">tiempo</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-red-500 transition-all duration-300">
                          {result.points}
                        </div>
                        <div className="text-sm text-slate-600">puntos</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
