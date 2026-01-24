import { Request, Response } from 'express';
import { QcService } from '../services/qc.service.js';

export class QcController {
  static async updateBatch(req: Request & { user?: any }, res: Response) {
    try {
      const input = req.body;
      const userId = req.user.id; // User must be attached by auth middleware

      const updated = await QcService.updateBatch(input, userId);

      res.json({ success: true, message: 'Batch updated', data: updated });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
}
