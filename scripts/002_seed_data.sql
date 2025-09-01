-- Insertar los 4 entrenamientos
INSERT INTO workouts (name, description, workout_number) VALUES
('WOD 1', 'Primer entrenamiento de la competición', 1),
('WOD 2', 'Segundo entrenamiento de la competición', 2),
('WOD 3', 'Tercer entrenamiento de la competición', 3),
('WOD 4', 'Cuarto entrenamiento de la competición', 4)
ON CONFLICT (workout_number) DO NOTHING;

-- Insertar 20 equipos
INSERT INTO teams (name) VALUES
('Team Alpha'),
('Team Beta'),
('Team Gamma'),
('Team Delta'),
('Team Epsilon'),
('Team Zeta'),
('Team Eta'),
('Team Theta'),
('Team Iota'),
('Team Kappa'),
('Team Lambda'),
('Team Mu'),
('Team Nu'),
('Team Xi'),
('Team Omicron'),
('Team Pi'),
('Team Rho'),
('Team Sigma'),
('Team Tau'),
('Team Upsilon')
ON CONFLICT (name) DO NOTHING;
