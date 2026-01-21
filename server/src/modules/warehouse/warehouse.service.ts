import db from '../../config/db';

export const WarehouseService = {
  async findAll() {
    return db('warehouse_stock')
      .join('production_batches', 'warehouse_stock.batch_id', 'production_batches.id')
      .select('warehouse_stock.*', 'production_batches.batch_number')
      .orderBy('warehouse_stock.created_at', 'desc');
  },
  
  async getMovements() {
    return db('stock_movements')
      .join('users', 'stock_movements.user_id', 'users.id')
      .select('stock_movements.*', 'users.full_name as user_name')
      .orderBy('occurred_at', 'desc')
      .limit(50);
  }
};
