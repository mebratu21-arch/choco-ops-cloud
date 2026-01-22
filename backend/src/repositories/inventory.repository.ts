import { db } from '../config/database.js';
import { Ingredient, InventoryFilters } from '../types/inventory.types.js';

export class InventoryRepository {
  static async findAll(filters: InventoryFilters = {}): Promise<Ingredient[]> {
    let query = db('ingredients')
      .select(
        'ingredients.*',
        db.raw('current_stock < minimum_stock AS is_low_stock')
      )
      .whereNull('deleted_at');

    if (filters.low_stock_only) {
      query = query.whereRaw('current_stock < minimum_stock');
    }

    if (filters.supplier_id) {
      query = query.where('supplier_id', filters.supplier_id);
    }

    if (filters.aisle) query = query.where('aisle', filters.aisle);
    if (filters.shelf) query = query.where('shelf', filters.shelf);
    if (filters.bin) query = query.where('bin', filters.bin);

    return query.orderBy('name');
  }

  static async findLowStock(): Promise<Ingredient[]> {
    return db('ingredients')
      .select(
        'ingredients.*',
        db.raw('current_stock < minimum_stock AS is_low_stock')
      )
      .whereRaw('current_stock < minimum_stock')
      .whereNull('deleted_at')
      .orderBy('current_stock', 'asc');
  }

  static async findExpiringSoon(days: number): Promise<Ingredient[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    return db('ingredients')
      .select(
        'ingredients.*',
        db.raw('current_stock < minimum_stock AS is_low_stock')
      )
      .whereBetween('expiry_date', [new Date(), futureDate])
      .whereNull('deleted_at')
      .orderBy('expiry_date', 'asc');
  }

  static async findById(id: string): Promise<Ingredient | undefined> {
    const item = await db('ingredients')
      .where({ id })
      .whereNull('deleted_at')
      .first();

    if (!item) return undefined;

    return {
      ...item,
      is_low_stock: Number(item.current_stock) < Number(item.minimum_stock),
    };
  }

  static async updateStock(id: string, newStock: number, trx: any) {
    await trx('ingredients')
      .where({ id })
      .update({
        current_stock: newStock,
        updated_at: trx.fn.now(),
      });
  }
}