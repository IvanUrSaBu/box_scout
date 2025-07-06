"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getClubBoxers = exports.deleteClub = exports.updateClub = exports.createClub = exports.getClubById = exports.getClubs = void 0;
const database_1 = require("../config/database");
const getClubs = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, search = '', sort = 'created_at', order = 'desc' } = req.query;
        const offset = (page - 1) * limit;
        let whereClause = 'WHERE c.activo = true';
        const queryParams = [];
        let paramCount = 1;
        if (search) {
            whereClause += ` AND (c.nombre ILIKE $${paramCount} OR c.ubicacion ILIKE $${paramCount})`;
            queryParams.push(`%${search}%`);
            paramCount++;
        }
        // Query para obtener clubes con información del administrador y conteo de boxeadores
        const clubsQuery = `
      SELECT 
        c.id, c.nombre, c.ubicacion, c.descripcion, c.admin_user_id, c.activo, c.created_at, c.updated_at,
        u.nombre as admin_nombre, u.email as admin_email,
        COUNT(b.id) as boxeadores_count
      FROM clubs c
      LEFT JOIN users u ON c.admin_user_id = u.id
      LEFT JOIN boxers b ON c.id = b.club_id AND b.activo = true
      ${whereClause}
      GROUP BY c.id, u.nombre, u.email
      ORDER BY c.${sort} ${order}
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `;
        queryParams.push(limit, offset);
        // Query para contar total
        const countQuery = `SELECT COUNT(*) as total FROM clubs c ${whereClause}`;
        const countParams = search ? [`%${search}%`] : [];
        const [clubsResult, countResult] = await Promise.all([
            database_1.pool.query(clubsQuery, queryParams),
            database_1.pool.query(countQuery, countParams),
        ]);
        const total = parseInt(countResult.rows[0].total);
        const totalPages = Math.ceil(total / limit);
        // Transformar datos para incluir información del admin
        const clubs = clubsResult.rows.map(row => ({
            id: row.id,
            nombre: row.nombre,
            ubicacion: row.ubicacion,
            descripcion: row.descripcion,
            admin_user_id: row.admin_user_id,
            activo: row.activo,
            created_at: row.created_at,
            updated_at: row.updated_at,
            admin: {
                id: row.admin_user_id,
                nombre: row.admin_nombre,
                email: row.admin_email,
            },
            boxeadores_count: parseInt(row.boxeadores_count),
        }));
        const response = {
            data: clubs,
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages,
        };
        res.json({
            success: true,
            data: response,
            message: 'Clubes obtenidos exitosamente',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getClubs = getClubs;
const getClubById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const clubResult = await database_1.pool.query(`SELECT 
        c.id, c.nombre, c.ubicacion, c.descripcion, c.admin_user_id, c.activo, c.created_at, c.updated_at,
        u.nombre as admin_nombre, u.email as admin_email,
        COUNT(b.id) as boxeadores_count
      FROM clubs c
      LEFT JOIN users u ON c.admin_user_id = u.id
      LEFT JOIN boxers b ON c.id = b.club_id AND b.activo = true
      WHERE c.id = $1
      GROUP BY c.id, u.nombre, u.email`, [id]);
        if (clubResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Club no encontrado',
            });
        }
        const row = clubResult.rows[0];
        const club = {
            id: row.id,
            nombre: row.nombre,
            ubicacion: row.ubicacion,
            descripcion: row.descripcion,
            admin_user_id: row.admin_user_id,
            activo: row.activo,
            created_at: row.created_at,
            updated_at: row.updated_at,
            admin: {
                id: row.admin_user_id,
                nombre: row.admin_nombre,
                email: row.admin_email,
            },
            boxeadores_count: parseInt(row.boxeadores_count),
        };
        res.json({
            success: true,
            data: club,
            message: 'Club obtenido exitosamente',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getClubById = getClubById;
const createClub = async (req, res, next) => {
    try {
        const { nombre, ubicacion, descripcion } = req.body;
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no autenticado',
            });
        }
        // Verificar que el usuario no tenga ya un club (solo si es administrador de club)
        if (req.user.role === 'administrador_club') {
            const existingClub = await database_1.pool.query('SELECT id FROM clubs WHERE admin_user_id = $1 AND activo = true', [req.user.id]);
            if (existingClub.rows.length > 0) {
                return res.status(409).json({
                    success: false,
                    message: 'Ya eres administrador de un club',
                });
            }
        }
        // Para administradores generales, necesitamos especificar qué usuario será el admin
        let adminUserId = req.user.id;
        if (req.user.role === 'administrador_general' && req.body.admin_user_id) {
            // Verificar que el usuario especificado existe y es administrador de club
            const adminUser = await database_1.pool.query('SELECT id, role FROM users WHERE id = $1 AND role = $2 AND activo = true', [req.body.admin_user_id, 'administrador_club']);
            if (adminUser.rows.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'El usuario especificado no existe o no es administrador de club',
                });
            }
            adminUserId = req.body.admin_user_id;
        }
        const clubResult = await database_1.pool.query(`INSERT INTO clubs (nombre, ubicacion, descripcion, admin_user_id)
       VALUES ($1, $2, $3, $4)
       RETURNING id, nombre, ubicacion, descripcion, admin_user_id, activo, created_at, updated_at`, [nombre, ubicacion, descripcion, adminUserId]);
        const club = clubResult.rows[0];
        res.status(201).json({
            success: true,
            data: club,
            message: 'Club creado exitosamente',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createClub = createClub;
const updateClub = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { nombre, ubicacion, descripcion } = req.body;
        // Verificar que el club existe
        const existingClub = await database_1.pool.query('SELECT id, admin_user_id FROM clubs WHERE id = $1', [id]);
        if (existingClub.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Club no encontrado',
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
        if (ubicacion) {
            updateFields.push(`ubicacion = $${paramCount}`);
            updateValues.push(ubicacion);
            paramCount++;
        }
        if (descripcion !== undefined) {
            updateFields.push(`descripcion = $${paramCount}`);
            updateValues.push(descripcion || null);
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
      UPDATE clubs 
      SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $${paramCount} 
      RETURNING id, nombre, ubicacion, descripcion, admin_user_id, activo, created_at, updated_at
    `;
        const result = await database_1.pool.query(updateQuery, updateValues);
        const updatedClub = result.rows[0];
        res.json({
            success: true,
            data: updatedClub,
            message: 'Club actualizado exitosamente',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateClub = updateClub;
const deleteClub = async (req, res, next) => {
    try {
        const { id } = req.params;
        // Verificar que el club existe
        const existingClub = await database_1.pool.query('SELECT id FROM clubs WHERE id = $1', [id]);
        if (existingClub.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Club no encontrado',
            });
        }
        // En lugar de eliminar, desactivar el club
        await database_1.pool.query('UPDATE clubs SET activo = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1', [id]);
        res.json({
            success: true,
            message: 'Club desactivado exitosamente',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteClub = deleteClub;
const getClubBoxers = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;
        // Verificar que el club existe
        const clubExists = await database_1.pool.query('SELECT id FROM clubs WHERE id = $1', [id]);
        if (clubExists.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Club no encontrado',
            });
        }
        const boxersQuery = `
      SELECT 
        b.id, b.nombre, b.peso_categoria, b.fecha_nacimiento, 
        b.victorias, b.derrotas, b.empates, b.activo, b.created_at, b.updated_at,
        u.email, u.nombre as user_nombre
      FROM boxers b
      LEFT JOIN users u ON b.user_id = u.id
      WHERE b.club_id = $1 AND b.activo = true
      ORDER BY b.created_at DESC
      LIMIT $2 OFFSET $3
    `;
        const countQuery = 'SELECT COUNT(*) as total FROM boxers WHERE club_id = $1 AND activo = true';
        const [boxersResult, countResult] = await Promise.all([
            database_1.pool.query(boxersQuery, [id, limit, offset]),
            database_1.pool.query(countQuery, [id]),
        ]);
        const total = parseInt(countResult.rows[0].total);
        const totalPages = Math.ceil(total / limit);
        const response = {
            data: boxersResult.rows,
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages,
        };
        res.json({
            success: true,
            data: response,
            message: 'Boxeadores del club obtenidos exitosamente',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getClubBoxers = getClubBoxers;
