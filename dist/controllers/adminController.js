"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rechargeUserCredits = void 0;
const users_1 = __importDefault(require("../models/users"));
const rechargeUserCredits = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, newCredits } = req.body;
    try {
        // Verifica se i crediti sono un valore valido
        if (newCredits <= 0) {
            const err = new Error('L\'importo dei crediti deve essere maggiore di zero.');
            err.name = 'Not_valid';
            throw err;
        }
        // Trova l'utente tramite email
        const user = yield users_1.default.getUserByEmail(email);
        // Ricarica il credito dell'utente
        user.tokens += newCredits; // Aggiunge i nuovi crediti
        yield user.save(); // Salva le modifiche nel database
        return res.status(200).json({ message: 'Credito ricaricato con successo.', user });
    }
    catch (error) {
        next(error);
    }
});
exports.rechargeUserCredits = rechargeUserCredits;
