"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { Trophy } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;

      if (data.user) {
        console.log("Login exitoso");
        // Redirigir al admin
        window.location.href = "/admin";
      }
    } catch (error: unknown) {
      console.error("Error en login:", error);
      setError(error instanceof Error ? error.message : "Ha ocurrido un error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="text-center">
            <div className="w-16 h-16 bg-red-500 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Try Games</h1>
            <p className="text-slate-600">Panel de Administración</p>
          </div>

          <Card className="competition-card">
            <CardHeader>
              <CardTitle className="text-2xl text-center">
                Iniciar Sesión
              </CardTitle>
              <CardDescription className="text-center">
                Accede al panel de administración de la competición
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin}>
                <div className="flex flex-col gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@trygames.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-11"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password">Contraseña</Label>
                    <Input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-11"
                    />
                  </div>
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  )}
                  <Button
                    type="submit"
                    className="w-full h-11 bg-red-500 hover:bg-red-600 text-white font-medium"
                    disabled={isLoading}
                  >
                    {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
                  </Button>
                </div>
                <div className="mt-6 text-center text-sm">
                  <span className="text-slate-600">¿No tienes cuenta? </span>
                  <Link
                    href="/auth/sign-up"
                    className="text-red-500 hover:text-red-600 font-medium"
                  >
                    Regístrate
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="text-center">
            <Link
              href="/"
              className="text-sm text-slate-600 hover:text-slate-900"
            >
              ← Volver a la competición
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
