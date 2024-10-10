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
class ModificationRequest extends sequelize_1.Model {
    // Metodo per creare una richiesta di modifica
    static createModificationRequest(modelId, userId, coordinates, tokensCost) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield ModificationRequest.create({
                modelId,
                userId,
                coordinates,
                status: 'Pending', // Imposta lo stato iniziale
                tokensCost,
            });
        });
    }
    // Metodo per trovare una richiesta di modifica per ID
    static findRequestById(requestId) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = yield ModificationRequest.findByPk(requestId);
            if (!request) {
                const err = new Error('Richiesta di modifica non trovata');
                err.name = 'Not_found';
                throw err;
            }
            return request;
        });
    }
    // Metodo per verificare se una richiesta può essere aggiornata
    static verifyIsPossibleUpdate(requestId) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = yield ModificationRequest.findRequestById(requestId);
            if (request.status !== 'Pending') {
                const err = new Error('Richiesta già : ' + request.status);
                err.name = 'Not_found';
                throw err;
            }
            return request;
        });
    }
    // Metodo per aggiornare lo stato della richiesta di modifica
    static updateRequestStatus(request, status) {
        return __awaiter(this, void 0, void 0, function* () {
            if (status === 'Accepted')
                request.status = 'Accepted';
            else
                request.status = 'Rejected';
            yield request.save();
        });
    }
    // Metodo per rifiutare altre richieste di modifica 'Pending' per lo stesso modello
    static refusePendingRequests(modelId, requestId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield ModificationRequest.update({ status: 'Refused' }, {
                where: {
                    modelId,
                    id: { [sequelize_1.Op.ne]: requestId },
                    status: 'Pending',
                },
            });
        });
    }
    // Metodo per ottenere lo storico delle richieste di modifica
    static getModificationRequestsByModelId(modelId, status) {
        return __awaiter(this, void 0, void 0, function* () {
            const whereClause = { modelId };
            if (status) {
                whereClause.status = status;
            }
            const modificationRequests = yield ModificationRequest.findAll({
                where: whereClause,
            });
            if (modificationRequests.length === 0) {
                const err = new Error(`Nessuna richiesta di modifica trovata.`);
                err.name = 'Not_found';
                throw err;
            }
            else {
                return modificationRequests;
            }
        });
    }
    // Metodo per ottenere richieste di modifica filtrando per date
    static getModificationRequestsByModelIdAndDate(modelId, startDate, endDate) {
        return __awaiter(this, void 0, void 0, function* () {
            const whereClause = {
                modelId,
                status: 'Accepted',
            };
            // Aggiungi le condizioni per updatedAt se le date sono fornite
            if (startDate) {
                whereClause.updatedAt = Object.assign(Object.assign({}, whereClause.updatedAt), { [sequelize_1.Op.gte]: new Date(startDate) });
            }
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999); // Imposta la fine del giorno
                whereClause.updatedAt = Object.assign(Object.assign({}, whereClause.updatedAt), { [sequelize_1.Op.lte]: end });
            }
            const modificationRequests = yield ModificationRequest.findAll({
                where: whereClause,
            });
            if (modificationRequests.length === 0) {
                const err = new Error(`Nessuna richiesta di modifica trovata tra ${startDate !== null && startDate !== void 0 ? startDate : 'inizio'} ed ${endDate !== null && endDate !== void 0 ? endDate : 'fine'}.`);
                err.name = 'Not_found';
                throw err;
            }
            else {
                return modificationRequests;
            }
        });
    }
}
ModificationRequest.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    modelId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    userId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    coordinates: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    status: {
        type: sequelize_1.DataTypes.ENUM('Pending', 'Accepted', 'Rejected', 'Refused'),
        defaultValue: 'Pending',
    },
    tokensCost: {
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: false,
    },
}, {
    sequelize: database_1.default.getInstance(),
    tableName: 'modification_requests',
});
exports.default = ModificationRequest;
