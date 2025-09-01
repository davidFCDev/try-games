-- Añadir columna description a la tabla workouts
ALTER TABLE workouts ADD COLUMN IF NOT EXISTS description TEXT;

-- Actualizar los WODs existentes con descripciones
UPDATE workouts SET description = 
  CASE 
    WHEN name = 'WOD 1 - Fran' THEN '21-15-9 Thrusters (95/65 lb) y Pull-ups'
    WHEN name = 'WOD 2 - Helen' THEN '3 rounds: 400m Run, 21 KB Swings (53/35 lb), 12 Pull-ups'
    WHEN name = 'WOD 3 - Grace' THEN '30 Clean and Jerks for time (135/95 lb)'
    WHEN name = 'WOD 4 - Diane' THEN '21-15-9 Deadlifts (225/155 lb) y Handstand Push-ups'
    ELSE 'Descripción del entrenamiento'
  END
WHERE description IS NULL;
