import { Request, Response } from 'express';
import { RawMaterialService } from './raw-materials.service';

export const RawMaterialController = {
  async getAll(_req: Request, res: Response) {
    try {
      const materials = await RawMaterialService.findAll();
      res.json({ status: 'success', data: materials });
    } catch (error: any) {
      console.error('[MATERIAL ERROR]', error.message);
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  },

  async getLowStock(_req: Request, res: Response) {
    try {
      const lowStock = await RawMaterialService.getLowStock();
      res.json({ status: 'success', data: lowStock });
    } catch (error: any) {
      console.error('[MATERIAL ERROR]', error.message);
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  }
};
