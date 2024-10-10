"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class AuthenticateJWT {
    handle(req, res, next) {
        var _a;
        const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
        if (!token) {
            const error = new Error('Token mancante');
            error.name = 'Not_found';
            return next(error);
        }
        try {
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            req.userId = decoded.userId; // Estrai userId dal token decodificato
            next(); // utente autenticato può continuare la richiesta
        }
        catch (err) {
            const error = new Error('Token non valido');
            error.name = 'Forbidden';
            return next(error);
        }
    }
}
exports.default = AuthenticateJWT;
