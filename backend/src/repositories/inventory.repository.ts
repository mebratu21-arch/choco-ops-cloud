import { db } from '../config/database.js';
import { Ingredient, StockUpdateResult } from '../types/inventory.types.js';
//import { Supplier } from '../types/supplier.types.js';

export class InventoryRepository {
  static async findAll(filters?: any): Promise<Ingredient[]> {
    let query = db('ingredients')
      .leftJoin('suppliers', 'ingredients.supplier_id', 'suppliers.id')
      .select(
        'ingredients.*',
        'suppliers.name as supplier_name',
        db.raw('current_stock < minimum_stock AS is_low_stock')
      )
      .whereNull('ingredients.deleted_at');

    if (filters?.low_stock_only) {
      query = query.whereRaw('current_stock < minimum_stock');
    }

    if (filters?.supplier_id) {
      query = query.where('ingredients.supplier_id', filters.supplier_id);
    }

    if (filters?.location) {
      const { aisle, shelf, bin } = filters.location;
      if (aisle) query = query.where('aisle', aisle);
      if (shelf) query = query.where('shelf', shelf);
      if (bin) query = query.where('bin', bin);
    }

    return query.orderBy('ingredients.name');
  }

  static async findById(id: string): Promise<Ingredient | undefined> {
    const ingredient = await db('ingredients')
      .where({ 'ingredients.id': id })
      .whereNull('ingredients.deleted_at')
      .first();

    if (!ingredient) return undefined;

    return {
      ...ingredient,
      is_low_stock: Number(ingredient.current_stock) < Number(ingredient.minimum_stock),
    };
  }

  static async findLowStock(): Promise<Ingredient[]> {
    return db('ingredients')
      .whereRaw('current_stock < minimum_stock')
      .whereNull('deleted_at')
      .orderBy('current_stock', 'asc');
  }

  static async findExpiringSoon(days: number): Promise<Ingredient[]> {
    return db('ingredients')
      .whereBetween('expiry_date', [
        new Date(),
        new Date(Date.now() + days * 24 * 60 * 60 * 1000),
      ])
      .whereNull('deleted_at')
      .orderBy('expiry_date', 'asc');
  }

  static async updateStock(id: string, newStock: number, userId: string, trx: any): Promise<StockUpdateResult> {
    await trx('ingredients')
      .where({ id })
      .update({
        current_stock: newStock,
        updated_at: trx.fn.now(),
      });

    // Return updated record
    return trx('ingredients').where({ id }).first();
  }
}