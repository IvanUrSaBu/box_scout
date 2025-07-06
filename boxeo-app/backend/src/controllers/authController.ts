import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../config/database.js';
import { 
  UserRole, 
  LoginRequest, 
  LoginResponse, 
  RegisterRequest,
  AuthenticationError,
  NotFoundError 
} from 'boxeo-shared';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export async function login(req: Request, res: Response) {
  try {
    const { email, password }: LoginRequest = req.body;

    // Buscar usuario
    const userResult = await pool.query(
      'SELECT id, email, password_hash, role, nombre, activo FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (userResult.rows.length === 0) {
      throw new AuthenticationError('Credenciales inválidas');
    }

    const user = userResult.rows[0];

    if (!user.activo) {
      throw new AuthenticationError('Cuenta desactivada');
    }

    // Verificar contraseña
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      throw new AuthenticationError('Credenciales inválidas');
    }

    // Generar token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    const response: LoginResponse = {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        nombre: user.nombre,
        activo: user.activo
      },
      token,
      expires_in: 7 * 24 * 60 * 60 // 7 días en segundos
    };

    res.json({
      success: true,
      data: response,
      message: 'Inicio de sesión exitoso'
    });

  } catch (error) {
    throw error;
  }
}

export async function register(req: Request, res: Response) {
  try {
    const { email, password, nombre, role = UserRole.BOXEADOR }: RegisterRequest = req.body;

    // Verificar si el email ya existe
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'El email ya está registrado'
      });
    }

    // Hash de la contraseña
    const passwordHash = await bcrypt.hash(password, 12);

    // Crear usuario
    const userResult = await pool.query(`
      INSERT INTO users (email, password_hash, role, nombre)
      VALUES ($1, $2, $3, $4)
      RETURNING id, email, role, nombre, activo
    `, [email.toLowerCase(), passwordHash, role, nombre]);

    const newUser = userResult.rows[0];

    // Generar token
    const token = jwt.sign(
      {
        userId: newUser.id,
        email: newUser.email,
        role: newUser.role
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    const response: LoginResponse = {
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        nombre: newUser.nombre,
        activo: newUser.activo
      },
      token,
      expires_in: 7 * 24 * 60 * 60
    };

    res.status(201).json({
      success: true,
      data: response,
      message: 'Usuario registrado exitosamente'
    });

  } catch (error) {
    throw error;
  }
}

export async function getProfile(req: Request, res: Response) {
  try {
    if (!req.user) {
      throw new AuthenticationError('Usuario no autenticado');
    }

    const userResult = await pool.query(
      'SELECT id, email, role, nombre, activo, created_at FROM users WHERE id = $1',
      [req.user.userId]
    );

    if (userResult.rows.length === 0) {
      throw new NotFoundError('Usuario');
    }

    const user = userResult.rows[0];

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        role: user.role,
        nombre: user.nombre,
        activo: user.activo,
        created_at: user.created_at
      }
    });

  } catch (error) {
    throw error;
  }
}

export async function updateProfile(req: Request, res: Response) {
  try {
    if (!req.user) {
      throw new AuthenticationError('Usuario no autenticado');
    }

    const { nombre } = req.body;
    
    const userResult = await pool.query(`
      UPDATE users 
      SET nombre = COALESCE($1, nombre)
      WHERE id = $2
      RETURNING id, email, role, nombre, activo
    `, [nombre, req.user.userId]);

    if (userResult.rows.length === 0) {
      throw new NotFoundError('Usuario');
    }

    const updatedUser = userResult.rows[0];

    res.json({
      success: true,
      data: {
        id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
        nombre: updatedUser.nombre,
        activo: updatedUser.activo
      },
      message: 'Perfil actualizado exitosamente'
    });

  } catch (error) {
    throw error;
  }
}

export async function changePassword(req: Request, res: Response) {
  try {
    if (!req.user) {
      throw new AuthenticationError('Usuario no autenticado');
    }

    const { currentPassword, newPassword } = req.body;

    // Obtener contraseña actual
    const userResult = await pool.query(
      'SELECT password_hash FROM users WHERE id = $1',
      [req.user.userId]
    );

    if (userResult.rows.length === 0) {
      throw new NotFoundError('Usuario');
    }

    // Verificar contraseña actual
    const validPassword = await bcrypt.compare(currentPassword, userResult.rows[0].password_hash);
    if (!validPassword) {
      throw new AuthenticationError('Contraseña actual incorrecta');
    }

    // Hash de la nueva contraseña
    const newPasswordHash = await bcrypt.hash(newPassword, 12);

    // Actualizar contraseña
    await pool.query(
      'UPDATE users SET password_hash = $1 WHERE id = $2',
      [newPasswordHash, req.user.userId]
    );

    res.json({
      success: true,
      message: 'Contraseña actualizada exitosamente'
    });

  } catch (error) {
    throw error;
  }
}