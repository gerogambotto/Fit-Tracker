-- Script para llenar la base de datos con datos de prueba coherentes
-- Ejecutar después de crear las tablas

-- Limpiar datos existentes
DELETE FROM comida_plantilla_alimentos;
DELETE FROM comidas_plantilla;
DELETE FROM dietas_plantilla;
DELETE FROM ejercicios_plantilla;
DELETE FROM rutinas_plantilla;
DELETE FROM comida_alimentos;
DELETE FROM comidas;
DELETE FROM dietas;
DELETE FROM ejercicios;
DELETE FROM rutinas;
DELETE FROM personal_records;
DELETE FROM pesos_alumno;
DELETE FROM alumnos;
DELETE FROM ejercicios_base;
DELETE FROM alimentos;
DELETE FROM coaches;

-- Coaches
INSERT INTO coaches (id, nombre, email, password_hash) VALUES
(1, 'Carlos Mendez', 'carlos@fittracker.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBdXzgVjHUxoM2'),
(2, 'Ana Rodriguez', 'ana@fittracker.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBdXzgVjHUxoM2'),
(3, 'Diego Fitness', 'demo@fittracker.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBdXzgVjHUxoM2');

-- Alumnos
INSERT INTO alumnos (id, coach_id, nombre, email, fecha_nacimiento, altura, objetivo, fecha_cobro, notificaciones_activas) VALUES
(1, 1, 'Juan Perez', 'juan@email.com', '1990-05-15', 1.75, 'Ganar masa muscular', '2024-01-15', true),
(2, 1, 'Maria Garcia', 'maria@email.com', '1985-08-22', 1.65, 'Perder peso', '2024-01-20', true),
(3, 1, 'Pedro Lopez', 'pedro@email.com', '1992-03-10', 1.80, 'Mantenimiento', '2024-01-25', false),
(4, 2, 'Sofia Martinez', 'sofia@email.com', '1988-11-05', 1.68, 'Tonificar', '2024-01-18', true),
(5, 3, 'Alex Thompson', 'alex@email.com', '1995-07-12', 1.78, 'Ganar fuerza', '2024-02-01', true),
(6, 3, 'Laura Sanchez', 'laura@email.com', '1987-04-18', 1.62, 'Perder grasa', '2024-02-05', true),
(7, 3, 'Roberto Silva', 'roberto@email.com', '1991-09-25', 1.85, 'Competición', '2024-02-10', true),
(8, 3, 'Carmen Ruiz', 'carmen@email.com', '1993-12-03', 1.70, 'Rehabilitación', '2024-02-15', false),
(9, 3, 'Miguel Torres', 'miguel@email.com', '1989-06-30', 1.73, 'Resistencia', '2024-02-20', true);

-- Pesos de alumnos
INSERT INTO pesos_alumno (alumno_id, peso, fecha) VALUES
(1, 75.5, '2024-01-01'), (1, 76.2, '2024-01-15'), (1, 77.0, '2024-02-01'),
(2, 68.0, '2024-01-01'), (2, 67.2, '2024-01-15'), (2, 66.5, '2024-02-01'),
(3, 82.3, '2024-01-01'), (3, 82.1, '2024-01-15'), (3, 82.0, '2024-02-01'),
(4, 58.5, '2024-01-01'), (4, 59.0, '2024-01-15'), (4, 59.2, '2024-02-01'),
(5, 85.0, '2024-01-01'), (5, 85.8, '2024-01-15'), (5, 86.5, '2024-02-01'), (5, 87.2, '2024-02-15'),
(6, 72.5, '2024-01-01'), (6, 71.8, '2024-01-15'), (6, 70.9, '2024-02-01'), (6, 70.2, '2024-02-15'),
(7, 78.0, '2024-01-01'), (7, 77.5, '2024-01-15'), (7, 77.8, '2024-02-01'), (7, 78.2, '2024-02-15'),
(8, 65.0, '2024-01-01'), (8, 65.5, '2024-01-15'), (8, 66.0, '2024-02-01'), (8, 66.3, '2024-02-15'),
(9, 70.5, '2024-01-01'), (9, 70.3, '2024-01-15'), (9, 70.0, '2024-02-01'), (9, 69.8, '2024-02-15');

-- Ejercicios base
INSERT INTO ejercicios_base (id, nombre, categoria) VALUES
(1, 'Press de banca', 'Pecho'),
(2, 'Sentadilla', 'Piernas'),
(3, 'Peso muerto', 'Espalda'),
(4, 'Press militar', 'Hombros'),
(5, 'Dominadas', 'Espalda'),
(6, 'Flexiones', 'Pecho'),
(7, 'Curl de biceps', 'Brazos'),
(8, 'Extensiones de triceps', 'Brazos'),
(9, 'Plancha', 'Core'),
(10, 'Zancadas', 'Piernas');

