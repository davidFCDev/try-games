const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

// Configuración de Supabase (estas deben estar en tus variables de entorno)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error(
    "❌ Faltan variables de entorno: NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY"
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  try {
    console.log("🔄 Ejecutando migración: 010_add_lane_to_teams.sql");

    // Leer el archivo SQL
    const sqlPath = path.join(
      __dirname,
      "scripts",
      "010_add_lane_to_teams.sql"
    );
    const sqlContent = fs.readFileSync(sqlPath, "utf8");

    // Ejecutar las queries por separado
    const queries = sqlContent
      .split(";")
      .map((q) => q.trim())
      .filter((q) => q.length > 0 && !q.startsWith("--"));

    for (const query of queries) {
      if (query.includes("COMMENT ON")) {
        // Los comentarios no son compatibles con la API REST, los saltamos
        console.log("⏭️  Saltando comentario SQL");
        continue;
      }

      console.log("📝 Ejecutando:", query.substring(0, 50) + "...");
      const { error } = await supabase.rpc("exec_sql", { sql: query });

      if (error) {
        console.error("❌ Error ejecutando query:", error);
        throw error;
      }
    }

    console.log("✅ Migración completada exitosamente");

    // Verificar que la columna fue creada
    const { data, error } = await supabase
      .from("teams")
      .select("id, name, heat, lane")
      .limit(1);

    if (error) {
      console.error("❌ Error verificando migración:", error);
    } else {
      console.log("✅ Verificación exitosa: columna lane disponible");
    }
  } catch (error) {
    console.error("❌ Error en migración:", error);
    process.exit(1);
  }
}

runMigration();
