"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { Eye, EyeOff, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface Workout {
  id: string;
  name: string;
  workout_number: number;
  is_visible?: boolean;
}

interface WorkoutVisibilityProps {
  workouts: Workout[];
}

export function WorkoutVisibility({ workouts }: WorkoutVisibilityProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingWorkout, setLoadingWorkout] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  // Debug: log de los workouts que llegan
  console.log("WorkoutVisibility - workouts recibidos:", workouts);

  const handleToggleVisibility = async (
    workoutId: string,
    currentVisibility: boolean
  ) => {
    setIsLoading(true);
    setLoadingWorkout(workoutId);

    try {
      const { error } = await supabase
        .from("workouts")
        .update({ is_visible: !currentVisibility })
        .eq("id", workoutId);

      if (error) throw error;

      router.refresh();
    } catch (error) {
      console.error("Error updating workout visibility:", error);
    } finally {
      setIsLoading(false);
      setLoadingWorkout(null);
    }
  };

  const sortedWorkouts = [...workouts].sort(
    (a, b) => a.workout_number - b.workout_number
  );

  return (
    <Card className="shadow-lg">
      <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
        <CardTitle className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold">Control de Visibilidad WODs</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-3">
          <p className="text-sm text-gray-600 mb-4">
            Controla qué entrenamientos son visibles para los participantes. Los
            WODs ocultos aparecerán borrosos hasta que los reveles.
          </p>

          {sortedWorkouts.map((workout) => (
            <div
              key={workout.id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-white hover:shadow-md transition-shadow"
            >
              <div className="flex items-center space-x-3">
                <Badge
                  variant={workout.is_visible ? "default" : "secondary"}
                  className={`text-sm px-3 py-1 ${
                    workout.is_visible
                      ? "bg-green-100 text-green-800 border-green-300"
                      : "bg-gray-100 text-gray-600 border-gray-300"
                  }`}
                >
                  WOD {workout.workout_number}
                </Badge>
                <div>
                  <p className="font-medium text-gray-900">{workout.name}</p>
                  <p
                    className={`text-sm ${
                      workout.is_visible ? "text-green-600" : "text-gray-500"
                    }`}
                  >
                    {workout.is_visible
                      ? "✓ Visible para participantes"
                      : "⚫ Oculto (borroso)"}
                  </p>
                </div>
              </div>

              <Button
                onClick={() =>
                  handleToggleVisibility(
                    workout.id,
                    workout.is_visible || false
                  )
                }
                disabled={isLoading && loadingWorkout === workout.id}
                size="sm"
                variant={workout.is_visible ? "destructive" : "default"}
                className={`min-w-[120px] ${
                  workout.is_visible
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {isLoading && loadingWorkout === workout.id ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                ) : workout.is_visible ? (
                  <EyeOff className="w-4 h-4 mr-2" />
                ) : (
                  <Eye className="w-4 h-4 mr-2" />
                )}
                {workout.is_visible ? "Ocultar" : "Revelar"}
              </Button>
            </div>
          ))}

          {workouts.length === 0 && (
            <p className="text-center text-gray-500 py-8">
              No hay entrenamientos registrados
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
