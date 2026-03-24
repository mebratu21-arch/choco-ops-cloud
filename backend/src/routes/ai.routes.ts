import { Router } from 'express';
import * as aiController from '../controllers/aiController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// AI features should be protected (rate limiter applied in app.ts)
router.use(authenticateToken);

router.post('/chat', aiController.chat);
router.post('/translate', aiController.translate);
router.get('/history', aiController.getChatHistory);
router.delete('/history', aiController.clearChatHistory);
router.post('/recommendations', aiController.getRecommendations);
router.get('/status', aiController.getStatus);

export default router;
