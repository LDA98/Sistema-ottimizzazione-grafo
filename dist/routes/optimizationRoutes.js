"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const optimizationController_1 = require("../controllers/optimizationController");
const adminController_1 = require("../controllers/adminController");
const authenticateJWT_1 = __importDefault(require("../middleware/authenticateJWT"));
const checkUserTokens_1 = __importDefault(require("../middleware/checkUserTokens"));
const authenticateAdmin_1 = __importDefault(require("../middleware/authenticateAdmin"));
const middlewareChain_1 = __importDefault(require("../middleware/middlewareChain"));
const router = (0, express_1.Router)();
// Creiamo le istanze degli handler
const authenticateJWT = new authenticateJWT_1.default();
const checkUserTokens = new checkUserTokens_1.default();
const authenticateAdmin = new authenticateAdmin_1.default();
// Catena di middleware per autenticazione e verifica token
const userMiddlewareChain = new middlewareChain_1.default()
    .addHandler(authenticateJWT)
    .addHandler(checkUserTokens);
// Catena di middleware per autenticazione e verifica permessi admin
const adminMiddlewareChain = new middlewareChain_1.default()
    .addHandler(authenticateJWT)
    .addHandler(authenticateAdmin);
// Rotte modelli
router.post('/create-model', (req, res, next) => {
    userMiddlewareChain.execute(req, res, next);
}, optimizationController_1.createOptimizationModel);
router.post('/execute/:modelId', (req, res, next) => {
    userMiddlewareChain.execute(req, res, next);
}, optimizationController_1.executeOptimizationModel);
// Rotte per richiesta di modifica
router.post('/models/:modelId/modification-requests', (req, res, next) => {
    userMiddlewareChain.execute(req, res, next);
}, optimizationController_1.createModificationRequest);
router.put('/modification-requests/:requestId', (req, res, next) => {
    userMiddlewareChain.execute(req, res, next);
}, optimizationController_1.updateModificationRequestStatus);
router.get('/models/:modelId/modification-requests', (req, res, next) => {
    userMiddlewareChain.execute(req, res, next);
}, optimizationController_1.getModificationRequestsHistory);
router.get('/models/:modelId/modifications', (req, res, next) => {
    userMiddlewareChain.execute(req, res, next);
}, optimizationController_1.getModificationRequests);
// Rotta per ricaricare i crediti dell'utente
router.post('/recharge', (req, res, next) => {
    adminMiddlewareChain.execute(req, res, next);
}, adminController_1.rechargeUserCredits);
exports.default = router;
