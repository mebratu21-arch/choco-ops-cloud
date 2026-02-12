import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/identity/auth.service.js';
import { JWTPayload } from '../types/index.js';

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.warn('[AUTH] No Bearer token provided in header');
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    const token = authHeader.substring(7);
    const payload = AuthService.verifyAccessToken(token);
    
    if (!payload || !payload.id) {
        console.error('[AUTH] Invalid token payload structure:', payload);
        throw new Error('Invalid token payload');
    }

    req.user = payload;
    next();
  } catch (error: any) {
    console.error('[AUTH] Verification failed:', error.message);
    res.status(401).json({ 
        error: 'Invalid or expired token',
        message: error.message 
    });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const userRole = req.user.role.toUpperCase();
    const allowedRoles = roles.map(r => r.toUpperCase());

    if (!allowedRoles.includes(userRole)) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }

    next();
  };
};

// Aliases for backward compatibility
export const authMiddleware = authenticate;
export const requireRole = (roles: string | string[]) => {
  const roleList = Array.isArray(roles) ? roles : [roles];
  return authorize(...roleList);
};
export const restrictTo = (...roles: string[]) => authorize(...roles);
