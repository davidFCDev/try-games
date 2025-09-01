-- Agregar campo heat a la tabla teams
ALTER TABLE teams ADD COLUMN IF NOT EXISTS heat INTEGER DEFAULT NULL;

-- Índice para mejorar las consultas por heat
CREATE INDEX IF NOT EXISTS idx_teams_heat ON teams(heat);
