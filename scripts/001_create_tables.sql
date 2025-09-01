-- Crear tabla de equipos
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de entrenamientos/pruebas
CREATE TABLE IF NOT EXISTS workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  workout_number INTEGER NOT NULL UNIQUE CHECK (workout_number BETWEEN 1 AND 4),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de resultados
CREATE TABLE IF NOT EXISTS results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  workout_id UUID NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  time_seconds INTEGER NOT NULL CHECK (time_seconds > 0),
  points INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_id, workout_id)
);

-- Habilitar Row Level Security
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE results ENABLE ROW LEVEL SECURITY;

-- Políticas para permitir lectura pública (todos pueden ver los datos)
CREATE POLICY "Allow public read access to teams" ON teams FOR SELECT USING (true);
CREATE POLICY "Allow public read access to workouts" ON workouts FOR SELECT USING (true);
CREATE POLICY "Allow public read access to results" ON results FOR SELECT USING (true);

-- Solo usuarios autenticados pueden insertar/actualizar/eliminar
CREATE POLICY "Allow authenticated users to manage teams" ON teams FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users to manage workouts" ON workouts FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users to manage results" ON results FOR ALL USING (auth.uid() IS NOT NULL);

-- Función para actualizar timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at en results
CREATE TRIGGER update_results_updated_at BEFORE UPDATE ON results
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
