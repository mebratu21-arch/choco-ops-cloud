import { db } from '../config/database.js';
import { logger } from '../config/logger.js';
import { NotFoundError } from '../utils/errors.js';

export class InventoryService {
  static async getAllIngredients() {
    return db('ingredients')
      .leftJoin('suppliers', 'ingredients.supplier_id', 'suppliers.id')
      .select(
        'ingredients.*',
        'suppliers.name as supplier_name'
      )
      .whereNull('ingredients.deleted_at')
      .orderBy('ingredients.name');
  }

  static async getLowStock() {
    // Uses partial index idx_ingredient_low_stock
    return db('ingredients')
      .whereRaw('current_stock < minimum_stock')
      .whereNull('deleted_at')
      .orderBy('name');
  }

  static async getExpiringSoon(days: number = 30) {
    return db('ingredients')
      .whereBetween('expiry_date', [
        new Date(),
        new Date(Date.now() + days * 24 * 60 * 60 * 1000)
      ])
      .whereNull('deleted_at')
      .orderBy('expiry_date', 'asc');
  }

  static async updateStock(id: string, quantity: number, userId: string) {
    const ingredient = await db('ingredients').where({ id, deleted_at: null }).first();
    if (!ingredient) {
      throw new NotFoundError('Ingredient not found');
    }

    await db('ingredients')
      .where({ id })
      .update({ 
        current_stock: quantity,
        updated_at: new Date()
      });

    logger.info('Stock updated', { ingredientId: id, quantity, userId });
  }
}
