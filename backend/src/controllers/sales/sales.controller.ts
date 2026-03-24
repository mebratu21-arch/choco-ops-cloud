import { Request, Response } from 'express';
import { SalesService } from '../../services/sales/sales.service.js';
import { SalesRepository } from '../../repositories/sales/sales.repository.js';
import { logger } from '../../config/logger.js';

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

  static async getAllOrders(req: Request, res: Response) {
    try {
      const orders = await SalesService.getOnlineOrders();
      res.json({ success: true, data: orders });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getAllEmployeeSales(req: Request, res: Response) {
    try {
      const sales = await SalesRepository.getAllEmployeeSales();
      res.json({ success: true, data: sales });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async verifyCryptoMock(req: Request, res: Response) {
    try {
      // Simulate network delay (2-5 seconds)
      const delay = Math.floor(Math.random() * 3000) + 2000;
      await new Promise(resolve => setTimeout(resolve, delay));

      const { amount, currency = 'ETH', items } = req.body;
      let saleRecords = [];

      // If items are provided, record the sale
      if (items && Array.isArray(items) && items.length > 0) {
          // Use a default 'system' or 'admin' user ID for this mock if req.user is missing
          // In a real app, strict auth would be enforced.
          // Using a placeholder UUID for "POS Terminal"
          const posUserId = req.user?.id || '00000000-0000-0000-0000-000000000000'; 
          
          saleRecords = await SalesService.processPOSSale(
              posUserId, 
              items, 
              'TRANSFER', // Recording as TRANSFER for Crypto
              `Crypto ${currency} Transaction`
          );
      }

      res.status(200).json({
        success: true,
        data: {
          txHash: '0x' + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join(''),
          status: 'CONFIRMED',
          amount,
          currency,
          timestamp: new Date().toISOString(),
          confirmations: 12,
          saleRecordsCount: saleRecords.length
        }
      });
    } catch (error: any) {
      logger.error('Crypto verification failed', error);
      res.status(500).json({ success: false, error: 'Verification failed' });
    }
  }
}
