import { Request, Response } from 'express';
import { db } from '../../config/database.js';

interface SalesTrendRow {
  date: Date | string;
  revenue: number | null;
  orders: string | number;
}

interface TopProductRow {
  product_id: string;
  sku: string;
  name: string;
  total_sold: string | number;
  total_revenue: number | null;
}

interface CategorySalesRow {
  category: string | null;
  revenue: number | null;
  items_sold: string | number;
}

export class AnalyticsController {
  /**
   * Get today's sales KPIs
   */
  static async getTodayKPIs(req: Request, res: Response) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Total revenue today
      const revenueResult = await db('shop_orders')
        .where('created_at', '>=', today)
        .where('status', 'completed')
        .sum('total as total_revenue');
      const { total_revenue } = (revenueResult[0] || {}) as { total_revenue: number | null };

      // Total orders today
      const orderCountResult = await db('shop_orders')
        .where('created_at', '>=', today)
        .count('* as order_count');
      const { order_count } = (orderCountResult[0] || {}) as { order_count: string | number };

      // Average order value
      const validOrderCount = Number(order_count || 0);
      const avgOrder = validOrderCount > 0 ? (Number(total_revenue) || 0) / validOrderCount : 0;

      // Low stock products
      const lowStockResult = await db('products')
        .where('stock', '<', 50)
        .count('* as low_stock_count');
      const { low_stock_count } = (lowStockResult[0] || {}) as { low_stock_count: string | number };

      res.json({
        success: true,
        data: {
          revenue: parseFloat(String(total_revenue || 0)),
          orders: validOrderCount,
          avgOrder: parseFloat(avgOrder.toFixed(2)),
          lowStock: Number(low_stock_count || 0)
        }
      });
    } catch (error) {
      console.error('Error fetching today KPIs:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch KPIs'
      });
    }
  }

  /**
   * Get sales trend for last N days
   */
  static async getSalesTrend(req: Request, res: Response) {
    try {
      const days = parseInt(req.query.days as string) || 7;
      
      const sales = await db('shop_orders')
        .select(db.raw('DATE(created_at) as date'))
        .sum('total as revenue')
        .count('* as orders')
        .where('created_at', '>=', db.raw(`NOW() - INTERVAL '${days} days'`))
        .where('status', 'completed')
        .groupBy(db.raw('DATE(created_at)'))
        .orderBy('date');

      const typedSales = sales as unknown as SalesTrendRow[];

      res.json({
        success: true,
        data: typedSales.map(s => ({
          date: s.date,
          revenue: parseFloat(String(s.revenue || 0)),
          orders: parseInt(String(s.orders || 0))
        }))
      });
    } catch (error) {
      console.error('Error fetching sales trend:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch sales trend'
      });
    }
  }

  /**
   * Get top selling products
   */
  static async getTopProducts(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 10;

      const topProducts = await db('shop_order_items')
        .select('product_id', 'sku', 'name')
        .sum('quantity as total_sold')
        .sum('subtotal as total_revenue')
        .groupBy('product_id', 'sku', 'name')
        .orderBy('total_revenue', 'desc')
        .limit(limit);

      const typedTopProducts = topProducts as unknown as TopProductRow[];

      res.json({
        success: true,
        data: typedTopProducts.map(p => ({
          productId: p.product_id,
          sku: p.sku,
          name: p.name,
          totalSold: parseInt(String(p.total_sold || 0)),
          totalRevenue: parseFloat(String(p.total_revenue || 0))
        }))
      });
    } catch (error) {
      console.error('Error fetching top products:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch top products'
      });
    }
  }

  /**
   * Get sales by category
   */
  static async getSalesByCategory(req: Request, res: Response) {
    try {
      const salesByCategory = await db('shop_order_items as oi')
        .join('products as p', 'oi.product_id', 'p.id')
        .select('p.category')
        .sum('oi.subtotal as revenue')
        .count('oi.id as items_sold')
        .groupBy('p.category')
        .orderBy('revenue', 'desc');

      const typedSalesByCategory = salesByCategory as unknown as CategorySalesRow[];

      res.json({
        success: true,
        data: typedSalesByCategory.map(c => ({
          category: c.category || 'Uncategorized',
          revenue: parseFloat(String(c.revenue || 0)),
          itemsSold: parseInt(String(c.items_sold || 0))
        }))
      });
    } catch (error) {
      console.error('Error fetching sales by category:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch sales by category'
      });
    }
  }
}
