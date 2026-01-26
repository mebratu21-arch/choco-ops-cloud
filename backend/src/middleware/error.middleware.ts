import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger.js';
import { env } from '../config/env.js';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  logger.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
  });
 
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.message,
      ...(env.NODE_ENV === 'development' && { stack: err.stack }),
    });
    return;
  }
 
  // Unhandled errors
  res.status(500).json({
    error: 'Internal server error',
    ...(env.NODE_ENV === 'development' && {
      message: err.message,
      stack: err.stack,
    }),
  });
};
