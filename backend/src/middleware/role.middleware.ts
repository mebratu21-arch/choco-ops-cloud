import { Request, Response, NextFunction } from 'express';
import { ForbiddenError } from '../utils/errors.js';

/**
 * Middleware to restrict access to specific roles
 * @param roles Allowed roles
 */
export const restrictTo = (...roles: string[]) => {
  return (req: Request & { user?: any }, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ForbiddenError('Forbidden: insufficient permissions'));
    }
    next();
  };
};
