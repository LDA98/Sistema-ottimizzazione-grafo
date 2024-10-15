import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Handler } from '../interfaces/Handler'; // Importa l'interfaccia

class AuthenticateJWT implements Handler {
  handle(req: Request, res: Response, next: NextFunction): void {

    // Estrae il token dalla richiesta HTTP, che è nel formato "Bearer <token>"
    const token = req.headers.authorization?.split(' ')[1];

    // Verifica se il token è presente
    if (!token) {
      const error = new Error('Token mancante');
      error.name = 'Not_found';
      return next(error); 
    }

    try {
      
      // Verifica e decodifica il token utilizzando la chiave segreta JWT
      const decoded = jwt.verify(token, process.env.JWT_SECRET!);

      // Assegna l'ID utente decodificato dal token alla richiesta in modo da poterlo usare nei successivi middleware o controller
      (req as any).userId = (decoded as any).userId; 
      
      next(); // utente autenticato può continuare la richiesta
    } catch (err) {
      const error = new Error('Token non valido');
      error.name = 'Forbidden';
      return next(error); 
    }
  }
}

export default AuthenticateJWT;
