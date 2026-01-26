import { Request, Response, NextFunction } from 'express';
import { redis } from '../config/redis.js';

/**
 * Role-based rate limits (Requests per minute)
 */
const ROLE_LIMITS: Record<string, { windowMs: number; max: number }> = {
  MANAGER: { windowMs: 60_000, max: 500 },
  WAREHOUSE: { windowMs: 60_000, max: 200 },
  PRODUCTION: { windowMs: 60_000, max: 200 },
  MECHANIC: { windowMs: 60_000, max: 200 },
  QC: { windowMs: 60_000, max: 200 },
  ADMIN: { windowMs: 60_000, max: 1000 },
  ANONYMOUS: { windowMs: 60_000, max: 50 },
};

/**
 * Redis-backed rate limiting middleware
 */
export const rateLimiter = async (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;
  const role = user?.role || 'ANONYMOUS';
  const { windowMs, max } = ROLE_LIMITS[role] || ROLE_LIMITS.ANONYMOUS;

  const identifier = user?.id || req.ip || 'unknown';
  const endpoint = `${req.method}:${req.path}`;
  const key = `ratelimit:${identifier}:${endpoint}`;

  try {
    const current = await redis.incr(key);
    if (current === 1) {
      await redis.expire(key, windowMs / 1000);
    }

    if (current > max) {
      res.status(429).json({
        success: false,
        error: 'Too many requests',
        retryAfter: Math.ceil(windowMs / 1000),
      });
      return;
    }

    res.setHeader('X-RateLimit-Limit', max.toString());
    res.setHeader('X-RateLimit-Remaining', (max - current).toString());
    next();
  } catch (err) {
    // If Redis fails, allow the request to proceed (fail open)
    next();
  }
};
