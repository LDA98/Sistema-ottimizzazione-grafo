import { Request, Response, NextFunction } from 'express';
import User from '../models/users';
import { Handler } from '../interfaces/Handler'; // Importa l'interfaccia

class AuthenticateAdmin implements Handler {
  async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).userId;

      const user = await User.findByPk(userId);

      if (!user || !user.isAdmin) {
        const err = new Error('Accesso negato: permessi amministrativi richiesti');
        err.name = 'Forbidden';
        throw err;
      }

      next(); // L'utente è un admin, procedere con la richiesta
    } catch (error) {
      next(error);
    }
  }
}

export default AuthenticateAdmin;
