import { Router } from 'express';
import {
  getFights,
  getFightById,
  createFight,
  updateFight,
  deleteFight,
} from '../controllers/fightsController';
import { authenticate, authorize } from '../middleware/auth';
import { validate, validateQuery } from '../middleware/validation';
import { createFightSchema, updateFightSchema, paginationSchema } from '../validation/schemas';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// Rutas públicas (para usuarios autenticados)
router.get('/', validateQuery(paginationSchema), getFights);
router.get('/:id', getFightById);

// Crear combate (solo administradores)
router.post('/', 
  authorize('administrador_general', 'administrador_club'), 
  validate(createFightSchema), 
  createFight
);

// Actualizar combate (solo administradores)
router.put('/:id', 
  authorize('administrador_general', 'administrador_club'), 
  validate(updateFightSchema), 
  updateFight
);

// Eliminar combate (solo administradores)
router.delete('/:id', 
  authorize('administrador_general', 'administrador_club'), 
  deleteFight
);

export default router;