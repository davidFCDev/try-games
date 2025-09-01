import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { ArrowLeft, Target, Trophy, Users } from "lucide-react";
import Link from "next/link";

interface TeamRanking {
  team_id: string;
  team_name: string;
  team_avatar_url?: string;
  total_points: number;
  completed_workouts: number;
  workout_results: { workout_name: string; points: number; position: number }[];
}

export default async function RankingsPage() {
  const supabase = await createClient();

  // Obtener todos los datos necesarios
  const [teamsResult, workoutsResult, resultsResult] = await Promise.all([
    supabase.from("teams").select("*").order("name"),
    supabase.from("workouts").select("*").order("workout_number"),
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

  const teams = teamsResult.data || [];
  const workouts = workoutsResult.data || [];
  const results = resultsResult.data || [];

  // Calcular ranking detallado
  const teamRankings: TeamRanking[] = teams
    .map((team) => {
      const teamResults = results.filter((r) => r.team_id === team.id);
      const totalPoints = teamResults.reduce((sum, r) => sum + r.points, 0);

      // Obtener resultados por entrenamiento con posiciones
      const workoutResults = workouts.map((workout) => {
        const workoutResult = teamResults.find(
          (r) => r.workout_id === workout.id
        );
        if (!workoutResult) {
          return { workout_name: workout.name, points: 0, position: 0 };
        }

        // Calcular posición en este entrenamiento
        const workoutAllResults = results
          .filter((r) => r.workout_id === workout.id)
          .sort((a, b) => b.points - a.points);

        const position =
          workoutAllResults.findIndex((r) => r.id === workoutResult.id) + 1;

        return {
          workout_name: workout.name,
          points: workoutResult.points,
          position,
        };
      });

      return {
        team_id: team.id,
        team_name: team.name,
        team_avatar_url: team.avatar_url,
        total_points: totalPoints,
        completed_workouts: teamResults.length,
        workout_results: workoutResults,
      };
    })
    .sort((a, b) => b.total_points - a.total_points);

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
                    Rankings Detallados
                  </h1>
                  <p className="text-slate-600">
                    Try Games - Análisis Completo
                  </p>
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
        {/* Estadísticas generales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Equipos Participantes
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{teams.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Entrenamientos
              </CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{workouts.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Resultados Totales
              </CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{results.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabla de rankings detallada */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="w-5 h-5" />
              <span>Ranking General Detallado</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 font-semibold">Pos</th>
                    <th className="text-left py-3 px-4 font-semibold">
                      Equipo
                    </th>
                    {workouts.map((workout) => (
                      <th
                        key={workout.id}
                        className="text-center py-3 px-2 font-semibold text-sm"
                      >
                        {workout.name}
                      </th>
                    ))}
                    <th className="text-center py-3 px-4 font-semibold">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {teamRankings.map((team, index) => (
                    <tr
                      key={team.team_id}
                      className={`border-b hover:bg-slate-50 ${
                        index < 3
                          ? "bg-gradient-to-r from-yellow-50 to-orange-50"
                          : ""
                      }`}
                    >
                      <td className="py-4 px-2">
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
                      </td>
                      <td className="py-4 px-4 font-semibold">
                        {team.team_name}
                      </td>
                      {team.workout_results.map((result, workoutIndex) => (
                        <td
                          key={workoutIndex}
                          className="py-4 px-2 text-center"
                        >
                          {result.points > 0 ? (
                            <div className="space-y-1">
                              <div className="font-bold text-sm">
                                {result.points}
                              </div>
                              <div className="text-xs text-slate-500">
                                #{result.position}
                              </div>
                            </div>
                          ) : (
                            <div className="text-slate-400 text-sm">-</div>
                          )}
                        </td>
                      ))}
                      <td className="py-4 px-4 text-center">
                        <div className="space-y-1">
                          <div className="text-xl font-bold text-red-500">
                            {team.total_points}
                          </div>
                          <div className="text-xs text-slate-600">
                            {team.completed_workouts}/{workouts.length} WODs
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