-- Rutinas
INSERT INTO rutinas (id, alumno_id, nombre, fecha_inicio, notas, entrenamientos_semana, activa, eliminado) VALUES
(1, 1, 'Rutina Fuerza Juan', '2024-01-15', 'Enfoque en ganar masa muscular', 4, true, false),
(2, 2, 'Rutina Cardio Maria', '2024-01-20', 'Para pérdida de peso', 5, true, false),
(3, 3, 'Rutina Mantenimiento Pedro', '2024-01-25', 'Mantener forma física', 3, true, false),
(4, NULL, 'Rutina Principiantes', '2024-01-01', 'Rutina básica para comenzar', 3, true, false),
(5, 5, 'Powerlifting Alex', '2024-02-01', 'Enfoque en los 3 grandes', 4, true, false),
(6, 6, 'HIIT Laura', '2024-02-05', 'Alta intensidad para quemar grasa', 5, true, false),
(7, 7, 'Pre-Competencia Roberto', '2024-02-10', 'Preparación para competencia', 6, true, false),
(8, 8, 'Rehabilitación Carmen', '2024-02-15', 'Recuperación de lesión', 3, true, false),
(9, 9, 'Resistencia Miguel', '2024-02-20', 'Mejora cardiovascular', 4, true, false),
(10, NULL, 'Rutina Avanzada', '2024-02-01', 'Para atletas experimentados', 5, true, false);

