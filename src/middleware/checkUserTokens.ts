import { Request, Response, NextFunction } from 'express';
import User from '../models/users';

const checkUserTokens = async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).userId; 

  try {
    // Trova l'utente per ID
    const user = await User.findByPk(userId);

    if (!user) {
        const err = new Error('Utente non trovato');
        err.name = 'Not_found';
        throw err;
    }

    // Verifica se l'utente ha 0 token
    if (user.tokens <= 0) {
      const err = new Error('Credito terminato per effettuare richieste');
      err.name = 'Unauthorized';
      throw err;
    }

    next(); // L'utente ha sufficienti token, quindi prosegui
  } catch (error) {
    next(error);
  }
};

export default checkUserTokens;
