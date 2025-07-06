"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.canModifyBoxer = exports.canModifyClub = exports.authorize = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = require("../config/database");
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Token de autenticación requerido',
            });
        }
        const token = authHeader.substring(7);
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            throw new Error('JWT_SECRET no configurado');
        }
        const decoded = jsonwebtoken_1.default.verify(token, jwtSecret);
        // Obtener datos del usuario
        const userResult = await database_1.pool.query('SELECT id, email, role, nombre, activo, created_at, updated_at FROM users WHERE id = $1 AND activo = true', [decoded.userId]);
        if (userResult.rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no encontrado o inactivo',
            });
        }
        req.user = userResult.rows[0];
        next();
    }
    catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Token inválido o expirado',
        });
    }
};
exports.authenticate = authenticate;
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no autenticado',
            });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permisos para acceder a este recurso',
            });
        }
        next();
    };
};
exports.authorize = authorize;
// Middleware para verificar si el usuario puede modificar un club
const canModifyClub = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no autenticado',
            });
        }
        // Administrador general puede modificar cualquier club
        if (req.user.role === 'administrador_general') {
            return next();
        }
        // Administrador de club solo puede modificar su propio club
        if (req.user.role === 'administrador_club') {
            const clubId = req.params.id || req.body.club_id;
            if (!clubId) {
                return res.status(400).json({
                    success: false,
                    message: 'ID del club requerido',
                });
            }
            const clubResult = await database_1.pool.query('SELECT admin_user_id FROM clubs WHERE id = $1', [clubId]);
            if (clubResult.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Club no encontrado',
                });
            }
            if (clubResult.rows[0].admin_user_id !== req.user.id) {
                return res.status(403).json({
                    success: false,
                    message: 'No puedes modificar este club',
                });
            }
        }
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.canModifyClub = canModifyClub;
// Middleware para verificar si el usuario puede modificar un boxeador
const canModifyBoxer = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no autenticado',
            });
        }
        // Administrador general puede modificar cualquier boxeador
        if (req.user.role === 'administrador_general') {
            return next();
        }
        const boxerId = req.params.id || req.body.boxer_id;
        if (!boxerId) {
            return res.status(400).json({
                success: false,
                message: 'ID del boxeador requerido',
            });
        }
        const boxerResult = await database_1.pool.query(`SELECT b.user_id, b.club_id, c.admin_user_id 
       FROM boxers b 
       LEFT JOIN clubs c ON b.club_id = c.id 
       WHERE b.id = $1`, [boxerId]);
        if (boxerResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Boxeador no encontrado',
            });
        }
        const boxer = boxerResult.rows[0];
        // El boxeador puede modificar su propio perfil
        if (req.user.role === 'boxeador' && boxer.user_id === req.user.id) {
            return next();
        }
        // Administrador de club puede modificar boxeadores de su club
        if (req.user.role === 'administrador_club' && boxer.admin_user_id === req.user.id) {
            return next();
        }
        return res.status(403).json({
            success: false,
            message: 'No puedes modificar este boxeador',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.canModifyBoxer = canModifyBoxer;