-- Ejercicios de rutinas
INSERT INTO ejercicios (rutina_id, ejercicio_base_id, dia, series, repeticiones, peso, descanso, notas) VALUES
-- Rutina Juan (Fuerza) - 4 días
(1, 1, 1, 4, 8, 80.0, 120, 'Día pecho - Aumentar peso gradualmente'),
(1, 6, 1, 3, 12, 0, 60, 'Día pecho - Hasta el fallo'),
(1, 8, 1, 3, 12, 12.0, 60, 'Día pecho - Extensión completa'),
(1, 2, 2, 4, 10, 100.0, 120, 'Día piernas - Profundidad completa'),
(1, 10, 2, 3, 15, 0, 90, 'Día piernas - Alternando'),
(1, 3, 3, 4, 6, 120.0, 180, 'Día espalda - Técnica perfecta'),
(1, 5, 3, 3, 8, 0, 90, 'Día espalda - Asistidas si es necesario'),
(1, 7, 3, 3, 12, 15.0, 60, 'Día espalda - Movimiento controlado'),
(1, 4, 4, 3, 10, 40.0, 90, 'Día hombros - Press militar'),
(1, 9, 4, 3, 60, 0, 30, 'Día hombros - Core'),
-- Rutina Maria (Cardio) - 5 días
(2, 6, 1, 4, 15, 0, 45, 'Día 1 - Ritmo constante'),
(2, 9, 1, 3, 45, 0, 30, 'Día 1 - Plancha'),
(2, 10, 2, 4, 20, 0, 45, 'Día 2 - Alternando piernas'),
(2, 6, 2, 3, 20, 0, 30, 'Día 2 - Flexiones rápidas'),
(2, 2, 3, 3, 15, 40.0, 60, 'Día 3 - Sentadillas con peso'),
(2, 9, 3, 4, 30, 0, 30, 'Día 3 - Plancha lateral'),
(2, 10, 4, 5, 25, 0, 30, 'Día 4 - Zancadas explosivas'),
(2, 6, 4, 4, 25, 0, 30, 'Día 4 - Flexiones diamante'),
(2, 9, 5, 5, 60, 0, 30, 'Día 5 - Plancha completa'),
(2, 10, 5, 4, 30, 0, 45, 'Día 5 - Zancadas laterales'),
-- Rutina Pedro (Mantenimiento) - 3 días
(3, 1, 1, 3, 10, 60.0, 90, 'Día 1 - Peso moderado'),
(3, 2, 1, 3, 12, 80.0, 90, 'Día 1 - Rango completo'),
(3, 7, 1, 3, 12, 12.0, 60, 'Día 1 - Curl biceps'),
(3, 4, 2, 3, 10, 40.0, 90, 'Día 2 - Control del peso'),
(3, 5, 2, 3, 6, 0, 120, 'Día 2 - Dominadas asistidas'),
(3, 8, 2, 3, 12, 10.0, 60, 'Día 2 - Triceps'),
(3, 3, 3, 3, 8, 90.0, 120, 'Día 3 - Peso muerto'),
(3, 10, 3, 3, 15, 0, 60, 'Día 3 - Zancadas'),
(3, 9, 3, 3, 45, 0, 30, 'Día 3 - Core'),
-- Rutina Principiantes (Standalone) - 3 días
(4, 6, 1, 3, 8, 0, 90, 'Día 1 - Flexiones básicas'),
(4, 2, 1, 3, 10, 20.0, 90, 'Día 1 - Sentadillas básicas'),
(4, 9, 1, 3, 30, 0, 60, 'Día 1 - Plancha básica'),
(4, 7, 2, 3, 10, 5.0, 60, 'Día 2 - Curl ligero'),
(4, 8, 2, 3, 10, 5.0, 60, 'Día 2 - Triceps ligero'),
(4, 10, 2, 3, 12, 0, 60, 'Día 2 - Zancadas básicas'),
(4, 1, 3, 3, 8, 30.0, 90, 'Día 3 - Press básico'),
(4, 4, 3, 3, 8, 20.0, 90, 'Día 3 - Press militar básico'),
(4, 3, 3, 3, 6, 40.0, 120, 'Día 3 - Peso muerto básico'),
-- Powerlifting Alex - 4 días
(5, 1, 1, 5, 5, 100.0, 180, 'Día pecho - Fuerza máxima'),
(5, 6, 1, 3, 8, 0, 90, 'Día pecho - Auxiliar'),
(5, 8, 1, 4, 8, 15.0, 60, 'Día pecho - Triceps'),
(5, 2, 2, 5, 5, 140.0, 180, 'Día piernas - Sentadilla pesada'),
(5, 10, 2, 4, 10, 20.0, 90, 'Día piernas - Zancadas con peso'),
(5, 3, 3, 5, 3, 160.0, 240, 'Día espalda - Peso muerto máximo'),
(5, 5, 3, 4, 5, 20.0, 120, 'Día espalda - Dominadas con peso'),
(5, 7, 3, 4, 8, 20.0, 60, 'Día espalda - Curl pesado'),
(5, 4, 4, 4, 6, 60.0, 120, 'Día hombros - Press militar pesado'),
(5, 9, 4, 4, 45, 20.0, 60, 'Día hombros - Plancha con peso'),
-- HIIT Laura - 5 días
(6, 6, 1, 5, 12, 0, 30, 'Día 1 - Flexiones explosivas'),
(6, 10, 1, 5, 15, 0, 30, 'Día 1 - Zancadas rápidas'),
(6, 9, 1, 5, 30, 0, 30, 'Día 1 - Plancha dinámica'),
(6, 2, 2, 5, 20, 0, 30, 'Día 2 - Sentadillas jump'),
(6, 6, 2, 5, 15, 0, 30, 'Día 2 - Flexiones rápidas'),
(6, 10, 3, 6, 20, 0, 30, 'Día 3 - Zancadas explosivas'),
(6, 9, 3, 5, 45, 0, 30, 'Día 3 - Plancha lateral'),
(6, 2, 4, 6, 25, 0, 30, 'Día 4 - Sentadillas pistol'),
(6, 6, 4, 6, 20, 0, 30, 'Día 4 - Flexiones diamante'),
(6, 9, 5, 6, 60, 0, 30, 'Día 5 - Plancha completa'),
(6, 10, 5, 6, 30, 0, 30, 'Día 5 - Zancadas laterales'),
-- Pre-Competencia Roberto - 6 días
(7, 1, 1, 6, 4, 130.0, 180, 'Día 1 - Press competencia'),
(7, 6, 1, 4, 6, 0, 90, 'Día 1 - Flexiones técnica'),
(7, 8, 1, 5, 6, 20.0, 60, 'Día 1 - Triceps fuerza'),
(7, 2, 2, 6, 3, 170.0, 240, 'Día 2 - Sentadilla competencia'),
(7, 10, 2, 4, 8, 30.0, 90, 'Día 2 - Zancadas pesadas'),
(7, 3, 3, 6, 2, 190.0, 300, 'Día 3 - Peso muerto competencia'),
(7, 5, 3, 4, 3, 30.0, 180, 'Día 3 - Dominadas pesadas'),
(7, 7, 3, 5, 6, 25.0, 60, 'Día 3 - Curl competencia'),
(7, 4, 4, 5, 5, 70.0, 120, 'Día 4 - Press militar competencia'),
(7, 9, 4, 5, 60, 25.0, 60, 'Día 4 - Core con peso'),
(7, 1, 5, 4, 6, 120.0, 120, 'Día 5 - Press técnica'),
(7, 2, 5, 4, 5, 150.0, 120, 'Día 5 - Sentadilla técnica'),
(7, 3, 6, 4, 3, 170.0, 180, 'Día 6 - Peso muerto técnica'),
(7, 5, 6, 3, 5, 25.0, 120, 'Día 6 - Dominadas técnica'),
-- Rehabilitación Carmen - 3 días
(8, 6, 1, 3, 5, 0, 120, 'Día 1 - Flexiones suaves'),
(8, 2, 1, 3, 8, 10.0, 120, 'Día 1 - Sentadillas ligeras'),
(8, 9, 1, 3, 20, 0, 90, 'Día 1 - Plancha suave'),
(8, 7, 2, 3, 8, 2.0, 90, 'Día 2 - Curl rehabilitación'),
(8, 8, 2, 3, 8, 2.0, 90, 'Día 2 - Triceps suave'),
(8, 10, 2, 3, 8, 0, 90, 'Día 2 - Zancadas suaves'),
(8, 4, 3, 3, 6, 5.0, 120, 'Día 3 - Press suave'),
(8, 3, 3, 3, 5, 20.0, 150, 'Día 3 - Peso muerto suave'),
(8, 9, 3, 3, 30, 0, 90, 'Día 3 - Core rehabilitación'),
-- Resistencia Miguel - 4 días
(9, 6, 1, 4, 20, 0, 45, 'Día 1 - Flexiones resistencia'),
(9, 2, 1, 4, 25, 30.0, 45, 'Día 1 - Sentadillas resistencia'),
(9, 9, 1, 4, 60, 0, 45, 'Día 1 - Plancha resistencia'),
(9, 10, 2, 5, 30, 0, 45, 'Día 2 - Zancadas resistencia'),
(9, 6, 2, 4, 25, 0, 45, 'Día 2 - Flexiones continuas'),
(9, 5, 3, 4, 12, 0, 60, 'Día 3 - Dominadas resistencia'),
(9, 7, 3, 4, 20, 8.0, 45, 'Día 3 - Curl resistencia'),
(9, 8, 3, 4, 20, 8.0, 45, 'Día 3 - Triceps resistencia'),
(9, 1, 4, 4, 15, 50.0, 60, 'Día 4 - Press resistencia'),
(9, 4, 4, 4, 15, 30.0, 60, 'Día 4 - Press militar resistencia'),
(9, 3, 4, 4, 12, 70.0, 90, 'Día 4 - Peso muerto resistencia'),
-- Rutina Avanzada (Standalone) - 5 días
(10, 1, 1, 5, 6, 110.0, 150, 'Día 1 - Press avanzado'),
(10, 6, 1, 4, 10, 0, 90, 'Día 1 - Flexiones avanzadas'),
(10, 8, 1, 4, 10, 18.0, 60, 'Día 1 - Triceps avanzado'),
(10, 2, 2, 5, 8, 130.0, 150, 'Día 2 - Sentadilla avanzada'),
(10, 10, 2, 4, 12, 25.0, 90, 'Día 2 - Zancadas avanzadas'),
(10, 3, 3, 5, 5, 150.0, 180, 'Día 3 - Peso muerto avanzado'),
(10, 5, 3, 4, 6, 15.0, 120, 'Día 3 - Dominadas con peso'),
(10, 7, 3, 4, 10, 18.0, 60, 'Día 3 - Curl avanzado'),
(10, 4, 4, 4, 8, 55.0, 120, 'Día 4 - Press militar avanzado'),
(10, 9, 4, 4, 60, 15.0, 60, 'Día 4 - Core avanzado'),
(10, 1, 5, 4, 8, 100.0, 120, 'Día 5 - Press técnica'),
(10, 2, 5, 4, 10, 120.0, 120, 'Día 5 - Sentadilla técnica'),
(10, 3, 5, 4, 6, 140.0, 150, 'Día 5 - Peso muerto técnica');

