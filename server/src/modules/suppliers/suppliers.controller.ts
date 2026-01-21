import { Request, Response } from 'express';
import { SupplierService } from './suppliers.service';

export const SupplierController = {
  async getAll(_req: Request, res: Response) {
    try {
      const suppliers = await SupplierService.findAll();
      res.json({ status: 'success', data: suppliers });
    } catch (error: any) {
      console.error('[SUPPLIER ERROR]', error.message);
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const supplier = await SupplierService.findById(id as string);
      
      if (!supplier) {
        return res.status(404).json({ status: 'error', message: 'Supplier not found' });
      }

      res.json({ status: 'success', data: supplier });
    } catch (error: any) {
      console.error('[SUPPLIER ERROR]', error.message);
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  }
};
