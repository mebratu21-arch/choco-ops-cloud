import { db } from '../config/database.js';
import { Ingredient, InventoryFilters } from '../types/inventory.types.js';

export class InventoryRepository {
  static async findAll(filters: InventoryFilters = {}): Promise<Ingredient[]> {
    let query = db('ingredients')
      .leftJoin('suppliers', 'ingredients.supplier_id', 'suppliers.id')
      .select(
        'ingredients.*',
        'suppliers.name as supplier_name',
        db.raw('current_stock < minimum_stock AS is_low_stock')
      )
      .whereNull('ingredients.deleted_at');

    if (filters.low_stock_only) {
      query = query.whereRaw('current_stock < minimum_stock');
    }
    if (filters.supplier_id) query = query.where('supplier_id', filters.supplier_id);
    if (filters.aisle) query = query.where('aisle', filters.aisle);
    if (filters.shelf) query = query.where('shelf', filters.shelf);
    if (filters.bin) query = query.where('bin', filters.bin);

    return query.orderBy('name');
  }

  static async findLowStock(trx?: any): Promise<Ingredient[]> {
    const connection = trx || db;
    return connection('ingredients')
      .select(
        'id',
        'name',
        'current_stock',
        'minimum_stock',
        'optimal_stock',
        'unit',
        db.raw('current_stock < minimum_stock AS is_low_stock')
      )
      .whereRaw('current_stock < minimum_stock')
      .whereNull('deleted_at')
      .orderBy('current_stock', 'asc');
  }

  static async findExpiringSoon(days: number = 30): Promise<Ingredient[]> {
    const future = new Date();
    future.setDate(future.getDate() + days);

    return db('ingredients')
      .select(
        'ingredients.*',
        db.raw('current_stock < minimum_stock AS is_low_stock')
      )
      .whereBetween('expiry_date', [new Date(), future])
      .whereNull('deleted_at')
      .orderBy('expiry_date', 'asc');
  }

  static async findById(id: string, trx?: any): Promise<Ingredient | undefined> {
    const connection = trx || db;

    const row = await connection('ingredients')
      .leftJoin('suppliers', 'ingredients.supplier_id', 'suppliers.id')
      .select(
        'ingredients.*',
        'suppliers.name as supplier_name',
        db.raw('current_stock < minimum_stock AS is_low_stock')
      )
      .where('ingredients.id', id)
      .whereNull('ingredients.deleted_at')
      .first();

    return row;
  }

  static async updateStock(id: string, newStock: number, trx: any): Promise<void> {
    await trx('ingredients')
      .where({ id })
      .update({
        current_stock: newStock,
        updated_at: trx.fn.now(),
      });
  }
}