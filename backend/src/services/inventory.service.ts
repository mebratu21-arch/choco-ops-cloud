import { db } from '../config/database.js';
import { logger } from '../config/logger.js';
import { InventoryRepository } from '../repositories/inventory.repository.js';
import { Ingredient, StockUpdateInput, StockUpdateResult, InventoryFilters } from '../types/inventory.types.js';
import { ValidationError, NotFoundError } from '../utils/errors.js';

const VALID_REASONS = [
  'PRODUCTION_USAGE',
  'SUPPLIER_DELIVERY',
  'MANUAL_ADJUSTMENT',
  'QUALITY_ISSUE',
  'EXPIRED_REMOVAL',
] as const;

export class InventoryService {
  static async getAllStock(filters: InventoryFilters = {}): Promise<Ingredient[]> {
    logger.info('Fetching inventory stock', { filters });
    return InventoryRepository.findAll(filters);
  }

  static async getLowStock(): Promise<Ingredient[]> {
    logger.info('Fetching low stock alerts');
    return InventoryRepository.findLowStock();
  }

  static async getExpiringSoon(days: number = 30): Promise<Ingredient[]> {
    logger.info('Fetching expiring ingredients', { days });
    return InventoryRepository.findExpiringSoon(days);
  }

  static async getIngredientById(id: string): Promise<Ingredient> {
    logger.info('Fetching ingredient', { id });
    const item = await InventoryRepository.findById(id);
    if (!item) throw new NotFoundError('Ingredient not found');
    return item;
  }

  static async updateStock(input: StockUpdateInput, userId: string): Promise<StockUpdateResult> {
    const { ingredient_id, quantity_change, reason } = input;

    // Validate reason
    if (reason && !VALID_REASONS.includes(reason as any)) {
      throw new ValidationError(`Invalid reason. Allowed: ${VALID_REASONS.join(', ')}`);
    }

    return db.transaction(async (trx) => {
      const ingredient = await trx('ingredients')
        .where({ id: ingredient_id })
        .whereNull('deleted_at')
        .forUpdate() // lock row to prevent race conditions
        .first();

      if (!ingredient) throw new NotFoundError('Ingredient not found or deleted');

      const previousStock = Number(ingredient.current_stock);
      const newStock = previousStock + quantity_change;

      if (newStock < 0) {
        throw new ValidationError(`Cannot reduce stock below zero (current: ${previousStock})`);
      }

      await InventoryRepository.updateStock(ingredient_id, newStock, trx);

      // Audit log
      await trx('audit_logs').insert({
        user_id: userId,
        action: quantity_change > 0 ? 'STOCK_ADDED' : 'STOCK_REMOVED',
        resource: 'ingredients',
        resource_id: ingredient_id,
        old_values: { current_stock: previousStock },
        new_values: { current_stock: newStock },
        ip_address: '127.0.0.1', // replace with req.ip in controller
        reason,
      });

      logger.info('Stock updated', {
        ingredient_id,
        previousStock,
        newStock,
        change: quantity_change,
        userId,
        reason,
      });

      return {
        ingredient_id,
        previous_stock: previousStock,
        new_stock: newStock,
        change: quantity_change,
        reason,
        updated_by: userId,
      };
    });
  }
}
