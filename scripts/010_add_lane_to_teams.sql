-- Agregar campo lane (pista/zona) a la tabla teams
ALTER TABLE teams ADD COLUMN IF NOT EXISTS lane TEXT DEFAULT NULL;

-- Validar que solo se usen las zonas permitidas
ALTER TABLE teams ADD CONSTRAINT check_lane_values 
  CHECK (lane IS NULL OR lane IN ('A', 'B', 'C'));

-- Índice para mejorar las consultas por lane
CREATE INDEX IF NOT EXISTS idx_teams_lane ON teams(lane);

-- Comentario para documentar el campo
COMMENT ON COLUMN teams.lane IS 'Zona/pista asignada al equipo: A, B, o C';
