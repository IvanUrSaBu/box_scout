"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Error interno del servidor';
    let errors = [];
    // Errores de validación de Joi
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = 'Error de validación';
        errors = err.errors || [err.message];
    }
    // Errores de PostgreSQL
    if (err.name === 'DatabaseError' || err.code) {
        const pgError = err;
        statusCode = 400;
        switch (pgError.code) {
            case '23505': // unique_violation
                message = 'Ya existe un registro con estos datos';
                break;
            case '23503': // foreign_key_violation
                message = 'Referencia a datos inexistentes';
                break;
            case '23514': // check_violation
                message = 'Los datos no cumplen las restricciones';
                break;
            case '42P01': // undefined_table
                message = 'Error de configuración de la base de datos';
                statusCode = 500;
                break;
            default:
                message = 'Error en la base de datos';
        }
    }
    // Errores de JWT
    if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Token de autenticación inválido';
    }
    if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token de autenticación expirado';
    }
    // Log del error (solo en desarrollo o errores 500+)
    if (process.env.NODE_ENV === 'development' || statusCode >= 500) {
        console.error(`❌ Error ${statusCode}:`, {
            message: err.message,
            stack: err.stack,
            url: req.url,
            method: req.method,
            body: req.body,
            params: req.params,
            query: req.query,
        });
    }
    res.status(statusCode).json({
        success: false,
        message,
        errors: errors.length > 0 ? errors : undefined,
    });
};
exports.errorHandler = errorHandler;
