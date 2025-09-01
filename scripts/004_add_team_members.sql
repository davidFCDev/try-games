-- Agregar campos para integrantes del equipo
ALTER TABLE teams ADD COLUMN IF NOT EXISTS member1 TEXT;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS member2 TEXT;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS member3 TEXT;

-- Actualizar la política para permitir actualizaciones de integrantes
-- (Las políticas existentes deberían cubrir esto, pero verificamos)
