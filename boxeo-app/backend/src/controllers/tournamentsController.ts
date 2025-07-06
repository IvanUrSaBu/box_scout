import { Request, Response, NextFunction } from 'express';
import { pool } from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { PaginatedResponse, TournamentDTO, CreateTournament } from 'boxeo-shared';

export const getTournaments = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 10, search = '', sort = 'created_at', order = 'desc', estado } = req.query as any;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    const queryParams: any[] = [];
    let paramCount = 1;

    // Filtrar por estado si se proporciona
    if (estado) {
      whereClause += ` AND t.estado = $${paramCount}`;
      queryParams.push(estado);
      paramCount++;
    }

    // Solo mostrar torneos públicos a menos que sea administrador
    if (req.user?.role !== 'administrador_general') {
      if (req.user?.role === 'administrador_club') {
        // Administradores de club ven torneos públicos y los de su club
        const clubResult = await pool.query(
          'SELECT id FROM clubs WHERE admin_user_id = $1',
          [req.user.id]
        );
        
        if (clubResult.rows.length > 0) {
          whereClause += ` AND (t.es_publico = true OR t.organizador_club_id = $${paramCount})`;
          queryParams.push(clubResult.rows[0].id);
          paramCount++;
        } else {
          whereClause += ` AND t.es_publico = true`;
        }
      } else {
        whereClause += ` AND t.es_publico = true`;
      }
    }

    if (search) {
      whereClause += ` AND (t.nombre ILIKE $${paramCount} OR t.descripcion ILIKE $${paramCount})`;
      queryParams.push(`%${search}%`);
      paramCount++;
    }

    // Query para obtener torneos con información del club organizador
    const tournamentsQuery = `
      SELECT 
        t.id, t.nombre, t.descripcion, t.organizador_club_id, t.es_publico,
        t.fecha_inicio, t.fecha_fin, t.estado, t.ubicacion, t.created_at, t.updated_at,
        c.nombre as organizador_club_nombre, c.ubicacion as organizador_club_ubicacion,
        COUNT(f.id) as combates_count
      FROM tournaments t
      LEFT JOIN clubs c ON t.organizador_club_id = c.id
      LEFT JOIN fights f ON t.id = f.torneo_id
      ${whereClause}
      GROUP BY t.id, c.nombre, c.ubicacion
      ORDER BY t.${sort} ${order}
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `;
    queryParams.push(limit, offset);

    // Query para contar total
    const countQuery = `SELECT COUNT(*) as total FROM tournaments t ${whereClause}`;
    const countParams = queryParams.slice(0, -2); // Remover limit y offset

    const [tournamentsResult, countResult] = await Promise.all([
      pool.query(tournamentsQuery, queryParams),
      pool.query(countQuery, countParams),
    ]);

    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);

    // Transformar datos
    const tournaments: TournamentDTO[] = tournamentsResult.rows.map(row => ({
      id: row.id,
      nombre: row.nombre,
      descripcion: row.descripcion,
      organizador_club_id: row.organizador_club_id,
      es_publico: row.es_publico,
      fecha_inicio: row.fecha_inicio,
      fecha_fin: row.fecha_fin,
      estado: row.estado,
      ubicacion: row.ubicacion,
      created_at: row.created_at,
      updated_at: row.updated_at,
      organizador_club: row.organizador_club_id ? {
        id: row.organizador_club_id,
        nombre: row.organizador_club_nombre,
        ubicacion: row.organizador_club_ubicacion,
      } as any : undefined,
      combates_count: parseInt(row.combates_count),
    }));

    const response: PaginatedResponse<TournamentDTO> = {
      data: tournaments,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages,
    };

    res.json({
      success: true,
      data: response,
      message: 'Torneos obtenidos exitosamente',
    });
  } catch (error) {
    next(error);
  }
};

