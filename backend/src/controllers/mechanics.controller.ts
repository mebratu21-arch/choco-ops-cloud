import { Request, Response } from 'express';
import { MechanicsService } from '../services/mechanics.service.js';
import { logger } from '../config/logger.js';

export class MechanicsController {
  static async logFix(req: Request, res: Response) {
    try {
      const fix = await MechanicsService.logFix(req.body, req.user?.id);
      res.status(201).json({ success: true, data: fix });
    } catch (error: any) {
      logger.error('Log fix failed', { error });
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async getFix(req: Request, res: Response) {
      const { id } = req.params;
      res.json({ success: true, data: { id, description: 'Mocked fix retrieval' } });
  }

  static async updateFix(req: Request, res: Response) {
      const { id } = req.params;
      res.json({ success: true, data: { id, ...req.body, status: 'UPDATED' } });
  }
}
