import { db } from '../../config/database.js';
import { InventoryRepository } from '../../repositories/inventory/inventory.repository.js';
import { Audit } from '../../utils/audit.js';
import { logger } from '../../config/logger.js';
import { AppError } from '../../utils/errors.js';

export class InventoryService {
  /**
   * Manual Stock Adjustment (Audit Mandatory)
   */
  static async adjustStock(userId: string, ingredientId: string, adjustment: number, reason: string) {
    return await db.transaction(async (trx) => {
      const ingredient = await trx('ingredients').where('id', ingredientId).forUpdate().first();
      if (!ingredient) throw new AppError(404, 'Ingredient not found');
      
      const oldStock = Number(ingredient.current_stock);
      const newStock = oldStock + adjustment;

      if (newStock < 0) throw new AppError(400, 'Adjustment would result in negative stock');

      const updated = await InventoryRepository.updateStock(ingredientId, newStock, trx);

      await Audit.logAction(userId, 'STOCK_ADJUSTMENT', 'inventory', {
        ingredient_id: ingredientId,
        old_stock: oldStock,
        new_stock: newStock,
        reason
      }, trx);

      logger.info(`Stock adjusted for ${ingredient.name}`, { adjustment, reason });
      return updated;
    });
  }

  /**
   * Dashboard intelligence
   */
  static async getDashboardMetrics() {
    const lowStock = await InventoryRepository.getLowStock();
    const expiring = await InventoryRepository.getExpiringSoon();
    return { lowStock, expiring };
  }

  /**
   * Standard reads
   */
  static async getAllIngredients() {
      return await db('ingredients').whereNull('deleted_at').select('*');
  }

  static async createIngredient(data: any, userId: string) {
      const ingredient = await InventoryRepository.createIngredient(data);
      await Audit.logAction(userId, 'CREATE_INGREDIENT', 'inventory', { id: ingredient.id, name: ingredient.name });
      return ingredient;
  }
}
