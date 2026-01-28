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

  /**
   * Translate text using Gemini with artisan chocolatier context
   */
  static async translate(req: Request, res: Response) {
    try {
      const { text, targetLanguage, context } = req.body;

      // Validation
      if (!text || typeof text !== 'string') {
        return res.status(400).json({ 
          success: false, 
          error: 'Text is required and must be a string' 
        });
      }

      if (!targetLanguage || typeof targetLanguage !== 'string') {
        return res.status(400).json({ 
          success: false, 
          error: 'Target language is required' 
        });
      }

      const translation = await AiService.translate(text, targetLanguage, context);

      res.json({ 
        success: true, 
        data: { translation } 
      });
    } catch (error: any) {
      logger.error('AI Controller: Translation failed', { error: error.message });
      res.status(500).json({ 
        success: false, 
        error: 'Translation failed' 
      });
    }
  }

  /**
   * Detect language of text using Gemini AI
   */
  static async detectLanguage(req: Request, res: Response) {
    try {
      const { text } = req.body;

      if (!text || typeof text !== 'string') {
        return res.status(400).json({ 
          success: false, 
          error: 'Text is required and must be a string' 
        });
      }

      const languageCode = await AiService.detectLanguage(text);

      res.json({ 
        success: true, 
        data: { languageCode } 
      });
    } catch (error: any) {
      logger.error('AI Controller: Language detection failed', { error: error.message });
      res.status(500).json({ 
        success: false, 
        error: 'Language detection failed' 
      });
    }
  }

  /**
   * Batch translate multiple texts
   */
  static async translateBatch(req: Request, res: Response) {
    try {
      const { texts, targetLanguage, context } = req.body;

      // Validation
      if (!Array.isArray(texts) || texts.length === 0) {
        return res.status(400).json({ 
          success: false, 
          error: 'Texts must be a non-empty array' 
        });
      }

      if (texts.length > 50) {
        return res.status(400).json({ 
          success: false, 
          error: 'Maximum batch size is 50 texts' 
        });
      }

      if (!targetLanguage || typeof targetLanguage !== 'string') {
        return res.status(400).json({ 
          success: false, 
          error: 'Target language is required' 
        });
      }

      const result = await AiService.translateBatch(texts, targetLanguage, context);

      res.json({ 
        success: true, 
        data: result 
      });
    } catch (error: any) {
      logger.error('AI Controller: Batch translation failed', { error: error.message });
      res.status(500).json({ 
        success: false, 
        error: 'Batch translation failed' 
      });
    }
  }
}
