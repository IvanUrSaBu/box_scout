"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeConnection = exports.testConnection = exports.pool = void 0;
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'boxeo_app',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
};
exports.pool = new pg_1.Pool(dbConfig);
const testConnection = async () => {
    try {
        const client = await exports.pool.connect();
        await client.query('SELECT NOW()');
        client.release();
        console.log('✅ Conexión a la base de datos establecida');
        return true;
    }
    catch (error) {
        console.error('❌ Error conectando a la base de datos:', error);
        return false;
    }
};
exports.testConnection = testConnection;
const closeConnection = async () => {
    await exports.pool.end();
    console.log('🔌 Conexión a la base de datos cerrada');
};
exports.closeConnection = closeConnection;
