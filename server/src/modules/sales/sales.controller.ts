import { Request, Response } from 'express';
import { SalesService } from './sales.service';

export const SalesController = {
  async getAll(_req: Request, res: Response) {
    try {
      const sales = await SalesService.findAll();
      res.json({ status: 'success', data: sales });
    } catch (error: any) {
      console.error('[SALES ERROR]', error.message);
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  },

  async getStats(_req: Request, res: Response) {
    try {
      const stats = await SalesService.getRevenueStats();
      res.json({ status: 'success', data: stats });
    } catch (error: any) {
      console.error('[SALES ERROR]', error.message);
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  }
};
