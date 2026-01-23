import { db } from '../config/database.js';
import { logger } from '../config/logger.js';
import { InventoryRepository } from '../repositories/inventory.repository.js';
import {
  Ingredient,
  InventoryFilters,
  StockUpdateInput,
  StockUpdateResult,
  STOCK_UPDATE_REASONS,
} from '../types/inventory.types.js';
import { AppError, NotFoundError, ValidationError } from '../utils/errors.js';

export class InventoryService {
  static async getAllStock(filters: InventoryFilters = {}): Promise<Ingredient[]> {
    return InventoryRepository.findAll(filters);
  }

  static async getLowStock(): Promise<Ingredient[]> {
    return InventoryRepository.findLowStock();
  }

  static async getExpiringSoon(days: number = 30): Promise<Ingredient[]> {
    return InventoryRepository.findExpiringSoon(days);
  }

  static async getIngredientById(id: string): Promise<Ingredient> {
    const item = await InventoryRepository.findById(id);
    if (!item) throw new NotFoundError(`Ingredient ${id} not found`);
    return item;
  }

  static async updateStock(input: StockUpdateInput, userId: string): Promise<StockUpdateResult> {
    const { ingredient_id, quantity_change, reason = 'MANUAL_ADJUSTMENT', notes } = input;

    if (!STOCK_UPDATE_REASONS.includes(reason)) {
      throw new ValidationError(`Invalid reason. Allowed: ${STOCK_UPDATE_REASONS.join(', ')}`);
    }

    return db.transaction(async (trx) => {
      // Pass trx to get locked/consistent read
      const ingredient = await InventoryRepository.findById(ingredient_id, trx);
      if (!ingredient) throw new NotFoundError('Ingredient not found');

      const previousStock = Number(ingredient.current_stock);
      const newStock = previousStock + quantity_change;

      if (newStock < 0) {
        throw new ValidationError(`Cannot reduce below zero (current: ${previousStock})`);
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
        reason,
        notes,
      });

      return {
        ingredient_id,
        previous_stock: previousStock,
        new_stock: newStock,
        change: quantity_change,
        reason,
        notes,
        updated_by: userId,
        updated_at: new Date().toISOString(),
      };
    });
  }
}
