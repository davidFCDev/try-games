import { AddResultForm } from "@/components/add-result-form";
import { HeatManagement } from "@/components/heat-management";
import { TeamManagement } from "@/components/team-management";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WorkoutManagement } from "@/components/workout-management";
import { createClient } from "@/lib/supabase/server";
import { Clock, LogOut, Plus, Target, Trophy, Users } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

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
  description?: string;
  is_visible?: boolean;
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

export default async function AdminPage() {
  const supabase = await createClient();

  // Verificar autenticación
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) {
    redirect("/auth/login");
  }

  // Obtener datos
  const [teamsResult, workoutsResult, resultsResult] = await Promise.all([
    supabase.from("teams").select("*").order("name"),
    supabase.from("workouts").select("*, is_visible").order("workout_number"),
    supabase
      .from("results")
      .select(
        `
        *,
        teams(name),
        workouts(name, workout_number)
      `
      )
      .order("created_at", { ascending: false }),
  ]);

  const teams = teamsResult.data || [];
  const workouts = workoutsResult.data || [];
  const results = resultsResult.data || [];

  // Calcular estadísticas
  const totalPossibleResults = teams.length * workouts.length;
  const completionPercentage = Math.round(
    (results.length / totalPossibleResults) * 100
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-orange-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Panel de Administración
                </h1>
                <p className="text-gray-700">
                  Try Games - Gestión de Competición
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Conectado como:</p>
                <p className="font-medium text-gray-900">{user.email}</p>
              </div>
              <form action="/auth/signout" method="post">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-2 bg-white border-orange-300 text-gray-900 hover:bg-orange-50"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Salir</span>
                </Button>
              </form>
              <Link href="/">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-orange-600 text-white border-orange-600 hover:bg-orange-700"
                >
                  Ver Competición
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white border-orange-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-900">
                Equipos
              </CardTitle>
              <Users className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {teams.length}
              </div>
              <p className="text-xs text-gray-600">equipos registrados</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-orange-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-900">
                Entrenamientos
              </CardTitle>
              <Target className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {workouts.length}
              </div>
              <p className="text-xs text-gray-600">WODs configurados</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-orange-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-900">
                Resultados
              </CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {results.length}
              </div>
              <p className="text-xs text-gray-600">
                de {totalPossibleResults} posibles
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white border-orange-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-900">
                Progreso
              </CardTitle>
              <Trophy className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {completionPercentage}%
              </div>
              <p className="text-xs text-gray-600">completado</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Formulario para añadir resultados */}
          <Card className="bg-white border-orange-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-gray-900">
                <Plus className="w-5 h-5 text-orange-600" />
                <span>Añadir Resultado</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AddResultForm teams={teams} workouts={workouts} />
            </CardContent>
          </Card>

          {/* Progreso por WOD */}
          <Card className="bg-white border-orange-200">
            <CardHeader>
              <CardTitle className="text-gray-900">
                Progreso por Entrenamiento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {workouts.map((workout) => {
                  const workoutResults = results.filter(
                    (r) => r.workout_id === workout.id
                  );
                  const progress = Math.round(
                    (workoutResults.length / teams.length) * 100
                  );

                  return (
                    <div key={workout.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900">
                          {workout.name}
                        </span>
                        <Badge
                          variant={progress === 100 ? "default" : "secondary"}
                          className={
                            progress === 100
                              ? "bg-orange-600 text-white"
                              : "bg-orange-100 text-orange-800"
                          }
                        >
                          {workoutResults.length}/{teams.length}
                        </Badge>
                      </div>
                      <div className="w-full bg-orange-200 rounded-full h-2">
                        <div
                          className="bg-orange-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-700">
                        {progress}% completado
                      </p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Secciones de gestión */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          {/* Gestión de Equipos */}
          <Card className="bg-white border-orange-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-gray-900">
                <Users className="w-5 h-5 text-orange-600" />
                <span>Gestión de Equipos</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TeamManagement teams={teams} />
            </CardContent>
          </Card>

          {/* Gestión de WODs */}
          <Card className="bg-white border-orange-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-gray-900">
                <Target className="w-5 h-5 text-orange-600" />
                <span>Gestión de WODs</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <WorkoutManagement workouts={workouts} />
            </CardContent>
          </Card>
        </div>

        {/* Gestión de Heats */}
        <Card className="mt-8 bg-white border-orange-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-gray-900">
              <Users className="w-5 h-5 text-orange-600" />
              <span>🎲 Gestión de Heats (Sorteo)</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <HeatManagement teams={teams} workouts={workouts} />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
