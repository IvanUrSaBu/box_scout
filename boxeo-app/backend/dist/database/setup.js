"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupDatabase = void 0;
const database_1 = require("../config/database");
const schema_1 = require("./schema");
const setupDatabase = async () => {
    try {
        console.log('🚀 Iniciando configuración de la base de datos...');
        // Verificar conexión
        const connected = await (0, database_1.testConnection)();
        if (!connected) {
            throw new Error('No se pudo conectar a la base de datos');
        }
        // Ejecutar el schema
        console.log('📋 Creando esquema de la base de datos...');
        await database_1.pool.query(schema_1.createSchema);
        console.log('✅ Esquema creado exitosamente');
        console.log('🎉 Base de datos configurada correctamente');
    }
    catch (error) {
        console.error('❌ Error configurando la base de datos:', error);
        throw error;
    }
};
exports.setupDatabase = setupDatabase;
// Ejecutar si se llama directamente
if (require.main === module) {
    (0, exports.setupDatabase)()
        .then(() => {
        console.log('✅ Configuración completada');
        process.exit(0);
    })
        .catch((error) => {
        console.error('❌ Error:', error);
        process.exit(1);
    });
}
