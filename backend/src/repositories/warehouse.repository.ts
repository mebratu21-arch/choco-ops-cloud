import { db } from '../config/database.js';
import { WarehouseStock, StockMovement } from '../types/domain.types.js';

export class WarehouseRepository {
  // Stock
  static async findAllStock(): Promise<WarehouseStock[]> {
    return db('warehouse_stock')
      .select('*', db.raw('quantity - reserved_quantity as available_quantity'))
      .orderBy('item_type', 'asc');
  }

  static async findStockByType(itemType: string): Promise<WarehouseStock[]> {
    return db('warehouse_stock')
      .where({ item_type: itemType })
      .select('*', db.raw('quantity - reserved_quantity as available_quantity'));
  }

  static async findStockById(id: string): Promise<WarehouseStock | undefined> {
    return db('warehouse_stock')
      .where({ id })
      .select('*', db.raw('quantity - reserved_quantity as available_quantity'))
      .first();
  }

  static async updateStock(id: string, data: Partial<WarehouseStock>): Promise<WarehouseStock> {
    const [stock] = await db('warehouse_stock')
      .where({ id })
      .update({ ...data, updated_at: new Date() })
      .returning('*');
    return stock;
  }

  // Stock Movements
  static async findAllMovements(limit: number = 100): Promise<StockMovement[]> {
    return db('stock_movements')
      .leftJoin('users', 'stock_movements.performed_by', 'users.id')
      .select('stock_movements.*', db.raw("users.first_name || ' ' || users.last_name as performer_name"))
      .orderBy('stock_movements.performed_at', 'desc')
      .limit(limit);
  }

  static async findMovementsByItem(itemId: string): Promise<StockMovement[]> {
    return db('stock_movements')
      .where({ item_id: itemId })
      .orderBy('performed_at', 'desc');
  }

  static async createMovement(data: Partial<StockMovement>): Promise<StockMovement> {
    const [movement] = await db('stock_movements')
      .insert(data)
      .returning('*');
    return movement;
  }

  // Location-based queries
  static async findStockByLocation(aisle?: string, shelf?: string, bin?: string): Promise<WarehouseStock[]> {
    let query = db('warehouse_stock');
    
    if (aisle) query = query.where('location_aisle', aisle);
    if (shelf) query = query.where('location_shelf', shelf);
    if (bin) query = query.where('location_bin', bin);
    
    return query.select('*', db.raw('quantity - reserved_quantity as available_quantity'));
  }
}
