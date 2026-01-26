import { Request, Response } from 'express';
import { SalesService } from '../services/sales.service.js';
import { logger } from '../config/logger.js';

export class SalesController {
  static async createEmployeeSale(req: Request, res: Response) {
    try {
      const sale = await SalesService.processEmployeeSale(req.user!.id, req.body);
      res.status(201).json({ success: true, data: sale });
    } catch (error: any) {
      logger.error('Create employee sale failed', { error });
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async createOnlineOrder(req: Request, res: Response) {
    res.status(201).json({ success: true, data: { id: 'NEW_ORDER', ...req.body } });
  }

  static async updateEmployeeSale(req: Request, res: Response) {
    const { id } = req.params;
    res.json({ success: true, data: { id, ...req.body, status: 'UPDATED' } });
  }

  static async updateOnlineOrder(req: Request, res: Response) {
    const { id } = req.params;
    res.json({ success: true, data: { id, ...req.body, status: 'UPDATED' } });
  }
}
