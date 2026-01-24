import { db } from '../config/database.js';
import { logger } from '../config/logger.js';

export class DashboardService {
  static async getStats() {
    try {
      const [
        dailyRevenue,
        monthlyRevenue,
        lowStock,
        activeBatches,
        openFixes,
        topItems
      ] = await Promise.all([
        // Revenue Today
        db('employee_sales')
          .sum('final_amount as total')
          .whereRaw('DATE(created_at) = CURRENT_DATE')
          .first(),

        // Revenue This Month
        db('employee_sales')
          .sum('final_amount as total')
          .whereRaw("DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)")
          .first(),

        // Low Stock Count
        db('ingredients')
          .count('* as count')
          .whereRaw('current_stock < minimum_stock')
          .whereNull('deleted_at')
          .first(),

        // Active Production Batches
        db('batches')
          .count('* as count')
          .whereIn('status', ['PLANNED', 'IN_PROGRESS'])
          .whereNull('deleted_at')
          .first(),

        // Open Mechanic Issues (last week)
        db('audit_logs')
          .count('* as count')
          .where('action', 'MACHINE_FIX')
          .whereRaw("created_at >= DATE_TRUNC('week', CURRENT_DATE)")
          .first(),

        // Top 5 Products by Sales
        db('employee_sales')
          .join('batches', 'employee_sales.batch_id', 'batches.id')
          .join('recipes', 'batches.recipe_id', 'recipes.id')
          .select('recipes.name')
          .sum('employee_sales.quantity_sold as total_qty')
          .groupBy('recipes.name')
          .orderBy('total_qty', 'desc')
          .limit(5)
      ]);

      return {
        financials: {
          revenue_today: Number(dailyRevenue?.total || 0),
          revenue_this_month: Number(monthlyRevenue?.total || 0),
        },
        operations: {
          low_stock_items: Number(lowStock?.count || 0),
          active_batches: Number(activeBatches?.count || 0),
          open_maintenance_issues: Number(openFixes?.count || 0),
        },
        top_products: topItems.map((item: any) => ({
          name: item.name,
          total_sold: Number(item.total_qty),
        })),
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      logger.error('Dashboard stats failed', { error });
      throw error;
    }
  }
}
