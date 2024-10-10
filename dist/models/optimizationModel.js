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
class OptimizationModel extends sequelize_1.Model {
    // Metodo per creare un modello di ottimizzazione
    static createModel(userId, graph, tokensCost) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield OptimizationModel.create({ userId, graph, tokensCost });
        });
    }
    // Metodo per trovare un modello per ID
    static findModelById(modelId) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = yield OptimizationModel.findByPk(modelId);
            if (!model) {
                const err = new Error('Modello non trovato');
                err.name = 'Not_found';
                throw err;
            }
        });
    }
    // Metodo per ottenere un modello per ID
    static getModelById(modelId) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = yield OptimizationModel.findByPk(modelId);
            if (!model) {
                const err = new Error('Modello non trovato');
                err.name = 'Not_found';
                throw err;
            }
            return model;
        });
    }
    // Metodo per verificare se l'utente è il creatore del modello
    static checkUserOwnership(modelId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = yield OptimizationModel.getModelById(modelId);
            if (model.userId !== userId) {
                const err = new Error('Non sei il creatore del modello');
                err.name = 'Forbidden';
                throw err;
            }
        });
    }
    // Metodo per applicare le modifiche al grafo
    applyChanges(coordinates) {
        return __awaiter(this, void 0, void 0, function* () {
            const graph = JSON.parse(this.graph);
            const parsedCoordinates = JSON.parse(coordinates);
            parsedCoordinates.forEach(({ x, y }) => {
                graph[x][y] = graph[x][y] === 0 ? 1 : 0; // Inverte il valore in base alle coordinate
            });
            // Aggiorna il grafo nel modello
            this.graph = JSON.stringify(graph);
            yield this.save();
        });
    }
}
OptimizationModel.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    userId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    graph: {
        type: sequelize_1.DataTypes.JSON, // Salva il grafo come JSON
        allowNull: false,
    },
    tokensCost: {
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: false,
    },
}, {
    sequelize: database_1.default.getInstance(),
    tableName: 'optimization_models',
});
exports.default = OptimizationModel;
