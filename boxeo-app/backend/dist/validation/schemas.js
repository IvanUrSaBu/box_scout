"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.paginationSchema = exports.updateFightSchema = exports.createFightSchema = exports.updateTournamentSchema = exports.createTournamentSchema = exports.updateBoxerSchema = exports.createBoxerSchema = exports.updateClubSchema = exports.createClubSchema = exports.registerSchema = exports.loginSchema = void 0;
const joi_1 = __importDefault(require("joi"));
// Esquemas de autenticación
exports.loginSchema = joi_1.default.object({
    email: joi_1.default.string().email().required().messages({
        'string.email': 'El email debe tener un formato válido',
        'any.required': 'El email es requerido',
    }),
    password: joi_1.default.string().min(6).required().messages({
        'string.min': 'La contraseña debe tener al menos 6 caracteres',
        'any.required': 'La contraseña es requerida',
    }),
});
exports.registerSchema = joi_1.default.object({
    email: joi_1.default.string().email().required().messages({
        'string.email': 'El email debe tener un formato válido',
        'any.required': 'El email es requerido',
    }),
    password: joi_1.default.string().min(6).required().messages({
        'string.min': 'La contraseña debe tener al menos 6 caracteres',
        'any.required': 'La contraseña es requerida',
    }),
    nombre: joi_1.default.string().min(2).max(255).required().messages({
        'string.min': 'El nombre debe tener al menos 2 caracteres',
        'string.max': 'El nombre no puede exceder 255 caracteres',
        'any.required': 'El nombre es requerido',
    }),
    role: joi_1.default.string().valid('administrador_general', 'administrador_club', 'boxeador').required().messages({
        'any.only': 'El rol debe ser administrador_general, administrador_club o boxeador',
        'any.required': 'El rol es requerido',
    }),
});
// Esquemas de club
exports.createClubSchema = joi_1.default.object({
    nombre: joi_1.default.string().min(2).max(255).required().messages({
        'string.min': 'El nombre del club debe tener al menos 2 caracteres',
        'string.max': 'El nombre del club no puede exceder 255 caracteres',
        'any.required': 'El nombre del club es requerido',
    }),
    ubicacion: joi_1.default.string().min(2).max(255).required().messages({
        'string.min': 'La ubicación debe tener al menos 2 caracteres',
        'string.max': 'La ubicación no puede exceder 255 caracteres',
        'any.required': 'La ubicación es requerida',
    }),
    descripcion: joi_1.default.string().max(1000).optional().messages({
        'string.max': 'La descripción no puede exceder 1000 caracteres',
    }),
});
exports.updateClubSchema = joi_1.default.object({
    nombre: joi_1.default.string().min(2).max(255).optional().messages({
        'string.min': 'El nombre del club debe tener al menos 2 caracteres',
        'string.max': 'El nombre del club no puede exceder 255 caracteres',
    }),
    ubicacion: joi_1.default.string().min(2).max(255).optional().messages({
        'string.min': 'La ubicación debe tener al menos 2 caracteres',
        'string.max': 'La ubicación no puede exceder 255 caracteres',
    }),
    descripcion: joi_1.default.string().max(1000).optional().allow('').messages({
        'string.max': 'La descripción no puede exceder 1000 caracteres',
    }),
});
// Esquemas de boxeador
exports.createBoxerSchema = joi_1.default.object({
    nombre: joi_1.default.string().min(2).max(255).required().messages({
        'string.min': 'El nombre del boxeador debe tener al menos 2 caracteres',
        'string.max': 'El nombre del boxeador no puede exceder 255 caracteres',
        'any.required': 'El nombre del boxeador es requerido',
    }),
    peso_categoria: joi_1.default.string().valid('peso_mosca', 'peso_gallo', 'peso_pluma', 'peso_ligero', 'peso_super_ligero', 'peso_welter', 'peso_super_welter', 'peso_mediano', 'peso_super_mediano', 'peso_pesado').required().messages({
        'any.only': 'La categoría de peso no es válida',
        'any.required': 'La categoría de peso es requerida',
    }),
    fecha_nacimiento: joi_1.default.date().max('now').required().messages({
        'date.max': 'La fecha de nacimiento no puede ser en el futuro',
        'any.required': 'La fecha de nacimiento es requerida',
    }),
    club_id: joi_1.default.string().uuid().optional().messages({
        'string.uuid': 'El ID del club debe ser un UUID válido',
    }),
});
exports.updateBoxerSchema = joi_1.default.object({
    nombre: joi_1.default.string().min(2).max(255).optional().messages({
        'string.min': 'El nombre del boxeador debe tener al menos 2 caracteres',
        'string.max': 'El nombre del boxeador no puede exceder 255 caracteres',
    }),
    peso_categoria: joi_1.default.string().valid('peso_mosca', 'peso_gallo', 'peso_pluma', 'peso_ligero', 'peso_super_ligero', 'peso_welter', 'peso_super_welter', 'peso_mediano', 'peso_super_mediano', 'peso_pesado').optional().messages({
        'any.only': 'La categoría de peso no es válida',
    }),
    fecha_nacimiento: joi_1.default.date().max('now').optional().messages({
        'date.max': 'La fecha de nacimiento no puede ser en el futuro',
    }),
    club_id: joi_1.default.string().uuid().optional().allow(null).messages({
        'string.uuid': 'El ID del club debe ser un UUID válido',
    }),
    activo: joi_1.default.boolean().optional(),
});
// Esquemas de torneo
exports.createTournamentSchema = joi_1.default.object({
    nombre: joi_1.default.string().min(2).max(255).required().messages({
        'string.min': 'El nombre del torneo debe tener al menos 2 caracteres',
        'string.max': 'El nombre del torneo no puede exceder 255 caracteres',
        'any.required': 'El nombre del torneo es requerido',
    }),
    descripcion: joi_1.default.string().max(1000).optional().messages({
        'string.max': 'La descripción no puede exceder 1000 caracteres',
    }),
    es_publico: joi_1.default.boolean().required().messages({
        'any.required': 'Debe especificar si el torneo es público',
    }),
    fecha_inicio: joi_1.default.date().min('now').required().messages({
        'date.min': 'La fecha de inicio no puede ser en el pasado',
        'any.required': 'La fecha de inicio es requerida',
    }),
    fecha_fin: joi_1.default.date().min(joi_1.default.ref('fecha_inicio')).required().messages({
        'date.min': 'La fecha de fin debe ser posterior a la fecha de inicio',
        'any.required': 'La fecha de fin es requerida',
    }),
    ubicacion: joi_1.default.string().max(255).optional().messages({
        'string.max': 'La ubicación no puede exceder 255 caracteres',
    }),
});
exports.updateTournamentSchema = joi_1.default.object({
    nombre: joi_1.default.string().min(2).max(255).optional().messages({
        'string.min': 'El nombre del torneo debe tener al menos 2 caracteres',
        'string.max': 'El nombre del torneo no puede exceder 255 caracteres',
    }),
    descripcion: joi_1.default.string().max(1000).optional().allow('').messages({
        'string.max': 'La descripción no puede exceder 1000 caracteres',
    }),
    es_publico: joi_1.default.boolean().optional(),
    fecha_inicio: joi_1.default.date().optional(),
    fecha_fin: joi_1.default.date().optional(),
    estado: joi_1.default.string().valid('programado', 'activo', 'completado', 'cancelado').optional().messages({
        'any.only': 'El estado debe ser programado, activo, completado o cancelado',
    }),
    ubicacion: joi_1.default.string().max(255).optional().allow('').messages({
        'string.max': 'La ubicación no puede exceder 255 caracteres',
    }),
});
// Esquemas de combate
exports.createFightSchema = joi_1.default.object({
    torneo_id: joi_1.default.string().uuid().optional().messages({
        'string.uuid': 'El ID del torneo debe ser un UUID válido',
    }),
    boxeador1_id: joi_1.default.string().uuid().required().messages({
        'string.uuid': 'El ID del primer boxeador debe ser un UUID válido',
        'any.required': 'El primer boxeador es requerido',
    }),
    boxeador2_id: joi_1.default.string().uuid().required().invalid(joi_1.default.ref('boxeador1_id')).messages({
        'string.uuid': 'El ID del segundo boxeador debe ser un UUID válido',
        'any.required': 'El segundo boxeador es requerido',
        'any.invalid': 'Los boxeadores deben ser diferentes',
    }),
    peso_categoria: joi_1.default.string().valid('peso_mosca', 'peso_gallo', 'peso_pluma', 'peso_ligero', 'peso_super_ligero', 'peso_welter', 'peso_super_welter', 'peso_mediano', 'peso_super_mediano', 'peso_pesado').required().messages({
        'any.only': 'La categoría de peso no es válida',
        'any.required': 'La categoría de peso es requerida',
    }),
    fecha_combate: joi_1.default.date().required().messages({
        'any.required': 'La fecha del combate es requerida',
    }),
    ubicacion: joi_1.default.string().max(255).optional().messages({
        'string.max': 'La ubicación no puede exceder 255 caracteres',
    }),
    notas: joi_1.default.string().max(1000).optional().messages({
        'string.max': 'Las notas no pueden exceder 1000 caracteres',
    }),
});
exports.updateFightSchema = joi_1.default.object({
    resultado: joi_1.default.string().valid('boxer1_gana', 'boxer2_gana', 'empate', 'pendiente').optional().messages({
        'any.only': 'El resultado debe ser boxer1_gana, boxer2_gana, empate o pendiente',
    }),
    fecha_combate: joi_1.default.date().optional(),
    ubicacion: joi_1.default.string().max(255).optional().allow('').messages({
        'string.max': 'La ubicación no puede exceder 255 caracteres',
    }),
    notas: joi_1.default.string().max(1000).optional().allow('').messages({
        'string.max': 'Las notas no pueden exceder 1000 caracteres',
    }),
});
// Esquemas de consulta
exports.paginationSchema = joi_1.default.object({
    page: joi_1.default.number().integer().min(1).default(1),
    limit: joi_1.default.number().integer().min(1).max(100).default(10),
    search: joi_1.default.string().max(255).optional(),
    sort: joi_1.default.string().valid('nombre', 'created_at', 'updated_at').default('created_at'),
    order: joi_1.default.string().valid('asc', 'desc').default('desc'),
});
