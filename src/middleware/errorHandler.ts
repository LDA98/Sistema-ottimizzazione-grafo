import { Request, Response, NextFunction } from 'express';
import { ValidationError, UniqueConstraintError } from 'sequelize';


// Middleware di gestione degli errori
const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Errore:', err.stack); // Log dell'errore per debugging

  // Gestione degli errori Sequelize
  if (err instanceof ValidationError || err instanceof UniqueConstraintError) {
    return res.status(400).json({
      error: err.errors.map((e: any) => e.message),
    });
  }

  // Gestione di errori personalizzati basati sul nome dell'errore
  
  if (err.name === 'Not_found') {
    // Restituisci un errore 400 se l'errore indica che qualcosa non è stato trovato
    return res.status(400).json({ error: err.message });
  }

  if (err.name === 'Unauthorized') {
    // Restituisci un errore 401 per accesso non autorizzato
    return res.status(401).json({ error: err.message });
  }

  if (err.name === 'Insufficient_credit') {
    // Restituisci un errore 402 se ci sono crediti insufficienti
    return res.status(402).json({ error: err.message });
  }

  if (err.name === 'Forbidden') {
    // Restituisci un errore 403 se l'accesso è vietato
    return res.status(403).json({ error: err.message });
  }

  if (err.name === 'Not_valid') {
    // Restituisci un errore 422 se i dati forniti non sono validi
    return res.status(422).json({ error: err.message });
  }

  // Risposta di default per altri errori interni

  // Restituisci un errore 500 (Internal Server Error) per errori non gestiti
  return res.status(500).json({
    error: 'Errore interno del server',
  });
};


export default errorHandler;
