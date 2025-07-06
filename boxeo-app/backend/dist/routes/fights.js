"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const fightsController_1 = require("../controllers/fightsController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const schemas_1 = require("../validation/schemas");
const router = (0, express_1.Router)();
// Todas las rutas requieren autenticación
router.use(auth_1.authenticate);
// Rutas públicas (para usuarios autenticados)
router.get('/', (0, validation_1.validateQuery)(schemas_1.paginationSchema), fightsController_1.getFights);
router.get('/:id', fightsController_1.getFightById);
// Crear combate (solo administradores)
router.post('/', (0, auth_1.authorize)('administrador_general', 'administrador_club'), (0, validation_1.validate)(schemas_1.createFightSchema), fightsController_1.createFight);
// Actualizar combate (solo administradores)
router.put('/:id', (0, auth_1.authorize)('administrador_general', 'administrador_club'), (0, validation_1.validate)(schemas_1.updateFightSchema), fightsController_1.updateFight);
// Eliminar combate (solo administradores)
router.delete('/:id', (0, auth_1.authorize)('administrador_general', 'administrador_club'), fightsController_1.deleteFight);
exports.default = router;
