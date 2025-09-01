"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useRealtimeData } from "@/hooks/use-realtime-data";
import { Calendar, Dumbbell, Trophy } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  const { teams, workouts, results, teamRankings, isLoading, lastUpdate } =
    useRealtimeData();
  const { user } = useAuth();

  const getTeamAvatar = (teamName: string, avatarUrl?: string) => {
    // Usar siempre la misma imagen que sabemos que funciona
    const workingImage =
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=150&h=150&fit=crop&crop=face";

    if (avatarUrl && !avatarUrl.includes("dicebear")) {
      return avatarUrl;
    }

    // Por defecto usar la imagen que funciona
    return workingImage;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-500 rounded-xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-black mb-2">
            Cargando Try Games...
          </h2>
          <p className="text-gray-600">Obteniendo los últimos resultados</p>
        </div>
      </div>
    );
  }

  const topThree = teamRankings.slice(0, 3);

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-gray-900/95 backdrop-blur-sm shadow-lg border-b border-green-500/30">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-6">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center space-x-2 sm:space-x-4 flex-1 min-w-0">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-500 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                <Trophy className="w-6 h-6 sm:w-10 sm:h-10 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-sm sm:text-4xl font-bold title-games text-white truncate">
                  Try Games 2025
                </h1>
                <div className="flex items-center space-x-2 sm:space-x-4">
                  <p className="text-green-400 font-medium text-xs sm:text-base truncate">
                    Competición de tríos mixtos
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-3 flex-shrink-0">
              <Link href="/wods">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-green-400 hover:text-white hover:bg-green-500/20 cursor-pointer px-1.5 sm:px-3 min-w-0"
                >
                  <Dumbbell className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">WODs</span>
                </Button>
              </Link>

              <Link href="/heats">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-green-400 hover:text-white hover:bg-green-500/20 cursor-pointer px-1.5 sm:px-3 min-w-0"
                >
                  <Calendar className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Heats</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="mb-12 sm:mb-16" style={{ overflow: "visible" }}>
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-3xl sm:text-5xl font-bold text-black mb-2 sm:mb-4">
              🏆 Pódium
            </h2>
            <p className="text-base sm:text-lg text-green-600">
              Primeros clasificados
            </p>
          </div>

          <div
            className="flex justify-evenly items-end mb-8 max-w-md sm:max-w-lg lg:max-w-2xl mx-auto"
            style={{ overflow: "visible" }}
          >
            {topThree.map((team, index) => {
              // Buscar el equipo completo para obtener el avatar_url
              const fullTeam = teams.find((t) => t.id === team.team_id);

              return (
                <div
                  key={team.team_id}
                  className={`relative transition-all duration-700 ${
                    index === 0
                      ? "order-2"
                      : index === 1
                      ? "order-1"
                      : "order-3"
                  }`}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    minHeight: "200px", // Reducido para móvil
                    overflow: "visible",
                  }}
                >
                  {/* Caja del avatar - alineada al fondo */}
                  <div
                    className={`
                    relative rounded-2xl transition-all duration-700
                    ${
                      index === 0
                        ? "h-24 w-24 sm:h-32 sm:w-32 lg:h-40 lg:w-40"
                        : index === 1
                        ? "h-20 w-20 sm:h-24 sm:w-24 lg:h-32 lg:w-32"
                        : "h-16 w-16 sm:h-20 sm:w-20 lg:h-28 lg:w-28"
                    }
                    flex items-center justify-center group border-4 border-black shadow-lg
                  `}
                    style={{ overflow: "visible" }}
                  >
                    {/* Badge de posición en esquina superior izquierda sobresaliendo */}
                    <div
                      className={`absolute w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full border-3 border-white flex items-center justify-center shadow-lg font-bold text-sm sm:text-base lg:text-lg z-[100] ${
                        index === 0
                          ? "bg-gradient-to-br from-yellow-400 to-yellow-600 text-black"
                          : index === 1
                          ? "bg-gradient-to-br from-gray-300 to-gray-500 text-black"
                          : "bg-gradient-to-br from-amber-600 to-amber-800 text-white"
                      }`}
                      style={{
                        top: "-20px",
                        left: "-20px",
                      }}
                    >
                      {index + 1}
                    </div>

                    {/* Avatar del equipo como fondo */}
                    <img
                      src={getTeamAvatar(team.team_name, fullTeam?.avatar_url)}
                      alt={`Avatar ${team.team_name}`}
                      className="w-full h-full object-cover rounded-xl"
                    />
                  </div>

                  {/* Contenedor de texto con altura fija */}
                  <div
                    className="mt-2 sm:mt-3 w-20 sm:w-32 lg:w-44 text-center"
                    style={{ height: "50px" }}
                  >
                    <div className="h-8 sm:h-10 flex items-center justify-center overflow-hidden">
                      <p className="font-bold text-black text-xs sm:text-sm lg:text-lg break-words text-center leading-tight px-1 max-w-full">
                        {team.team_name}
                      </p>
                    </div>
                    <p className="text-xs sm:text-sm text-green-600 mt-1">
                      {team.completed_workouts}/{workouts.length} WODs
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center space-x-3 mb-6">
            <span className="text-2xl font-bold text-black">Leaderboard</span>
          </div>

          <div className="grid gap-3">
            {teamRankings.map((team, index) => {
              // Buscar el equipo completo para obtener el avatar_url
              const fullTeam = teams.find((t) => t.id === team.team_id);

              return (
                <div
                  key={team.team_id}
                  className="bg-white border border-gray-400 p-2 sm:p-3 rounded-lg transition-all duration-300 hover:shadow-md hover:border-green-500/40 flex items-center space-x-2 sm:space-x-3"
                >
                  {/* 1. Columna de badges (puesto y heat) */}
                  <div className="flex flex-col space-y-1 flex-shrink-0">
                    {/* Badge de posición */}
                    <Badge
                      variant={index < 3 ? "default" : "secondary"}
                      className={`text-xs sm:text-sm px-2 py-1 h-6 sm:h-8 flex items-center justify-center min-w-[3rem] sm:min-w-[4rem] border-2 ${
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

                    {/* Heat Badge */}
                    {fullTeam?.heat ? (
                      <Badge
                        variant="outline"
                        className="border border-gray-700 text-gray-700 bg-transparent px-1 py-0.5 text-xs font-bold hover:bg-gray-50 transition-colors h-6 sm:h-8 flex items-center justify-center min-w-[3rem] sm:min-w-[4rem]"
                      >
                        HEAT {fullTeam.heat}
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="border border-gray-300 text-gray-600 bg-transparent px-1 py-0.5 text-xs h-6 sm:h-8 flex items-center justify-center min-w-[3rem] sm:min-w-[4rem]"
                      >
                        SIN HEAT
                      </Badge>
                    )}
                  </div>

                  {/* 2. Avatar (solo en desktop) - altura = 2 badges + gap */}
                  <img
                    src={getTeamAvatar(team.team_name, fullTeam?.avatar_url)}
                    alt={`Avatar ${team.team_name}`}
                    className="hidden sm:block w-[4.25rem] h-[4.25rem] rounded object-cover flex-shrink-0 border-2 border-gray-400"
                  />

                  {/* 3. Información del equipo */}
                  <div className="flex-grow min-w-0">
                    {/* Nombre del equipo */}
                    <div className="font-bold text-sm sm:text-lg text-black mb-0.5">
                      {team.team_name}
                    </div>

                    {/* Integrantes */}
                    {fullTeam && (
                      <div className="text-xs sm:text-sm text-green-600 mb-0.5 truncate">
                        {[fullTeam.member1, fullTeam.member2, fullTeam.member3]
                          .filter(Boolean)
                          .join(" • ") || "Sin integrantes"}
                      </div>
                    )}

                    {/* WODs completados */}
                    <div className="text-xs text-gray-600">
                      WODs {team.completed_workouts}/{workouts.length}
                    </div>
                  </div>

                  {/* 4. Puntos al final */}
                  <div className="text-right flex-shrink-0">
                    <div className="font-bold text-lg sm:text-xl text-green-600">
                      {team.total_points}
                    </div>
                    <div className="text-xs text-gray-500">pts</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
