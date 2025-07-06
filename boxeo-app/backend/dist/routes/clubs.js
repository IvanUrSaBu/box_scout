"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const clubsController_1 = require("../controllers/clubsController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const schemas_1 = require("../validation/schemas");
const router = (0, express_1.Router)();
// Todas las rutas requieren autenticación
router.use(auth_1.authenticate);
// Rutas públicas (para usuarios autenticados)
router.get('/', (0, validation_1.validateQuery)(schemas_1.paginationSchema), clubsController_1.getClubs);
router.get('/:id', clubsController_1.getClubById);
router.get('/:id/boxers', (0, validation_1.validateQuery)(schemas_1.paginationSchema), clubsController_1.getClubBoxers);
// Crear club (administradores generales y de club)
router.post('/', (0, auth_1.authorize)('administrador_general', 'administrador_club'), (0, validation_1.validate)(schemas_1.createClubSchema), clubsController_1.createClub);
// Actualizar club (solo quien puede modificarlo)
router.put('/:id', auth_1.canModifyClub, (0, validation_1.validate)(schemas_1.updateClubSchema), clubsController_1.updateClub);
// Eliminar club (solo administrador general)
router.delete('/:id', (0, auth_1.authorize)('administrador_general'), clubsController_1.deleteClub);
exports.default = router;
