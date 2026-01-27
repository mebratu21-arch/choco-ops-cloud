import { Request, Response, NextFunction } from 'express';
import { InventoryRepository } from '../../repositories/inventory/inventory.repository.js';
import { logger } from '../../config/logger.js';

export class IngredientController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const ingredients = await InventoryRepository.findAll(req.query);
      res.json({ success: true, data: ingredients });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const ingredient = await InventoryRepository.findById(req.params.id);
      if (!ingredient) {
        return res.status(404).json({ success: false, error: 'Ingredient not found' });
      }
      res.json({ success: true, data: ingredient });
    } catch (error) {
      next(error);
    }
  }

  static async getLowStock(req: Request, res: Response, next: NextFunction) {
    try {
      const ingredients = await InventoryRepository.findLowStock();
      res.json({ success: true, data: ingredients });
    } catch (error) {
      next(error);
    }
  }

  static async getExpiringSoon(req: Request, res: Response, next: NextFunction) {
    try {
      const days = parseInt(req.query.days as string) || 30;
      const ingredients = await InventoryRepository.findExpiringSoon(days);
      res.json({ success: true, data: ingredients });
    } catch (error) {
      next(error);
    }
  }
}
