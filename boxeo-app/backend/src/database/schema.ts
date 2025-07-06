export const createSchema = `
-- Habilitar extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tipos enumerados
CREATE TYPE user_role AS ENUM ('administrador_general', 'administrador_club', 'boxeador');
CREATE TYPE weight_class AS ENUM ('peso_mosca', 'peso_gallo', 'peso_pluma', 'peso_ligero', 'peso_welter', 'peso_mediano', 'peso_pesado');
CREATE TYPE fight_result AS ENUM ('boxer1_gana', 'boxer2_gana', 'empate', 'pendiente');
CREATE TYPE tournament_status AS ENUM ('programado', 'activo', 'completado', 'cancelado');

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'boxeador',
    nombre VARCHAR(255) NOT NULL,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de clubes
CREATE TABLE IF NOT EXISTS clubs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(255) NOT NULL,
    ubicacion VARCHAR(255) NOT NULL,
    descripcion TEXT,
    admin_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de boxeadores
CREATE TABLE IF NOT EXISTS boxers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    club_id UUID REFERENCES clubs(id) ON DELETE SET NULL,
    nombre VARCHAR(255) NOT NULL,
    fecha_nacimiento DATE NOT NULL,
    peso_categoria weight_class NOT NULL,
    altura INTEGER, -- en centímetros
    alcance INTEGER, -- en centímetros
    victorias INTEGER DEFAULT 0,
    derrotas INTEGER DEFAULT 0,
    empates INTEGER DEFAULT 0,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de torneos
CREATE TABLE IF NOT EXISTS tournaments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    organizador_club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE RESTRICT,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    ubicacion VARCHAR(255),
    estado tournament_status DEFAULT 'programado',
    publico BOOLEAN DEFAULT true,
    max_participantes INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_dates CHECK (fecha_inicio <= fecha_fin)
);

-- Tabla de combates
CREATE TABLE IF NOT EXISTS fights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tournament_id UUID REFERENCES tournaments(id) ON DELETE SET NULL,
    boxer1_id UUID NOT NULL REFERENCES boxers(id) ON DELETE CASCADE,
    boxer2_id UUID NOT NULL REFERENCES boxers(id) ON DELETE CASCADE,
    fecha TIMESTAMP WITH TIME ZONE NOT NULL,
    ubicacion VARCHAR(255),
    peso_categoria weight_class NOT NULL,
    resultado fight_result DEFAULT 'pendiente',
    ganador_id UUID REFERENCES boxers(id) ON DELETE SET NULL,
    notas TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT different_boxers CHECK (boxer1_id != boxer2_id),
    CONSTRAINT valid_winner CHECK (
        ganador_id IS NULL OR 
        ganador_id = boxer1_id OR 
        ganador_id = boxer2_id OR
        resultado = 'empate'
    )
);

-- Índices para rendimiento
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_clubs_admin ON clubs(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_boxers_user ON boxers(user_id);
CREATE INDEX IF NOT EXISTS idx_boxers_club ON boxers(club_id);
CREATE INDEX IF NOT EXISTS idx_boxers_categoria ON boxers(peso_categoria);
CREATE INDEX IF NOT EXISTS idx_tournaments_organizador ON tournaments(organizador_club_id);
CREATE INDEX IF NOT EXISTS idx_tournaments_fecha ON tournaments(fecha_inicio, fecha_fin);
CREATE INDEX IF NOT EXISTS idx_tournaments_estado ON tournaments(estado);
CREATE INDEX IF NOT EXISTS idx_fights_tournament ON fights(tournament_id);
CREATE INDEX IF NOT EXISTS idx_fights_boxers ON fights(boxer1_id, boxer2_id);
CREATE INDEX IF NOT EXISTS idx_fights_fecha ON fights(fecha);
CREATE INDEX IF NOT EXISTS idx_fights_resultado ON fights(resultado);

-- Triggers para updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_clubs_updated_at ON clubs;
CREATE TRIGGER update_clubs_updated_at 
    BEFORE UPDATE ON clubs 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_boxers_updated_at ON boxers;
CREATE TRIGGER update_boxers_updated_at 
    BEFORE UPDATE ON boxers 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_tournaments_updated_at ON tournaments;
CREATE TRIGGER update_tournaments_updated_at 
    BEFORE UPDATE ON tournaments 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_fights_updated_at ON fights;
CREATE TRIGGER update_fights_updated_at 
    BEFORE UPDATE ON fights 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Función para actualizar estadísticas de boxeadores
CREATE OR REPLACE FUNCTION update_boxer_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Si es una inserción o actualización de resultado
    IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.resultado != NEW.resultado) THEN
        -- Actualizar estadísticas del boxer1
        UPDATE boxers SET 
            victorias = (
                SELECT COUNT(*) FROM fights 
                WHERE (boxer1_id = NEW.boxer1_id OR boxer2_id = NEW.boxer1_id) 
                AND ganador_id = NEW.boxer1_id
                AND resultado != 'pendiente'
            ),
            derrotas = (
                SELECT COUNT(*) FROM fights 
                WHERE (boxer1_id = NEW.boxer1_id OR boxer2_id = NEW.boxer1_id)
                AND ganador_id != NEW.boxer1_id 
                AND ganador_id IS NOT NULL
                AND resultado != 'pendiente'
                AND resultado != 'empate'
            ),
            empates = (
                SELECT COUNT(*) FROM fights 
                WHERE (boxer1_id = NEW.boxer1_id OR boxer2_id = NEW.boxer1_id)
                AND resultado = 'empate'
            )
        WHERE id = NEW.boxer1_id;
        
        -- Actualizar estadísticas del boxer2
        UPDATE boxers SET 
            victorias = (
                SELECT COUNT(*) FROM fights 
                WHERE (boxer1_id = NEW.boxer2_id OR boxer2_id = NEW.boxer2_id) 
                AND ganador_id = NEW.boxer2_id
                AND resultado != 'pendiente'
            ),
            derrotas = (
                SELECT COUNT(*) FROM fights 
                WHERE (boxer1_id = NEW.boxer2_id OR boxer2_id = NEW.boxer2_id)
                AND ganador_id != NEW.boxer2_id 
                AND ganador_id IS NOT NULL
                AND resultado != 'pendiente'
                AND resultado != 'empate'
            ),
            empates = (
                SELECT COUNT(*) FROM fights 
                WHERE (boxer1_id = NEW.boxer2_id OR boxer2_id = NEW.boxer2_id)
                AND resultado = 'empate'
            )
        WHERE id = NEW.boxer2_id;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar estadísticas automáticamente
DROP TRIGGER IF EXISTS update_boxer_stats_trigger ON fights;
CREATE TRIGGER update_boxer_stats_trigger
    AFTER INSERT OR UPDATE ON fights
    FOR EACH ROW 
    WHEN (NEW.resultado != 'pendiente')
    EXECUTE PROCEDURE update_boxer_stats();

-- Vistas útiles
CREATE OR REPLACE VIEW boxer_records AS
SELECT 
    b.id,
    b.nombre,
    b.peso_categoria,
    c.nombre as club_nombre,
    b.victorias,
    b.derrotas, 
    b.empates,
    (b.victorias + b.derrotas + b.empates) as combates_totales,
    CASE 
        WHEN (b.victorias + b.derrotas + b.empates) = 0 THEN 0
        ELSE ROUND((b.victorias::decimal / (b.victorias + b.derrotas + b.empates)) * 100, 2)
    END as porcentaje_victorias
FROM boxers b
LEFT JOIN clubs c ON b.club_id = c.id
WHERE b.activo = true;

CREATE OR REPLACE VIEW tournament_summary AS
SELECT 
    t.id,
    t.nombre,
    t.estado,
    t.fecha_inicio,
    t.fecha_fin,
    c.nombre as organizador_nombre,
    COUNT(f.id) as combates_totales,
    COUNT(CASE WHEN f.resultado != 'pendiente' THEN 1 END) as combates_completados
FROM tournaments t
LEFT JOIN clubs c ON t.organizador_club_id = c.id
LEFT JOIN fights f ON t.id = f.tournament_id
GROUP BY t.id, t.nombre, t.estado, t.fecha_inicio, t.fecha_fin, c.nombre;

-- Datos iniciales del sistema
INSERT INTO users (id, email, password_hash, role, nombre) VALUES 
('00000000-0000-0000-0000-000000000001', 'admin@boxeoapp.com', '$2b$12$example_hash_will_be_replaced', 'administrador_general', 'Administrador General')
ON CONFLICT (email) DO NOTHING;
`;