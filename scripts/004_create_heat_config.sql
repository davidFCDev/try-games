-- Crear tabla para configuración de heats
CREATE TABLE IF NOT EXISTS heat_config (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  start_time text NOT NULL DEFAULT '08:00',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insertar configuración por defecto si no existe
INSERT INTO heat_config (start_time) 
SELECT '08:00' 
WHERE NOT EXISTS (SELECT 1 FROM heat_config);

-- Habilitar RLS (Row Level Security)
ALTER TABLE heat_config ENABLE ROW LEVEL SECURITY;

-- Crear política para permitir lectura a todos
CREATE POLICY "Anyone can read heat config" ON heat_config FOR SELECT USING (true);

-- Crear política para permitir inserción y actualización solo a usuarios autenticados
CREATE POLICY "Authenticated users can insert heat config" ON heat_config FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update heat config" ON heat_config FOR UPDATE USING (auth.role() = 'authenticated');
