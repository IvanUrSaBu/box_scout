import { Request, Response, NextFunction } from 'express';
import { ValidationError, AuthenticationError, AuthorizationError, NotFoundError } from 'boxeo-shared';

export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error('Error:', error);

  // Joi validation errors
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Datos de entrada inválidos',
      errors: error.message
    });
  }

  // Custom validation errors
  if (error instanceof ValidationError) {
    return res.status(400).json({
      success: false,
      message: error.message,
      errors: error.errors
    });
  }

  // Authentication errors
  if (error instanceof AuthenticationError) {
    return res.status(401).json({
      success: false,
      message: error.message
    });
  }

  // Authorization errors
  if (error instanceof AuthorizationError) {
    return res.status(403).json({
      success: false,
      message: error.message
    });
  }

  // Not found errors
  if (error instanceof NotFoundError) {
    return res.status(404).json({
      success: false,
      message: error.message
    });
  }

  // PostgreSQL errors
  if (error.name === 'DatabaseError' || (error as any).code) {
    const pgError = error as any;
    
    switch (pgError.code) {
      case '23505': // unique_violation
        return res.status(409).json({
          success: false,
          message: 'Ya existe un registro con estos datos',
          error: 'Duplicate entry'
        });
      
      case '23503': // foreign_key_violation
        return res.status(400).json({
          success: false,
          message: 'Referencia inválida a otro registro',
          error: 'Foreign key violation'
        });
      
      case '23514': // check_violation
        return res.status(400).json({
          success: false,
          message: 'Los datos no cumplen con las restricciones',
          error: 'Check constraint violation'
        });
        
      case '42P01': // undefined_table
        return res.status(500).json({
          success: false,
          message: 'Error de configuración de la base de datos',
          error: 'Table not found'
        });
        
      default:
        console.error('PostgreSQL Error:', pgError);
        return res.status(500).json({
          success: false,
          message: 'Error en la base de datos',
          error: 'Database error'
        });
    }
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Token inválido'
    });
  }

  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expirado'
    });
  }

  // Default server error
  return res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && {
      error: error.message,
      stack: error.stack
    })
  });
}

export function notFound(req: Request, res: Response) {
  res.status(404).json({
    success: false,
    message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`
  });
}