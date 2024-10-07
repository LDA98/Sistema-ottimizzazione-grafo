import { Request, Response, NextFunction } from 'express';
import { Handler } from '../interfaces/Handler'; // Importa l'interfaccia Handler

class MiddlewareChain {
  private handlers: Handler[] = [];

  // Aggiunge un handler alla catena
  addHandler(handler: Handler): MiddlewareChain {
    this.handlers.push(handler);
    return this;
  }

  // Esegue la catena di middleware
  execute(req: Request, res: Response, next: NextFunction): void {
    const executeHandler = (index: number) => {
      // Verifica se ci sono handler rimanenti nella catena
      if (index < this.handlers.length) {
        const handler = this.handlers[index];
        
        // Esegui l'handler e gestisci il flusso
        handler.handle(req, res, (err) => {
          if (err) {
            next(err); // Passa l'errore al middleware di gestione degli errori
          } else {
            executeHandler(index + 1); // Passa al prossimo handler
          }
        });
      } else {
        next(); // Tutti gli handler sono stati eseguiti, prosegui con la richiesta
      }
    };

    executeHandler(0); // Inizia l'esecuzione dalla prima posizione
  }
}

export default MiddlewareChain;
