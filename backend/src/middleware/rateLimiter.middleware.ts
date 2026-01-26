import { Request, Response, NextFunction } from 'express';
import { db } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../config/logger.js';

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
}

const rateLimitsByRole: Record<string, RateLimitConfig> = {
  ADMIN: { windowMs: 60000, maxRequests: 1000 },
  MANAGER: { windowMs: 60000, maxRequests: 500 },
  OPERATOR: { windowMs: 60000, maxRequests: 200 },
  QC: { windowMs: 60000, maxRequests: 200 },
  SALES: { windowMs: 60000, maxRequests: 200 },
  ANONYMOUS: { windowMs: 60000, maxRequests: 50 },
};

export const rateLimiter = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const identifier = req.user?.id || req.ip || 'unknown'; // Note: req.user.id based on my type def, user snippet had userId. I'll use id as I standardized on it.
    const role = req.user?.role || 'ANONYMOUS';
    const endpoint = `${req.method}:${req.path}`;
   
    const config = rateLimitsByRole[role] || rateLimitsByRole['ANONYMOUS'];
    const windowStart = new Date(Date.now() - config.windowMs);
   
    // Clean old entries
    await db('rate_limits')
      .where('window_start', '<', windowStart)
      .delete();
   
    // Get current count
    const existing = await db('rate_limits')
      .where({ identifier, endpoint })
      .where('window_start', '>=', windowStart)
      .first();
   
    if (existing) {
      if (existing.request_count >= config.maxRequests) {
        logger.warn(`Rate limit exceeded for ${identifier} on ${endpoint}`);
        res.status(429).json({
          error: 'Too many requests',
          retryAfter: Math.ceil(config.windowMs / 1000),
        });
        return;
      }
     
      // Increment counter
      await db('rate_limits')
        .where({ id: existing.id })
        .increment('request_count', 1);
    } else {
      // Create new entry
      await db('rate_limits').insert({
        id: uuidv4(),
        identifier,
        endpoint,
        request_count: 1,
        window_start: new Date(),
      });
    }
   
    // Add rate limit headers
    const remaining = config.maxRequests - (existing?.request_count || 0) - 1;
    res.setHeader('X-RateLimit-Limit', config.maxRequests);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, remaining));
    res.setHeader('X-RateLimit-Reset', Date.now() + config.windowMs);
   
    next();
  } catch (error) {
    logger.error('Rate limiter error:', error);
    // Don't block request on rate limiter error
    next();
  }
};
