import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { validateBody } from '../middleware/validation.js';
import { loginSchema, registerSchema } from '../validation/schemas.js';
import { 
  login, 
  register, 
  getProfile, 
  updateProfile, 
  changePassword 
} from '../controllers/authController.js';

const router = Router();

// Public routes
router.post('/login', validateBody(loginSchema), login);
router.post('/register', validateBody(registerSchema), register);

// Protected routes
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);
router.put('/password', authenticate, changePassword);

export default router;