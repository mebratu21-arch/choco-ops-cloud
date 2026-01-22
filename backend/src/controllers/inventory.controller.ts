import { Request, Response } from 'express';
import { InventoryService } from '../services/inventory.service.js';
import { InventoryFilters, StockUpdateInput } from '../types/inventory.types.js';
import { AppError } from '../utils/errors.js';

export class InventoryController {
  static async getAllStock(req: Request, res: Response) {
    try {
      const filters: InventoryFilters = {
        low_stock_only: req.query.low_stock_only === 'true',
        expiring_soon_days: req.query.expiring_soon_days ? Number(req.query.expiring_soon_days) : undefined,
        supplier_id: req.query.supplier_id as string,
        aisle: req.query.aisle as string,
        shelf: req.query.shelf as string,
        bin: req.query.bin as string,
      };

      const stock = await InventoryService.getAllStock(filters);
      res.json({ success: true, count: stock.length, data: stock });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to fetch stock' });
    }
  }

  static async getLowStock(req: Request, res: Response) {
    try {
      const items = await InventoryService.getLowStock();
      res.json({ success: true, count: items.length, data: items });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to fetch low stock' });
    }
  }

  static async getExpiringSoon(req: Request, res: Response) {
    try {
      const days = req.query.days ? Number(req.query.days) : 30;
      const items = await InventoryService.getExpiringSoon(days);
      res.json({ success: true, count: items.length, days, data: items });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to fetch expiring items' });
    }
  }

  static async getIngredient(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const item = await InventoryService.getIngredientById(id);
      res.json({ success: true, data: item });
    } catch (error: any) {
      if (error instanceof AppError) {
        return res.status(error.statusCode || 404).json({
          success: false,
          error: error.message,
        });
      }
      res.status(500).json({ success: false, error: 'Failed to fetch ingredient' });
    }
  }

  static async updateStock(req: Request & { user?: any }, res: Response) {
    try {
      const input: StockUpdateInput = req.body;
      const userId = req.user?.id;

      if (!userId) throw new AppError('User not authenticated', 401);

      const result = await InventoryService.updateStock(input, userId);

      res.json({
        success: true,
        message: 'Stock updated successfully',
        data: result,
      });
    } catch (error: any) {
      if (error instanceof AppError) {
        return res.status(error.statusCode || 400).json({
          success: false,
          error: error.message,
        });
      }
      res.status(500).json({ success: false, error: 'Failed to update stock' });
    }
  }
}
