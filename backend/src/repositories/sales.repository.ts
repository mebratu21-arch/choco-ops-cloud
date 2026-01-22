import { db } from '../config/database.js';
import { ProductSale, OnlineOrder } from '../types/domain.types.js';

export class SalesRepository {
  // Product Sales
  static async findAllSales(): Promise<ProductSale[]> {
    return db('product_sales')
      .leftJoin('users', 'product_sales.employee_id', 'users.id')
      .select('product_sales.*', db.raw("users.first_name || ' ' || users.last_name as employee_name"))
      .orderBy('product_sales.sale_date', 'desc');
  }

  static async findSaleById(id: string): Promise<ProductSale | undefined> {
    return db('product_sales')
      .where('product_sales.id', id)
      .first();
  }

  static async createSale(data: Partial<ProductSale>): Promise<ProductSale> {
    const [sale] = await db('product_sales')
      .insert(data)
      .returning('*');
    return sale;
  }

  static async getSalesStats(startDate?: Date, endDate?: Date): Promise<any> {
    let query = db('product_sales')
      .select(
        db.raw('COUNT(*) as total_sales'),
        db.raw('SUM(total_price) as total_revenue'),
        db.raw('AVG(total_price) as avg_sale_value')
      );

    if (startDate) query = query.where('sale_date', '>=', startDate);
    if (endDate) query = query.where('sale_date', '<=', endDate);

    return query.first();
  }

  // Online Orders
  static async findAllOrders(): Promise<OnlineOrder[]> {
    return db('online_orders')
      .orderBy('ordered_at', 'desc');
  }

  static async findOrderById(id: string): Promise<OnlineOrder | undefined> {
    return db('online_orders')
      .where({ id })
      .first();
  }

  static async findOrderByNumber(orderNumber: string): Promise<OnlineOrder | undefined> {
    return db('online_orders')
      .where({ order_number: orderNumber })
      .first();
  }

  static async findOrdersByStatus(status: string): Promise<OnlineOrder[]> {
    return db('online_orders')
      .where({ status })
      .orderBy('ordered_at', 'desc');
  }

  static async createOrder(data: Partial<OnlineOrder>): Promise<OnlineOrder> {
    const [order] = await db('online_orders')
      .insert(data)
      .returning('*');
    return order;
  }

  static async updateOrder(id: string, data: Partial<OnlineOrder>): Promise<OnlineOrder> {
    const [order] = await db('online_orders')
      .where({ id })
      .update({ ...data, updated_at: new Date() })
      .returning('*');
    return order;
  }
}
