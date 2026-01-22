import { Router } from 'express';
import { AuthController } from '../../controllers/auth.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { authLimiter } from '../../middleware/rate-limit.middleware.js';
import { RegisterRequestSchema, LoginRequestSchema, RefreshTokenSchema } from '../../schemas/auth.schema.js';

const router = Router();

// Public routes with rate limiting
router.post('/register', authLimiter, validate(RegisterRequestSchema), AuthController.register);
router.post('/login', authLimiter, validate(LoginRequestSchema), AuthController.login);
router.post('/refresh', validate(RefreshTokenSchema), AuthController.refresh);

// Protected routes
router.get('/profile', authenticate, AuthController.getProfile);
router.post('/logout', authenticate, AuthController.logout);

export default router;
