import { Router } from 'express';
import {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getDashboardStats,
} from '../controllers/usersController';
import { authenticate, authorize } from '../middleware/auth';
import { validateQuery } from '../middleware/validation';
import { paginationSchema } from '../validation/schemas';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// Estadísticas del dashboard (solo administradores)
router.get('/dashboard-stats', authorize('administrador_general'), getDashboardStats);

// CRUD de usuarios (solo administrador general)
router.get('/', authorize('administrador_general'), validateQuery(paginationSchema), getUsers);
router.get('/:id', authorize('administrador_general'), getUserById);
router.put('/:id', authorize('administrador_general'), updateUser);
router.delete('/:id', authorize('administrador_general'), deleteUser);

export default router;