-- Personal Records
INSERT INTO personal_records (alumno_id, ejercicio, peso, repeticiones, fecha) VALUES
(1, 'press_plano', 85.0, 1, '2024-01-20'),
(1, 'sentadilla', 110.0, 1, '2024-01-25'),
(2, 'peso_muerto', 70.0, 1, '2024-01-22'),
(3, 'press_militar', 50.0, 1, '2024-01-28'),
(5, 'press_plano', 120.0, 1, '2024-02-05'),
(5, 'sentadilla', 150.0, 1, '2024-02-08'),
(5, 'peso_muerto', 180.0, 1, '2024-02-12'),
(6, 'press_plano', 45.0, 1, '2024-02-07'),
(7, 'press_plano', 140.0, 1, '2024-02-14'),
(7, 'sentadilla', 170.0, 1, '2024-02-16'),
(9, 'peso_muerto', 90.0, 1, '2024-02-22');

-- Alimentos
INSERT INTO alimentos (id, nombre, calorias_100g, proteinas_100g, carbohidratos_100g, grasas_100g) VALUES
(1, 'Pollo pechuga', 165, 31, 0, 3.6),
(2, 'Arroz blanco', 130, 2.7, 28, 0.3),
(3, 'Brócoli', 34, 2.8, 7, 0.4),
(4, 'Huevo entero', 155, 13, 1.1, 11),
(5, 'Avena', 389, 16.9, 66, 6.9),
(6, 'Plátano', 89, 1.1, 23, 0.3),
(7, 'Salmón', 208, 25, 0, 12),
(8, 'Batata', 86, 1.6, 20, 0.1),
(9, 'Almendras', 579, 21, 22, 50),
(10, 'Yogur griego', 59, 10, 3.6, 0.4);

-- Dietas
INSERT INTO dietas (id, alumno_id, nombre, fecha_inicio, notas, activa, eliminado) VALUES
(1, 1, 'Dieta Volumen Juan', '2024-01-15', 'Alta en proteínas y calorías', true, false),
(2, 2, 'Dieta Déficit Maria', '2024-01-20', 'Déficit calórico controlado', true, false),
(3, NULL, 'Dieta Equilibrada', '2024-01-01', 'Dieta balanceada general', true, false),
(4, 5, 'Dieta Fuerza Alex', '2024-02-01', 'Alto contenido calórico para fuerza', true, false),
(5, 6, 'Dieta Cutting Laura', '2024-02-05', 'Baja en carbohidratos', true, false),
(6, 7, 'Dieta Competencia Roberto', '2024-02-10', 'Periodizada para competencia', true, false),
(7, 8, 'Dieta Recuperación Carmen', '2024-02-15', 'Rica en antiinflamatorios', true, false),
(8, NULL, 'Dieta Deportista', '2024-02-01', 'Para atletas de resistencia', true, false);

