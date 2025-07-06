"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const compression_1 = __importDefault(require("compression"));
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = require("./config/database");
const errorHandler_1 = require("./middleware/errorHandler");
const notFound_1 = require("./middleware/notFound");
// Importar rutas
const auth_1 = __importDefault(require("./routes/auth"));
const users_1 = __importDefault(require("./routes/users"));
const clubs_1 = __importDefault(require("./routes/clubs"));
const boxers_1 = __importDefault(require("./routes/boxers"));
const tournaments_1 = __importDefault(require("./routes/tournaments"));
const fights_1 = __importDefault(require("./routes/fights"));
// Cargar variables de entorno
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// Middleware de seguridad y utilidad
app.use((0, helmet_1.default)());
app.use((0, compression_1.default)());
app.use((0, morgan_1.default)('combined'));
// Configuración de CORS
const corsOptions = {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    optionsSuccessStatus: 200,
};
app.use((0, cors_1.default)(corsOptions));
// Middleware para parsing
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Ruta de salud
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'API de BoxeoApp funcionando correctamente',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});
// Rutas de la API
app.use('/api/auth', auth_1.default);
app.use('/api/users', users_1.default);
app.use('/api/clubs', clubs_1.default);
app.use('/api/boxers', boxers_1.default);
app.use('/api/tournaments', tournaments_1.default);
app.use('/api/fights', fights_1.default);
// Middleware de manejo de errores
app.use(notFound_1.notFound);
app.use(errorHandler_1.errorHandler);
// Inicializar servidor
const startServer = async () => {
    try {
        // Verificar conexión a la base de datos
        const dbConnected = await (0, database_1.testConnection)();
        if (!dbConnected) {
            throw new Error('No se pudo conectar a la base de datos');
        }
        app.listen(PORT, () => {
            console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
            console.log(`🌐 API disponible en: http://localhost:${PORT}/api`);
            console.log(`❤️  Health check: http://localhost:${PORT}/api/health`);
            if (process.env.NODE_ENV === 'development') {
                console.log(`🔧 Modo: ${process.env.NODE_ENV}`);
                console.log(`📡 CORS configurado para: ${corsOptions.origin}`);
            }
        });
    }
    catch (error) {
        console.error('❌ Error iniciando el servidor:', error);
        process.exit(1);
    }
};
// Manejo de errores no capturados
process.on('unhandledRejection', (err) => {
    console.error('❌ Unhandled Promise Rejection:', err.message);
    process.exit(1);
});
process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught Exception:', err.message);
    process.exit(1);
});
startServer();
exports.default = app;
