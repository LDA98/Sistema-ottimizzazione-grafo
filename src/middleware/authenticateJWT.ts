import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Handler } from '../interfaces/Handler'; // Importa l'interfaccia

class AuthenticateJWT implements Handler {
  handle(req: Request, res: Response, next: NextFunction): void {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      const error = new Error('Token mancante');
      error.name = 'Not_found';
      return next(error); 
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!);
      (req as any).userId = (decoded as any).userId; // Estrai userId dal token decodificato
      next(); // utente autenticato può continuare la richiesta
    } catch (err) {
      const error = new Error('Token non valido');
      error.name = 'Forbidden';
      return next(error); 
    }
  }
}

export default AuthenticateJWT;
