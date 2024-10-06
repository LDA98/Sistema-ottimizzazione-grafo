import { Router } from 'express';
import { createOptimizationModel, executeOptimizationModel, createModificationRequest, updateModificationRequestStatus, getModificationRequestsHistory, getModificationRequests } from '../controllers/optimizationController';
import {rechargeUserCredits} from '../controllers/adminController';
import authenticateJWT from '../middleware/authenticateJWT';
import checkUserTokens from '../middleware/checkUserTokens'; 
import authenticateAdmin from '../middleware/authenticateAdmin'; 


const router = Router();

// Rotte modelli 
router.post('/create-model', authenticateJWT, checkUserTokens, createOptimizationModel); // Rotta per la creazione del modello
router.post('/execute/:modelId', authenticateJWT, checkUserTokens, executeOptimizationModel); // Rotta per eseguire il modello

// Creare una richiesta di modifica
router.post('/models/:modelId/modification-requests', authenticateJWT, checkUserTokens, createModificationRequest);

// Aggiornare lo stato di una richiesta di modifica
router.put('/modification-requests/:requestId', authenticateJWT, checkUserTokens, updateModificationRequestStatus);

// Visualizzare lo storico delle richieste di modifica
router.get('/models/:modelId/modification-requests', authenticateJWT, checkUserTokens, getModificationRequestsHistory);

// Visualizzare lo storico degli aggiornamenti effettuati del modello
router.get('/models/:modelId/modifications', authenticateJWT, checkUserTokens, getModificationRequests);

// Rotta per ricaricare i crediti dell'utente
router.post('/recharge',authenticateJWT, authenticateAdmin, rechargeUserCredits);

export default router;
