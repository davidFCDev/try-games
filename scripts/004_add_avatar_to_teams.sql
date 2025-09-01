-- Agregar campo de avatar a la tabla teams
ALTER TABLE teams ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Actualizar equipos existentes con avatares aleatorios para el ejemplo
UPDATE teams SET avatar_url = CASE 
  WHEN name LIKE '%Alpha%' THEN 'https://api.dicebear.com/7.x/personas/svg?seed=alpha&backgroundColor=f97316&body=chest&eyes=variant01&hair=short01&mouth=smile&nose=variant01&top=shirt'
  WHEN name LIKE '%Beta%' THEN 'https://api.dicebear.com/7.x/personas/svg?seed=beta&backgroundColor=ea580c&body=chest&eyes=variant02&hair=short02&mouth=smile&nose=variant02&top=tank'
  WHEN name LIKE '%Gamma%' THEN 'https://api.dicebear.com/7.x/personas/svg?seed=gamma&backgroundColor=fb923c&body=chest&eyes=variant03&hair=short03&mouth=smile&nose=variant03&top=hoodie'
  WHEN name LIKE '%Delta%' THEN 'https://api.dicebear.com/7.x/personas/svg?seed=delta&backgroundColor=fdba74&body=chest&eyes=variant04&hair=short04&mouth=smile&nose=variant04&top=shirt'
  WHEN name LIKE '%Epsilon%' THEN 'https://api.dicebear.com/7.x/personas/svg?seed=epsilon&backgroundColor=fed7aa&body=chest&eyes=variant05&hair=short05&mouth=smile&nose=variant05&top=tank'
  WHEN name LIKE '%Zeta%' THEN 'https://api.dicebear.com/7.x/personas/svg?seed=zeta&backgroundColor=f97316&body=chest&eyes=variant06&hair=short06&mouth=smile&nose=variant06&top=hoodie'
  WHEN name LIKE '%Eta%' THEN 'https://api.dicebear.com/7.x/personas/svg?seed=eta&backgroundColor=ea580c&body=chest&eyes=variant01&hair=short01&mouth=smile&nose=variant01&top=shirt'
  WHEN name LIKE '%Theta%' THEN 'https://api.dicebear.com/7.x/personas/svg?seed=theta&backgroundColor=fb923c&body=chest&eyes=variant02&hair=short02&mouth=smile&nose=variant02&top=tank'
  WHEN name LIKE '%Iota%' THEN 'https://api.dicebear.com/7.x/personas/svg?seed=iota&backgroundColor=fdba74&body=chest&eyes=variant03&hair=short03&mouth=smile&nose=variant03&top=hoodie'
  WHEN name LIKE '%Kappa%' THEN 'https://api.dicebear.com/7.x/personas/svg?seed=kappa&backgroundColor=fed7aa&body=chest&eyes=variant04&hair=short04&mouth=smile&nose=variant04&top=shirt'
  ELSE CONCAT('https://api.dicebear.com/7.x/personas/svg?seed=', LOWER(REPLACE(name, ' ', '')), '&backgroundColor=f97316&body=chest&eyes=variant01&hair=short01&mouth=smile&nose=variant01&top=shirt')
END
WHERE avatar_url IS NULL;
