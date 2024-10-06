import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/users';

const register = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  const { email, password, isAdmin } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      email,
      password: hashedPassword,
      tokens: isAdmin ? 0 : 10,
      isAdmin: isAdmin || false,
    });

    const message = isAdmin ? 'Admin registrato con successo' : 'Utente registrato con successo';
    return res.status(201).json({ message, user: newUser });
  } catch (error) {
    next(error);
  }
};

const login = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      const err = new Error('Utente non trovato');
      err.name = 'Not_found';
      throw err;
    }

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

export { register, login };
