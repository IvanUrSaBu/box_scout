"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSchema = void 0;
exports.createSchema = `
-- Crear extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Crear tipos enumerados
CREATE TYPE user_role AS ENUM ('administrador_general', 'administrador_club', 'boxeador');

CREATE TYPE weight_class AS ENUM (
  'peso_mosca',
  'peso_gallo', 
  'peso_pluma',
  'peso_ligero',
  'peso_super_ligero',
  'peso_welter',
  'peso_super_welter',
  'peso_mediano',
  'peso_super_mediano',
  'peso_pesado'
);

CREATE TYPE fight_result AS ENUM ('boxer1_gana', 'boxer2_gana', 'empate', 'pendiente');

CREATE TYPE tournament_status AS ENUM ('programado', 'activo', 'completado', 'cancelado');

-- Tabla de usuarios
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role user_role NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de clubes
CREATE TABLE clubs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(255) NOT NULL,
  ubicacion VARCHAR(255) NOT NULL,
  descripcion TEXT,
  admin_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de boxeadores
CREATE TABLE boxers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  club_id UUID REFERENCES clubs(id) ON DELETE SET NULL,
  nombre VARCHAR(255) NOT NULL,
  peso_categoria weight_class NOT NULL,
  fecha_nacimiento DATE NOT NULL,
  victorias INTEGER DEFAULT 0 CHECK (victorias >= 0),
  derrotas INTEGER DEFAULT 0 CHECK (derrotas >= 0),
  empates INTEGER DEFAULT 0 CHECK (empates >= 0),
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de torneos
CREATE TABLE tournaments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  organizador_club_id UUID REFERENCES clubs(id) ON DELETE SET NULL,
  es_publico BOOLEAN DEFAULT true,
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  estado tournament_status DEFAULT 'programado',
  ubicacion VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT valid_tournament_dates CHECK (fecha_fin >= fecha_inicio)
);

-- Tabla de combates
CREATE TABLE fights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  torneo_id UUID REFERENCES tournaments(id) ON DELETE SET NULL,
  boxeador1_id UUID NOT NULL REFERENCES boxers(id) ON DELETE CASCADE,
  boxeador2_id UUID NOT NULL REFERENCES boxers(id) ON DELETE CASCADE,
  peso_categoria weight_class NOT NULL,
  resultado fight_result DEFAULT 'pendiente',
  fecha_combate TIMESTAMP WITH TIME ZONE NOT NULL,
  ubicacion VARCHAR(255),
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT different_boxers CHECK (boxeador1_id != boxeador2_id)
);

-- Índices para mejorar performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_clubs_admin ON clubs(admin_user_id);
CREATE INDEX idx_boxers_user ON boxers(user_id);
CREATE INDEX idx_boxers_club ON boxers(club_id);
CREATE INDEX idx_boxers_weight ON boxers(peso_categoria);
CREATE INDEX idx_tournaments_organizer ON tournaments(organizador_club_id);
CREATE INDEX idx_tournaments_status ON tournaments(estado);
CREATE INDEX idx_fights_tournament ON fights(torneo_id);
CREATE INDEX idx_fights_boxers ON fights(boxeador1_id, boxeador2_id);
CREATE INDEX idx_fights_date ON fights(fecha_combate);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clubs_updated_at BEFORE UPDATE ON clubs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_boxers_updated_at BEFORE UPDATE ON boxers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tournaments_updated_at BEFORE UPDATE ON tournaments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_fights_updated_at BEFORE UPDATE ON fights FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para actualizar estadísticas de boxeadores después de un combate
CREATE OR REPLACE FUNCTION update_boxer_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Solo actualizar si el resultado cambió de 'pendiente' a otro estado
  IF OLD.resultado = 'pendiente' AND NEW.resultado != 'pendiente' THEN
    -- Actualizar estadísticas del boxeador 1
    IF NEW.resultado = 'boxer1_gana' THEN
      UPDATE boxers SET victorias = victorias + 1 WHERE id = NEW.boxeador1_id;
      UPDATE boxers SET derrotas = derrotas + 1 WHERE id = NEW.boxeador2_id;
    ELSIF NEW.resultado = 'boxer2_gana' THEN
      UPDATE boxers SET derrotas = derrotas + 1 WHERE id = NEW.boxeador1_id;
      UPDATE boxers SET victorias = victorias + 1 WHERE id = NEW.boxeador2_id;
    ELSIF NEW.resultado = 'empate' THEN
      UPDATE boxers SET empates = empates + 1 WHERE id = NEW.boxeador1_id;
      UPDATE boxers SET empates = empates + 1 WHERE id = NEW.boxeador2_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar estadísticas automáticamente
CREATE TRIGGER update_boxer_stats_trigger 
  AFTER UPDATE ON fights 
  FOR EACH ROW 
  EXECUTE FUNCTION update_boxer_stats();
`;