-- Comidas
INSERT INTO comidas (id, dieta_id, nombre, dia, orden) VALUES
-- Dieta Juan (Volumen) - 7 días completos
(1, 1, 'Desayuno', 1, 1), (2, 1, 'Media Mañana', 1, 2), (3, 1, 'Almuerzo', 1, 3), (4, 1, 'Merienda', 1, 4), (5, 1, 'Cena', 1, 5),
(6, 1, 'Desayuno', 2, 1), (7, 1, 'Media Mañana', 2, 2), (8, 1, 'Almuerzo', 2, 3), (9, 1, 'Merienda', 2, 4), (10, 1, 'Cena', 2, 5),
(11, 1, 'Desayuno', 3, 1), (12, 1, 'Media Mañana', 3, 2), (13, 1, 'Almuerzo', 3, 3), (14, 1, 'Merienda', 3, 4), (15, 1, 'Cena', 3, 5),
-- Dieta Maria (Déficit) - 5 días
(16, 2, 'Desayuno', 1, 1), (17, 2, 'Almuerzo', 1, 2), (18, 2, 'Cena', 1, 3),
(19, 2, 'Desayuno', 2, 1), (20, 2, 'Almuerzo', 2, 2), (21, 2, 'Cena', 2, 3),
(22, 2, 'Desayuno', 3, 1), (23, 2, 'Almuerzo', 3, 2), (24, 2, 'Cena', 3, 3),
-- Dieta Equilibrada - 3 días
(25, 3, 'Desayuno', 1, 1), (26, 3, 'Almuerzo', 1, 2), (27, 3, 'Cena', 1, 3),
(28, 3, 'Desayuno', 2, 1), (29, 3, 'Almuerzo', 2, 2), (30, 3, 'Cena', 2, 3),
(31, 3, 'Desayuno', 3, 1), (32, 3, 'Almuerzo', 3, 2), (33, 3, 'Cena', 3, 3),
-- Dieta Fuerza Alex - 7 días
(34, 4, 'Desayuno', 1, 1), (35, 4, 'Pre-Entreno', 1, 2), (36, 4, 'Post-Entreno', 1, 3), (37, 4, 'Almuerzo', 1, 4), (38, 4, 'Cena', 1, 5),
(39, 4, 'Desayuno', 2, 1), (40, 4, 'Pre-Entreno', 2, 2), (41, 4, 'Post-Entreno', 2, 3), (42, 4, 'Almuerzo', 2, 4), (43, 4, 'Cena', 2, 5),
-- Dieta Cutting Laura - 4 días
(44, 5, 'Desayuno', 1, 1), (45, 5, 'Almuerzo', 1, 2), (46, 5, 'Cena', 1, 3),
(47, 5, 'Desayuno', 2, 1), (48, 5, 'Almuerzo', 2, 2), (49, 5, 'Cena', 2, 3),
(50, 5, 'Desayuno', 3, 1), (51, 5, 'Almuerzo', 3, 2), (52, 5, 'Cena', 3, 3),
-- Dieta Competencia Roberto - 6 días
(53, 6, 'Desayuno', 1, 1), (54, 6, 'Pre-Entreno', 1, 2), (55, 6, 'Post-Entreno', 1, 3), (56, 6, 'Almuerzo', 1, 4), (57, 6, 'Pre-Cena', 1, 5), (58, 6, 'Cena', 1, 6),
(59, 6, 'Desayuno', 2, 1), (60, 6, 'Pre-Entreno', 2, 2), (61, 6, 'Post-Entreno', 2, 3), (62, 6, 'Almuerzo', 2, 4), (63, 6, 'Pre-Cena', 2, 5), (64, 6, 'Cena', 2, 6),
-- Dieta Recuperación Carmen - 3 días
(65, 7, 'Desayuno', 1, 1), (66, 7, 'Media Mañana', 1, 2), (67, 7, 'Almuerzo', 1, 3), (68, 7, 'Merienda', 1, 4), (69, 7, 'Cena', 1, 5),
(70, 7, 'Desayuno', 2, 1), (71, 7, 'Media Mañana', 2, 2), (72, 7, 'Almuerzo', 2, 3), (73, 7, 'Merienda', 2, 4), (74, 7, 'Cena', 2, 5),
-- Dieta Deportista (Standalone) - 5 días
(75, 8, 'Desayuno', 1, 1), (76, 8, 'Pre-Entreno', 1, 2), (77, 8, 'Post-Entreno', 1, 3), (78, 8, 'Almuerzo', 1, 4), (79, 8, 'Cena', 1, 5),
(80, 8, 'Desayuno', 2, 1), (81, 8, 'Pre-Entreno', 2, 2), (82, 8, 'Post-Entreno', 2, 3), (83, 8, 'Almuerzo', 2, 4), (84, 8, 'Cena', 2, 5);

