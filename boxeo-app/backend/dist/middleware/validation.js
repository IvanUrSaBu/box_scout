"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateQuery = exports.validate = void 0;
const validate = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true,
        });
        if (error) {
            const errors = error.details.map(detail => detail.message);
            return res.status(400).json({
                success: false,
                message: 'Error de validación',
                errors,
            });
        }
        req.body = value;
        next();
    };
};
exports.validate = validate;
const validateQuery = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.query, {
            abortEarly: false,
            stripUnknown: true,
        });
        if (error) {
            const errors = error.details.map(detail => detail.message);
            return res.status(400).json({
                success: false,
                message: 'Error de validación en parámetros de consulta',
                errors,
            });
        }
        req.query = value;
        next();
    };
};
exports.validateQuery = validateQuery;
