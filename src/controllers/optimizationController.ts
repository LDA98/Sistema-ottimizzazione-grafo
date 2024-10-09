import { Request, Response, NextFunction } from 'express';
import { AStarFinder } from 'astar-typescript';
import User from '../models/users';
import OptimizationModel from '../models/optimizationModel';
import ModificationRequest from '../models/modificationRequest';
import { isValidGraph, areValidCoordinates, validateDates } from '../services/utils';

class OptimizationController {
    // Funzione per creare il modello di ottimizzazione
    async createOptimizationModel(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const { graph } = req.body; 
            const userId = (req as any).userId; 

            // Controlla se il grafo è una matrice valida
            if (!isValidGraph(graph)) { 
                const err = new Error('Formato del grafo non valido. Deve essere una matrice NxM e di 0 e 1.');
                err.name = 'Not_valid';
                throw err;
            }

            // Calcola il costo in token
            const N = graph.length;
            const M = graph[0].length;
            const tokensCost = 0.025 * N * M;

            // Trova l'utente che ha fatto la richiesta
            const user = await User.findUserOrCheckTokens(userId, tokensCost);
            await User.deductTokens(userId, tokensCost);

            // Crea il modello di ottimizzazione
            const model = await OptimizationModel.createModel(userId, JSON.stringify(graph), tokensCost);

            return res.status(201).json({ 
                message: 'Modello creato con successo', 
                model, 
                remainingCredit: user.tokens 
            });
        } catch (error) {
            next(error);
        }
    }

    // Funzione per eseguire il modello di ottimizzazione
    async executeOptimizationModel(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        const { modelId } = req.params;
        const { start, goal } = req.body;
        const userId = (req as any).userId;

        try {
            const model = await OptimizationModel.getModelById(Number(modelId));
            const tokensCost = model.tokensCost;

            const user = await User.findUserOrCheckTokens(userId, tokensCost);
            await User.deductTokens(userId, tokensCost);

            const graph = JSON.parse(model.graph);

            const coordinatesToCheck = [start, goal];
            if (!areValidCoordinates(graph, coordinatesToCheck)) {
                const err = new Error('Coordinate non valide');
                err.name = 'Not_valid';
                throw err;
            }

            const startTime = Date.now();
            const aStarFinder = new AStarFinder({
                grid: { matrix: graph },
            });

            const path = aStarFinder.findPath(start, goal);
            if (!path || path.length === 0) {
                const err = new Error('Percorso non trovato tra i nodi di partenza e arrivo');
                err.name = 'Not_found';
                throw err;
            }

            const endTime = Date.now();
            const executionTime = endTime - startTime;

            return res.status(200).json({
                path,
                tokensCost,
                executionTime,
                remainingCredit: user.tokens
            });
        } catch (error) {
            next(error);
        }
    }

    // Funzione per creare la richiesta di modifica
    async createModificationRequest(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        const { modelId } = req.params;
        const { coordinates } = req.body;
        const userId = (req as any).userId;

        try {
            const model = await OptimizationModel.getModelById(Number(modelId));
            const tokensCost = 0.01 * coordinates.length;

            const user = await User.findUserOrCheckTokens(userId, tokensCost);
            const graph = JSON.parse(model.graph);

            if (!areValidCoordinates(graph, coordinates)) {
                const err = new Error('Coordinate non valide');
                err.name = 'Not_valid';
                throw err;
            }

            await User.deductTokens(userId, tokensCost);

            const modificationRequest = await ModificationRequest.create({
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
        } catch (error) {
            next(error);
        }
    }

    // Funzione per aggiornare la richiesta di modifica
    async updateModificationRequestStatus(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        const { requestId } = req.params;
        const { status } = req.body;
        const userId = (req as any).userId;

        try {
            if (status !== 'Accepted' && status !== 'Rejected') {
                const err = new Error('Status non valido. Lo stato deve essere "Accepted" o "Rejected"');
                err.name = 'Not_valid';
                throw err;
            }

            const modificationRequest = await ModificationRequest.verifyIsPossibleUpdate(Number(requestId));
            await OptimizationModel.checkUserOwnership(modificationRequest.modelId, userId);
            const model = await OptimizationModel.getModelById(modificationRequest.modelId);

            if (status === 'Accepted') {
                await model.applyChanges(modificationRequest.coordinates);
                await ModificationRequest.refusePendingRequests(modificationRequest.modelId, Number(requestId));
            }

            await ModificationRequest.updateRequestStatus(modificationRequest, status);

            return res.status(200).json({ message: `Richiesta di modifica ${status.toLowerCase()} con successo.` });
        } catch (error) {
            next(error);
        }
    }

    // Funzione per ottenere l'istorico di tutte le richieste eventualmente filtrando per stato
    async getModificationRequestsHistory(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        const { modelId } = req.params;
        const userId = (req as any).userId;
        const { status } = req.query;

        try {
            const validStatuses = ['Pending', 'Accepted', 'Rejected', 'Refused'];
            if (status && !validStatuses.includes(status as string)) {
                const err = new Error('Status non valido. Deve essere uno tra: Pending, Accepted, Rejected, Refused.');
                err.name = 'Not_valid';
                throw err;
            }

            const model = await OptimizationModel.getModelById(Number(modelId));
            await OptimizationModel.checkUserOwnership(model.id, userId);

            const modificationRequests = await ModificationRequest.getModificationRequestsByModelId(Number(modelId), status as string);

            return res.status(200).json({ modificationRequests });
        } catch (error) {
            next(error);
        }
    }

    // Funzione per ottenere gli aggiornamenti del modello filtrando per date inizio o fine
    async getModificationRequests(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        const { modelId } = req.params;
        const { startDate, endDate } = req.query; 

        try {
            await OptimizationModel.findModelById(Number(modelId));
            validateDates(startDate as string, endDate as string);

            const modificationRequests = await ModificationRequest.getModificationRequestsByModelIdAndDate(Number(modelId), startDate as string, endDate as string);

            return res.status(200).json(modificationRequests);
        } catch (error) {
            next(error);
        }
    }
}

export default new OptimizationController();
