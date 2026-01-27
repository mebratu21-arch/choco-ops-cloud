import { Request, Response } from 'express';
import { DashboardService } from '../../services/system/dashboard.service.js';
import { logger } from '../../config/logger.js';

export class DashboardController {
  static async getStats(req: Request & { user?: any }, res: Response) {
    try {
      const stats = await DashboardService.getStats();
      res.json({ success: true, data: stats });
    } catch (error: any) {
      logger.error('Dashboard failed', { error: error.message, userId: req.user?.id });
      res.status(500).json({ success: false, error: 'Failed to load dashboard stats' });
    }
  }
}
