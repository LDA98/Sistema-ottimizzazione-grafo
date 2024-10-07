import { Router } from 'express';
import { createOptimizationModel, executeOptimizationModel, createModificationRequest, updateModificationRequestStatus, getModificationRequestsHistory, getModificationRequests } from '../controllers/optimizationController';
import { rechargeUserCredits } from '../controllers/adminController';
import AuthenticateJWT from '../middleware/authenticateJWT';
import CheckUserTokens from '../middleware/checkUserTokens';
import AuthenticateAdmin from '../middleware/authenticateAdmin';
import MiddlewareChain from '../middleware/middlewareChain';

const router = Router();

// Creiamo le istanze degli handler
const authenticateJWT = new AuthenticateJWT();
const checkUserTokens = new CheckUserTokens();
const authenticateAdmin = new AuthenticateAdmin();

// Catena di middleware per autenticazione e verifica token
const userMiddlewareChain = new MiddlewareChain()
  .addHandler(authenticateJWT)
  .addHandler(checkUserTokens);

// Catena di middleware per autenticazione e verifica permessi admin
const adminMiddlewareChain = new MiddlewareChain()
  .addHandler(authenticateJWT)
  .addHandler(authenticateAdmin);

// Rotte modelli
router.post('/create-model', (req, res, next) => {
  userMiddlewareChain.execute(req, res, next);
}, createOptimizationModel);

router.post('/execute/:modelId', (req, res, next) => {
  userMiddlewareChain.execute(req, res, next);
}, executeOptimizationModel);

// Rotte per richiesta di modifica
router.post('/models/:modelId/modification-requests', (req, res, next) => {
  userMiddlewareChain.execute(req, res, next);
}, createModificationRequest);

router.put('/modification-requests/:requestId', (req, res, next) => {
  userMiddlewareChain.execute(req, res, next);
}, updateModificationRequestStatus);

router.get('/models/:modelId/modification-requests', (req, res, next) => {
  userMiddlewareChain.execute(req, res, next);
}, getModificationRequestsHistory);

router.get('/models/:modelId/modifications', (req, res, next) => {
  userMiddlewareChain.execute(req, res, next);
}, getModificationRequests);

// Rotta per ricaricare i crediti dell'utente
router.post('/recharge', (req, res, next) => {
  adminMiddlewareChain.execute(req, res, next);
}, rechargeUserCredits);

export default router;
