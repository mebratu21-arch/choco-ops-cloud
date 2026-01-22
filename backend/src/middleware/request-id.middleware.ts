import { v4 as uuidv4 } from 'uuid';
import { Request, Response, NextFunction } from 'express';

export function requestId(req: Request, res: Response, next: NextFunction) {
  const requestId = req.headers['x-request-id'] || uuidv4();
  req.requestId = requestId as string;
  res.setHeader('X-Request-ID', requestId);
  next();
}
