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
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
class User extends sequelize_1.Model {
    // Metodo per ottenere l'utente dall'e-mail
    static getUserByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield User.findOne({ where: { email } });
            if (!user) {
                const err = new Error('Utente non trovato');
                err.name = 'Not_found';
                throw err;
            }
            return user;
        });
    }
    // Metodo per trovare un utente e controllare i token
    static findUserOrCheckTokens(userId, tokensRequired) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield User.findByPk(userId);
            if (!user) {
                const err = new Error('Utente non trovato');
                err.name = 'Not_found';
                throw err;
            }
            if (tokensRequired && user.tokens < tokensRequired) {
                const err = new Error('Credito insufficiente. Hai a disposizione ' + user.tokens);
                err.name = 'Insufficient_credit';
                throw err;
            }
            return user;
        });
    }
    // Metodo per sottrarre i token
    static deductTokens(userId, tokensToDeduct) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield User.findByPk(userId);
            if (!user) {
                const err = new Error('Utente non trovato');
                err.name = 'Not_found';
                throw err;
            }
            user.tokens -= tokensToDeduct;
            yield user.save();
            return user.tokens; // Restituisce il credito rimanente
        });
    }
}
User.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    email: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    password: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    tokens: {
        type: sequelize_1.DataTypes.FLOAT,
        defaultValue: 10, // Token iniziali per ogni utente
    },
    isAdmin: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: false,
    },
}, {
    sequelize: database_1.default.getInstance(),
    tableName: 'users',
});
exports.default = User;
