import { Request, Response } from 'express';
import { InventoryService } from '../../services/inventory/inventory.service.js';

export class InventoryController {
  static async getAll(req: Request, res: Response) {
      const items = await InventoryService.getAllIngredients();
      res.json({ success: true, data: items });
  }

  static async createIngredient(req: Request, res: Response) {
    const item = await InventoryService.createIngredient(req.body, req.user!.id);
    res.status(201).json({ success: true, data: item });
  }

  static async create(req: Request, res: Response) {
      return InventoryController.createIngredient(req, res);
  }

  static async getExpiringSoon(req: Request, res: Response) {
    const metrics = await InventoryService.getDashboardMetrics();
    res.json({ success: true, data: metrics.expiring });
  }

  /**
   * Manual Stock Adjustment (Audit Mandatory)
   */
  static async adjustStock(req: Request, res: Response) {
      const { id } = req.params;
      const { adjustment, reason } = req.body;
      const result = await InventoryService.adjustStock(req.user!.id, id, adjustment, reason);
      res.json({ success: true, data: result });
  }

  static async addStock(req: Request, res: Response) {
    const { id } = req.params;
    const { quantity } = req.body; 
    // Forwarding to adjustStock for logic reuse
    const result = await InventoryService.adjustStock(req.user!.id, id, quantity, 'Incoming stock addition');
    res.json({ success: true, data: result });
  }

  static async getLowStock(req: Request, res: Response) {
    const metrics = await InventoryService.getDashboardMetrics();
    res.json({ success: true, data: metrics.lowStock });
  }

  static async updateStock(req: Request, res: Response) {
    const { id } = req.params;
    const { current_stock, reason } = req.body;
    
    // Calculate adjustment based on current value
    const ingredients = await InventoryService.getAllIngredients();
    const target = ingredients.find(i => i.id === id);
    if (!target) {
        res.status(404).json({ success: false, error: 'Ingredient not found' });
        return;
    }

    const adjustment = Number(current_stock) - Number(target.current_stock);
    
    const updated = await InventoryService.adjustStock(
        req.user!.id, 
        id, 
        adjustment, 
        reason || `Manual stock override from ${target.current_stock} to ${current_stock}`
    );

    res.json({ success: true, data: updated });
  }
}
