import { Request, Response, NextFunction } from 'express';
import User from '../models/users';

class AdminController {
  async rechargeUserCredits(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
  const { email, newCredits } = req.body;

  try {
    // Verifica se i crediti sono un valore valido
    if (newCredits <= 0) {
      const err = new Error('L\'importo dei crediti deve essere maggiore di zero.');
      err.name = 'Not_valid';
      throw err;
    }

    // Trova l'utente tramite email
    const user = await User.getUserByEmail(email);

    // Ricarica il credito dell'utente
    user.tokens += newCredits; // Aggiunge i nuovi crediti
    await user.save(); // Salva le modifiche nel database

    return res.status(200).json({ message: 'Credito ricaricato con successo.', user });
  } catch (error) {
    next(error);
  }
  };
}

export default new AdminController();

