import { Request, Response, NextFunction } from 'express';
import { Op } from 'sequelize';
import { AStarFinder } from 'astar-typescript';
import User from '../models/users';
import OptimizationModel from '../models/optimizationModel';
import ModificationRequest from '../models/modificationRequest';
import { isValidGraph, areValidCoordinates } from '../services/utils'

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
    const user = await User.findByPk(userId);
    if (!user) {
      const err = new Error('Utente non trovato');
      err.name = 'Not_found';
      throw err;
    }
    if (user.tokens < tokensCost) {
      const err = new Error('Credito insufficiente. Hai a disposizione ' + user.tokens);
      err.name = 'Insufficient_credit';
      throw err;
    }

    // Sottrae i token dall'utente
    user.tokens -= tokensCost;
    await user.save();

    const remainingCredit = user.tokens;

    // Crea il modello di ottimizzazione
    const model = await OptimizationModel.create({
      userId,
      graph: JSON.stringify(graph),
      tokensCost,
    });

    return res.status(201).json({ message: 'Modello creato con successo', model, remainingCredit });
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
    const model = await OptimizationModel.findByPk(modelId);
    if (!model) {
      const err = new Error('Modello non trovato');
      err.name = 'Not_found';
      throw err;
    }

    // Controlla il costo associato all'esecuzione
    const cost = model.tokensCost;

    // Trova l'utente e verifica il saldo dei token
    const user = await User.findByPk(userId);
    if (!user) {
      const err = new Error('Utente non trovato');
      err.name = 'Not_found';
      throw err;
    }

    if (user.tokens < cost) {
      const err = new Error('Credito insufficiente. Hai a disposizione ' + user.tokens);
      err.name = 'Insufficient_credit';
      throw err;    
    }

    // Sottrae i token dall'utente
    user.tokens -= cost;
    await user.save();

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

    const remainingCredit = user.tokens;

    // Ritorna il risultato come JSON
    return res.status(200).json({
      path,
      cost,
      executionTime,
      remainingCredit
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
    const model = await OptimizationModel.findByPk(modelId);
    if (!model) {
      const err = new Error('Modello non trovato');
      err.name = 'Not_found';
      throw err;
    }

    // Trova l'utente che ha fatto la richiesta
    const user = await User.findByPk(userId);
    if (!user) {
      const err = new Error('Utente non trovato');
      err.name = 'Not_found';
      throw err;
    }

    // Parse il grafo dal modello
    const graph = JSON.parse(model.graph);

    // Verifica che le coordinate siano valide
    if (!areValidCoordinates(graph, coordinates)) {
      const err = new Error('Coordinate non valide');
      err.name = 'Not_valid';
      throw err;
      
    }

    // Calcola il costo dei token
    const tokensCost = 0.01 * coordinates.length; //assumo che si paga per ogni coordinata

    // Verifica se l'utente ha sufficiente credito in token
    if (user.tokens < tokensCost) {
      const err = new Error('Credito insufficiente. Hai a disposizione ' + user.tokens);
      err.name = 'Insufficient_credit';
      throw err;    
    }

    // Sottrae i token dall'utente
    user.tokens -= tokensCost;
    await user.save();

    const remainingCredit = user.tokens;

    // Crea la richiesta di modifica
    const modificationRequest = await ModificationRequest.create({
      modelId,
      userId,
      coordinates: JSON.stringify(coordinates),
      status: 'Pending',
      tokensCost
    });

    return res.status(201).json({ message: 'Richiesta di modifica creata con successo.', modificationRequest, remainingCredit });
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

    // Trova la richiesta di modifica
    const modificationRequest = await ModificationRequest.findByPk(requestId);
    if (!modificationRequest) {
      const err = new Error('Richiesta di modifica non trovata');
      err.name = 'Not_found';
      throw err;
    }

    // Verifica che l'utente sia il creatore del modello
    const model = await OptimizationModel.findByPk(modificationRequest.modelId);
    if (!model || model.userId !== userId) {
      const err = new Error('Non sei il creatore del modello');
      err.name = 'Forbidden'; 
      throw err;    
     }

     if (modificationRequest.status !== 'Pending') {
      const err = new Error('Richiesta già : ' + modificationRequest.status);
      err.name = 'Not_found';
      throw err;
    }

    // Aggiorna lo stato della richiesta di modifica
    if (status === 'Accepted') {
      // Applica le modifiche al modello
      const graph = JSON.parse(model.graph);
      const coordinates = JSON.parse(modificationRequest.coordinates);
      coordinates.forEach(({ x, y }: { x: number, y: number }) => {
        graph[x][y] = graph[x][y] === 0 ? 1 : 0;
      });
      model.graph = JSON.stringify(graph);
      await model.save();
      // Rifiuta altre richieste di modifica 'Pending' per lo stesso modello
      await ModificationRequest.update(
        { status: 'Refused' },
        {
          where: {
            modelId: modificationRequest.modelId,
            id: { [Op.ne]: requestId }, // Escludi la richiesta corrente
            status: 'Pending'
          }
        }
      );
    }

    modificationRequest.status = status;
    await modificationRequest.save();

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
    // Verifica che il modello esista
    const model = await OptimizationModel.findByPk(modelId);
    if (!model) {
      const err = new Error('Modello non trovato');
      err.name = 'Not_found';
      throw err;
    }


    // Verifica che l'utente sia il creatore del modello
    if (model.userId !== userId) {
      const err = new Error('Non sei il creatore del modello');
      err.name = 'Forbidden'; 
      throw err;    
    }


    // Verifica che lo stato sia valido
    const validStatuses = ['Pending', 'Accepted', 'Rejected', 'Refused'];
    if (status && !validStatuses.includes(status as string)) {
      const err = new Error('Status non valido. Deve essere uno tra: Pending, Accepted, Rejected, Refused.');
      err.name = 'Not_valid';
      throw err;
    }

    // Ottieni lo storico delle richieste di modifica
    const whereClause: any = { modelId };
    if (status) {
      whereClause.status = status;
    }

    const modificationRequests = await ModificationRequest.findAll({ where: whereClause });

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
    // Verifica che il modello esista
    const model = await OptimizationModel.findByPk(modelId);
    if (!model) {
      const err = new Error('Modello non trovato');
      err.name = 'Not_found';
      throw err;
    }

    // Costruisce i filtri per la data
    const dateFilter: any = {};
    let start: Date | null = null;
    let end: Date | null = null;

    // Controllo e validazione delle date
    if (startDate) {
      const startString = startDate as string; // Cast a string
      start = new Date(startDate as string);
      const isValidStartDate = startString.match(/^\d{4}-\d{2}-\d{2}$/);
      
      if (!isValidStartDate || isNaN(start.getTime())) {
        const err = new Error('startDate non è valido. Assicurati di usare il formato YYYY-MM-DD.');
        err.name = 'Not_valid';
        throw err;
      }
      dateFilter[Op.gte] = start;
    }

    if (endDate) {
      const endString = endDate as string; // Cast a string
      end = new Date(endDate as string);
      const isValidEndDate = endString.match(/^\d{4}-\d{2}-\d{2}$/);

      if (!isValidEndDate || isNaN(end.getTime())) {
        const err = new Error('endDate non è valido. Assicurati di usare il formato YYYY-MM-DD.');
        err.name = 'Not_valid';
        throw err;
      }
      dateFilter[Op.lte] = end;
    }

    // Se entrambe le date sono presenti, verifica che startDate sia precedente a endDate
    if (start && end && start > end) {
      const err = new Error(`Intervallo di date non valido. Data inizio ${startDate} e data fine ${endDate}.`);
      err.name = 'Not_valid';
      throw err;
    }

    // Trova tutte le richieste di modifica per il modello specifico, applicando i filtri di data se presenti
    const modificationRequests = await ModificationRequest.findAll({
      where: {
        modelId,
        status: 'Accepted',
        ...(Object.keys(dateFilter).length > 0 && { updatedAt: dateFilter }),
      },
    });

    // Se non vengono trovate richieste di modifica
    if (modificationRequests.length === 0) {
      const err = new Error(`Nessuna richiesta di modifica trovata tra ${startDate ?? 'inizio'} ed ${endDate ?? 'fine'}.`);
      err.name = 'Not_found';
      throw err;
    }

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
