import { Request, Response, NextFunction } from 'express';

export interface Handler {
  handle(req: Request, res: Response, next: NextFunction): void;
}
