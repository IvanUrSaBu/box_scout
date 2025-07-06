"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const boxersController_1 = require("../controllers/boxersController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const schemas_1 = require("../validation/schemas");
const router = (0, express_1.Router)();
// Todas las rutas requieren autenticación
router.use(auth_1.authenticate);
// Rutas públicas (para usuarios autenticados)
router.get('/', (0, validation_1.validateQuery)(schemas_1.paginationSchema), boxersController_1.getBoxers);
router.get('/:id', boxersController_1.getBoxerById);
router.get('/:id/fights', (0, validation_1.validateQuery)(schemas_1.paginationSchema), boxersController_1.getBoxerFights);
// Crear boxeador (administradores y el propio boxeador)
router.post('/', (0, auth_1.authorize)('administrador_general', 'administrador_club', 'boxeador'), (0, validation_1.validate)(schemas_1.createBoxerSchema), boxersController_1.createBoxer);
// Actualizar boxeador (solo quien puede modificarlo)
router.put('/:id', auth_1.canModifyBoxer, (0, validation_1.validate)(schemas_1.updateBoxerSchema), boxersController_1.updateBoxer);
// Eliminar boxeador (solo administradores)
router.delete('/:id', (0, auth_1.authorize)('administrador_general', 'administrador_club'), boxersController_1.deleteBoxer);
exports.default = router;
