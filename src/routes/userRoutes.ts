import { Router } from 'express';
import UserController from '../controllers/userController';


const router = Router();

// Rotte utenti
router.post('/register', UserController.register);
router.post('/login', UserController.login);

export default router;
