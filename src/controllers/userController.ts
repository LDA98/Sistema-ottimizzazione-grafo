import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/users';


class UserController{

  // Funzione per la registrazione
  async register(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    const { email, password, isAdmin } = req.body;

    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      // Crea un nuovo utente
      const newUser = await User.create({
        email,
        password: hashedPassword,
        tokens: isAdmin ? 1000 : 10,
        isAdmin: isAdmin || false,
      });

      const message = isAdmin ? 'Admin registrato con successo' : 'Utente registrato con successo';
      return res.status(201).json({ message, user: newUser });
    } catch (error) {
      next(error);
    }
  };

  // Funzione per il login
  async login(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    const { email, password } = req.body;

    try {
      // Verifica ed ottiene l'utente data l'email
      const user = await User.getUserByEmail(email as string);

      // Confronta la password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        const err = new Error('Password non valida');
        err.name = 'Unauthorized'; 
        throw err; 
      }

      // Genera un token JWT
      const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET!, { expiresIn: '1h' });

      const message = user.isAdmin ? 'Accesso amministrativo effettuato con successo' : 'Login effettuato con successo';
      return res.status(200).json({ message, token });
    } catch (error) {
      next(error);
    }
  };
}

export default new UserController();
