import { Request, Response } from 'express';
import { QcService } from '../../services/quality/qc.service.js';
import { logger } from '../../config/logger.js';

export class QcController {
  static async createCheck(req: Request, res: Response) {
    try {
      const check = await QcService.createCheck(req.body, req.user?.id);
      res.status(201).json({ success: true, data: check });
    } catch (error: any) {
      logger.error('Create QC check failed', { error });
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async getCheck(req: Request, res: Response) {
      const { id } = req.params;
      res.json({ success: true, data: { id, result: 'PASSED' } });
  }

  static async updateCheck(req: Request, res: Response) {
      const { id } = req.params;
      res.json({ success: true, data: { id, ...req.body, status: 'UPDATED' } });
  }
}
