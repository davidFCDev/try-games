"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import { Edit, Eye, EyeOff, Plus, Save, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface Workout {
  id: string;
  name: string;
  workout_number: number;
  description?: string;
  is_visible?: boolean;
}

interface WorkoutManagementProps {
  workouts: Workout[];
}

export function WorkoutManagement({ workouts }: WorkoutManagementProps) {
  const [newWorkout, setNewWorkout] = useState({
    name: "",
    description: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  // Estados para edición
  const [editingWorkoutId, setEditingWorkoutId] = useState<string | null>(null);
  const [editWorkout, setEditWorkout] = useState({
    name: "",
    description: "",
  });

  const router = useRouter();
  const supabase = createClient();

  const handleAddWorkout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkout.name.trim()) return;

    setIsLoading(true);
    try {
      const nextNumber =
        Math.max(...workouts.map((w) => w.workout_number), 0) + 1;

      const { error } = await supabase.from("workouts").insert([
        {
          name: newWorkout.name.trim(),
          description: newWorkout.description.trim() || null,
          workout_number: nextNumber,
        },
      ]);

      if (error) throw error;

      setNewWorkout({ name: "", description: "" });
      router.refresh();
    } catch (error) {
      console.error("Error adding workout:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditWorkout = (workout: Workout) => {
    setEditingWorkoutId(workout.id);
    setEditWorkout({
      name: workout.name,
      description: workout.description || "",
    });
  };

  const handleSaveEdit = async () => {
    if (!editWorkout.name.trim() || !editingWorkoutId) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("workouts")
        .update({
          name: editWorkout.name.trim(),
          description: editWorkout.description.trim() || null,
        })
        .eq("id", editingWorkoutId);

      if (error) throw error;

      handleCancelEdit();
      router.refresh();
    } catch (error) {
      console.error("Error updating workout:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingWorkoutId(null);
    setEditWorkout({ name: "", description: "" });
  };

  const handleDeleteWorkout = async (workoutId: string) => {
    if (
      !confirm(
        "¿Estás seguro de que quieres eliminar este WOD? Se eliminarán también todos los resultados asociados."
      )
    ) {
      return;
    }

    setIsLoading(true);
    try {
      // Primero eliminar resultados del WOD
      await supabase.from("results").delete().eq("workout_id", workoutId);

      // Luego eliminar el WOD
      const { error } = await supabase
        .from("workouts")
        .delete()
        .eq("id", workoutId);

      if (error) throw error;

      router.refresh();
    } catch (error) {
      console.error("Error deleting workout:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleVisibility = async (
    workoutId: string,
    currentVisibility: boolean
  ) => {
    setIsLoading(true);
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
    }
  };

  return (
    <div className="space-y-4">
      {/* Formulario para añadir WOD */}
      <form onSubmit={handleAddWorkout} className="space-y-3">
        <div>
          <Label htmlFor="workoutName">Nombre del WOD</Label>
          <Input
            id="workoutName"
            value={newWorkout.name}
            onChange={(e) =>
              setNewWorkout((prev) => ({ ...prev, name: e.target.value }))
            }
            placeholder="Ej: WOD 1 - Fran"
            disabled={isLoading}
          />
        </div>
        <div>
          <Label htmlFor="workoutDescription">Descripción del WOD</Label>
          <Textarea
            id="workoutDescription"
            value={newWorkout.description}
            onChange={(e) =>
              setNewWorkout((prev) => ({
                ...prev,
                description: e.target.value,
              }))
            }
            placeholder="21-15-9 Thrusters (95/65) Pull-ups"
            disabled={isLoading}
            rows={3}
          />
        </div>
        <Button
          type="submit"
          disabled={isLoading || !newWorkout.name.trim()}
          className="w-full"
        >
          <Plus className="w-4 h-4 mr-2" />
          Añadir WOD
        </Button>
      </form>

      {/* Lista de WODs */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        <h4 className="font-medium text-sm text-gray-700">
          WODs Actuales ({workouts.length})
        </h4>
        {workouts.map((workout) => (
          <div key={workout.id} className="p-3 bg-gray-50 rounded-lg">
            {editingWorkoutId === workout.id ? (
              // Modo edición
              <div className="space-y-3">
                <div>
                  <Label htmlFor={`edit-name-${workout.id}`}>
                    Nombre del WOD
                  </Label>
                  <Input
                    id={`edit-name-${workout.id}`}
                    value={editWorkout.name}
                    onChange={(e) =>
                      setEditWorkout((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    placeholder="Nombre del WOD"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <Label htmlFor={`edit-description-${workout.id}`}>
                    Descripción del WOD
                  </Label>
                  <Textarea
                    id={`edit-description-${workout.id}`}
                    value={editWorkout.description}
                    onChange={(e) =>
                      setEditWorkout((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Descripción del WOD"
                    disabled={isLoading}
                    rows={3}
                  />
                </div>
                <div className="flex space-x-2">
                  <Button
                    onClick={handleSaveEdit}
                    disabled={isLoading || !editWorkout.name.trim()}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Guardar
                  </Button>
                  <Button
                    onClick={handleCancelEdit}
                    disabled={isLoading}
                    size="sm"
                    variant="outline"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              // Modo visualización
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h5 className="font-medium">{workout.name}</h5>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        workout.is_visible
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {workout.is_visible ? "Visible" : "Oculto"}
                    </span>
                  </div>
                  {workout.description && (
                    <p className="text-sm text-gray-600 mt-1">
                      {workout.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center space-x-1 ml-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push(`/workout/${workout.id}`)}
                    disabled={editingWorkoutId !== null}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditWorkout(workout)}
                    disabled={isLoading || editingWorkoutId !== null}
                    className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      handleToggleVisibility(
                        workout.id,
                        workout.is_visible || false
                      )
                    }
                    disabled={isLoading || editingWorkoutId !== null}
                    className={`${
                      workout.is_visible
                        ? "text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                        : "text-green-600 hover:text-green-700 hover:bg-green-50"
                    }`}
                    title={workout.is_visible ? "Ocultar WOD" : "Mostrar WOD"}
                  >
                    {workout.is_visible ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteWorkout(workout.id)}
                    disabled={isLoading || editingWorkoutId !== null}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
