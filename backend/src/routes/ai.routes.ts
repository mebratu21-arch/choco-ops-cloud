import { Router } from 'express';
import * as aiController from '../controllers/aiController.js';
import { authenticateToken } from '../middleware/auth.js';
import { rateLimiter } from '../middleware/rate-limit.middleware.js';

const router = Router();

// AI features should be protected and rate limited
router.use(authenticateToken);
router.use(rateLimiter);

router.post('/chat', aiController.chat);
router.post('/translate', aiController.translate);
router.get('/history', aiController.getChatHistory); // Added
router.post('/recommendations', aiController.getRecommendations); // Added


export default router;
