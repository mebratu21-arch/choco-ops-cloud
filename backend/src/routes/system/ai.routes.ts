import { Router } from 'express';
import { AiController } from '../../controllers/system/ai.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';

const router = Router();

/**
 * Route: POST /api/v1/ai/chat
 * Protected by authentication
 */
router.post('/chat', authenticate, AiController.chat);

export default router;
