"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const usersController_1 = require("../controllers/usersController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const schemas_1 = require("../validation/schemas");
const router = (0, express_1.Router)();
// Todas las rutas requieren autenticación
router.use(auth_1.authenticate);
// Estadísticas del dashboard (solo administradores)
router.get('/dashboard-stats', (0, auth_1.authorize)('administrador_general'), usersController_1.getDashboardStats);
// CRUD de usuarios (solo administrador general)
router.get('/', (0, auth_1.authorize)('administrador_general'), (0, validation_1.validateQuery)(schemas_1.paginationSchema), usersController_1.getUsers);
router.get('/:id', (0, auth_1.authorize)('administrador_general'), usersController_1.getUserById);
router.put('/:id', (0, auth_1.authorize)('administrador_general'), usersController_1.updateUser);
router.delete('/:id', (0, auth_1.authorize)('administrador_general'), usersController_1.deleteUser);
exports.default = router;
