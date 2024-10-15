import { Request, Response, NextFunction } from 'express';  

// Definizione dell'interfaccia `Handler`, che rappresenta un gestore (handler) nella catena di responsabilità (Chain of Responsibility - CoR)
export interface Handler {
  /* 
    Definisce un metodo `handle` che riceve tre parametri:
      - `req`: l'oggetto Request di Express, che rappresenta la richiesta HTTP.
      - `res`: l'oggetto Response di Express, che rappresenta la risposta HTTP.
      - `next`: il metodo NextFunction di Express, che viene chiamato per passare la richiesta al prossimo middleware nella catena.
  */ 
  handle(req: Request, res: Response, next: NextFunction): void;
}
