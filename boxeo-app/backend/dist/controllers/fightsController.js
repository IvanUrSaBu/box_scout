"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFight = exports.updateFight = exports.createFight = exports.getFightById = exports.getFights = void 0;
const database_1 = require("../config/database");
const getFights = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, search = '', sort = 'fecha_combate', order = 'desc', torneo_id, boxeador_id, resultado } = req.query;
        const offset = (page - 1) * limit;
        let whereClause = 'WHERE 1=1';
        const queryParams = [];
        let paramCount = 1;
        if (torneo_id) {
            whereClause += ` AND f.torneo_id = $${paramCount}`;
            queryParams.push(torneo_id);
            paramCount++;
        }
        if (boxeador_id) {
            whereClause += ` AND (f.boxeador1_id = $${paramCount} OR f.boxeador2_id = $${paramCount})`;
            queryParams.push(boxeador_id);
            paramCount++;
        }
        if (resultado) {
            whereClause += ` AND f.resultado = $${paramCount}`;
            queryParams.push(resultado);
            paramCount++;
        }
        if (search) {
            whereClause += ` AND (b1.nombre ILIKE $${paramCount} OR b2.nombre ILIKE $${paramCount} OR t.nombre ILIKE $${paramCount})`;
            queryParams.push(`%${search}%`);
            paramCount++;
        }
        // Query para obtener combates con información de boxeadores y torneo
        const fightsQuery = `
      SELECT 
        f.id, f.torneo_id, f.boxeador1_id, f.boxeador2_id, f.peso_categoria,
        f.resultado, f.fecha_combate, f.ubicacion, f.notas, f.created_at, f.updated_at,
        b1.nombre as boxeador1_nombre, b1.victorias as boxeador1_victorias, b1.derrotas as boxeador1_derrotas,
        b2.nombre as boxeador2_nombre, b2.victorias as boxeador2_victorias, b2.derrotas as boxeador2_derrotas,
        t.nombre as torneo_nombre, t.es_publico as torneo_publico
      FROM fights f
      LEFT JOIN boxers b1 ON f.boxeador1_id = b1.id
      LEFT JOIN boxers b2 ON f.boxeador2_id = b2.id
      LEFT JOIN tournaments t ON f.torneo_id = t.id
      ${whereClause}
      ORDER BY f.${sort} ${order}
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `;
        queryParams.push(limit, offset);
        // Query para contar total
        const countQuery = `
      SELECT COUNT(*) as total 
      FROM fights f
      LEFT JOIN boxers b1 ON f.boxeador1_id = b1.id
      LEFT JOIN boxers b2 ON f.boxeador2_id = b2.id
      LEFT JOIN tournaments t ON f.torneo_id = t.id
      ${whereClause}
    `;
        const countParams = queryParams.slice(0, -2); // Remover limit y offset
        const [fightsResult, countResult] = await Promise.all([
            database_1.pool.query(fightsQuery, queryParams),
            database_1.pool.query(countQuery, countParams),
        ]);
        const total = parseInt(countResult.rows[0].total);
        const totalPages = Math.ceil(total / limit);
        // Filtrar combates privados según permisos
        const filteredFights = fightsResult.rows.filter(row => {
            // Si no hay torneo o es público, mostrar
            if (!row.torneo_id || row.torneo_publico)
                return true;
            // Si es administrador general, mostrar todos
            if (req.user?.role === 'administrador_general')
                return true;
            // Para otros casos, necesitaríamos verificar permisos específicos
            // Por simplicidad, no mostramos combates de torneos privados a usuarios normales
            return false;
        });
        // Transformar datos
        const fights = filteredFights.map(row => ({
            id: row.id,
            torneo_id: row.torneo_id,
            boxeador1_id: row.boxeador1_id,
            boxeador2_id: row.boxeador2_id,
            peso_categoria: row.peso_categoria,
            resultado: row.resultado,
            fecha_combate: row.fecha_combate,
            ubicacion: row.ubicacion,
            notas: row.notas,
            created_at: row.created_at,
            updated_at: row.updated_at,
            boxeador1: {
                id: row.boxeador1_id,
                nombre: row.boxeador1_nombre,
                victorias: row.boxeador1_victorias,
                derrotas: row.boxeador1_derrotas,
            },
            boxeador2: {
                id: row.boxeador2_id,
                nombre: row.boxeador2_nombre,
                victorias: row.boxeador2_victorias,
                derrotas: row.boxeador2_derrotas,
            },
            torneo: row.torneo_id ? {
                id: row.torneo_id,
                nombre: row.torneo_nombre,
                es_publico: row.torneo_publico,
            } : undefined,
        }));
        const response = {
            data: fights,
            total: filteredFights.length,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(filteredFights.length / limit),
        };
        res.json({
            success: true,
            data: response,
            message: 'Combates obtenidos exitosamente',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getFights = getFights;
const getFightById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const fightResult = await database_1.pool.query(`SELECT 
        f.id, f.torneo_id, f.boxeador1_id, f.boxeador2_id, f.peso_categoria,
        f.resultado, f.fecha_combate, f.ubicacion, f.notas, f.created_at, f.updated_at,
        b1.nombre as boxeador1_nombre, b1.victorias as boxeador1_victorias, b1.derrotas as boxeador1_derrotas,
        b2.nombre as boxeador2_nombre, b2.victorias as boxeador2_victorias, b2.derrotas as boxeador2_derrotas,
        t.nombre as torneo_nombre, t.es_publico as torneo_publico, t.organizador_club_id
      FROM fights f
      LEFT JOIN boxers b1 ON f.boxeador1_id = b1.id
      LEFT JOIN boxers b2 ON f.boxeador2_id = b2.id
      LEFT JOIN tournaments t ON f.torneo_id = t.id
      WHERE f.id = $1`, [id]);
        if (fightResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Combate no encontrado',
            });
        }
        const row = fightResult.rows[0];
        // Verificar permisos de acceso para combates de torneos privados
        if (row.torneo_id && !row.torneo_publico && req.user?.role !== 'administrador_general') {
            if (req.user?.role === 'administrador_club') {
                const clubResult = await database_1.pool.query('SELECT id FROM clubs WHERE admin_user_id = $1 AND id = $2', [req.user.id, row.organizador_club_id]);
                if (clubResult.rows.length === 0) {
                    return res.status(403).json({
                        success: false,
                        message: 'No tienes permisos para ver este combate',
                    });
                }
            }
            else {
                return res.status(403).json({
                    success: false,
                    message: 'No tienes permisos para ver este combate',
                });
            }
        }
        const fight = {
            id: row.id,
            torneo_id: row.torneo_id,
            boxeador1_id: row.boxeador1_id,
            boxeador2_id: row.boxeador2_id,
            peso_categoria: row.peso_categoria,
            resultado: row.resultado,
            fecha_combate: row.fecha_combate,
            ubicacion: row.ubicacion,
            notas: row.notas,
            created_at: row.created_at,
            updated_at: row.updated_at,
            boxeador1: {
                id: row.boxeador1_id,
                nombre: row.boxeador1_nombre,
                victorias: row.boxeador1_victorias,
                derrotas: row.boxeador1_derrotas,
            },
            boxeador2: {
                id: row.boxeador2_id,
                nombre: row.boxeador2_nombre,
                victorias: row.boxeador2_victorias,
                derrotas: row.boxeador2_derrotas,
            },
            torneo: row.torneo_id ? {
                id: row.torneo_id,
                nombre: row.torneo_nombre,
                es_publico: row.torneo_publico,
            } : undefined,
        };
        res.json({
            success: true,
            data: fight,
            message: 'Combate obtenido exitosamente',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getFightById = getFightById;
const createFight = async (req, res, next) => {
    try {
        const { torneo_id, boxeador1_id, boxeador2_id, peso_categoria, fecha_combate, ubicacion, notas } = req.body;
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no autenticado',
            });
        }
        // Verificar que los boxeadores existen y están activos
        const boxersCheck = await database_1.pool.query('SELECT id, nombre, activo FROM boxers WHERE id IN ($1, $2)', [boxeador1_id, boxeador2_id]);
        if (boxersCheck.rows.length !== 2) {
            return res.status(400).json({
                success: false,
                message: 'Uno o ambos boxeadores no existen',
            });
        }
        const inactiveBoxers = boxersCheck.rows.filter(boxer => !boxer.activo);
        if (inactiveBoxers.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Uno o ambos boxeadores están inactivos',
            });
        }
        // Verificar torneo si se especifica
        if (torneo_id) {
            const tournamentCheck = await database_1.pool.query('SELECT id, estado, organizador_club_id FROM tournaments WHERE id = $1', [torneo_id]);
            if (tournamentCheck.rows.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'El torneo especificado no existe',
                });
            }
            const tournament = tournamentCheck.rows[0];
            // Verificar permisos para agregar combates al torneo
            if (req.user.role === 'administrador_club') {
                const clubResult = await database_1.pool.query('SELECT id FROM clubs WHERE admin_user_id = $1 AND id = $2', [req.user.id, tournament.organizador_club_id]);
                if (clubResult.rows.length === 0) {
                    return res.status(403).json({
                        success: false,
                        message: 'No puedes agregar combates a este torneo',
                    });
                }
            }
            // No permitir agregar combates a torneos completados o cancelados
            if (tournament.estado === 'completado' || tournament.estado === 'cancelado') {
                return res.status(400).json({
                    success: false,
                    message: 'No se pueden agregar combates a un torneo completado o cancelado',
                });
            }
        }
        const fightResult = await database_1.pool.query(`INSERT INTO fights (torneo_id, boxeador1_id, boxeador2_id, peso_categoria, fecha_combate, ubicacion, notas)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, torneo_id, boxeador1_id, boxeador2_id, peso_categoria, resultado,
                 fecha_combate, ubicacion, notas, created_at, updated_at`, [torneo_id || null, boxeador1_id, boxeador2_id, peso_categoria, fecha_combate, ubicacion, notas]);
        const fight = fightResult.rows[0];
        res.status(201).json({
            success: true,
            data: fight,
            message: 'Combate creado exitosamente',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createFight = createFight;
const updateFight = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { resultado, fecha_combate, ubicacion, notas } = req.body;
        // Verificar que el combate existe
        const existingFight = await database_1.pool.query(`SELECT f.id, f.torneo_id, t.organizador_club_id, t.estado 
       FROM fights f 
       LEFT JOIN tournaments t ON f.torneo_id = t.id 
       WHERE f.id = $1`, [id]);
        if (existingFight.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Combate no encontrado',
            });
        }
        const fight = existingFight.rows[0];
        // Verificar permisos de modificación
        if (req.user?.role === 'administrador_club' && fight.torneo_id) {
            const clubResult = await database_1.pool.query('SELECT id FROM clubs WHERE admin_user_id = $1 AND id = $2', [req.user.id, fight.organizador_club_id]);
            if (clubResult.rows.length === 0) {
                return res.status(403).json({
                    success: false,
                    message: 'No puedes modificar este combate',
                });
            }
        }
        // No permitir modificar combates de torneos completados
        if (fight.estado === 'completado') {
            return res.status(400).json({
                success: false,
                message: 'No se pueden modificar combates de torneos completados',
            });
        }
        const updateFields = [];
        const updateValues = [];
        let paramCount = 1;
        if (resultado) {
            updateFields.push(`resultado = $${paramCount}`);
            updateValues.push(resultado);
            paramCount++;
        }
        if (fecha_combate) {
            updateFields.push(`fecha_combate = $${paramCount}`);
            updateValues.push(fecha_combate);
            paramCount++;
        }
        if (ubicacion !== undefined) {
            updateFields.push(`ubicacion = $${paramCount}`);
            updateValues.push(ubicacion || null);
            paramCount++;
        }
        if (notas !== undefined) {
            updateFields.push(`notas = $${paramCount}`);
            updateValues.push(notas || null);
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
      UPDATE fights 
      SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $${paramCount} 
      RETURNING id, torneo_id, boxeador1_id, boxeador2_id, peso_categoria, resultado,
                fecha_combate, ubicacion, notas, created_at, updated_at
    `;
        const result = await database_1.pool.query(updateQuery, updateValues);
        const updatedFight = result.rows[0];
        res.json({
            success: true,
            data: updatedFight,
            message: 'Combate actualizado exitosamente',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateFight = updateFight;
const deleteFight = async (req, res, next) => {
    try {
        const { id } = req.params;
        // Verificar que el combate existe y permisos
        const existingFight = await database_1.pool.query(`SELECT f.id, f.torneo_id, t.organizador_club_id, t.estado 
       FROM fights f 
       LEFT JOIN tournaments t ON f.torneo_id = t.id 
       WHERE f.id = $1`, [id]);
        if (existingFight.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Combate no encontrado',
            });
        }
        const fight = existingFight.rows[0];
        // Verificar permisos de eliminación
        if (req.user?.role === 'administrador_club' && fight.torneo_id) {
            const clubResult = await database_1.pool.query('SELECT id FROM clubs WHERE admin_user_id = $1 AND id = $2', [req.user.id, fight.organizador_club_id]);
            if (clubResult.rows.length === 0) {
                return res.status(403).json({
                    success: false,
                    message: 'No puedes eliminar este combate',
                });
            }
        }
        // No permitir eliminar combates de torneos completados
        if (fight.estado === 'completado') {
            return res.status(400).json({
                success: false,
                message: 'No se pueden eliminar combates de torneos completados',
            });
        }
        await database_1.pool.query('DELETE FROM fights WHERE id = $1', [id]);
        res.json({
            success: true,
            message: 'Combate eliminado exitosamente',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteFight = deleteFight;