export const getTournamentById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const tournamentResult = await pool.query(
      `SELECT 
        t.id, t.nombre, t.descripcion, t.organizador_club_id, t.es_publico,
        t.fecha_inicio, t.fecha_fin, t.estado, t.ubicacion, t.created_at, t.updated_at,
        c.nombre as organizador_club_nombre, c.ubicacion as organizador_club_ubicacion,
        COUNT(f.id) as combates_count
      FROM tournaments t
      LEFT JOIN clubs c ON t.organizador_club_id = c.id
      LEFT JOIN fights f ON t.id = f.torneo_id
      WHERE t.id = $1
      GROUP BY t.id, c.nombre, c.ubicacion`,
      [id]
    );

    if (tournamentResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Torneo no encontrado',
      });
    }

    const row = tournamentResult.rows[0];

    // Verificar permisos de acceso
    if (!row.es_publico && req.user?.role !== 'administrador_general') {
      if (req.user?.role === 'administrador_club') {
        // Verificar si es el administrador del club organizador
        const clubResult = await pool.query(
          'SELECT id FROM clubs WHERE admin_user_id = $1 AND id = $2',
          [req.user.id, row.organizador_club_id]
        );

        if (clubResult.rows.length === 0) {
          return res.status(403).json({
            success: false,
            message: 'No tienes permisos para ver este torneo',
          });
        }
      } else {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para ver este torneo',
        });
      }
    }

    const tournament: TournamentDTO = {
      id: row.id,
      nombre: row.nombre,
      descripcion: row.descripcion,
      organizador_club_id: row.organizador_club_id,
      es_publico: row.es_publico,
      fecha_inicio: row.fecha_inicio,
      fecha_fin: row.fecha_fin,
      estado: row.estado,
      ubicacion: row.ubicacion,
      created_at: row.created_at,
      updated_at: row.updated_at,
      organizador_club: row.organizador_club_id ? {
        id: row.organizador_club_id,
        nombre: row.organizador_club_nombre,
        ubicacion: row.organizador_club_ubicacion,
      } as any : undefined,
      combates_count: parseInt(row.combates_count),
    };

    res.json({
      success: true,
      data: tournament,
      message: 'Torneo obtenido exitosamente',
    });
  } catch (error) {
    next(error);
  }
};

export const createTournament = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { nombre, descripcion, es_publico, fecha_inicio, fecha_fin, ubicacion }: CreateTournament = req.body;

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado',
      });
    }

    let organizadorClubId = null;

    // Si es administrador de club, usar su club como organizador
    if (req.user.role === 'administrador_club') {
      const clubResult = await pool.query(
        'SELECT id FROM clubs WHERE admin_user_id = $1 AND activo = true',
        [req.user.id]
      );

      if (clubResult.rows.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No tienes un club asignado para organizar torneos',
        });
      }

      organizadorClubId = clubResult.rows[0].id;
    }

    // Si es administrador general y especifica un club organizador
    if (req.user.role === 'administrador_general' && req.body.organizador_club_id) {
      const clubCheck = await pool.query(
        'SELECT id FROM clubs WHERE id = $1 AND activo = true',
        [req.body.organizador_club_id]
      );

      if (clubCheck.rows.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'El club organizador especificado no existe',
        });
      }

      organizadorClubId = req.body.organizador_club_id;
    }

    const tournamentResult = await pool.query(
      `INSERT INTO tournaments (nombre, descripcion, organizador_club_id, es_publico, fecha_inicio, fecha_fin, ubicacion)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, nombre, descripcion, organizador_club_id, es_publico, fecha_inicio, fecha_fin, 
                 estado, ubicacion, created_at, updated_at`,
      [nombre, descripcion, organizadorClubId, es_publico, fecha_inicio, fecha_fin, ubicacion]
    );

    const tournament = tournamentResult.rows[0];

    res.status(201).json({
      success: true,
      data: tournament,
      message: 'Torneo creado exitosamente',
    });
  } catch (error) {
    next(error);
  }
};