-- Comida Alimentos
INSERT INTO comida_alimentos (comida_id, alimento_id, cantidad_gramos) VALUES
-- Dieta Juan (Volumen) - Día 1
(1, 5, 100), (1, 6, 200), (1, 4, 150), (1, 9, 30),
(2, 10, 200), (2, 9, 20),
(3, 1, 250), (3, 2, 200), (3, 3, 150), (3, 8, 200),
(4, 6, 150), (4, 9, 25),
(5, 7, 200), (5, 8, 250), (5, 3, 100),
-- Dieta Juan - Día 2
(6, 5, 100), (6, 4, 180), (6, 6, 150),
(7, 10, 250), (7, 9, 30),
(8, 1, 300), (8, 2, 250), (8, 3, 120),
(9, 7, 150), (9, 9, 40),
(10, 7, 250), (10, 8, 300), (10, 3, 150),
-- Dieta Juan - Día 3
(11, 5, 120), (11, 6, 200), (11, 4, 200),
(12, 10, 300), (12, 6, 100),
(13, 1, 280), (13, 2, 220), (13, 8, 200),
(14, 9, 50), (14, 6, 120),
(15, 7, 220), (15, 8, 280), (15, 3, 120),
-- Dieta Maria (Déficit) - Día 1
(16, 10, 150), (16, 6, 80),
(17, 1, 120), (17, 3, 200), (17, 2, 80),
(18, 7, 100), (18, 8, 80), (18, 3, 100),
-- Dieta Maria - Día 2
(19, 5, 40), (19, 6, 100), (19, 4, 80),
(20, 1, 150), (20, 3, 180),
(21, 7, 120), (21, 3, 150),
-- Dieta Maria - Día 3
(22, 10, 200), (22, 3, 50),
(23, 1, 140), (23, 2, 60), (23, 3, 200),
(24, 7, 110), (24, 8, 100),
-- Dieta Equilibrada - Día 1
(25, 5, 60), (25, 6, 120), (25, 4, 100),
(26, 1, 150), (26, 2, 120), (26, 3, 100),
(27, 7, 130), (27, 8, 150), (27, 3, 80),
-- Dieta Equilibrada - Día 2
(28, 5, 70), (28, 6, 100), (28, 10, 150),
(29, 1, 180), (29, 2, 100), (29, 3, 120),
(30, 7, 150), (30, 8, 120),
-- Dieta Equilibrada - Día 3
(31, 4, 150), (31, 6, 150), (31, 5, 50),
(32, 1, 200), (32, 2, 150), (32, 3, 100),
(33, 7, 140), (33, 8, 180), (33, 3, 100),
-- Dieta Fuerza Alex - Día 1
(34, 5, 120), (34, 6, 250), (34, 4, 200), (34, 9, 40),
(35, 6, 200), (35, 5, 50),
(36, 1, 300), (36, 2, 200), (36, 10, 200),
(37, 1, 350), (37, 2, 300), (37, 3, 150), (37, 8, 250),
(38, 7, 300), (38, 8, 300), (38, 3, 150), (38, 9, 50),
-- Dieta Fuerza Alex - Día 2
(39, 4, 250), (39, 5, 100), (39, 6, 200),
(40, 6, 150), (40, 9, 30),
(41, 1, 250), (41, 2, 250), (41, 10, 250),
(42, 7, 250), (42, 2, 200), (42, 3, 200),
(43, 7, 280), (43, 8, 350), (43, 9, 60),
-- Dieta Cutting Laura - Día 1
(44, 10, 120), (44, 3, 100),
(45, 1, 100), (45, 3, 250),
(46, 7, 80), (46, 3, 200),
-- Dieta Cutting Laura - Día 2
(47, 4, 80), (47, 3, 150),
(48, 1, 120), (48, 3, 300),
(49, 7, 100), (49, 3, 180),
-- Dieta Cutting Laura - Día 3
(50, 10, 150), (50, 6, 80),
(51, 1, 140), (51, 3, 280),
(52, 7, 90), (52, 3, 220),
-- Dieta Competencia Roberto - Día 1
(53, 4, 200), (53, 5, 80), (53, 6, 150),
(54, 6, 200), (54, 5, 60),
(55, 1, 200), (55, 2, 150), (55, 10, 200),
(56, 1, 300), (56, 2, 250), (56, 3, 100), (56, 8, 200),
(57, 9, 40), (57, 6, 100),
(58, 7, 250), (58, 8, 200), (58, 3, 80),
-- Dieta Competencia Roberto - Día 2
(59, 5, 100), (59, 4, 180), (59, 6, 120),
(60, 6, 180), (60, 9, 30),
(61, 1, 250), (61, 2, 200), (61, 10, 150),
(62, 7, 200), (62, 2, 200), (62, 3, 120),
(63, 10, 150), (63, 9, 20),
(64, 7, 220), (64, 8, 250), (64, 3, 100),
-- Dieta Recuperación Carmen - Día 1
(65, 5, 60), (65, 6, 120), (65, 10, 150),
(66, 6, 100), (66, 9, 15),
(67, 1, 120), (67, 2, 100), (67, 3, 150), (67, 8, 120),
(68, 10, 120), (68, 6, 80),
(69, 7, 120), (69, 8, 150), (69, 3, 120),
-- Dieta Recuperación Carmen - Día 2
(70, 4, 120), (70, 5, 50), (70, 6, 100),
(71, 10, 150), (71, 9, 20),
(72, 1, 150), (72, 2, 120), (72, 3, 180),
(73, 6, 120), (73, 9, 25),
(74, 7, 140), (74, 8, 120), (74, 3, 100),
-- Dieta Deportista - Día 1
(75, 5, 80), (75, 6, 180), (75, 4, 150),
(76, 6, 150), (76, 5, 40),
(77, 1, 200), (77, 2, 150), (77, 10, 200),
(78, 1, 200), (78, 2, 180), (78, 3, 120), (78, 8, 180),
(79, 7, 180), (79, 8, 200), (79, 3, 100),
-- Dieta Deportista - Día 2
(80, 4, 150), (80, 5, 70), (80, 6, 150),
(81, 6, 120), (81, 9, 25),
(82, 1, 180), (82, 2, 200), (82, 10, 180),
(83, 7, 150), (83, 2, 150), (83, 3, 150),
(84, 7, 200), (84, 8, 220), (84, 3, 120);

-- Plantillas de rutinas
INSERT INTO rutinas_plantilla (id, coach_id, nombre, notas, entrenamientos_semana) VALUES
(1, 1, 'Plantilla Principiante', 'Rutina básica 3 días', 3),
(2, 1, 'Plantilla Intermedio', 'Rutina 4 días split', 4),
(3, 3, 'Plantilla Powerlifting', 'Enfoque en fuerza máxima', 4),
(4, 3, 'Plantilla HIIT', 'Alta intensidad', 5),
(5, 3, 'Plantilla Rehabilitación', 'Ejercicios terapéuticos', 3);

-- Ejercicios de plantillas
INSERT INTO ejercicios_plantilla (rutina_plantilla_id, ejercicio_base_id, series, repeticiones, peso, descanso) VALUES
(1, 1, 3, 10, 50, 90), (1, 2, 3, 12, 60, 90), (1, 5, 3, 8, 0, 90),
(2, 1, 4, 8, 70, 120), (2, 2, 4, 10, 90, 120), (2, 3, 4, 6, 100, 180);

