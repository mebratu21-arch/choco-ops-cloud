import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { errorResponse } from '../utils/responseHandler.js';
import { UserRole, JWTPayload } from '../types/index.js';
import { env } from '../config/env.js';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return errorResponse(res, 'Access denied. No token provided.', 401);
  }

  try {
    const secret = env.JWT_SECRET;
    const decoded = jwt.verify(token, secret) as JWTPayload;
    req.user = decoded;
    next();
  } catch (error) {
    return errorResponse(res, 'Invalid or expired token.', 401, error);
  }
};

export const authorizeRoles = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return errorResponse(res, 'User not authenticated.', 401);
    }

    const userRole = req.user.role.toLowerCase() as UserRole;
    if (!allowedRoles.includes(userRole)) {
      return errorResponse(res, `Access denied. Role '${req.user.role}' is not authorized.`, 403);
    }

    next();
  };
};
