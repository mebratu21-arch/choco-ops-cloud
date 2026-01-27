import { Request, Response } from 'express';
import { AiService } from '../../services/system/ai.service.js';
import { logger } from '../../config/logger.js';

/**
 * Controller for AI-powered interactions
 */
export class AiController {
  /**
   * Post a chat message to Gemini
   */
  static async chat(req: Request, res: Response) {
    try {
      const { message, page, images } = req.body;
      const user = (req as any).user;

      const response = await AiService.chat(message, {
        userId: user.id,
        userRole: user.role,
        page,
        images
      });

      res.json({ success: true, data: response });
    } catch (error: any) {
      logger.error('AI Controller: Chat failed', { error: error.message });
      res.status(500).json({ success: false, error: 'AI interaction failed' });
    }
  }
}