-- Plantillas de dietas
INSERT INTO dietas_plantilla (id, coach_id, nombre, notas) VALUES
(1, 1, 'Plantilla Volumen', 'Dieta alta en calorías'),
(2, 1, 'Plantilla Definición', 'Dieta baja en calorías'),
(3, 3, 'Plantilla Atleta', 'Para deportistas de alto rendimiento'),
(4, 3, 'Plantilla Cutting', 'Definición extrema'),
(5, 3, 'Plantilla Recuperación', 'Dieta antiinflamatoria');

-- Comidas de plantillas
INSERT INTO comidas_plantilla (id, dieta_plantilla_id, nombre, orden) VALUES
(1, 1, 'Desayuno', 1), (2, 1, 'Almuerzo', 2), (3, 1, 'Cena', 3),
(4, 2, 'Desayuno', 1), (5, 2, 'Almuerzo', 2), (6, 2, 'Cena', 3);

-- Alimentos de plantillas
INSERT INTO comida_plantilla_alimentos (comida_plantilla_id, alimento_id, cantidad_gramos) VALUES
-- Plantilla Volumen
(1, 5, 100), (1, 6, 200), (1, 4, 150),
(2, 1, 250), (2, 2, 200), (2, 3, 100),
(3, 7, 200), (3, 8, 250), (3, 9, 50),
-- Plantilla Definición
(4, 10, 150), (4, 6, 100),
(5, 1, 150), (5, 3, 200),
(6, 7, 120), (6, 8, 100);

-- NUEVOS ALUMNOS DEL COACH 3
INSERT INTO alumnos (id, coach_id, nombre, email, fecha_nacimiento, altura, objetivo, fecha_cobro, notificaciones_activas) VALUES
(5, 3, 'Lucas Fernandez', 'lucas@email.com', '1995-07-12', 1.78, 'Ganar fuerza', '2024-01-10', true),
(6, 3, 'Valentina Ruiz', 'valentina@email.com', '1993-04-03', 1.62, 'Perder grasa', '2024-01-12', true),
(7, 3, 'Martín Ortega', 'martin@email.com', '1989-09-27', 1.85, 'Tonificar', '2024-01-14', false);

-- PESOS DE LOS NUEVOS ALUMNOS
INSERT INTO pesos_alumno (alumno_id, peso, fecha) VALUES
(5, 72.0, '2024-01-01'), (5, 73.5, '2024-01-15'), (5, 74.2, '2024-02-01'),
(6, 70.0, '2024-01-01'), (6, 68.8, '2024-01-15'), (6, 67.5, '2024-02-01'),
(7, 80.0, '2024-01-01'), (7, 79.5, '2024-01-15'), (7, 78.8, '2024-02-01');

-- RUTINAS PARA LOS ALUMNOS DEL COACH 3
INSERT INTO rutinas (id, alumno_id, nombre, fecha_inicio, notas, entrenamientos_semana, activa, eliminado) VALUES
(11, 5, 'Rutina Fuerza Lucas', '2024-01-10', 'Foco en fuerza máxima', 4, true, false),
(12, 6, 'Rutina Quema Valentina', '2024-01-12', 'Alta intensidad y cardio', 5, true, false),
(13, 7, 'Rutina Tonificación Martín', '2024-01-14', 'Mejorar definición muscular', 3, true, false);

-- EJERCICIOS DE LAS NUEVAS RUTINAS
INSERT INTO ejercicios (rutina_id, ejercicio_base_id, dia, series, repeticiones, peso, descanso, notas) VALUES
-- Rutina Lucas
(11, 1, 1, 5, 5, 90.0, 150, 'Priorizar fuerza'),
(11, 2, 2, 5, 5, 110.0, 150, 'Sentadilla profunda'),
-- Rutina Valentina
(12, 6, 1, 4, 20, 0, 30, 'Alta velocidad'),
(12, 10, 2, 3, 15, 0, 45, 'Bien controladas'),
-- Rutina Martín
(13, 3, 1, 4, 10, 80.0, 90, 'Ejecutar con técnica'),
(13, 9, 2, 3, 60, 0, 30, 'Mantener 1 minuto');

-- PERSONAL RECORDS
INSERT INTO personal_records (alumno_id, ejercicio, peso, repeticiones, fecha) VALUES
(5, 'press_banca', 95.0, 1, '2024-01-20'),
(6, 'sentadilla', 80.0, 5, '2024-01-22'),
(7, 'plancha', 0, 1, '2024-01-25');

-- DIETAS PARA LOS ALUMNOS
INSERT INTO dietas (id, alumno_id, nombre, fecha_inicio, notas, activa, eliminado) VALUES
(9, 5, 'Dieta Fuerza Lucas', '2024-01-10', 'Alta en proteínas', true, false),
(10, 6, 'Dieta Déficit Valentina', '2024-01-12', 'Baja en carbohidratos', true, false),
(11, 7, 'Dieta Equilibrada Martín', '2024-01-14', 'Balanceada para tonificación', true, false);

-- COMIDAS DE LAS NUEVAS DIETAS
INSERT INTO comidas (id, dieta_id, nombre, dia, orden) VALUES
(13, 9, 'Desayuno', 1, 1), (14, 9, 'Almuerzo', 1, 2), (15, 9, 'Cena', 1, 3),
(16, 10, 'Desayuno', 1, 1), (17, 10, 'Almuerzo', 1, 2), (18, 10, 'Cena', 1, 3),
(19, 11, 'Desayuno', 1, 1), (20, 11, 'Almuerzo', 1, 2), (21, 11, 'Cena', 1, 3);

