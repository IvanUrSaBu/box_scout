import { Router } from 'express';
import {
  getBoxers,
  getBoxerById,
  createBoxer,
  updateBoxer,
  deleteBoxer,
  getBoxerFights,
} from '../controllers/boxersController';
import { authenticate, authorize, canModifyBoxer } from '../middleware/auth';
import { validate, validateQuery } from '../middleware/validation';
import { createBoxerSchema, updateBoxerSchema, paginationSchema } from '../validation/schemas';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// Rutas públicas (para usuarios autenticados)
router.get('/', validateQuery(paginationSchema), getBoxers);
router.get('/:id', getBoxerById);
router.get('/:id/fights', validateQuery(paginationSchema), getBoxerFights);

// Crear boxeador (administradores y el propio boxeador)
router.post('/', 
  authorize('administrador_general', 'administrador_club', 'boxeador'), 
  validate(createBoxerSchema), 
  createBoxer
);

// Actualizar boxeador (solo quien puede modificarlo)
router.put('/:id', 
  canModifyBoxer, 
  validate(updateBoxerSchema), 
  updateBoxer
);

// Eliminar boxeador (solo administradores)
router.delete('/:id', 
  authorize('administrador_general', 'administrador_club'), 
  deleteBoxer
);

export default router;