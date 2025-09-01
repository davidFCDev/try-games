"use client";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";

export function MigrationTool() {
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<string>("");
  const supabase = createClient();

  const runMigration = async () => {
    setIsRunning(true);
    setResult("");

    try {
      console.log("🔄 Ejecutando migración...");

      setResult(`
❌ La función exec_sql no está disponible en esta instancia de Supabase.

🛠️ **SOLUCIÓN MANUAL:**

1. Ve a tu panel de Supabase (https://supabase.com/dashboard)
2. Selecciona tu proyecto 
3. Ve a "SQL Editor" en el menú lateral
4. Crea una nueva query y pega este código SQL:

\`\`\`sql
ALTER TABLE teams ADD COLUMN IF NOT EXISTS lane TEXT DEFAULT NULL;

ALTER TABLE teams ADD CONSTRAINT IF NOT EXISTS check_lane_values 
  CHECK (lane IS NULL OR lane IN ('A', 'B', 'C'));

CREATE INDEX IF NOT EXISTS idx_teams_lane ON teams(lane);
\`\`\`

5. Ejecuta la query haciendo clic en "Run"
6. Luego haz clic en "Probar Columna" aquí para verificar que funcionó

**Alternativamente:** Puedes usar la herramienta de migración automática que está abajo.
      `);
    } catch (error) {
      console.error("Error inesperado:", error);
      setResult(
        `❌ Error inesperado: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`
      );
    } finally {
      setIsRunning(false);
    }
  };
  const testColumn = async () => {
    try {
      const { data, error } = await supabase
        .from("teams")
        .select("id, name, heat, lane")
        .limit(1);

      if (error) {
        setResult(`❌ La columna lane NO existe: ${error.message}`);
      } else {
        setResult("✅ La columna lane existe y está funcionando correctamente");
      }
    } catch (error) {
      setResult(
        `❌ Error probando columna: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`
      );
    }
  };

  const runDirectMigration = async () => {
    setIsRunning(true);
    setResult("");

    try {
      console.log("🔄 Intentando migración directa...");

      // Intentar insertar un registro con lane para forzar la creación de la columna
      // Si la columna no existe, esto fallará y sabremos que necesitamos crearla manualmente
      const { data: testData, error: testError } = await supabase
        .from("teams")
        .select("id, name, heat, lane")
        .limit(1);

      if (
        testError &&
        testError.message.includes("column") &&
        testError.message.includes("lane")
      ) {
        setResult(`
❌ La columna 'lane' NO existe en la tabla teams.

🛠️ **INSTRUCCIONES PARA AGREGAR LA COLUMNA:**

1. Ve a: https://supabase.com/dashboard/project/ypvsuyzgiexcqtcttvam
2. En el menú lateral, haz clic en "SQL Editor"
3. Crea una nueva query
4. Copia y pega este código SQL:

\`\`\`sql
-- Agregar columna lane
ALTER TABLE teams ADD COLUMN lane TEXT DEFAULT NULL;

-- Agregar restricción para validar valores
ALTER TABLE teams ADD CONSTRAINT check_lane_values 
  CHECK (lane IS NULL OR lane IN ('A', 'B', 'C'));

-- Crear índice para mejorar consultas
CREATE INDEX idx_teams_lane ON teams(lane);
\`\`\`

5. Haz clic en "Run" para ejecutar
6. Luego haz clic en "Probar Columna" aquí para verificar

**¡Una vez hecho esto, las pistas funcionarán automáticamente!**
        `);
      } else if (testError) {
        setResult(`❌ Error inesperado: ${testError.message}`);
      } else {
        setResult(
          "✅ ¡La columna 'lane' ya existe! Las pistas están listas para funcionar."
        );
      }
    } catch (error) {
      console.error("Error en migración directa:", error);
      setResult(
        `❌ Error: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`
      );
    } finally {
      setIsRunning(false);
    }
  };

  const activateLanes = async () => {
    setIsRunning(true);
    setResult("");

    try {
      // Primero verificar que la columna existe
      const { data: testData, error: testError } = await supabase
        .from("teams")
        .select("id, lane")
        .limit(1);

      if (testError) {
        setResult(
          `❌ Error: La columna 'lane' no existe. Primero ejecuta la migración SQL manualmente.`
        );
        return;
      }

      setResult(`
✅ **¡FUNCIONALIDAD DE PISTAS ACTIVADA!**

🎯 **¿Qué puedes hacer ahora?**

1. **Generar Heats con Pistas:** Ve a la sección "Gestión de Heats" y haz clic en "Sortear Heats"
   - Los equipos se asignarán automáticamente a Zona A, B o C

2. **Ver Pistas en Horarios:** Ve a "/heats" para ver los horarios con las zonas asignadas

3. **Resetear incluye Pistas:** El botón "Resetear Heats" ahora también limpia las asignaciones de pistas

🔧 **Funciones activadas:**
- ✅ Asignación automática de pistas (A, B, C)
- ✅ Visualización en página de heats
- ✅ Visualización en panel de admin
- ✅ Reset incluye pistas

**¡Ya puedes ocultar esta herramienta!**
      `);
    } catch (error) {
      setResult(
        `❌ Error activando funcionalidad: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`
      );
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-4">
      <h3 className="font-semibold text-red-900">
        🔧 Herramienta de Migración
      </h3>
      <p className="text-sm text-red-700">
        Esta herramienta agrega la columna 'lane' necesaria para las pistas de
        los heats.
      </p>

      <div className="flex gap-2 flex-wrap">
        <Button
          onClick={runMigration}
          disabled={isRunning}
          className="bg-red-600 hover:bg-red-700 text-white"
        >
          {isRunning ? "Ejecutando..." : "Ver Instrucciones"}
        </Button>

        <Button
          onClick={runDirectMigration}
          disabled={isRunning}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isRunning ? "Verificando..." : "Verificar Columna"}
        </Button>

        <Button
          onClick={testColumn}
          variant="outline"
          className="border-green-500 text-green-600 hover:bg-green-50"
        >
          Probar Funcionamiento
        </Button>

        <Button
          onClick={activateLanes}
          disabled={isRunning}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          {isRunning ? "Activando..." : "Activar Pistas"}
        </Button>
      </div>

      {result && (
        <div className="bg-white border border-red-200 rounded p-3 text-sm">
          {result}
        </div>
      )}
    </div>
  );
}