-- COMIDA_ALIMENTOS
INSERT INTO comida_alimentos (comida_id, alimento_id, cantidad_gramos) VALUES
-- Lucas
(13, 5, 80), (13, 4, 120), (14, 1, 200), (14, 2, 150), (15, 7, 180), (15, 8, 200),
-- Valentina
(16, 10, 150), (16, 6, 100), (17, 1, 150), (17, 3, 120), (18, 7, 100), (18, 8, 80),
-- Martín
(19, 5, 60), (19, 6, 100), (20, 1, 180), (20, 2, 130), (21, 7, 150), (21, 8, 100);

-- PLANTILLAS DE RUTINAS Y DIETAS DEL COACH 3
INSERT INTO rutinas_plantilla (id, coach_id, nombre, notas, entrenamientos_semana) VALUES
(3, 3, 'Plantilla Fuerza Avanzada', 'Rutina 4 días para fuerza máxima', 4);

INSERT INTO ejercicios_plantilla (rutina_plantilla_id, ejercicio_base_id, series, repeticiones, peso, descanso) VALUES
(3, 1, 5, 5, 100, 180), (3, 2, 5, 5, 120, 180), (3, 3, 5, 5, 140, 180);

INSERT INTO dietas_plantilla (id, coach_id, nombre, notas) VALUES
(3, 3, 'Plantilla Dieta Fuerza', 'Alta en proteína y grasas buenas');

INSERT INTO comidas_plantilla (id, dieta_plantilla_id, nombre, orden) VALUES
(7, 3, 'Desayuno', 1), (8, 3, 'Almuerzo', 2), (9, 3, 'Cena', 3);

INSERT INTO comida_plantilla_alimentos (comida_plantilla_id, alimento_id, cantidad_gramos) VALUES
(7, 5, 100), (7, 6, 200), (7, 4, 150),
(8, 1, 250), (8, 2, 200), (8, 3, 100),
(9, 7, 200), (9, 8, 250), (9, 9, 50);

-- Resetear secuencias de auto-increment
ALTER TABLE coaches AUTO_INCREMENT = 4;
ALTER TABLE alumnos AUTO_INCREMENT = 10;
ALTER TABLE rutinas AUTO_INCREMENT = 14;
ALTER TABLE ejercicios AUTO_INCREMENT = 300;
ALTER TABLE dietas AUTO_INCREMENT = 12;
ALTER TABLE comidas AUTO_INCREMENT = 85;
ALTER TABLE comida_alimentos AUTO_INCREMENT = 500;

-- Notificaciones de prueba
INSERT INTO notifications (coach_id, alumno_id, tipo, titulo, mensaje, leida, creada_en) VALUES
(1, 1, 'rutina_vencida', 'Rutina Vencida - Juan Pérez', 'La rutina de Juan Pérez ha vencido el 15/12/2024. Es necesario crear una nueva rutina.', false, '2024-12-16 09:00:00'),
(1, 2, 'dieta_vencida', 'Dieta Vencida - María García', 'La dieta de María García venció el 14/12/2024. Se recomienda actualizar el plan nutricional.', false, '2024-12-16 09:15:00'),
(1, 3, 'meet_seguimiento', 'Meet de Seguimiento - Pedro López', 'Es hora de programar una sesión de seguimiento con Pedro López. Última sesión: 01/12/2024.', false, '2024-12-16 10:00:00'),
(1, NULL, 'rutina_vencida', 'Rutina Standalone Vencida', 'La rutina "Principiantes" ha vencido y necesita revisión.', true, '2024-12-15 14:30:00'),
(1, 4, 'meet_seguimiento', 'Recordatorio Meet - Ana Martínez', 'Programar meet de seguimiento semanal con Ana Martínez.', false, '2024-12-16 11:00:00');

-- Lesiones de ejemplo
INSERT INTO lesiones (alumno_id, nombre, descripcion, es_cronica, fecha_inicio, fecha_fin, activa, creada_en) VALUES
(1, 'Tendinitis rotuliana', 'Inflamación del tendón rotuliano en rodilla derecha', false, '2024-11-15 00:00:00', '2024-12-15 00:00:00', false, '2024-11-15 10:00:00'),
(2, 'Lumbalgia crónica', 'Dolor crónico en zona lumbar L4-L5', true, '2024-01-01 00:00:00', NULL, true, '2024-01-01 10:00:00'),
(3, 'Esguince tobillo', 'Esguince grado 1 en tobillo izquierdo', false, '2024-12-01 00:00:00', '2024-12-20 00:00:00', true, '2024-12-01 15:30:00'),
(5, 'Epicondilitis', 'Codo de tenista en brazo dominante', false, '2024-10-01 00:00:00', '2024-11-30 00:00:00', false, '2024-10-01 09:00:00');

ALTER TABLE notifications AUTO_INCREMENT = 6;
ALTER TABLE lesiones AUTO_INCREMENT = 5;
ALTER TABLE rutinas_plantilla AUTO_INCREMENT = 4;
ALTER TABLE ejercicios_plantilla AUTO_INCREMENT = 20;
ALTER TABLE dietas_plantilla AUTO_INCREMENT = 4;
ALTER TABLE comidas_plantilla AUTO_INCREMENT = 10;
ALTER TABLE comida_plantilla_alimentos AUTO_INCREMENT = 30;
