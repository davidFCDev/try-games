"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { RotateCcw, Shuffle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Team {
  id: string;
  name: string;
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

interface HeatManagementProps {
  teams: Team[];
  workouts: Workout[];
}

export function HeatManagement({ teams, workouts }: HeatManagementProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [startTime, setStartTime] = useState("08:00");
  const router = useRouter();
  const supabase = createClient();

  // Función para guardar la hora de inicio
  const saveStartTime = async (time: string) => {
    try {
      // Intentar actualizar si ya existe una configuración
      const { data: existing } = await supabase
        .from("heat_config")
        .select("id")
        .limit(1)
        .single();

      if (existing) {
        await supabase
          .from("heat_config")
          .update({ start_time: time })
          .eq("id", existing.id);
      } else {
        await supabase.from("heat_config").insert({ start_time: time });
      }
    } catch (error) {
      console.error("Error saving start time:", error);
    }
  };

  // Función para obtener la hora de inicio guardada
  const getStartTime = async (): Promise<string> => {
    try {
      const { data } = await supabase
        .from("heat_config")
        .select("start_time")
        .limit(1)
        .single();

      return data?.start_time || "08:00";
    } catch (error) {
      console.error("Error getting start time:", error);
      return "08:00";
    }
  };

  // Cargar la hora de inicio guardada al montar el componente
  useEffect(() => {
    const loadStartTime = async () => {
      const savedTime = await getStartTime();
      setStartTime(savedTime);
    };
    loadStartTime();
  }, []);

  // Función para calcular y asignar heats
  const generateHeats = async () => {
    setIsLoading(true);

    try {
      const totalTeams = teams.length;
      if (totalTeams === 0) {
        alert("No hay equipos para sortear");
        return;
      }

      // Calcular número de heats
      let totalHeats = Math.ceil(totalTeams / 3);

      // Si el último heat tiene solo 1 equipo, redistribuir
      const teamsInLastHeat = totalTeams % 3;
      if (teamsInLastHeat === 1 && totalHeats > 1) {
        // Redistribuir: el penúltimo heat tendrá 2 equipos y el último también 2
        totalHeats = totalHeats; // Mantener el mismo número de heats
      }

      // Crear array de equipos aleatorio
      const shuffledTeams = [...teams].sort(() => Math.random() - 0.5);

      // Calcular equipos por heat con redistribución si es necesario
      const teamsPerHeat = [];
      if (teamsInLastHeat === 1 && totalHeats > 1) {
        // Redistribuir: todos los heats menos los últimos 2 tienen 3 equipos
        for (let i = 0; i < totalHeats - 2; i++) {
          teamsPerHeat.push(3);
        }
        // Los últimos 2 heats tienen 2 equipos cada uno
        teamsPerHeat.push(2, 2);
      } else {
        // Distribución normal
        for (let i = 0; i < totalHeats; i++) {
          if (i === totalHeats - 1) {
            // Último heat: puede tener 1, 2 o 3 equipos
            teamsPerHeat.push(totalTeams - i * 3);
          } else {
            teamsPerHeat.push(3);
          }
        }
      }

      // Asignar equipos a heats y pistas
      const updates = [];
      let teamIndex = 0;
      const lanes = ["A", "B", "C"]; // Pistas disponibles

      for (let heatNumber = 1; heatNumber <= totalHeats; heatNumber++) {
        const teamsInThisHeat = teamsPerHeat[heatNumber - 1];

        for (let i = 0; i < teamsInThisHeat; i++) {
          if (teamIndex < shuffledTeams.length) {
            const assignedLane = lanes[i] || null; // Asignar pista A, B, C según posición
            updates.push({
              id: shuffledTeams[teamIndex].id,
              heat: heatNumber,
              lane: assignedLane,
            });
            teamIndex++;
          }
        }
      }

      // Actualizar en la base de datos con manejo de errores para la columna lane
      for (const update of updates) {
        try {
          const { error } = await supabase
            .from("teams")
            .update({
              heat: update.heat,
              lane: update.lane,
            })
            .eq("id", update.id);

          if (error) throw error;
        } catch (error: any) {
          // Si falla por la columna lane, intentar solo con heat
          if (error?.message?.includes("lane")) {
            console.warn("Columna lane no disponible, usando solo heat");
            const { error: heatError } = await supabase
              .from("teams")
              .update({ heat: update.heat })
              .eq("id", update.id);

            if (heatError) throw heatError;
          } else {
            throw error;
          }
        }
      }

      // Guardar la hora de inicio configurada
      await saveStartTime(startTime);

      alert(
        `✅ Heats generados exitosamente!\n\nTotal de equipos: ${totalTeams}\nTotal de heats: ${totalHeats}`
      );
      router.refresh();
    } catch (error) {
      console.error("Error generating heats:", error);
      alert("Error al generar los heats. Inténtalo de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  // Función para resetear heats
  const resetHeats = async () => {
    if (
      !confirm(
        "¿Estás seguro de que quieres resetear todos los heats?\n\nEsto eliminará:\n• Todos los heats asignados a equipos\n• Todas las pistas (Zona A, B, C) asignadas\n• La configuración de hora de inicio\n\nEsta acción no se puede deshacer."
      )
    ) {
      return;
    }

    setIsLoading(true);

    try {
      // Resetear heats y pistas de los equipos con manejo de errores
      try {
        const { error: teamsError } = await supabase
          .from("teams")
          .update({
            heat: null,
            lane: null,
          })
          .not("heat", "is", null); // Solo actualizar equipos que tengan heat asignado (no null)

        if (teamsError) throw teamsError;
      } catch (error: any) {
        // Si falla por la columna lane, intentar solo con heat
        if (error?.message?.includes("lane")) {
          console.warn("Columna lane no disponible, reseteando solo heat");
          const { error: heatError } = await supabase
            .from("teams")
            .update({ heat: null })
            .not("heat", "is", null);

          if (heatError) throw heatError;
        } else {
          throw error;
        }
      }

      // Resetear configuración de hora de inicio
      const { error: configError } = await supabase
        .from("heat_config")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000"); // Eliminar todas las configuraciones

      // No lanzar error si no existe configuración, es normal
      if (configError && configError.code !== "PGRST116") {
        console.warn("Warning resetting config:", configError);
      }

      // Resetear hora de inicio en el componente
      setStartTime("08:00");

      alert("✅ Heats reseteados exitosamente!");
      router.refresh();
    } catch (error) {
      console.error("Error resetting heats:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Error desconocido";
      alert(
        `Error al resetear los heats: ${errorMessage}\nRevisa la consola para más detalles.`
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Calcular estadísticas de heats
  const heatsStats = () => {
    const teamsWithHeats = teams.filter((team) => team.heat);
    const totalHeats = Math.max(
      ...teamsWithHeats.map((team) => team.heat || 0),
      0
    );

    return {
      totalTeams: teams.length,
      teamsAssigned: teamsWithHeats.length,
      totalHeats,
      hasHeats: totalHeats > 0,
    };
  };

  // Calcular horarios de heats
  const calculateSchedule = (): WorkoutSchedule[] => {
    const stats = heatsStats();
    if (!stats.hasHeats) return [];

    const [hours, minutes] = startTime.split(":").map(Number);
    const startDateTime = new Date();
    startDateTime.setHours(hours, minutes, 0, 0);

    const sortedWorkouts = [...workouts].sort(
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
      for (let heatNumber = 1; heatNumber <= stats.totalHeats; heatNumber++) {
        const teamsInHeat = teams.filter((team) => team.heat === heatNumber);

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

  const stats = heatsStats();
  const schedule = calculateSchedule();

  return (
    <div className="space-y-6">
      {/* Estadísticas de Heats */}
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <h2 className="text-lg font-semibold text-orange-900 mb-3">
          📊 Estado de los Heats
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-3 border border-orange-200">
            <div className="text-2xl font-bold text-orange-600">
              {stats.totalTeams}
            </div>
            <div className="text-sm text-orange-700">Equipos totales</div>
          </div>
          <div className="bg-white rounded-lg p-3 border border-orange-200">
            <div className="text-2xl font-bold text-orange-600">
              {stats.teamsAssigned}
            </div>
            <div className="text-sm text-orange-700">Equipos asignados</div>
          </div>
          <div className="bg-white rounded-lg p-3 border border-orange-200">
            <div className="text-2xl font-bold text-orange-600">
              {stats.totalHeats}
            </div>
            <div className="text-sm text-orange-700">Heats creados</div>
          </div>
          <div className="bg-white rounded-lg p-3 border border-orange-200">
            <div
              className={`text-lg font-semibold ${
                stats.hasHeats ? "text-green-600" : "text-gray-600"
              }`}
            >
              {stats.hasHeats ? "Configurado" : "Sin configurar"}
            </div>
          </div>
        </div>
      </div>

      {/* Configuración de hora de inicio */}
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <Label
          htmlFor="start-time"
          className="text-sm font-medium text-orange-900 mb-2 block"
        >
          ⏰ Hora de inicio de la competición
        </Label>
        <div className="flex items-center space-x-3">
          <Input
            id="start-time"
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-32 border-orange-300 focus:border-orange-500 focus:ring-orange-500"
          />
          <span className="text-sm text-orange-700">
            Esta hora se aplicará al generar los heats
          </span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={generateHeats}
          disabled={isLoading || stats.totalTeams === 0}
          className="flex-1 bg-orange-600 hover:bg-orange-700 text-white cursor-pointer"
        >
          <Shuffle className="w-4 h-4 mr-2" />
          {isLoading ? "Sorteando..." : "Sortear Heats"}
        </Button>

        <Button
          onClick={resetHeats}
          disabled={isLoading || !stats.hasHeats}
          variant="outline"
          className="flex-1 border-orange-300 text-orange-600 hover:bg-orange-50 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          {isLoading ? "Reseteando..." : "Resetear Heats"}
        </Button>
      </div>

      {/* Cronograma de Heats - Solo se muestra cuando hay heats asignados */}
      {stats.hasHeats && schedule.length > 0 && (
        <div className="bg-white border border-orange-200 rounded-lg p-4">
          <h3 className="font-semibold text-orange-900 mb-4 text-lg">
            📅 Cronograma de Competición
          </h3>
          <div className="space-y-6">
            {schedule.map((workoutSchedule, workoutIndex) => (
              <div
                key={workoutSchedule.workout.id}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900 text-lg">
                    {workoutSchedule.workout.name}
                  </h4>
                  <span className="bg-green-100 text-green-800 text-sm font-medium px-2 py-1 rounded">
                    WOD {workoutSchedule.workout.workout_number}
                  </span>
                </div>

                <div className="grid gap-3">
                  {workoutSchedule.heats.map((heat) => (
                    <div
                      key={`${workoutSchedule.workout.id}-${heat.heatNumber}`}
                      className="bg-gray-50 border border-gray-200 rounded p-3"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="bg-green-600 text-white text-sm font-bold px-2 py-1 rounded">
                            Heat {heat.heatNumber}
                          </span>
                          <span className="text-sm font-medium text-gray-800">
                            {formatTime(heat.startTime)} -{" "}
                            {formatTime(heat.endTime)}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {sortTeamsByZone(heat.teams).map((team) => (
                          <span
                            key={team.id}
                            className="bg-white border border-gray-200 text-gray-700 text-xs px-2 py-1 rounded flex items-center space-x-1"
                          >
                            <span>{team.name}</span>
                            {team.lane && (
                              <span
                                className={`text-xs px-1 rounded ${getZoneColor(
                                  team.lane
                                )}`}
                              >
                                {team.lane}
                              </span>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 text-xs text-gray-600 bg-orange-50 p-3 rounded">
            <strong>Información del cronograma:</strong>
            <ul className="mt-2 space-y-1">
              <li>• Cada heat dura 10 minutos</li>
              <li>• 5 minutos de intercambio entre heats</li>
              <li>• 10 minutos de descanso entre WODs</li>
              <li>• Pistas asignadas: A, B, C</li>
              <li>• Inicio de competición: {startTime}</li>
            </ul>
          </div>
        </div>
      )}

      <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
        <strong>Nota:</strong> Los heats se formarán con 3 equipos cada uno. Si
        queda un equipo solo en el último heat, se redistribuirán
        automáticamente para que ningún equipo quede solo.
      </div>
    </div>
  );
}
