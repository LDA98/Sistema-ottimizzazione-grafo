import { Request, Response, NextFunction } from 'express';
import User from '../models/users';
import { Handler } from '../interfaces/Handler';

class AuthenticateAdmin implements Handler {

  /*
    Implementa il metodo `handle` definito nell'interfaccia `Handler`
    Metodo che gestisce l'autenticazione di un utente admin
  */ 
  async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Estrae l'ID utente dalla richiesta (iniettato nel middleware di autenticazione JWT)
      const userId = (req as any).userId;

      // Verifica ed ottine l'utente che ha effettuato la richiesta
      const user = await User.findUserOrCheckTokens(userId);

      // Verifica che l'utente sia Admin
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
