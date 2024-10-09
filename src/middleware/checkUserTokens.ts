import { Request, Response, NextFunction } from 'express';
import User from '../models/users';
import { Handler } from '../interfaces/Handler'; // Importa l'interfaccia

class CheckUserTokens implements Handler {
  async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
    const userId = (req as any).userId;

    try {
      // Trova l'utente per ID
      const user = await User.findUserOrCheckTokens(userId);

      // Verifica se l'utente ha 0 token
      if (user.tokens <= 0) {
        const err = new Error('Credito terminato per effettuare richieste');
        err.name = 'Unauthorized';
        throw err;
      }

      next(); // L'utente ha ancora token, quindi prosegui
    } catch (error) {
      next(error);
    }
  }
}

export default CheckUserTokens;
