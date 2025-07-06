import { Router } from 'express';
import {
  getClubs,
  getClubById,
  createClub,
  updateClub,
  deleteClub,
  getClubBoxers,
} from '../controllers/clubsController';
import { authenticate, authorize, canModifyClub } from '../middleware/auth';
import { validate, validateQuery } from '../middleware/validation';
import { createClubSchema, updateClubSchema, paginationSchema } from '../validation/schemas';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// Rutas públicas (para usuarios autenticados)
router.get('/', validateQuery(paginationSchema), getClubs);
router.get('/:id', getClubById);
router.get('/:id/boxers', validateQuery(paginationSchema), getClubBoxers);

// Crear club (administradores generales y de club)
router.post('/', 
  authorize('administrador_general', 'administrador_club'), 
  validate(createClubSchema), 
  createClub
);

// Actualizar club (solo quien puede modificarlo)
router.put('/:id', 
  canModifyClub, 
  validate(updateClubSchema), 
  updateClub
);

// Eliminar club (solo administrador general)
router.delete('/:id', 
  authorize('administrador_general'), 
  deleteClub
);

export default router;