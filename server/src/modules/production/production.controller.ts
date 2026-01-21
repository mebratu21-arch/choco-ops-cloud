import { Request, Response } from 'express';
import { ProductionService } from './production.service';

export const ProductionController = {
  async getAll(_req: Request, res: Response) {
    try {
      const batches = await ProductionService.findAll();
      res.json({ status: 'success', data: batches });
    } catch (error: any) {
      console.error('[PRODUCTION ERROR]', error.message);
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const batch = await ProductionService.findById(id as string);
      
      if (!batch) {
        return res.status(404).json({ status: 'error', message: 'Batch not found' });
      }

      res.json({ status: 'success', data: batch });
    } catch (error: any) {
      console.error('[PRODUCTION ERROR]', error.message);
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  }
};
