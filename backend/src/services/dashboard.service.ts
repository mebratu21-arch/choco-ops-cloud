import { logger } from '../config/logger.js';
import { SalesRepository } from '../repositories/sales.repository.js';
import { InventoryRepository } from '../repositories/inventory.repository.js';
import { ProductionRepository } from '../repositories/production.repository.js';
import { AuditRepository } from '../repositories/audit.repository.js';

export class DashboardService {
  static async getStats() {
    try {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      const [
        financials,
        lowStockCount,
        activeBatchesCount,
        openIssuesCount,
        topItems
      ] = await Promise.all([
        SalesRepository.getSalesSummary(),
        InventoryRepository.countLowStock(),
        ProductionRepository.countActiveBatches(),
        AuditRepository.countOpenMechanicIssues(weekAgo),
        SalesRepository.getTopSellingProductsWithRecipeNames(5)
      ]);

      return {
        financials: {
          revenue_today: financials.amountToday,
          revenue_this_month: financials.amountMonth,
        },
        operations: {
          low_stock_items: lowStockCount,
          active_batches: activeBatchesCount,
          open_maintenance_issues: openIssuesCount,
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
