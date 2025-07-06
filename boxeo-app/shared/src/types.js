"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TOURNAMENT_STATUS_LABELS = exports.FIGHT_RESULT_LABELS = exports.USER_ROLE_LABELS = exports.WEIGHT_CLASS_LABELS = void 0;
// Constantes útiles
exports.WEIGHT_CLASS_LABELS = {
    peso_mosca: 'Peso Mosca (hasta 51kg)',
    peso_gallo: 'Peso Gallo (51-54kg)',
    peso_pluma: 'Peso Pluma (54-57kg)',
    peso_ligero: 'Peso Ligero (57-60kg)',
    peso_super_ligero: 'Peso Súper Ligero (60-64kg)',
    peso_welter: 'Peso Welter (64-69kg)',
    peso_super_welter: 'Peso Súper Welter (69-75kg)',
    peso_mediano: 'Peso Mediano (75-81kg)',
    peso_super_mediano: 'Peso Súper Mediano (81-91kg)',
    peso_pesado: 'Peso Pesado (más de 91kg)',
};
exports.USER_ROLE_LABELS = {
    administrador_general: 'Administrador General',
    administrador_club: 'Administrador de Club',
    boxeador: 'Boxeador',
};
exports.FIGHT_RESULT_LABELS = {
    boxer1_gana: 'Victoria del primer boxeador',
    boxer2_gana: 'Victoria del segundo boxeador',
    empate: 'Empate',
    pendiente: 'Pendiente',
};
exports.TOURNAMENT_STATUS_LABELS = {
    programado: 'Programado',
    activo: 'Activo',
    completado: 'Completado',
    cancelado: 'Cancelado',
};
