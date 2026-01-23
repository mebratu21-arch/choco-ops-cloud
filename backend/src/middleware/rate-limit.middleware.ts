import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per IP
  message: { success: false, error: 'Too many login attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const inventoryLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 min
  max: 10,
  message: { success: false, error: 'Too many stock updates — wait 60s' },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: any) => req.user?.id || req.ip, // prefer user ID
});

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { success: false, error: 'Rate limit exceeded' },
});
