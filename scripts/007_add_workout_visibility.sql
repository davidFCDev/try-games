-- Agregar campo de visibilidad a los workouts
ALTER TABLE workouts ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT false;

-- Por defecto, hacer visible solo el primer workout
UPDATE workouts SET is_visible = true WHERE workout_number = 1;

-- Los demás workouts permanecen ocultos hasta que el admin los active
UPDATE workouts SET is_visible = false WHERE workout_number > 1;