export const updateTournament = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, es_publico, fecha_inicio, fecha_fin, estado, ubicacion } = req.body;

    // Verificar que el torneo existe y permisos
    const existingTournament = await pool.query(
      'SELECT id, organizador_club_id FROM tournaments WHERE id = $1',
      [id]
    );

    if (existingTournament.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Torneo no encontrado',
      });
    }

    const tournament = existingTournament.rows[0];

    // Verificar permisos de modificación
    if (req.user?.role === 'administrador_club') {
      const clubResult = await pool.query(
        'SELECT id FROM clubs WHERE admin_user_id = $1 AND id = $2',
        [req.user.id, tournament.organizador_club_id]
      );

      if (clubResult.rows.length === 0) {
        return res.status(403).json({
          success: false,
          message: 'No puedes modificar este torneo',
        });
      }
    }

    const updateFields: string[] = [];
    const updateValues: any[] = [];
    let paramCount = 1;

    if (nombre) {
      updateFields.push(`nombre = $${paramCount}`);
      updateValues.push(nombre);
      paramCount++;
    }

    if (descripcion !== undefined) {
      updateFields.push(`descripcion = $${paramCount}`);
      updateValues.push(descripcion || null);
      paramCount++;
    }

    if (typeof es_publico === 'boolean') {
      updateFields.push(`es_publico = $${paramCount}`);
      updateValues.push(es_publico);
      paramCount++;
    }

    if (fecha_inicio) {
      updateFields.push(`fecha_inicio = $${paramCount}`);
      updateValues.push(fecha_inicio);
      paramCount++;
    }

    if (fecha_fin) {
      updateFields.push(`fecha_fin = $${paramCount}`);
      updateValues.push(fecha_fin);
      paramCount++;
    }

    if (estado) {
      updateFields.push(`estado = $${paramCount}`);
      updateValues.push(estado);
      paramCount++;
    }

    if (ubicacion !== undefined) {
      updateFields.push(`ubicacion = $${paramCount}`);
      updateValues.push(ubicacion || null);
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
      UPDATE tournaments 
      SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $${paramCount} 
      RETURNING id, nombre, descripcion, organizador_club_id, es_publico, fecha_inicio, fecha_fin,
                estado, ubicacion, created_at, updated_at
    `;

    const result = await pool.query(updateQuery, updateValues);
    const updatedTournament = result.rows[0];

    res.json({
      success: true,
      data: updatedTournament,
      message: 'Torneo actualizado exitosamente',
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTournament = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Verificar que el torneo existe
    const existingTournament = await pool.query(
      'SELECT id, organizador_club_id FROM tournaments WHERE id = $1',
      [id]
    );

    if (existingTournament.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Torneo no encontrado',
      });
    }

    // Cancelar el torneo en lugar de eliminarlo
    await pool.query(
      'UPDATE tournaments SET estado = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      ['cancelado', id]
    );

    res.json({
      success: true,
      message: 'Torneo cancelado exitosamente',
    });
  } catch (error) {
    next(error);
  }
};

export const getTournamentFights = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query as any;
    const offset = (page - 1) * limit;

    // Verificar que el torneo existe y permisos
    const tournamentResult = await pool.query(
      'SELECT id, es_publico, organizador_club_id FROM tournaments WHERE id = $1',
      [id]
    );

    if (tournamentResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Torneo no encontrado',
      });
    }

    const tournament = tournamentResult.rows[0];

    // Verificar permisos de acceso
    if (!tournament.es_publico && req.user?.role !== 'administrador_general') {
      if (req.user?.role === 'administrador_club') {
        const clubResult = await pool.query(
          'SELECT id FROM clubs WHERE admin_user_id = $1 AND id = $2',
          [req.user.id, tournament.organizador_club_id]
        );

        if (clubResult.rows.length === 0) {
          return res.status(403).json({
            success: false,
            message: 'No tienes permisos para ver los combates de este torneo',
          });
        }
      } else {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para ver los combates de este torneo',
        });
      }
    }

    const fightsQuery = `
      SELECT 
        f.id, f.boxeador1_id, f.boxeador2_id, f.peso_categoria, f.resultado,
        f.fecha_combate, f.ubicacion, f.notas, f.created_at, f.updated_at,
        b1.nombre as boxeador1_nombre,
        b2.nombre as boxeador2_nombre
      FROM fights f
      LEFT JOIN boxers b1 ON f.boxeador1_id = b1.id
      LEFT JOIN boxers b2 ON f.boxeador2_id = b2.id
      WHERE f.torneo_id = $1
      ORDER BY f.fecha_combate ASC
      LIMIT $2 OFFSET $3
    `;

    const countQuery = 'SELECT COUNT(*) as total FROM fights WHERE torneo_id = $1';

    const [fightsResult, countResult] = await Promise.all([
      pool.query(fightsQuery, [id, limit, offset]),
      pool.query(countQuery, [id]),
    ]);

    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);

    const response: PaginatedResponse<any> = {
      data: fightsResult.rows,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages,
    };

    res.json({
      success: true,
      data: response,
      message: 'Combates del torneo obtenidos exitosamente',
    });
  } catch (error) {
    next(error);
  }
};