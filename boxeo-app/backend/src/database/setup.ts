import { pool } from '../config/database.js';
import { createSchema } from './schema.js';

async function setupDatabase() {
  try {
    console.log('🚀 Iniciando configuración de la base de datos...');
    
    // Ejecutar el schema
    await pool.query(createSchema);
    
    console.log('✅ Base de datos configurada exitosamente');
    console.log('📊 Tablas creadas: users, clubs, boxers, tournaments, fights');
    console.log('🔧 Triggers y funciones configurados');
    console.log('📈 Vistas creadas: boxer_records, tournament_summary');
    
  } catch (error) {
    console.error('❌ Error configurando la base de datos:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  setupDatabase().catch(console.error);
}