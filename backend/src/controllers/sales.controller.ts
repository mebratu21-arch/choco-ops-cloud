import { Request, Response, NextFunction } from 'express';
import { SalesRepository } from '../repositories/sales.repository.js';
import { logger } from '../config/logger.js';

export class SalesController {
  // Product Sales
  static async getAllSales(req: Request, res: Response, next: NextFunction) {
    try {
      const sales = await SalesRepository.findAllSales();
      res.json({ success: true, data: sales });
    } catch (error) {
      next(error);
    }
  }

  static async getSaleById(req: Request, res: Response, next: NextFunction) {
    try {
      const sale = await SalesRepository.findSaleById(req.params.id);
      if (!sale) {
        return res.status(404).json({ success: false, error: 'Sale not found' });
      }
      res.json({ success: true, data: sale });
    } catch (error) {
      next(error);
    }
  }

  static async createSale(req: Request, res: Response, next: NextFunction) {
    try {
      const sale = await SalesRepository.createSale({
        ...req.body,
        employee_id: req.user?.id
      });
      logger.info('Sale created', { id: sale.id });
      res.status(201).json({ success: true, data: sale });
    } catch (error) {
      next(error);
    }
  }

  static async getSalesStats(req: Request, res: Response, next: NextFunction) {
    try {
      const { start_date, end_date } = req.query;
      const stats = await SalesRepository.getSalesStats(
        start_date ? new Date(start_date as string) : undefined,
        end_date ? new Date(end_date as string) : undefined
      );
      res.json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  }

  // Online Orders
  static async getAllOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const orders = await SalesRepository.findAllOrders();
      res.json({ success: true, data: orders });
    } catch (error) {
      next(error);
    }
  }

  static async getOrderById(req: Request, res: Response, next: NextFunction) {
    try {
      const order = await SalesRepository.findOrderById(req.params.id);
      if (!order) {
        return res.status(404).json({ success: false, error: 'Order not found' });
      }
      res.json({ success: true, data: order });
    } catch (error) {
      next(error);
    }
  }

  static async getOrderByNumber(req: Request, res: Response, next: NextFunction) {
    try {
      const order = await SalesRepository.findOrderByNumber(req.params.orderNumber);
      if (!order) {
        return res.status(404).json({ success: false, error: 'Order not found' });
      }
      res.json({ success: true, data: order });
    } catch (error) {
      next(error);
    }
  }

  static async getOrdersByStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const orders = await SalesRepository.findOrdersByStatus(req.params.status);
      res.json({ success: true, data: orders });
    } catch (error) {
      next(error);
    }
  }

  static async createOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const order = await SalesRepository.createOrder(req.body);
      logger.info('Order created', { id: order.id, orderNumber: order.order_number });
      res.status(201).json({ success: true, data: order });
    } catch (error) {
      next(error);
    }
  }

  static async updateOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const order = await SalesRepository.updateOrder(req.params.id, req.body);
      logger.info('Order updated', { id: req.params.id });
      res.json({ success: true, data: order });
    } catch (error) {
      next(error);
    }
  }
}
