import { Router } from 'express';
import { AiController } from '../../controllers/system/ai.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';

const router = Router();

/**
 * Route: POST /api/v1/ai/chat
 * Protected by authentication
 */
router.post('/chat', authenticate, AiController.chat);

/**
 * Route: POST /api/v1/ai/translate
 * Protected by authentication
 */
router.post('/translate', authenticate, AiController.translate);

/**
 * Route: POST /api/v1/ai/detect-language
 * Protected by authentication
 */
router.post('/detect-language', authenticate, AiController.detectLanguage);

/**
 * Route: POST /api/v1/ai/translate/batch
 * Protected by authentication
 */
router.post('/translate/batch', authenticate, AiController.translateBatch);

export default router;
