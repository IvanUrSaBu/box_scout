import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { pool } from '../config/database.js';
import { UserRole, AuthenticationError, AuthorizationError } from 'boxeo-shared';

interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('No token provided');
    }

    const token = authHeader.substring(7);
    const secret = process.env.JWT_SECRET;
    
    if (!secret) {
      throw new Error('JWT_SECRET not configured');
    }

    const decoded = jwt.verify(token, secret) as JwtPayload;
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token inválido' 
      });
    }
    
    return res.status(401).json({ 
      success: false, 
      message: error instanceof Error ? error.message : 'Authentication failed' 
    });
  }
}

export function authorize(roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Usuario no autenticado' 
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'No tienes permisos para realizar esta acción' 
      });
    }

    next();
  };
}

export function canModifyClub() {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ 
          success: false, 
          message: 'Usuario no autenticado' 
        });
      }

      // Admin general puede modificar cualquier club
      if (req.user.role === UserRole.ADMINISTRADOR_GENERAL) {
        return next();
      }

      // Admin de club solo puede modificar su propio club
      if (req.user.role === UserRole.ADMINISTRADOR_CLUB) {
        const clubId = req.params.id || req.body.club_id;
        
        if (!clubId) {
          return res.status(400).json({ 
            success: false, 
            message: 'ID del club requerido' 
          });
        }

        const result = await pool.query(
          'SELECT id FROM clubs WHERE id = $1 AND admin_user_id = $2',
          [clubId, req.user.userId]
        );

        if (result.rows.length === 0) {
          return res.status(403).json({ 
            success: false, 
            message: 'No tienes permisos para modificar este club' 
          });
        }
      }

      next();
    } catch (error) {
      return res.status(500).json({ 
        success: false, 
        message: 'Error verificando permisos' 
      });
    }
  };
}

export function canModifyBoxer() {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ 
          success: false, 
          message: 'Usuario no autenticado' 
        });
      }

      // Admin general puede modificar cualquier boxeador
      if (req.user.role === UserRole.ADMINISTRADOR_GENERAL) {
        return next();
      }

      const boxerId = req.params.id || req.body.boxer_id;
      
      if (!boxerId) {
        return res.status(400).json({ 
          success: false, 
          message: 'ID del boxeador requerido' 
        });
      }

      // Boxeador solo puede modificar su propio perfil
      if (req.user.role === UserRole.BOXEADOR) {
        const result = await pool.query(
          'SELECT id FROM boxers WHERE id = $1 AND user_id = $2',
          [boxerId, req.user.userId]
        );

        if (result.rows.length === 0) {
          return res.status(403).json({ 
            success: false, 
            message: 'Solo puedes modificar tu propio perfil' 
          });
        }
      }

      // Admin de club puede modificar boxeadores de su club
      if (req.user.role === UserRole.ADMINISTRADOR_CLUB) {
        const result = await pool.query(`
          SELECT b.id 
          FROM boxers b 
          JOIN clubs c ON b.club_id = c.id 
          WHERE b.id = $1 AND c.admin_user_id = $2
        `, [boxerId, req.user.userId]);

        if (result.rows.length === 0) {
          return res.status(403).json({ 
            success: false, 
            message: 'Solo puedes modificar boxeadores de tu club' 
          });
        }
      }

      next();
    } catch (error) {
      return res.status(500).json({ 
        success: false, 
        message: 'Error verificando permisos' 
      });
    }
  };
}