import { Request, Response, NextFunction } from 'express';
import { WarehouseRepository } from '../repositories/warehouse.repository.js';
import { logger } from '../config/logger.js';

export class WarehouseController {
  // Stock
  static async getAllStock(req: Request, res: Response, next: NextFunction) {
    try {
      const stock = await WarehouseRepository.findAllStock();
      res.json({ success: true, data: stock });
    } catch (error) {
      next(error);
    }
  }

  static async getStockByType(req: Request, res: Response, next: NextFunction) {
    try {
      const stock = await WarehouseRepository.findStockByType(req.params.type);
      res.json({ success: true, data: stock });
    } catch (error) {
      next(error);
    }
  }

  static async getStockById(req: Request, res: Response, next: NextFunction) {
    try {
      const stock = await WarehouseRepository.findStockById(req.params.id);
      if (!stock) {
        return res.status(404).json({ success: false, error: 'Stock item not found' });
      }
      res.json({ success: true, data: stock });
    } catch (error) {
      next(error);
    }
  }

  static async updateStock(req: Request, res: Response, next: NextFunction) {
    try {
      const stock = await WarehouseRepository.updateStock(req.params.id, req.body);
      logger.info('Stock updated', { id: req.params.id });
      res.json({ success: true, data: stock });
    } catch (error) {
      next(error);
    }
  }

  static async getStockByLocation(req: Request, res: Response, next: NextFunction) {
    try {
      const { aisle, shelf, bin } = req.query;
      const stock = await WarehouseRepository.findStockByLocation(
        aisle as string,
        shelf as string,
        bin as string
      );
      res.json({ success: true, data: stock });
    } catch (error) {
      next(error);
    }
  }

  // Movements
  static async getAllMovements(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const movements = await WarehouseRepository.findAllMovements(limit);
      res.json({ success: true, data: movements });
    } catch (error) {
      next(error);
    }
  }

  static async getMovementsByItem(req: Request, res: Response, next: NextFunction) {
    try {
      const movements = await WarehouseRepository.findMovementsByItem(req.params.itemId);
      res.json({ success: true, data: movements });
    } catch (error) {
      next(error);
    }
  }

  static async createMovement(req: Request, res: Response, next: NextFunction) {
    try {
      const movement = await WarehouseRepository.createMovement({
        ...req.body,
        performed_by: req.user?.id,
        performed_at: new Date()
      });
      logger.info('Stock movement created', { id: movement.id, type: movement.movement_type });
      res.status(201).json({ success: true, data: movement });
    } catch (error) {
      next(error);
    }
  }
}
