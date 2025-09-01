"use client";

import type React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { Edit, Plus, Save, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface Team {
  id: string;
  name: string;
  avatar_url?: string;
  member1?: string;
  member2?: string;
  member3?: string;
  heat?: number | null;
}

interface TeamManagementProps {
  teams: Team[];
}

export function TeamManagement({ teams }: TeamManagementProps) {
  const [newTeamName, setNewTeamName] = useState("");
  const [newMember1, setNewMember1] = useState("");
  const [newMember2, setNewMember2] = useState("");
  const [newMember3, setNewMember3] = useState("");
  const [newAvatarUrl, setNewAvatarUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Estados para edición
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [editTeamName, setEditTeamName] = useState("");
  const [editMember1, setEditMember1] = useState("");
  const [editMember2, setEditMember2] = useState("");
  const [editMember3, setEditMember3] = useState("");
  const [editAvatarUrl, setEditAvatarUrl] = useState("");

  const router = useRouter();
  const supabase = createClient();

  const handleAddTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;

    setIsLoading(true);
    try {
      const { error } = await supabase.from("teams").insert([
        {
          name: newTeamName.trim(),
          member1: newMember1.trim() || null,
          member2: newMember2.trim() || null,
          member3: newMember3.trim() || null,
          avatar_url: newAvatarUrl.trim() || null,
        },
      ]);

      if (error) throw error;

      setNewTeamName("");
      setNewMember1("");
      setNewMember2("");
      setNewMember3("");
      setNewAvatarUrl("");
      router.refresh();
    } catch (error) {
      console.error("Error adding team:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditTeam = (team: Team) => {
    setEditingTeamId(team.id);
    setEditTeamName(team.name);
    setEditMember1(team.member1 || "");
    setEditMember2(team.member2 || "");
    setEditMember3(team.member3 || "");
    setEditAvatarUrl(team.avatar_url || "");
  };

  const handleSaveEdit = async () => {
    if (!editTeamName.trim() || !editingTeamId) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("teams")
        .update({
          name: editTeamName.trim(),
          member1: editMember1.trim() || null,
          member2: editMember2.trim() || null,
          member3: editMember3.trim() || null,
          avatar_url: editAvatarUrl.trim() || null,
        })
        .eq("id", editingTeamId);

      if (error) throw error;

      handleCancelEdit();
      router.refresh();
    } catch (error) {
      console.error("Error updating team:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingTeamId(null);
    setEditTeamName("");
    setEditMember1("");
    setEditMember2("");
    setEditMember3("");
    setEditAvatarUrl("");
  };

  const handleDeleteTeam = async (teamId: string) => {
    if (
      !confirm(
        "¿Estás seguro de que quieres eliminar este equipo? Se eliminarán también todos sus resultados."
      )
    ) {
      return;
    }

    setIsLoading(true);
    try {
      // Primero eliminar resultados del equipo
      await supabase.from("results").delete().eq("team_id", teamId);

      // Luego eliminar el equipo
      const { error } = await supabase.from("teams").delete().eq("id", teamId);

      if (error) throw error;

      router.refresh();
    } catch (error) {
      console.error("Error deleting team:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Formulario para añadir equipo */}
      <form onSubmit={handleAddTeam} className="space-y-3">
        <div>
          <Label htmlFor="teamName">Nombre del Equipo</Label>
          <Input
            id="teamName"
            value={newTeamName}
            onChange={(e) => setNewTeamName(e.target.value)}
            placeholder="Ej: Team Alpha"
            disabled={isLoading}
          />
        </div>

        <div>
          <Label htmlFor="avatarUrl">Avatar del Equipo (URL opcional)</Label>
          <div className="flex items-center space-x-3">
            <div className="flex-1">
              <Input
                id="avatarUrl"
                value={newAvatarUrl}
                onChange={(e) => setNewAvatarUrl(e.target.value)}
                placeholder="https://ejemplo.com/imagen.jpg"
                disabled={isLoading}
                type="url"
              />
            </div>
            {(newAvatarUrl || newTeamName) && (
              <Avatar className="h-12 w-12">
                <AvatarImage
                  src={newAvatarUrl || undefined}
                  alt="Vista previa del avatar"
                />
                <AvatarFallback>
                  {newTeamName.slice(0, 2).toUpperCase() || "?"}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Pega aquí el enlace de la imagen del avatar del equipo
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <Label htmlFor="member1">Integrante 1</Label>
            <Input
              id="member1"
              value={newMember1}
              onChange={(e) => setNewMember1(e.target.value)}
              placeholder="Nombre del integrante"
              disabled={isLoading}
            />
          </div>
          <div>
            <Label htmlFor="member2">Integrante 2</Label>
            <Input
              id="member2"
              value={newMember2}
              onChange={(e) => setNewMember2(e.target.value)}
              placeholder="Nombre del integrante"
              disabled={isLoading}
            />
          </div>
          <div>
            <Label htmlFor="member3">Integrante 3</Label>
            <Input
              id="member3"
              value={newMember3}
              onChange={(e) => setNewMember3(e.target.value)}
              placeholder="Nombre del integrante"
              disabled={isLoading}
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={isLoading || !newTeamName.trim()}
          className="w-full"
        >
          <Plus className="w-4 h-4 mr-2" />
          Añadir Equipo
        </Button>
      </form>

      {/* Lista de equipos */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        <h4 className="font-medium text-sm text-gray-700">
          Equipos Actuales ({teams.length})
        </h4>
        {teams.map((team) => (
          <div
            key={team.id}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            {editingTeamId === team.id ? (
              // Modo edición
              <div className="flex-1 space-y-3">
                <div>
                  <Label htmlFor={`edit-name-${team.id}`}>
                    Nombre del Equipo
                  </Label>
                  <Input
                    id={`edit-name-${team.id}`}
                    value={editTeamName}
                    onChange={(e) => setEditTeamName(e.target.value)}
                    placeholder="Nombre del equipo"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <Label htmlFor={`edit-avatar-${team.id}`}>
                    Avatar del Equipo (URL)
                  </Label>
                  <div className="flex items-center space-x-3">
                    <div className="flex-1">
                      <Input
                        id={`edit-avatar-${team.id}`}
                        value={editAvatarUrl}
                        onChange={(e) => setEditAvatarUrl(e.target.value)}
                        placeholder="https://ejemplo.com/imagen.jpg"
                        disabled={isLoading}
                        type="url"
                      />
                    </div>
                    {(editAvatarUrl || editTeamName) && (
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={editAvatarUrl || undefined}
                          alt="Vista previa del avatar"
                        />
                        <AvatarFallback>
                          {editTeamName.slice(0, 2).toUpperCase() || "?"}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <div>
                    <Label htmlFor={`edit-member1-${team.id}`}>
                      Integrante 1
                    </Label>
                    <Input
                      id={`edit-member1-${team.id}`}
                      value={editMember1}
                      onChange={(e) => setEditMember1(e.target.value)}
                      placeholder="Nombre del integrante"
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`edit-member2-${team.id}`}>
                      Integrante 2
                    </Label>
                    <Input
                      id={`edit-member2-${team.id}`}
                      value={editMember2}
                      onChange={(e) => setEditMember2(e.target.value)}
                      placeholder="Nombre del integrante"
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`edit-member3-${team.id}`}>
                      Integrante 3
                    </Label>
                    <Input
                      id={`edit-member3-${team.id}`}
                      value={editMember3}
                      onChange={(e) => setEditMember3(e.target.value)}
                      placeholder="Nombre del integrante"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button
                    onClick={handleSaveEdit}
                    disabled={isLoading || !editTeamName.trim()}
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
              <>
                <div className="flex items-center space-x-3 flex-1">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={team.avatar_url || undefined}
                      alt={`Avatar de ${team.name}`}
                    />
                    <AvatarFallback>
                      {team.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="font-medium">{team.name}</div>
                    {(team.member1 || team.member2 || team.member3) && (
                      <div className="text-sm text-gray-600 mt-1">
                        Integrantes:{" "}
                        {[team.member1, team.member2, team.member3]
                          .filter(Boolean)
                          .join(", ")}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditTeam(team)}
                    disabled={isLoading || editingTeamId !== null}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteTeam(team.id)}
                    disabled={isLoading || editingTeamId !== null}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
