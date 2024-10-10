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
exports.login = exports.register = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const users_1 = __importDefault(require("../models/users"));
const register = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password, isAdmin } = req.body;
    try {
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        const newUser = yield users_1.default.create({
            email,
            password: hashedPassword,
            tokens: isAdmin ? 1000 : 10,
            isAdmin: isAdmin || false,
        });
        const message = isAdmin ? 'Admin registrato con successo' : 'Utente registrato con successo';
        return res.status(201).json({ message, user: newUser });
    }
    catch (error) {
        next(error);
    }
});
exports.register = register;
const login = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        const user = yield users_1.default.getUserByEmail(email);
        // Confronta la password
        const isPasswordValid = yield bcrypt_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            const err = new Error('Password non valida');
            err.name = 'Unauthorized';
            throw err;
        }
        // Genera un token JWT
        const token = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
        const message = user.isAdmin ? 'Accesso amministrativo effettuato con successo' : 'Login effettuato con successo';
        return res.status(200).json({ message, token });
    }
    catch (error) {
        next(error);
    }
});
exports.login = login;
