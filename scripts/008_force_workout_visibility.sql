-- Script alternativo para añadir visibilidad a workouts
-- Primero verificamos si la columna existe, si no, la creamos

DO $$ 
BEGIN
    -- Intentar añadir la columna si no existe
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'workouts' 
        AND column_name = 'is_visible'
    ) THEN
        ALTER TABLE workouts ADD COLUMN is_visible BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Hacer visible solo el primer workout
UPDATE workouts SET is_visible = true WHERE workout_number = 1;

-- Los demás workouts permanecen ocultos
UPDATE workouts SET is_visible = false WHERE workout_number > 1;

-- Verificar los datos
SELECT id, name, workout_number, is_visible FROM workouts ORDER BY workout_number;
