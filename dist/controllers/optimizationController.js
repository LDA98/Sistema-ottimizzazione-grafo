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
exports.getModificationRequests = exports.getModificationRequestsHistory = exports.updateModificationRequestStatus = exports.createModificationRequest = exports.executeOptimizationModel = exports.createOptimizationModel = void 0;
const astar_typescript_1 = require("astar-typescript");
const users_1 = __importDefault(require("../models/users"));
const optimizationModel_1 = __importDefault(require("../models/optimizationModel"));
const modificationRequest_1 = __importDefault(require("../models/modificationRequest"));
const utils_1 = require("../services/utils");
// Funzione per creare il modello di ottimizzazione
const createOptimizationModel = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { graph } = req.body;
        const userId = req.userId;
        // Controlla se il grafo è una matrice valida (un array di array di 0 e 1)
        if (!(0, utils_1.isValidGraph)(graph)) {
            const err = new Error('Formato del grafo non valido. Deve essere una matrice NxM e di 0 e 1.');
            err.name = 'Not_valid';
            throw err;
        }
        // Calcola il costo in token
        const N = graph.length;
        const M = graph[0].length;
        const tokensCost = 0.025 * N * M;
        // Trova l'utente che ha fatto la richiesta
        const user = yield users_1.default.findUserOrCheckTokens(userId, tokensCost);
        yield users_1.default.deductTokens(userId, tokensCost);
        // Crea il modello di ottimizzazione
        const model = yield optimizationModel_1.default.createModel(userId, JSON.stringify(graph), tokensCost);
        return res.status(201).json({
            message: 'Modello creato con successo',
            model,
            remainingCredit: user.tokens
        });
    }
    catch (error) {
        next(error);
    }
});
exports.createOptimizationModel = createOptimizationModel;
// Funzione per eseguire il modello di ottimizzazione
const executeOptimizationModel = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { modelId } = req.params;
    const { start, goal } = req.body;
    const userId = req.userId;
    try {
        // Trova il modello di ottimizzazione per l'utente
        const model = yield optimizationModel_1.default.getModelById(Number(modelId));
        // Controlla il costo associato all'esecuzione
        const tokensCost = model.tokensCost;
        // Trova l'utente e verifica il saldo dei token
        const user = yield users_1.default.findUserOrCheckTokens(userId, tokensCost);
        yield users_1.default.deductTokens(userId, tokensCost);
        // Parse il grafo del modello
        const graph = JSON.parse(model.graph);
        // Verifica che le coordinate start e goal siano valide
        const coordinatesToCheck = [start, goal];
        if (!(0, utils_1.areValidCoordinates)(graph, coordinatesToCheck)) {
            const err = new Error('Coordinate non valide');
            err.name = 'Not_valid';
            throw err;
        }
        // Inizializza AStarFinder e calcola il tempo
        const startTime = Date.now();
        const aStarFinder = new astar_typescript_1.AStarFinder({
            grid: {
                matrix: graph,
            },
        });
        // Calcola il percorso tra i nodi di partenza e arrivo
        const path = aStarFinder.findPath(start, goal);
        if (!path || path.length === 0) {
            const err = new Error('Percorso non trovato tra i nodi di partenza e arrivo');
            err.name = 'Not_found';
            throw err;
        }
        const endTime = Date.now();
        // Calcola il tempo impiegato
        const executionTime = endTime - startTime;
        // Ritorna il risultato come JSON
        return res.status(200).json({
            path,
            tokensCost,
            executionTime,
            remainingCredit: user.tokens
        });
    }
    catch (error) {
        next(error);
    }
});
exports.executeOptimizationModel = executeOptimizationModel;
// Funzione per creare la richiesta di modifica
const createModificationRequest = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { modelId } = req.params;
    const { coordinates } = req.body;
    const userId = req.userId;
    try {
        // Verifica se il modello esiste
        const model = yield optimizationModel_1.default.getModelById(Number(modelId));
        // Controlla il costo associato all'esecuzione
        const tokensCost = 0.01 * coordinates.length;
        // Trova l'utente che ha fatto la richiesta
        const user = yield users_1.default.findUserOrCheckTokens(userId, tokensCost);
        // Parse il grafo dal modello
        const graph = JSON.parse(model.graph);
        // Verifica che le coordinate siano valide
        if (!(0, utils_1.areValidCoordinates)(graph, coordinates)) {
            const err = new Error('Coordinate non valide');
            err.name = 'Not_valid';
            throw err;
        }
        yield users_1.default.deductTokens(userId, tokensCost);
        // Crea la richiesta di modifica
        const modificationRequest = yield modificationRequest_1.default.create({
            modelId,
            userId,
            coordinates: JSON.stringify(coordinates),
            tokensCost
        });
        return res.status(201).json({
            message: 'Richiesta di modifica creata con successo.',
            modificationRequest,
            remainingCredit: user.tokens
        });
    }
    catch (error) {
        next(error);
    }
});
exports.createModificationRequest = createModificationRequest;
// Funzione per aggiornare la richiesta di modifica
const updateModificationRequestStatus = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { requestId } = req.params;
    const { status } = req.body; // 'Accepted' o 'Rejected'
    const userId = req.userId;
    try {
        // Verifica che lo stato sia valido
        if (status !== 'Accepted' && status !== 'Rejected') {
            const err = new Error('Status non valido. Lo stato deve essere "Accepted" o "Rejected"');
            err.name = 'Not_valid';
            throw err;
        }
        // Trova la richiesta di modifica e controlla se è possibile aggiornare la richiesta
        const modificationRequest = yield modificationRequest_1.default.verifyIsPossibleUpdate(Number(requestId));
        // Verifica che l'utente sia il creatore del modello
        yield optimizationModel_1.default.checkUserOwnership(modificationRequest.modelId, userId);
        const model = yield optimizationModel_1.default.getModelById(modificationRequest.modelId);
        // Aggiorna lo stato della richiesta di modifica
        if (status === 'Accepted') {
            // Applica le modifiche al modello
            yield model.applyChanges(modificationRequest.coordinates); // Chiama il metodo per applicare le modifiche
            // Rifiuta altre richieste di modifica 'Pending' per lo stesso modello
            yield modificationRequest_1.default.refusePendingRequests(modificationRequest.modelId, Number(requestId));
        }
        yield modificationRequest_1.default.updateRequestStatus(modificationRequest, status); // Passa l'oggetto modifica
        return res.status(200).json({ message: `Richiesta di modifica ${status.toLowerCase()} con successo.` });
    }
    catch (error) {
        next(error);
    }
});
exports.updateModificationRequestStatus = updateModificationRequestStatus;
// Funzione per ottenere l'istorico di tutte le richieste eventualmente filtrando per stato
const getModificationRequestsHistory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { modelId } = req.params;
    const userId = req.userId;
    const { status } = req.query;
    try {
        // Verifica che lo stato sia valido
        const validStatuses = ['Pending', 'Accepted', 'Rejected', 'Refused'];
        if (status && !validStatuses.includes(status)) {
            const err = new Error('Status non valido. Deve essere uno tra: Pending, Accepted, Rejected, Refused.');
            err.name = 'Not_valid';
            throw err;
        }
        // Verifica se il modello esiste
        const model = yield optimizationModel_1.default.getModelById(Number(modelId));
        yield optimizationModel_1.default.checkUserOwnership(model.id, userId);
        // Ottieni lo storico delle richieste di modifica
        const modificationRequests = yield modificationRequest_1.default.getModificationRequestsByModelId(Number(modelId), status);
        return res.status(200).json({ modificationRequests });
    }
    catch (error) {
        next(error);
    }
});
exports.getModificationRequestsHistory = getModificationRequestsHistory;
// Funzione per ottenere gli aggiornamenti del modello filtrando per date inizio o fine
const getModificationRequests = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { modelId } = req.params;
    const { startDate, endDate } = req.query;
    try {
        // Verifica se il modello esiste
        yield optimizationModel_1.default.findModelById(Number(modelId));
        // Validazione delle date se presenti
        (0, utils_1.validateDates)(startDate, endDate);
        const modificationRequests = yield modificationRequest_1.default.getModificationRequestsByModelIdAndDate(Number(modelId), startDate, endDate);
        return res.status(200).json(modificationRequests);
    }
    catch (error) {
        next(error);
    }
});
exports.getModificationRequests = getModificationRequests;
