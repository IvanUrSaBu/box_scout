"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotFoundError = exports.AuthorizationError = exports.AuthenticationError = exports.ValidationError = exports.FIGHT_RESULT_LABELS = exports.TOURNAMENT_STATUS_LABELS = exports.USER_ROLE_LABELS = exports.WEIGHT_CLASS_LABELS = exports.TournamentStatus = exports.FightResult = exports.WeightClass = exports.UserRole = void 0;
// ===== ENUMS =====
var UserRole;
(function (UserRole) {
    UserRole["ADMINISTRADOR_GENERAL"] = "administrador_general";
    UserRole["ADMINISTRADOR_CLUB"] = "administrador_club";
    UserRole["BOXEADOR"] = "boxeador";
})(UserRole || (exports.UserRole = UserRole = {}));
var WeightClass;
(function (WeightClass) {
    WeightClass["PESO_MOSCA"] = "peso_mosca";
    WeightClass["PESO_GALLO"] = "peso_gallo";
    WeightClass["PESO_PLUMA"] = "peso_pluma";
    WeightClass["PESO_LIGERO"] = "peso_ligero";
    WeightClass["PESO_WELTER"] = "peso_welter";
    WeightClass["PESO_MEDIANO"] = "peso_mediano";
    WeightClass["PESO_PESADO"] = "peso_pesado";
})(WeightClass || (exports.WeightClass = WeightClass = {}));
var FightResult;
(function (FightResult) {
    FightResult["BOXER1_GANA"] = "boxer1_gana";
    FightResult["BOXER2_GANA"] = "boxer2_gana";
    FightResult["EMPATE"] = "empate";
    FightResult["PENDIENTE"] = "pendiente";
})(FightResult || (exports.FightResult = FightResult = {}));
var TournamentStatus;
(function (TournamentStatus) {
    TournamentStatus["PROGRAMADO"] = "programado";
    TournamentStatus["ACTIVO"] = "activo";
    TournamentStatus["COMPLETADO"] = "completado";
    TournamentStatus["CANCELADO"] = "cancelado";
})(TournamentStatus || (exports.TournamentStatus = TournamentStatus = {}));
// ===== CONSTANTS =====
exports.WEIGHT_CLASS_LABELS = {
    [WeightClass.PESO_MOSCA]: 'Peso Mosca',
    [WeightClass.PESO_GALLO]: 'Peso Gallo',
    [WeightClass.PESO_PLUMA]: 'Peso Pluma',
    [WeightClass.PESO_LIGERO]: 'Peso Ligero',
    [WeightClass.PESO_WELTER]: 'Peso Welter',
    [WeightClass.PESO_MEDIANO]: 'Peso Mediano',
    [WeightClass.PESO_PESADO]: 'Peso Pesado'
};
exports.USER_ROLE_LABELS = {
    [UserRole.ADMINISTRADOR_GENERAL]: 'Administrador General',
    [UserRole.ADMINISTRADOR_CLUB]: 'Administrador de Club',
    [UserRole.BOXEADOR]: 'Boxeador'
};
exports.TOURNAMENT_STATUS_LABELS = {
    [TournamentStatus.PROGRAMADO]: 'Programado',
    [TournamentStatus.ACTIVO]: 'Activo',
    [TournamentStatus.COMPLETADO]: 'Completado',
    [TournamentStatus.CANCELADO]: 'Cancelado'
};
exports.FIGHT_RESULT_LABELS = {
    [FightResult.BOXER1_GANA]: 'Victoria Boxeador 1',
    [FightResult.BOXER2_GANA]: 'Victoria Boxeador 2',
    [FightResult.EMPATE]: 'Empate',
    [FightResult.PENDIENTE]: 'Pendiente'
};
class ValidationError extends Error {
    errors;
    constructor(errors) {
        super('Validation failed');
        this.errors = errors;
        this.name = 'ValidationError';
    }
}
exports.ValidationError = ValidationError;
class AuthenticationError extends Error {
    constructor(message = 'Authentication failed') {
        super(message);
        this.name = 'AuthenticationError';
    }
}
exports.AuthenticationError = AuthenticationError;
class AuthorizationError extends Error {
    constructor(message = 'Not authorized to perform this action') {
        super(message);
        this.name = 'AuthorizationError';
    }
}
exports.AuthorizationError = AuthorizationError;
class NotFoundError extends Error {
    constructor(resource = 'Resource') {
        super(`${resource} not found`);
        this.name = 'NotFoundError';
    }
}
exports.NotFoundError = NotFoundError;
