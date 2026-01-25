import { Request, Response } from 'express';
import { ProductionService } from '../services/production.service.js';

export class ProductionController {
  static async createBatch(req: Request & { user?: any }, res: Response) {
    try {
      const input = req.body;
      const userId = req.user.id;

      const batch = await ProductionService.createBatch(input, userId);

      res.status(201).json({
        success: true,
        message: 'Batch created successfully',
        data: batch,
      });
    } catch (error: any) {
      res.status(error.statusCode || 400).json({
        success: false,
        error: error.message || 'Failed to create batch',
      });
    }
  }

  static async getBatches(req: Request, res: Response) {
    try {
      const batches = await ProductionService.getBatches();
      res.json({ success: true, count: batches.length, data: batches });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to fetch batches' });
    }
  }
}
