"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardStats = exports.deleteUser = exports.updateUser = exports.getUserById = exports.getUsers = void 0;
const database_1 = require("../config/database");
const getUsers = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, search = '', sort = 'created_at', order = 'desc' } = req.query;
        const offset = (page - 1) * limit;
        let whereClause = 'WHERE activo = true';
        const queryParams = [];
        let paramCount = 1;
        if (search) {
            whereClause += ` AND (nombre ILIKE $${paramCount} OR email ILIKE $${paramCount})`;
            queryParams.push(`%${search}%`);
            paramCount++;
        }
        // Query para obtener usuarios
        const usersQuery = `
      SELECT id, email, role, nombre, activo, created_at, updated_at
      FROM users 
      ${whereClause}
      ORDER BY ${sort} ${order}
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `;
        queryParams.push(limit, offset);
        // Query para contar total
        const countQuery = `SELECT COUNT(*) as total FROM users ${whereClause}`;
        const countParams = search ? [`%${search}%`] : [];
        const [usersResult, countResult] = await Promise.all([
            database_1.pool.query(usersQuery, queryParams),
            database_1.pool.query(countQuery, countParams),
        ]);
        const total = parseInt(countResult.rows[0].total);
        const totalPages = Math.ceil(total / limit);
        const response = {
            data: usersResult.rows,
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages,
        };
        res.json({
            success: true,
            data: response,
            message: 'Usuarios obtenidos exitosamente',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getUsers = getUsers;
const getUserById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userResult = await database_1.pool.query('SELECT id, email, role, nombre, activo, created_at, updated_at FROM users WHERE id = $1', [id]);
        if (userResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado',
            });
        }
        const user = userResult.rows[0];
        // Obtener información adicional según el rol
        let additionalData = {};
        if (user.role === 'administrador_club') {
            const clubResult = await database_1.pool.query('SELECT id, nombre, ubicacion, descripcion FROM clubs WHERE admin_user_id = $1', [id]);
            additionalData = { club: clubResult.rows[0] || null };
        }
        if (user.role === 'boxeador') {
            const boxerResult = await database_1.pool.query(`SELECT b.*, c.nombre as club_nombre 
         FROM boxers b 
         LEFT JOIN clubs c ON b.club_id = c.id 
         WHERE b.user_id = $1`, [id]);
            additionalData = { boxer: boxerResult.rows[0] || null };
        }
        res.json({
            success: true,
            data: {
                ...user,
                ...additionalData,
            },
            message: 'Usuario obtenido exitosamente',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getUserById = getUserById;
const updateUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { nombre, email, activo } = req.body;
        // Verificar que el usuario existe
        const existingUser = await database_1.pool.query('SELECT id, email FROM users WHERE id = $1', [id]);
        if (existingUser.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado',
            });
        }
        const updateFields = [];
        const updateValues = [];
        let paramCount = 1;
        if (nombre) {
            updateFields.push(`nombre = $${paramCount}`);
            updateValues.push(nombre);
            paramCount++;
        }
        if (email && email !== existingUser.rows[0].email) {
            // Verificar que el nuevo email no exista
            const emailCheck = await database_1.pool.query('SELECT id FROM users WHERE email = $1 AND id != $2', [email.toLowerCase(), id]);
            if (emailCheck.rows.length > 0) {
                return res.status(409).json({
                    success: false,
                    message: 'Ya existe un usuario con este email',
                });
            }
            updateFields.push(`email = $${paramCount}`);
            updateValues.push(email.toLowerCase());
            paramCount++;
        }
        if (typeof activo === 'boolean') {
            updateFields.push(`activo = $${paramCount}`);
            updateValues.push(activo);
            paramCount++;
        }
        if (updateFields.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No se proporcionaron campos para actualizar',
            });
        }
        updateValues.push(id);
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
            message: 'Usuario actualizado exitosamente',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateUser = updateUser;
const deleteUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        // Verificar que no es el propio usuario
        if (req.user?.id === id) {
            return res.status(400).json({
                success: false,
                message: 'No puedes eliminar tu propia cuenta',
            });
        }
        // Verificar que el usuario existe
        const existingUser = await database_1.pool.query('SELECT id, role FROM users WHERE id = $1', [id]);
        if (existingUser.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado',
            });
        }
        // En lugar de eliminar, desactivar el usuario
        await database_1.pool.query('UPDATE users SET activo = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1', [id]);
        res.json({
            success: true,
            message: 'Usuario desactivado exitosamente',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteUser = deleteUser;
const getDashboardStats = async (req, res, next) => {
    try {
        const statsQueries = [
            'SELECT COUNT(*) as count FROM users WHERE activo = true',
            'SELECT COUNT(*) as count FROM clubs WHERE activo = true',
            'SELECT COUNT(*) as count FROM boxers WHERE activo = true',
            'SELECT COUNT(*) as count FROM tournaments WHERE estado IN (\'programado\', \'activo\')',
            'SELECT COUNT(*) as count FROM fights WHERE fecha_combate >= CURRENT_DATE - INTERVAL \'30 days\'',
        ];
        const results = await Promise.all(statsQueries.map(query => database_1.pool.query(query)));
        const stats = {
            usuarios_total: parseInt(results[0].rows[0].count),
            clubes_total: parseInt(results[1].rows[0].count),
            boxeadores_total: parseInt(results[2].rows[0].count),
            torneos_activos: parseInt(results[3].rows[0].count),
            combates_recientes: parseInt(results[4].rows[0].count),
        };
        res.json({
            success: true,
            data: stats,
            message: 'Estadísticas obtenidas exitosamente',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getDashboardStats = getDashboardStats;
