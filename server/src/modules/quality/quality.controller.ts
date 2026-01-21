import { Request, Response } from 'express';
import { QualityService } from './quality.service';

export const QualityController = {
  async getAll(_req: Request, res: Response) {
    try {
      const checks = await QualityService.findAll();
      res.json({ status: 'success', data: checks });
    } catch (error: any) {
      console.error('[QUALITY ERROR]', error.message);
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  }
};
