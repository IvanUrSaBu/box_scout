"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tournamentsController_1 = require("../controllers/tournamentsController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const schemas_1 = require("../validation/schemas");
const router = (0, express_1.Router)();
// Todas las rutas requieren autenticación
router.use(auth_1.authenticate);
// Rutas públicas (para usuarios autenticados)
router.get('/', (0, validation_1.validateQuery)(schemas_1.paginationSchema), tournamentsController_1.getTournaments);
router.get('/:id', tournamentsController_1.getTournamentById);
router.get('/:id/fights', (0, validation_1.validateQuery)(schemas_1.paginationSchema), tournamentsController_1.getTournamentFights);
// Crear torneo (solo administradores)
router.post('/', (0, auth_1.authorize)('administrador_general', 'administrador_club'), (0, validation_1.validate)(schemas_1.createTournamentSchema), tournamentsController_1.createTournament);
// Actualizar torneo (solo administradores)
router.put('/:id', (0, auth_1.authorize)('administrador_general', 'administrador_club'), (0, validation_1.validate)(schemas_1.updateTournamentSchema), tournamentsController_1.updateTournament);
// Eliminar torneo (solo administradores)
router.delete('/:id', (0, auth_1.authorize)('administrador_general', 'administrador_club'), tournamentsController_1.deleteTournament);
exports.default = router;
