"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePassword = exports.updateProfile = exports.getProfile = exports.register = exports.login = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = require("../config/database");
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        // Buscar usuario por email
        const userResult = await database_1.pool.query('SELECT id, email, password_hash, role, nombre, activo, created_at, updated_at FROM users WHERE email = $1', [email.toLowerCase()]);
        if (userResult.rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas',
            });
        }
        const user = userResult.rows[0];
        // Verificar si el usuario está activo
        if (!user.activo) {
            return res.status(401).json({
                success: false,
                message: 'Usuario inactivo',
            });
        }
        // Verificar contraseña
        const isPasswordValid = await bcryptjs_1.default.compare(password, user.password_hash);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas',
            });
        }
        // Crear token JWT
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            throw new Error('JWT_SECRET no configurado');
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, jwtSecret, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
        // Preparar respuesta sin password_hash
        const userDTO = {
            id: user.id,
            email: user.email,
            role: user.role,
            nombre: user.nombre,
            activo: user.activo,
            created_at: user.created_at,
            updated_at: user.updated_at,
        };
        const response = {
            user: userDTO,
            token,
        };
        res.json({
            success: true,
            data: response,
            message: 'Inicio de sesión exitoso',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.login = login;
const register = async (req, res, next) => {
    try {
        const { email, password, nombre, role } = req.body;
        // Verificar si el email ya existe
        const existingUser = await database_1.pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
        if (existingUser.rows.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Ya existe un usuario con este email',
            });
        }
        // Hash de la contraseña
        const saltRounds = 10;
        const passwordHash = await bcryptjs_1.default.hash(password, saltRounds);
        // Crear usuario
        const userResult = await database_1.pool.query(`INSERT INTO users (email, password_hash, role, nombre) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, email, role, nombre, activo, created_at, updated_at`, [email.toLowerCase(), passwordHash, role, nombre]);
        const user = userResult.rows[0];
        // Crear token JWT
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            throw new Error('JWT_SECRET no configurado');
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, jwtSecret, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
        const userDTO = {
            id: user.id,
            email: user.email,
            role: user.role,
            nombre: user.nombre,
            activo: user.activo,
            created_at: user.created_at,
            updated_at: user.updated_at,
        };
        const response = {
            user: userDTO,
            token,
        };
        res.status(201).json({
            success: true,
            data: response,
            message: 'Usuario registrado exitosamente',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.register = register;
const getProfile = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no autenticado',
            });
        }
        // Obtener información adicional según el rol
        let additionalData = {};
        if (req.user.role === 'administrador_club') {
            // Obtener club que administra
            const clubResult = await database_1.pool.query('SELECT id, nombre, ubicacion, descripcion FROM clubs WHERE admin_user_id = $1', [req.user.id]);
            additionalData = { club: clubResult.rows[0] || null };
        }
        if (req.user.role === 'boxeador') {
            // Obtener perfil de boxeador
            const boxerResult = await database_1.pool.query(`SELECT b.*, c.nombre as club_nombre 
         FROM boxers b 
         LEFT JOIN clubs c ON b.club_id = c.id 
         WHERE b.user_id = $1`, [req.user.id]);
            additionalData = { boxer: boxerResult.rows[0] || null };
        }
        res.json({
            success: true,
            data: {
                ...req.user,
                ...additionalData,
            },
            message: 'Perfil obtenido exitosamente',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getProfile = getProfile;
const updateProfile = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no autenticado',
            });
        }
        const { nombre, email } = req.body;
        const updateFields = [];
        const updateValues = [];
        let paramCount = 1;
        if (nombre) {
            updateFields.push(`nombre = $${paramCount}`);
            updateValues.push(nombre);
            paramCount++;
        }
        if (email && email !== req.user.email) {
            // Verificar que el nuevo email no exista
            const existingUser = await database_1.pool.query('SELECT id FROM users WHERE email = $1 AND id != $2', [email.toLowerCase(), req.user.id]);
            if (existingUser.rows.length > 0) {
                return res.status(409).json({
                    success: false,
                    message: 'Ya existe un usuario con este email',
                });
            }
            updateFields.push(`email = $${paramCount}`);
            updateValues.push(email.toLowerCase());
            paramCount++;
        }
        if (updateFields.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No se proporcionaron campos para actualizar',
            });
        }
        updateValues.push(req.user.id);
        const updateQuery = `
      UPDATE users 
      SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $${paramCount} 
      RETURNING id, email, role, nombre, activo, created_at, updated_at
    `;
        const result = await database_1.pool.query(updateQuery, updateValues);
        const updatedUser = result.rows[0];
        res.json({
            success: true,
            data: updatedUser,
            message: 'Perfil actualizado exitosamente',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateProfile = updateProfile;
const changePassword = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no autenticado',
            });
        }
        const { currentPassword, newPassword } = req.body;
        // Validar que se proporcionen ambas contraseñas
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Se requieren la contraseña actual y la nueva contraseña',
            });
        }
        // Validar longitud de nueva contraseña
        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'La nueva contraseña debe tener al menos 6 caracteres',
            });
        }
        // Obtener contraseña actual hasheada
        const userResult = await database_1.pool.query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
        const user = userResult.rows[0];
        // Verificar contraseña actual
        const isCurrentPasswordValid = await bcryptjs_1.default.compare(currentPassword, user.password_hash);
        if (!isCurrentPasswordValid) {
            return res.status(400).json({
                success: false,
                message: 'La contraseña actual es incorrecta',
            });
        }
        // Hash de la nueva contraseña
        const saltRounds = 10;
        const newPasswordHash = await bcryptjs_1.default.hash(newPassword, saltRounds);
        // Actualizar contraseña
        await database_1.pool.query('UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [newPasswordHash, req.user.id]);
        res.json({
            success: true,
            message: 'Contraseña actualizada exitosamente',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.changePassword = changePassword;
