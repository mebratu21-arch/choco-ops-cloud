import { db } from '../../config/database.js';
import { Ingredient, InventoryFilters } from '../../types/inventory.types.js';

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

  static async getLowStock(): Promise<Ingredient[]> {
    return db('ingredients')
      .whereRaw('current_stock <= minimum_stock')
      .orderBy('current_stock', 'asc')
      .whereNull('deleted_at');
  }

  static async getExpiringSoon(): Promise<Ingredient[]> {
    return db('ingredients')
      .whereNotNull('expiry_date')
      .whereRaw('expiry_date <= NOW() + INTERVAL \'7 days\'')
      .orderBy('expiry_date', 'asc')
      .whereNull('deleted_at');
  }

  static async updateStock(id: string, newStock: number, trx?: any): Promise<Ingredient | undefined> {
    const connection = trx || db;
    const [row] = await connection('ingredients')
      .where('id', id)
      .update({ current_stock: newStock, updated_at: connection.fn.now() })
      .returning('*');
    return row;
  }

  static async countLowStock(): Promise<number> {
    const result = await db('ingredients')
      .count('* as count')
      .whereRaw('current_stock < minimum_stock')
      .whereNull('deleted_at')
      .first();
    return Number(result?.count || 0);
  }

  static async create(data: any): Promise<Ingredient> {
    const [ingredient] = await db('ingredients')
      .insert({
        id: db.raw('gen_random_uuid()'),
        ...data,
        created_at: db.fn.now(),
        updated_at: db.fn.now(),
      })
      .returning('*');
    return ingredient;
  }

  static async createIngredient(input: { name: string; current_stock: number; minimum_stock: number; unit: string }): Promise<Ingredient> {
    const [row] = await db('ingredients')
      .insert({
        id: db.raw('gen_random_uuid()'),
        name: input.name,
        current_stock: input.current_stock,
        minimum_stock: input.minimum_stock,
        unit: input.unit,
        created_at: db.fn.now(),
        updated_at: db.fn.now(),
      })
      .returning('*');
    return row;
  }
}
