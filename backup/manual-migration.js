// Script manual para ejecutar en la consola del navegador
// Ir a tu aplicación en el navegador, abrir DevTools (F12), ir a Console y pegar este código:

async function addLaneColumn() {
  console.log("🔄 Agregando columna lane a la tabla teams...");

  try {
    // Nota: Este enfoque usa la API directa de Supabase
    // Reemplaza estas URLs con las tuyas desde el panel de Supabase

    const response = await fetch(
      "https://ypvsuyzgiexcqtcttvam.supabase.co/rest/v1/rpc/exec_sql",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: "TU_ANON_KEY_AQUI", // Reemplazar con tu clave anónima
          Authorization: "Bearer TU_ANON_KEY_AQUI", // Reemplazar con tu clave anónima
        },
        body: JSON.stringify({
          sql: "ALTER TABLE teams ADD COLUMN IF NOT EXISTS lane TEXT DEFAULT NULL;",
        }),
      }
    );

    if (response.ok) {
      console.log("✅ Columna lane agregada exitosamente");
    } else {
      console.error("❌ Error:", await response.text());
    }
  } catch (error) {
    console.error("❌ Error ejecutando migración:", error);
  }
}

// Ejecutar la función
addLaneColumn();

// INSTRUCCIONES:
// 1. Reemplaza TU_ANON_KEY_AQUI con tu clave anónima de Supabase
// 2. Copia y pega este código en la consola del navegador
// 3. Presiona Enter para ejecutar
