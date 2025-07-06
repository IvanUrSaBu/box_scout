import Joi from 'joi';
import { UserRole, WeightClass, FightResult, TournamentStatus } from 'boxeo-shared';

// Auth schemas
export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'El email debe tener un formato válido',
    'any.required': 'El email es requerido'
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'La contraseña debe tener al menos 6 caracteres',
    'any.required': 'La contraseña es requerida'
  })
});

export const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  nombre: Joi.string().min(2).max(255).required(),
  role: Joi.string().valid(...Object.values(UserRole)).optional()
});

// Club schemas  
export const createClubSchema = Joi.object({
  nombre: Joi.string().min(2).max(255).required().messages({
    'string.min': 'El nombre debe tener al menos 2 caracteres',
    'string.max': 'El nombre no puede exceder 255 caracteres',
    'any.required': 'El nombre es requerido'
  }),
  ubicacion: Joi.string().min(2).max(255).required().messages({
    'string.min': 'La ubicación debe tener al menos 2 caracteres',
    'string.max': 'La ubicación no puede exceder 255 caracteres',
    'any.required': 'La ubicación es requerida'
  }),
  descripcion: Joi.string().max(1000).optional().allow('').messages({
    'string.max': 'La descripción no puede exceder 1000 caracteres'
  })
});

export const updateClubSchema = Joi.object({
  nombre: Joi.string().min(2).max(255).optional(),
  ubicacion: Joi.string().min(2).max(255).optional(),
  descripcion: Joi.string().max(1000).optional().allow(''),
  activo: Joi.boolean().optional()
});

// Boxer schemas
export const createBoxerSchema = Joi.object({
  nombre: Joi.string().min(2).max(255).required(),
  club_id: Joi.string().uuid().optional().allow(null),
  fecha_nacimiento: Joi.date().max('now').required().messages({
    'date.max': 'La fecha de nacimiento no puede ser en el futuro',
    'any.required': 'La fecha de nacimiento es requerida'
  }),
  peso_categoria: Joi.string().valid(...Object.values(WeightClass)).required(),
  altura: Joi.number().integer().min(120).max(220).optional().messages({
    'number.min': 'La altura debe ser al menos 120 cm',
    'number.max': 'La altura no puede exceder 220 cm'
  }),
  alcance: Joi.number().integer().min(120).max(250).optional().messages({
    'number.min': 'El alcance debe ser al menos 120 cm',
    'number.max': 'El alcance no puede exceder 250 cm'
  })
});

export const updateBoxerSchema = Joi.object({
  nombre: Joi.string().min(2).max(255).optional(),
  club_id: Joi.string().uuid().optional().allow(null),
  fecha_nacimiento: Joi.date().max('now').optional(),
  peso_categoria: Joi.string().valid(...Object.values(WeightClass)).optional(),
  altura: Joi.number().integer().min(120).max(220).optional(),
  alcance: Joi.number().integer().min(120).max(250).optional(),
  activo: Joi.boolean().optional()
});

// Tournament schemas
export const createTournamentSchema = Joi.object({
  nombre: Joi.string().min(2).max(255).required(),
  descripcion: Joi.string().max(1000).optional().allow(''),
  fecha_inicio: Joi.date().min('now').required().messages({
    'date.min': 'La fecha de inicio debe ser en el futuro',
    'any.required': 'La fecha de inicio es requerida'
  }),
  fecha_fin: Joi.date().min(Joi.ref('fecha_inicio')).required().messages({
    'date.min': 'La fecha de fin debe ser posterior a la fecha de inicio',
    'any.required': 'La fecha de fin es requerida'
  }),
  ubicacion: Joi.string().max(255).optional().allow(''),
  publico: Joi.boolean().optional().default(true),
  max_participantes: Joi.number().integer().min(2).max(1000).optional().messages({
    'number.min': 'Debe haber al menos 2 participantes',
    'number.max': 'No puede haber más de 1000 participantes'
  })
});

export const updateTournamentSchema = Joi.object({
  nombre: Joi.string().min(2).max(255).optional(),
  descripcion: Joi.string().max(1000).optional().allow(''),
  fecha_inicio: Joi.date().optional(),
  fecha_fin: Joi.date().min(Joi.ref('fecha_inicio')).optional(),
  ubicacion: Joi.string().max(255).optional().allow(''),
  estado: Joi.string().valid(...Object.values(TournamentStatus)).optional(),
  publico: Joi.boolean().optional(),
  max_participantes: Joi.number().integer().min(2).max(1000).optional()
});

// Fight schemas
export const createFightSchema = Joi.object({
  tournament_id: Joi.string().uuid().optional().allow(null),
  boxer1_id: Joi.string().uuid().required(),
  boxer2_id: Joi.string().uuid().required().invalid(Joi.ref('boxer1_id')).messages({
    'any.invalid': 'Los boxeadores deben ser diferentes'
  }),
  fecha: Joi.date().required(),
  ubicacion: Joi.string().max(255).optional().allow(''),
  peso_categoria: Joi.string().valid(...Object.values(WeightClass)).required()
});

export const updateFightSchema = Joi.object({
  fecha: Joi.date().optional(),
  ubicacion: Joi.string().max(255).optional().allow(''),
  peso_categoria: Joi.string().valid(...Object.values(WeightClass)).optional(),
  resultado: Joi.string().valid(...Object.values(FightResult)).optional(),
  ganador_id: Joi.string().uuid().optional().allow(null),
  notas: Joi.string().max(1000).optional().allow('')
});

// Pagination schema
export const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).optional().default(1),
  limit: Joi.number().integer().min(1).max(100).optional().default(20),
  sortBy: Joi.string().optional(),
  sortOrder: Joi.string().valid('asc', 'desc').optional().default('asc')
});