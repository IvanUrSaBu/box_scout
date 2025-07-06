import { Router } from 'express';
import {
  getTournaments,
  getTournamentById,
  createTournament,
  updateTournament,
  deleteTournament,
  getTournamentFights,
} from '../controllers/tournamentsController';
import { authenticate, authorize } from '../middleware/auth';
import { validate, validateQuery } from '../middleware/validation';
import { createTournamentSchema, updateTournamentSchema, paginationSchema } from '../validation/schemas';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// Rutas públicas (para usuarios autenticados)
router.get('/', validateQuery(paginationSchema), getTournaments);
router.get('/:id', getTournamentById);
router.get('/:id/fights', validateQuery(paginationSchema), getTournamentFights);

// Crear torneo (solo administradores)
router.post('/', 
  authorize('administrador_general', 'administrador_club'), 
  validate(createTournamentSchema), 
  createTournament
);

// Actualizar torneo (solo administradores)
router.put('/:id', 
  authorize('administrador_general', 'administrador_club'), 
  validate(updateTournamentSchema), 
  updateTournament
);

// Eliminar torneo (solo administradores)
router.delete('/:id', 
  authorize('administrador_general', 'administrador_club'), 
  deleteTournament
);

export default router;