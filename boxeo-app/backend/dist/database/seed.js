"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedDatabase = void 0;
const database_1 = require("../config/database");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const seedDatabase = async () => {
    try {
        console.log('🌱 Iniciando sembrado de datos de prueba...');
        // Crear administrador general
        const adminPassword = await bcryptjs_1.default.hash('admin123', 10);
        const adminResult = await database_1.pool.query(`INSERT INTO users (email, password_hash, role, nombre) 
       VALUES ($1, $2, $3, $4) 
       ON CONFLICT (email) DO NOTHING 
       RETURNING id`, ['admin@boxeoapp.com', adminPassword, 'administrador_general', 'Administrador General']);
        // Crear administrador de club
        const clubAdminPassword = await bcryptjs_1.default.hash('clubadmin123', 10);
        const clubAdminResult = await database_1.pool.query(`INSERT INTO users (email, password_hash, role, nombre) 
       VALUES ($1, $2, $3, $4) 
       ON CONFLICT (email) DO NOTHING 
       RETURNING id`, ['club1@boxeoapp.com', clubAdminPassword, 'administrador_club', 'Carlos García']);
        // Crear segundo administrador de club
        const clubAdmin2Password = await bcryptjs_1.default.hash('clubadmin456', 10);
        const clubAdmin2Result = await database_1.pool.query(`INSERT INTO users (email, password_hash, role, nombre) 
       VALUES ($1, $2, $3, $4) 
       ON CONFLICT (email) DO NOTHING 
       RETURNING id`, ['club2@boxeoapp.com', clubAdmin2Password, 'administrador_club', 'María López']);
        // Crear boxeadores
        const boxer1Password = await bcryptjs_1.default.hash('boxer123', 10);
        const boxer1Result = await database_1.pool.query(`INSERT INTO users (email, password_hash, role, nombre) 
       VALUES ($1, $2, $3, $4) 
       ON CONFLICT (email) DO NOTHING 
       RETURNING id`, ['boxer1@boxeoapp.com', boxer1Password, 'boxeador', 'Miguel Rodríguez']);
        const boxer2Password = await bcryptjs_1.default.hash('boxer456', 10);
        const boxer2Result = await database_1.pool.query(`INSERT INTO users (email, password_hash, role, nombre) 
       VALUES ($1, $2, $3, $4) 
       ON CONFLICT (email) DO NOTHING 
       RETURNING id`, ['boxer2@boxeoapp.com', boxer2Password, 'boxeador', 'Ana Martínez']);
        const boxer3Password = await bcryptjs_1.default.hash('boxer789', 10);
        const boxer3Result = await database_1.pool.query(`INSERT INTO users (email, password_hash, role, nombre) 
       VALUES ($1, $2, $3, $4) 
       ON CONFLICT (email) DO NOTHING 
       RETURNING id`, ['boxer3@boxeoapp.com', boxer3Password, 'boxeador', 'David Sánchez']);
        const boxer4Password = await bcryptjs_1.default.hash('boxer101', 10);
        const boxer4Result = await database_1.pool.query(`INSERT INTO users (email, password_hash, role, nombre) 
       VALUES ($1, $2, $3, $4) 
       ON CONFLICT (email) DO NOTHING 
       RETURNING id`, ['boxer4@boxeoapp.com', boxer4Password, 'boxeador', 'Laura Fernández']);
        // Obtener IDs de usuarios creados
        const adminId = adminResult.rows[0]?.id;
        const clubAdminId = clubAdminResult.rows[0]?.id;
        const clubAdmin2Id = clubAdmin2Result.rows[0]?.id;
        const boxer1Id = boxer1Result.rows[0]?.id;
        const boxer2Id = boxer2Result.rows[0]?.id;
        const boxer3Id = boxer3Result.rows[0]?.id;
        const boxer4Id = boxer4Result.rows[0]?.id;
        // Crear clubes
        let club1Id, club2Id;
        if (clubAdminId) {
            const club1Result = await database_1.pool.query(`INSERT INTO clubs (nombre, ubicacion, descripcion, admin_user_id) 
         VALUES ($1, $2, $3, $4) 
         ON CONFLICT DO NOTHING 
         RETURNING id`, ['Club Boxeo Madrid', 'Madrid, España', 'Club de boxeo con más de 20 años de experiencia en la formación de campeones.', clubAdminId]);
            club1Id = club1Result.rows[0]?.id;
        }
        if (clubAdmin2Id) {
            const club2Result = await database_1.pool.query(`INSERT INTO clubs (nombre, ubicacion, descripcion, admin_user_id) 
         VALUES ($1, $2, $3, $4) 
         ON CONFLICT DO NOTHING 
         RETURNING id`, ['Club Atlético Barcelona', 'Barcelona, España', 'Club deportivo especializado en boxeo amateur y profesional.', clubAdmin2Id]);
            club2Id = club2Result.rows[0]?.id;
        }
        // Crear perfiles de boxeadores
        if (boxer1Id && club1Id) {
            await database_1.pool.query(`INSERT INTO boxers (user_id, club_id, nombre, peso_categoria, fecha_nacimiento, victorias, derrotas, empates) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
         ON CONFLICT DO NOTHING`, [boxer1Id, club1Id, 'Miguel "El Rayo" Rodríguez', 'peso_welter', '1995-03-15', 8, 2, 1]);
        }
        if (boxer2Id && club1Id) {
            await database_1.pool.query(`INSERT INTO boxers (user_id, club_id, nombre, peso_categoria, fecha_nacimiento, victorias, derrotas, empates) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
         ON CONFLICT DO NOTHING`, [boxer2Id, club1Id, 'Ana "La Pantera" Martínez', 'peso_ligero', '1998-07-22', 6, 1, 0]);
        }
        if (boxer3Id && club2Id) {
            await database_1.pool.query(`INSERT INTO boxers (user_id, club_id, nombre, peso_categoria, fecha_nacimiento, victorias, derrotas, empates) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
         ON CONFLICT DO NOTHING`, [boxer3Id, club2Id, 'David "El Martillo" Sánchez', 'peso_mediano', '1993-11-08', 12, 3, 2]);
        }
        if (boxer4Id) {
            await database_1.pool.query(`INSERT INTO boxers (user_id, club_id, nombre, peso_categoria, fecha_nacimiento, victorias, derrotas, empates) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
         ON CONFLICT DO NOTHING`, [boxer4Id, null, 'Laura "La Reina" Fernández', 'peso_pluma', '1996-05-12', 4, 0, 1]);
        }
        // Crear torneos
        if (club1Id) {
            await database_1.pool.query(`INSERT INTO tournaments (nombre, descripcion, organizador_club_id, es_publico, fecha_inicio, fecha_fin, estado, ubicacion) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
         ON CONFLICT DO NOTHING`, [
                'Campeonato de Madrid 2024',
                'Torneo anual de boxeo amateur de la Comunidad de Madrid',
                club1Id,
                true,
                '2024-09-15',
                '2024-09-17',
                'completado',
                'Polideportivo Municipal de Madrid'
            ]);
            await database_1.pool.query(`INSERT INTO tournaments (nombre, descripcion, organizador_club_id, es_publico, fecha_inicio, fecha_fin, estado, ubicacion) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
         ON CONFLICT DO NOTHING`, [
                'Copa Primavera 2025',
                'Torneo de preparación para la temporada 2025',
                club1Id,
                true,
                '2025-03-20',
                '2025-03-22',
                'programado',
                'Gimnasio Club Boxeo Madrid'
            ]);
        }
        console.log('✅ Datos de prueba sembrados exitosamente');
        console.log('');
        console.log('👤 Usuarios creados:');
        console.log('  📧 admin@boxeoapp.com (contraseña: admin123) - Administrador General');
        console.log('  📧 club1@boxeoapp.com (contraseña: clubadmin123) - Admin Club Madrid');
        console.log('  📧 club2@boxeoapp.com (contraseña: clubadmin456) - Admin Club Barcelona');
        console.log('  📧 boxer1@boxeoapp.com (contraseña: boxer123) - Miguel Rodríguez');
        console.log('  📧 boxer2@boxeoapp.com (contraseña: boxer456) - Ana Martínez');
        console.log('  📧 boxer3@boxeoapp.com (contraseña: boxer789) - David Sánchez');
        console.log('  📧 boxer4@boxeoapp.com (contraseña: boxer101) - Laura Fernández');
    }
    catch (error) {
        console.error('❌ Error sembrando datos:', error);
        throw error;
    }
};
exports.seedDatabase = seedDatabase;
// Ejecutar si se llama directamente
if (require.main === module) {
    (0, exports.seedDatabase)()
        .then(() => {
        console.log('✅ Sembrado completado');
        process.exit(0);
    })
        .catch((error) => {
        console.error('❌ Error:', error);
        process.exit(1);
    });
}
