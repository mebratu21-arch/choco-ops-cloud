import db from '../../config/db';

export const SalesService = {
  async findAll() {
    return db('product_sales')
      .join('warehouse_stock', 'product_sales.stock_id', 'warehouse_stock.id')
      .select('product_sales.*', 'warehouse_stock.sku')
      .orderBy('sold_at', 'desc');
  },

  async getRevenueStats() {
    return db('product_sales')
      .select(db.raw('DATE(sold_at) as date'), db.raw('SUM(total_amount) as total'))
      .groupBy('date')
      .orderBy('date', 'desc')
      .limit(30);
  }
};
