// ============================================================================
// PRODUCTION-READY SALES CONTROLLER
// Path: src/controllers/sales.controller.ts
// ============================================================================

import { Request, Response } from 'express';
import { logger } from '../utils/logger.js';
import { SalesService } from '../services/sales.service.js';
import { SalesRepository } from '../repositories/sales.repository.js';
import { db } from '../config/database.js';

// ────────────────────────────────────────────
// SALES CONTROLLER CLASS
// ────────────────────────────────────────────

export class SalesController {
  /**
   *  POST: Create employee sale
   */
  static async createEmployeeSale(req: Request & { user?: any }, res: Response): Promise<void> {
    try {
      const { seller_id, buyer_id, batch_id, quantity_sold, unit, original_price, discount_percentage, final_amount, payment_method, notes } = req.body;

      const result = await SalesService.recordEmployeeSale(
        {
          seller_id,
          buyer_id,
          batch_id,
          quantity_sold,
          unit,
          original_price,
          discount_percentage,
          final_amount,
          payment_method,
          notes,
        },
        req.user?.id
      );

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      logger.error('Create employee sale error', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   *  GET: Get employee sale by ID
   */
  static async getEmployeeSale(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const sale = await SalesRepository.findEmployeeSaleById(id);

      if (!sale) {
        res.status(404).json({ success: false, error: 'Sale not found' });
        return;
      }

      res.status(200).json({
        success: true,
        data: sale,
      });
    } catch (error: any) {
      logger.error('Get employee sale error', { error: error.message });
      res.status(500).json({ success: false, error: 'Failed to fetch sale' });
    }
  }

  /**
   *  GET: Get sales by seller
   */
  static async getSalesForSeller(req: Request & { user?: any }, res: Response): Promise<void> {
    try {
      const { limit = 20, offset = 0 } = req.query;

      const sales = await SalesRepository.findEmployeeSalesBySeller(
        req.user?.id,
        Number(limit),
        Number(offset)
      );

      res.status(200).json({
        success: true,
        data: sales,
        pagination: {
          limit: Number(limit),
          offset: Number(offset),
        },
      });
    } catch (error: any) {
      logger.error('Get sales for seller error', { error: error.message });
      res.status(500).json({ success: false, error: 'Failed to fetch sales' });
    }
  }

  /**
   *  POST: Create online order
   */
  static async createOnlineOrder(req: Request & { user?: any }, res: Response): Promise<void> {
    try {
      const { customer_email, customer_name, batch_id, quantity, unit, total_amount, status, notes } = req.body;

      const result = await SalesService.processOnlineOrder(
        {
          customer_email,
          customer_name,
          batch_id,
          quantity,
          unit,
          total_amount,
          status,
          notes,
        },
        req.user?.id
      );

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      logger.error('Create online order error', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   *  GET: Get online order by ID
   */
  static async getOnlineOrder(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const order = await SalesRepository.findOnlineOrderById(id);

      if (!order) {
        res.status(404).json({ success: false, error: 'Order not found' });
        return;
      }

      res.status(200).json({
        success: true,
        data: order,
      });
    } catch (error: any) {
      logger.error('Get online order error', { error: error.message });
      res.status(500).json({ success: false, error: 'Failed to fetch order' });
    }
  }

  /**
   *  GET: Get orders by status
   */
  static async getOrdersByStatus(req: Request, res: Response): Promise<void> {
    try {
      const { status, limit = 20, offset = 0 } = req.query;

      if (!status) {
        res.status(400).json({ success: false, error: 'status is required' });
        return;
      }

      const orders = await SalesRepository.findOnlineOrdersByStatus(
        String(status),
        Number(limit),
        Number(offset)
      );

      res.status(200).json({
        success: true,
        data: orders,
        pagination: { limit: Number(limit), offset: Number(offset) },
      });
    } catch (error: any) {
      logger.error('Get orders by status error', { error: error.message });
      res.status(500).json({ success: false, error: 'Failed to fetch orders' });
    }
  }

  /**
   *  PUT: Update order status
   */
  static async updateOrderStatus(req: Request & { user?: any }, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        res.status(400).json({ success: false, error: 'status is required' });
        return;
      }

      const result = await SalesService.updateOrderStatus(id, status, req.user?.id);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      logger.error('Update order status error', { error: error.message });
      res.status(400).json({ success: false, error: error.message });
    }
  }

  /**
   *  GET: Sales dashboard summary
   */
  static async getDashboardSummary(req: Request, res: Response): Promise<void> {
    try {
      const summary = await SalesService.getSalesSummary();
      const topProducts = await SalesService.getTopSellingProducts(5);

      res.status(200).json({
        success: true,
        data: {
          summary,
          topProducts,
        },
      });
    } catch (error: any) {
      logger.error('Get dashboard summary error', { error: error.message });
      res.status(500).json({ success: false, error: 'Failed to fetch summary' });
    }
  }

  /**
   *  GET: Customer order history
   */
  static async getCustomerHistory(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.params;

      if (!email) {
        res.status(400).json({ success: false, error: 'email is required' });
        return;
      }

      const history = await SalesService.getCustomerOrderHistory(email);

      res.status(200).json({
        success: true,
        data: history,
      });
    } catch (error: any) {
      logger.error('Get customer history error', { error: error.message });
      res.status(500).json({ success: false, error: 'Failed to fetch history' });
    }
  }

  /**
   *  GET: Seller performance
   */
  static async getSellerPerformance(req: Request & { user?: any }, res: Response): Promise<void> {
    try {
      const performance = await SalesService.getSellerPerformance(req.user?.id);

      res.status(200).json({
        success: true,
        data: performance,
      });
    } catch (error: any) {
      logger.error('Get seller performance error', { error: error.message });
      res.status(500).json({ success: false, error: 'Failed to fetch performance' });
    }
  }

  /**
   *  GET: Export sales data
   */
  static async exportSalesData(req: Request, res: Response): Promise<void> {
    try {
      const { startDate, endDate, format = 'json' } = req.query;

      if (!startDate || !endDate) {
        res.status(400).json({ success: false, error: 'startDate and endDate required' });
        return;
      }

      // JSON Export (Small data usually, keep simple)
      if (format === 'json') {
        const data = await SalesService.exportSalesData(
          new Date(String(startDate)),
          new Date(String(endDate)),
          'json'
        );
        res.status(200).json({ success: true, data: JSON.parse(data) });
        return;
      }

      // [SECURITY] GOOGLE STANDARD: CSV Streaming
      // Instead of loading all rows into RAM, we pipe them to the response.
      if (format === 'csv') {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="sales-export.csv"');

        // Write Header
        res.write('ID,Type,Customer/Buyer,Amount,Status,Date\n');

        const start = new Date(String(startDate));
        const end = new Date(String(endDate));

        // Stream Employee Sales
        const salesStream = db('employee_sales')
          .whereBetween('created_at', [start, end])
          .whereNull('deleted_at')
          .stream();

        for await (const sale of salesStream) {
          const row = `${sale.id},SALE,${sale.buyer_id},${sale.final_amount},${sale.status},${sale.created_at?.toISOString() || ''}\n`;
          res.write(row);
        }

        // Stream Online Orders
        const orderStream = db('online_orders')
          .whereBetween('order_date', [start, end])
          .whereNull('deleted_at')
          .stream();

        for await (const order of orderStream) {
          const row = `${order.id},ORDER,${order.customer_email},${order.total_amount},${order.status},${order.order_date?.toISOString() || ''}\n`;
          res.write(row);
        }

        res.end(); // Close stream
        logger.info('SUCCESS: Sales export streamed successfully');
      }
    } catch (error: any) {
      logger.error('Export sales data error', { error: error.message });
      res.status(500).json({ success: false, error: 'Failed to export data' });
    }
  }
}
