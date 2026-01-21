import { Request, Response } from 'express';
import { WarehouseService } from './warehouse.service';

export const WarehouseController = {
  async getStock(_req: Request, res: Response) {
    try {
      const stock = await WarehouseService.findAll();
      res.json({ status: 'success', data: stock });
    } catch (error: any) {
      console.error('[WAREHOUSE ERROR]', error.message);
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  },

  async getMovements(_req: Request, res: Response) {
    try {
      const movements = await WarehouseService.getMovements();
      res.json({ status: 'success', data: movements });
    } catch (error: any) {
      console.error('[WAREHOUSE ERROR]', error.message);
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  }
};
