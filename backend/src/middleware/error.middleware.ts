import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  logger.error('Error caught in global handler', {
    error: err.message,
    stack: err.stack,
    requestId: req.requestId,
    method: req.method,
    path: req.path,
  });

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
    });
  }

  // Handle generic errors
  return res.status(500).json({
    success: false,
    error: 'Internal Server Error',
  });
}
