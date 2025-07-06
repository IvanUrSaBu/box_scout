"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBoxerFights = exports.deleteBoxer = exports.updateBoxer = exports.createBoxer = exports.getBoxerById = exports.getBoxers = void 0;
const database_1 = require("../config/database");
const getBoxers = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, search = '', sort = 'created_at', order = 'desc', club_id } = req.query;
        const offset = (page - 1) * limit;
        let whereClause = 'WHERE b.activo = true';
        const queryParams = [];
        let paramCount = 1;
        if (search) {
            whereClause += ` AND b.nombre ILIKE $${paramCount}`;
            queryParams.push(`%${search}%`);
            paramCount++;
        }
        if (club_id) {
            whereClause += ` AND b.club_id = $${paramCount}`;
            queryParams.push(club_id);
            paramCount++;
        }
        // Query para obtener boxeadores con información del club y usuario
        const boxersQuery = `
      SELECT 
        b.id, b.user_id, b.club_id, b.nombre, b.peso_categoria, b.fecha_nacimiento,
        b.victorias, b.derrotas, b.empates, b.activo, b.created_at, b.updated_at,
        u.email, u.nombre as user_nombre,
        c.nombre as club_nombre, c.ubicacion as club_ubicacion
      FROM boxers b
      LEFT JOIN users u ON b.user_id = u.id
      LEFT JOIN clubs c ON b.club_id = c.id
      ${whereClause}
      ORDER BY b.${sort} ${order}
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `;
        queryParams.push(limit, offset);
        // Query para contar total
        const countQuery = `
      SELECT COUNT(*) as total 
      FROM boxers b 
      LEFT JOIN clubs c ON b.club_id = c.id 
      ${whereClause}
    `;
        const countParams = queryParams.slice(0, -2); // Remover limit y offset
        const [boxersResult, countResult] = await Promise.all([
            database_1.pool.query(boxersQuery, queryParams),
            database_1.pool.query(countQuery, countParams),
        ]);
        const total = parseInt(countResult.rows[0].total);
        const totalPages = Math.ceil(total / limit);
        // Transformar datos
        const boxers = boxersResult.rows.map(row => ({
            id: row.id,
            user_id: row.user_id,
            club_id: row.club_id,
            nombre: row.nombre,
            peso_categoria: row.peso_categoria,
            fecha_nacimiento: row.fecha_nacimiento,
            victorias: row.victorias,
            derrotas: row.derrotas,
            empates: row.empates,
            activo: row.activo,
            created_at: row.created_at,
            updated_at: row.updated_at,
            user: row.user_id ? {
                id: row.user_id,
                email: row.email,
                nombre: row.user_nombre,
            } : undefined,
            club: row.club_id ? {
                id: row.club_id,
                nombre: row.club_nombre,
                ubicacion: row.club_ubicacion,
            } : undefined,
        }));
        const response = {
            data: boxers,
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages,
        };
        res.json({
            success: true,
            data: response,
            message: 'Boxeadores obtenidos exitosamente',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getBoxers = getBoxers;
const getBoxerById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const boxerResult = await database_1.pool.query(`SELECT 
        b.id, b.user_id, b.club_id, b.nombre, b.peso_categoria, b.fecha_nacimiento,
        b.victorias, b.derrotas, b.empates, b.activo, b.created_at, b.updated_at,
        u.email, u.nombre as user_nombre,
        c.nombre as club_nombre, c.ubicacion as club_ubicacion
      FROM boxers b
      LEFT JOIN users u ON b.user_id = u.id
      LEFT JOIN clubs c ON b.club_id = c.id
      WHERE b.id = $1`, [id]);
        if (boxerResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Boxeador no encontrado',
            });
        }
        const row = boxerResult.rows[0];
        const boxer = {
            id: row.id,
            user_id: row.user_id,
            club_id: row.club_id,
            nombre: row.nombre,
            peso_categoria: row.peso_categoria,
            fecha_nacimiento: row.fecha_nacimiento,
            victorias: row.victorias,
            derrotas: row.derrotas,
            empates: row.empates,
            activo: row.activo,
            created_at: row.created_at,
            updated_at: row.updated_at,
            user: {
                id: row.user_id,
                email: row.email,
                nombre: row.user_nombre,
            },
            club: row.club_id ? {
                id: row.club_id,
                nombre: row.club_nombre,
                ubicacion: row.club_ubicacion,
            } : undefined,
        };
        res.json({
            success: true,
            data: boxer,
            message: 'Boxeador obtenido exitosamente',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getBoxerById = getBoxerById;
const createBoxer = async (req, res, next) => {
    try {
        const { nombre, peso_categoria, fecha_nacimiento, club_id } = req.body;
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no autenticado',
            });
        }
        // Determinar user_id según el rol
        let boxerUserId = req.user.id;
        // Si es administrador y especifica un user_id diferente
        if ((req.user.role === 'administrador_general' || req.user.role === 'administrador_club') && req.body.user_id) {
            // Verificar que el usuario existe y es boxeador
            const userCheck = await database_1.pool.query('SELECT id, role FROM users WHERE id = $1 AND role = $2 AND activo = true', [req.body.user_id, 'boxeador']);
            if (userCheck.rows.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'El usuario especificado no existe o no es boxeador',
                });
            }
            boxerUserId = req.body.user_id;
        }
        // Verificar que el usuario no tenga ya un perfil de boxeador
        const existingBoxer = await database_1.pool.query('SELECT id FROM boxers WHERE user_id = $1', [boxerUserId]);
        if (existingBoxer.rows.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Este usuario ya tiene un perfil de boxeador',
            });
        }
        // Verificar club si se especifica
        if (club_id) {
            const clubCheck = await database_1.pool.query('SELECT id, admin_user_id FROM clubs WHERE id = $1 AND activo = true', [club_id]);
            if (clubCheck.rows.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'El club especificado no existe',
                });
            }
            // Si es administrador de club, solo puede agregar a su propio club
            if (req.user.role === 'administrador_club' && clubCheck.rows[0].admin_user_id !== req.user.id) {
                return res.status(403).json({
                    success: false,
                    message: 'No puedes agregar boxeadores a un club que no administras',
                });
            }
        }
        const boxerResult = await database_1.pool.query(`INSERT INTO boxers (user_id, club_id, nombre, peso_categoria, fecha_nacimiento)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, user_id, club_id, nombre, peso_categoria, fecha_nacimiento, 
                 victorias, derrotas, empates, activo, created_at, updated_at`, [boxerUserId, club_id || null, nombre, peso_categoria, fecha_nacimiento]);
        const boxer = boxerResult.rows[0];
        res.status(201).json({
            success: true,
            data: boxer,
            message: 'Boxeador creado exitosamente',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createBoxer = createBoxer;
const updateBoxer = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { nombre, peso_categoria, fecha_nacimiento, club_id, activo } = req.body;
        // Verificar que el boxeador existe
        const existingBoxer = await database_1.pool.query('SELECT id, user_id, club_id FROM boxers WHERE id = $1', [id]);
        if (existingBoxer.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Boxeador no encontrado',
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
        if (peso_categoria) {
            updateFields.push(`peso_categoria = $${paramCount}`);
            updateValues.push(peso_categoria);
            paramCount++;
        }
        if (fecha_nacimiento) {
            updateFields.push(`fecha_nacimiento = $${paramCount}`);
            updateValues.push(fecha_nacimiento);
            paramCount++;
        }
        if (club_id !== undefined) {
            if (club_id) {
                // Verificar que el club existe
                const clubCheck = await database_1.pool.query('SELECT id, admin_user_id FROM clubs WHERE id = $1 AND activo = true', [club_id]);
                if (clubCheck.rows.length === 0) {
                    return res.status(400).json({
                        success: false,
                        message: 'El club especificado no existe',
                    });
                }
                // Si es administrador de club, verificar permisos
                if (req.user?.role === 'administrador_club' && clubCheck.rows[0].admin_user_id !== req.user.id) {
                    return res.status(403).json({
                        success: false,
                        message: 'No puedes asignar boxeadores a un club que no administras',
                    });
                }
            }
            updateFields.push(`club_id = $${paramCount}`);
            updateValues.push(club_id || null);
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
      UPDATE boxers 
      SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $${paramCount} 
      RETURNING id, user_id, club_id, nombre, peso_categoria, fecha_nacimiento,
                victorias, derrotas, empates, activo, created_at, updated_at
    `;
        const result = await database_1.pool.query(updateQuery, updateValues);
        const updatedBoxer = result.rows[0];
        res.json({
            success: true,
            data: updatedBoxer,
            message: 'Boxeador actualizado exitosamente',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateBoxer = updateBoxer;
const deleteBoxer = async (req, res, next) => {
    try {
        const { id } = req.params;
        // Verificar que el boxeador existe
        const existingBoxer = await database_1.pool.query('SELECT id FROM boxers WHERE id = $1', [id]);
        if (existingBoxer.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Boxeador no encontrado',
            });
        }
        // En lugar de eliminar, desactivar el boxeador
        await database_1.pool.query('UPDATE boxers SET activo = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1', [id]);
        res.json({
            success: true,
            message: 'Boxeador desactivado exitosamente',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteBoxer = deleteBoxer;
const getBoxerFights = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;
        // Verificar que el boxeador existe
        const boxerExists = await database_1.pool.query('SELECT id FROM boxers WHERE id = $1', [id]);
        if (boxerExists.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Boxeador no encontrado',
            });
        }
        const fightsQuery = `
      SELECT 
        f.id, f.torneo_id, f.boxeador1_id, f.boxeador2_id, f.peso_categoria,
        f.resultado, f.fecha_combate, f.ubicacion, f.notas, f.created_at, f.updated_at,
        b1.nombre as boxeador1_nombre,
        b2.nombre as boxeador2_nombre,
        t.nombre as torneo_nombre
      FROM fights f
      LEFT JOIN boxers b1 ON f.boxeador1_id = b1.id
      LEFT JOIN boxers b2 ON f.boxeador2_id = b2.id
      LEFT JOIN tournaments t ON f.torneo_id = t.id
      WHERE f.boxeador1_id = $1 OR f.boxeador2_id = $1
      ORDER BY f.fecha_combate DESC
      LIMIT $2 OFFSET $3
    `;
        const countQuery = `
      SELECT COUNT(*) as total 
      FROM fights 
      WHERE boxeador1_id = $1 OR boxeador2_id = $1
    `;
        const [fightsResult, countResult] = await Promise.all([
            database_1.pool.query(fightsQuery, [id, limit, offset]),
            database_1.pool.query(countQuery, [id]),
        ]);
        const total = parseInt(countResult.rows[0].total);
        const totalPages = Math.ceil(total / limit);
        const response = {
            data: fightsResult.rows,
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages,
        };
        res.json({
            success: true,
            data: response,
            message: 'Combates del boxeador obtenidos exitosamente',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getBoxerFights = getBoxerFights;
