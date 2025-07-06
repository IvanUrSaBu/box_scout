import { pool } from '../config/database.js';
import bcrypt from 'bcrypt';

async function seedDatabase() {
  try {
    console.log('🌱 Iniciando seed de la base de datos...');

    // Hash para contraseñas de prueba
    const adminHash = await bcrypt.hash('admin123', 12);
    const clubAdminHash = await bcrypt.hash('clubadmin123', 12);
    const boxerHash = await bcrypt.hash('boxer123', 12);

    // Limpiar datos existentes (en orden por dependencias)
    await pool.query('DELETE FROM fights WHERE id != \'00000000-0000-0000-0000-000000000000\'');
    await pool.query('DELETE FROM tournaments WHERE id != \'00000000-0000-0000-0000-000000000000\''); 
    await pool.query('DELETE FROM boxers WHERE id != \'00000000-0000-0000-0000-000000000000\'');
    await pool.query('DELETE FROM clubs WHERE id != \'00000000-0000-0000-0000-000000000000\'');
    await pool.query('DELETE FROM users WHERE id != \'00000000-0000-0000-0000-000000000001\'');

    // Actualizar usuario admin existente
    await pool.query(`
      UPDATE users 
      SET password_hash = $1 
      WHERE email = 'admin@boxeoapp.com'
    `, [adminHash]);

    // Insertar usuarios
    await pool.query(`
      INSERT INTO users (id, email, password_hash, role, nombre, activo) VALUES
      ('11111111-1111-1111-1111-111111111111', 'club1@boxeoapp.com', $1, 'administrador_club', 'Carlos García', true),
      ('22222222-2222-2222-2222-222222222222', 'club2@boxeoapp.com', $1, 'administrador_club', 'María López', true),
      ('33333333-3333-3333-3333-333333333333', 'club3@boxeoapp.com', $1, 'administrador_club', 'José Martín', true),
      ('44444444-4444-4444-4444-444444444444', 'club4@boxeoapp.com', $1, 'administrador_club', 'Ana Ruiz', true),
      ('55555555-5555-5555-5555-555555555555', 'boxer1@boxeoapp.com', $2, 'boxeador', 'Miguel Rodríguez', true),
      ('66666666-6666-6666-6666-666666666666', 'boxer2@boxeoapp.com', $2, 'boxeador', 'Ana Martínez', true),
      ('77777777-7777-7777-7777-777777777777', 'boxer3@boxeoapp.com', $2, 'boxeador', 'David Sánchez', true),
      ('88888888-8888-8888-8888-888888888888', 'boxer4@boxeoapp.com', $2, 'boxeador', 'Laura Fernández', true),
      ('99999999-9999-9999-9999-999999999999', 'boxer5@boxeoapp.com', $2, 'boxeador', 'Carlos Jiménez', true)
    `, [clubAdminHash, boxerHash]);

    // Insertar clubes
    await pool.query(`
      INSERT INTO clubs (id, nombre, ubicacion, descripcion, admin_user_id, activo) VALUES
      ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Club Boxeo Madrid', 'Madrid, España', 'Club de boxeo amateur más antiguo de Madrid', '11111111-1111-1111-1111-111111111111', true),
      ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Athletic Barcelona', 'Barcelona, España', 'Club profesional con grandes instalaciones', '22222222-2222-2222-2222-222222222222', true),
      ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Valencia Boxing Club', 'Valencia, España', 'Especialistas en formación de jóvenes talentos', '33333333-3333-3333-3333-333333333333', true),
      ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Sevilla Fight Club', 'Sevilla, España', 'Club con tradición en competiciones nacionales', '44444444-4444-4444-4444-444444444444', true)
    `);

    // Insertar boxeadores
    await pool.query(`
      INSERT INTO boxers (id, user_id, club_id, nombre, fecha_nacimiento, peso_categoria, altura, alcance, activo) VALUES
      ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '55555555-5555-5555-5555-555555555555', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Miguel "El Rayo" Rodríguez', '2000-03-15', 'peso_welter', 175, 180, true),
      ('ffffffff-ffff-ffff-ffff-ffffffffffff', '66666666-6666-6666-6666-666666666666', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Ana "La Pantera" Martínez', '2002-07-22', 'peso_ligero', 165, 170, true),
      ('gggggggg-gggg-gggg-gggg-gggggggggggg', '77777777-7777-7777-7777-777777777777', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'David "El Martillo" Sánchez', '1998-11-08', 'peso_mediano', 182, 185, true),
      ('hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', '88888888-8888-8888-8888-888888888888', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Laura "La Reina" Fernández', '2003-01-12', 'peso_pluma', 160, 165, true),
      ('iiiiiiii-iiii-iiii-iiii-iiiiiiiiiiii', '99999999-9999-9999-9999-999999999999', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Carlos "El Toro" Jiménez', '1996-09-30', 'peso_pesado', 190, 195, true)
    `);

    // Insertar torneos
    await pool.query(`
      INSERT INTO tournaments (id, nombre, descripcion, organizador_club_id, fecha_inicio, fecha_fin, ubicacion, estado, publico, max_participantes) VALUES
      ('tttttttt-tttt-tttt-tttt-tttttttttttt', 'Campeonato Nacional 2024', 'Torneo nacional de boxeo amateur con participación de todos los clubes', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2024-03-15', '2024-03-17', 'Palacio de Deportes Madrid', 'programado', true, 32),
      ('uuuuuuuu-uuuu-uuuu-uuuu-uuuuuuuuuuuu', 'Copa Primavera Barcelona', 'Torneo de primavera para categorías juveniles y senior', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '2024-02-20', '2024-02-22', 'Polideportivo San Adrián', 'activo', true, 16),
      ('vvvvvvvv-vvvv-vvvv-vvvv-vvvvvvvvvvvv', 'Torneo Valencia Open', 'Competición abierta para todas las categorías', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '2024-01-15', '2024-01-17', 'Pabellón Valencia Arena', 'completado', true, 24)
    `);

    // Insertar combates
    await pool.query(`
      INSERT INTO fights (id, tournament_id, boxer1_id, boxer2_id, fecha, ubicacion, peso_categoria, resultado, ganador_id) VALUES
      ('wwwwwwww-wwww-wwww-wwww-wwwwwwwwwwww', 'uuuuuuuu-uuuu-uuuu-uuuu-uuuuuuuuuuuu', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'gggggggg-gggg-gggg-gggg-gggggggggggg', '2024-02-21 18:00:00+01', 'Ring Central', 'peso_welter', 'boxer1_gana', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'),
      ('xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx', 'uuuuuuuu-uuuu-uuuu-uuuu-uuuuuuuuuuuu', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', '2024-02-21 19:30:00+01', 'Ring Central', 'peso_ligero', 'pendiente', NULL),
      ('yyyyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy', 'vvvvvvvv-vvvv-vvvv-vvvv-vvvvvvvvvvvv', 'iiiiiiii-iiii-iiii-iiii-iiiiiiiiiiii', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '2024-01-16 20:00:00+01', 'Ring Principal', 'peso_pesado', 'empate', NULL),
      ('zzzzzzzz-zzzz-zzzz-zzzz-zzzzzzzzzzzz', 'vvvvvvvv-vvvv-vvvv-vvvv-vvvvvvvvvvvv', 'gggggggg-gggg-gggg-gggg-gggggggggggg', 'hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', '2024-01-17 18:30:00+01', 'Ring Secundario', 'peso_mediano', 'boxer1_gana', 'gggggggg-gggg-gggg-gggg-gggggggggggg')
    `);

    console.log('✅ Seed completado exitosamente');
    console.log('👤 Usuarios creados: 9 (1 admin general, 4 admin club, 4 boxeadores)');
    console.log('🏢 Clubes creados: 4');
    console.log('🥊 Boxeadores creados: 5');
    console.log('🏆 Torneos creados: 3');
    console.log('⚔️ Combates creados: 4');
    console.log('');
    console.log('🔑 Credenciales de prueba:');
    console.log('  Admin General: admin@boxeoapp.com / admin123');
    console.log('  Club Madrid: club1@boxeoapp.com / clubadmin123');
    console.log('  Boxeador: boxer1@boxeoapp.com / boxer123');

  } catch (error) {
    console.error('❌ Error en seed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase().catch(console.error);
}