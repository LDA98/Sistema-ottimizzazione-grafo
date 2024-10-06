import { Request, Response, NextFunction } from 'express';
import User from '../models/users';

const authenticateAdmin = async (req: Request, res: Response, next: NextFunction) => {
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
};

export default authenticateAdmin;
