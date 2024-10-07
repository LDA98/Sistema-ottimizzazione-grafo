import { Request, Response, NextFunction } from 'express';
import { AStarFinder } from 'astar-typescript';
import User from '../models/users';
import OptimizationModel from '../models/optimizationModel';
import ModificationRequest from '../models/modificationRequest';
import { isValidGraph, areValidCoordinates, validateDates } from '../services/utils'

// Funzione per creare il modello di ottimizzazione
const createOptimizationModel = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const { graph } = req.body; 
    const userId = (req as any).userId; 

    // Controlla se il grafo è una matrice valida (un array di array di 0 e 1)
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
    const user = await User.findUserAndCheckTokens(userId, tokensCost);
    await User.deductTokens(userId, tokensCost);

    // Crea il modello di ottimizzazione
    const model = await OptimizationModel.createModel(
      userId, 
      JSON.stringify(graph), 
      tokensCost
    );

    return res.status(201).json({ 
      message: 'Modello creato con successo', 
      model, 
      remainingCredit: user.tokens 
    });
  } catch (error) {
    next(error);
  }
};

// Funzione per eseguire il modello di ottimizzazione
const executeOptimizationModel = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  const { modelId } = req.params;
  const { start, goal } = req.body;
  const userId = (req as any).userId;

  try {
    // Trova il modello di ottimizzazione per l'utente
    const model = await OptimizationModel.getModelById(Number(modelId));

    // Controlla il costo associato all'esecuzione
    const tokensCost = model.tokensCost;

    // Trova l'utente e verifica il saldo dei token
    const user = await User.findUserAndCheckTokens(userId, tokensCost);
    await User.deductTokens(userId, tokensCost);

    // Parse il grafo dal modello
    const graph = JSON.parse(model.graph);

    // Verifica che le coordinate start e goal siano valide
    const coordinatesToCheck = [start, goal];
    if (!areValidCoordinates(graph, coordinatesToCheck)) {
      const err = new Error('Coordinate non valide');
      err.name = 'Not_valid';
      throw err;
    }

    // Inizializza AStarFinder e calcola il tempo
    const startTime = Date.now();
    const aStarFinder = new AStarFinder({
      grid: {
        matrix: graph,
      },
    });

    // Calcola il percorso tra i nodi di partenza e arrivo
    const path  = aStarFinder.findPath(start, goal);
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
  } catch (error) {
    next(error);
  }
};

// Funzione per creare la richiesta di modifica
const createModificationRequest = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  const { modelId } = req.params;
  const { coordinates } = req.body;
  const userId = (req as any).userId;

  try {
    // Verifica se il modello esiste
    const model = await OptimizationModel.getModelById(Number(modelId));

    // Controlla il costo associato all'esecuzione
    const tokensCost = 0.01 * coordinates.length;

    // Trova l'utente che ha fatto la richiesta
    const user = await User.findUserAndCheckTokens(userId, tokensCost);

    // Parse il grafo dal modello
    const graph = JSON.parse(model.graph);

    // Verifica che le coordinate siano valide
    if (!areValidCoordinates(graph, coordinates)) {
      const err = new Error('Coordinate non valide');
      err.name = 'Not_valid';
      throw err;
    }

    await User.deductTokens(userId, tokensCost);

    // Crea la richiesta di modifica
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
};

// Funzione per aggiornare la richiesta di modifica
const updateModificationRequestStatus = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  const { requestId } = req.params;
  const { status } = req.body; // 'Accepted' o 'Rejected'
  const userId = (req as any).userId;

  try {
    // Verifica che lo stato sia valido
    if (status !== 'Accepted' && status !== 'Rejected') {
      const err = new Error('Status non valido. Lo stato deve essere "Accepted" o "Rejected"');
      err.name = 'Not_valid';
      throw err;
    }

    // Trova la richiesta di modifica e controlla se è possibile aggiornare la richiesta
    const modificationRequest = await ModificationRequest.verifyIsPossibleUpdate(Number(requestId));

    // Verifica che l'utente sia il creatore del modello
    await OptimizationModel.checkUserOwnership(modificationRequest.modelId, userId);
    const model = await OptimizationModel.getModelById(modificationRequest.modelId);

    // Aggiorna lo stato della richiesta di modifica
    if (status === 'Accepted') {
      // Applica le modifiche al modello
      await model.applyChanges(modificationRequest.coordinates); // Chiama il metodo per applicare le modifiche
      // Rifiuta altre richieste di modifica 'Pending' per lo stesso modello
      await ModificationRequest.refusePendingRequests(modificationRequest.modelId, Number(requestId));
    }

    await ModificationRequest.updateRequestStatus(modificationRequest, status); // Passa l'oggetto modifica

    return res.status(200).json({ message: `Richiesta di modifica ${status.toLowerCase()} con successo.` });
  } catch (error) {
    next(error);
  }
};

// Funzione per ottenere l'istorico di tutte le richieste eventualmente filtrando per stato
const getModificationRequestsHistory = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  const { modelId } = req.params;
  const userId = (req as any).userId;
  const { status } = req.query;

  try {
    // Verifica che lo stato sia valido
    const validStatuses = ['Pending', 'Accepted', 'Rejected', 'Refused'];
    if (status && !validStatuses.includes(status as string)) {
      const err = new Error('Status non valido. Deve essere uno tra: Pending, Accepted, Rejected, Refused.');
      err.name = 'Not_valid';
      throw err;
    }

    // Verifica se il modello esiste
    const model = await OptimizationModel.getModelById(Number(modelId));
    await OptimizationModel.checkUserOwnership(model.id, userId);

    // Ottieni lo storico delle richieste di modifica
    const modificationRequests = await ModificationRequest.getModificationRequestsByModelId(Number(modelId), status as string);

    return res.status(200).json({ modificationRequests });
  } catch (error) {
    next(error);
  }
};

// Funzione per ottenere gli aggiornamenti del modello filtrando per date inizio o fine
const getModificationRequests = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  const { modelId } = req.params;
  const { startDate, endDate } = req.query; 

  try {
    // Verifica se il modello esiste
    await OptimizationModel.findModelById(Number(modelId));

    // Validazione delle date se presenti
    validateDates(startDate as string, endDate as string);

    const modificationRequests = await ModificationRequest.getModificationRequestsByModelIdAndDate(Number(modelId), startDate as string, endDate as string);

    return res.status(200).json(modificationRequests);
  } catch (error) {
    next(error);
  }
};


export { createOptimizationModel, 
         executeOptimizationModel, 
         createModificationRequest, 
         updateModificationRequestStatus, 
         getModificationRequestsHistory, 
         getModificationRequests 
        };
