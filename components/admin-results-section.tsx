"use client";

import { ResultsTable } from "@/components/results-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { Trophy } from "lucide-react";
import { useState } from "react";

interface Result {
  id: string;
  team_id: string;
  workout_id: string;
  time_seconds: number;
  points: number;
  teams: { name: string };
  workouts: { name: string; workout_number: number };
}

interface AdminResultsSectionProps {
  initialResults: Result[];
}

export function AdminResultsSection({
  initialResults,
}: AdminResultsSectionProps) {
  const [results, setResults] = useState<Result[]>(initialResults);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  const refreshResults = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("results")
        .select(
          `
          *,
          teams(name),
          workouts(name, workout_number)
        `
        )
        .order("points", { ascending: false });

      if (error) {
        console.error("Error al refrescar resultados:", error);
        return;
      }

      setResults(data || []);
    } catch (error) {
      console.error("Error al refrescar resultados:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mt-8 bg-white border-orange-200">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-gray-900">
          <Trophy className="w-5 h-5 text-orange-600" />
          <span>Gestión de Resultados</span>
          {isLoading && (
            <div className="w-4 h-4 border border-orange-600 border-t-transparent rounded-full animate-spin ml-2"></div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {results.length > 0 ? (
          <ResultsTable results={results} onResultDeleted={refreshResults} />
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p>No hay resultados registrados aún.</p>
            <p className="text-sm mt-2">
              Los resultados aparecerán aquí una vez que agregues algunos.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
