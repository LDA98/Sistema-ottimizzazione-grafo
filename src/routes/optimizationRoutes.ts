import { Router } from 'express';
import OptimizationController from '../controllers/optimizationController';
import AdminController from '../controllers/adminController';
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
}, OptimizationController.createOptimizationModel);

router.post('/execute/:modelId', (req, res, next) => {
  userMiddlewareChain.execute(req, res, next);
}, OptimizationController.executeOptimizationModel);

// Rotte per richiesta di modifica
router.post('/models/:modelId/modification-requests', (req, res, next) => {
  userMiddlewareChain.execute(req, res, next);
}, OptimizationController.createModificationRequest);

router.put('/modification-requests/:requestId', (req, res, next) => {
  userMiddlewareChain.execute(req, res, next);
}, OptimizationController.updateModificationRequestStatus);

router.get('/models/:modelId/modification-requests', (req, res, next) => {
  userMiddlewareChain.execute(req, res, next);
}, OptimizationController.getModificationRequestsHistory);

router.get('/models/:modelId/modifications', (req, res, next) => {
  userMiddlewareChain.execute(req, res, next);
}, OptimizationController.getModificationRequests);

// Rotta per ricaricare i crediti dell'utente
router.post('/recharge', (req, res, next) => {
  adminMiddlewareChain.execute(req, res, next);
}, AdminController.rechargeUserCredits);

export default router;
