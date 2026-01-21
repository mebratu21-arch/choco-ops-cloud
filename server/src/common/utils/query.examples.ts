import { Knex } from 'knex';
import db from '../../config/db';

/**
 * query.examples.ts
 * Demonstrates optimized query patterns using our schema
 */

export const QueryExamples = {
  /**
   * 1. Active Inventory Check
   * Uses partial index 'idx_warehouse_stock_expiring_soon'
   */
  async getExpiringStock(days: number = 30) {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + days);

    return db('warehouse_stock')
      .where('status', 'available')
      .whereBetween('expiry_date', [today, futureDate])
      .select('*');
  },

  /**
   * 2. Production Batch Tracking
   * Uses partial index 'idx_production_batches_active'
   */
  async getActiveBatchesByUser(userId: string) {
    return db('production_batches')
      .where('created_by', userId)
      .whereNotIn('status', ['completed', 'rejected'])
      .orderBy('created_at', 'desc')
      .select('*');
  },

  /**
   * 3. Sales Reporting
   * Uses covering index 'idx_product_sales_reporting'
   */
  async getMonthlySales(startDate: Date, endDate: Date) {
    return db('product_sales')
      .whereBetween('sold_at', [startDate, endDate])
      .where('payment_status', 'completed')
      .sum('total_amount as total_revenue')
      .count('* as total_orders');
  },

  /**
   * 4. Quality Control Dashboard
   * Uses partial index 'idx_quality_controls_pending'
   */
  async getPendingInspections() {
    return db('quality_controls')
      .where('status', 'pending')
      .join('production_batches', 'quality_controls.batch_id', 'production_batches.id')
      .select('quality_controls.*', 'production_batches.batch_number');
  }
};
