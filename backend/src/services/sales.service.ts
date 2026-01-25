// ============================================================================
// PRODUCTION-READY SALES SERVICE
// Path: src/services/sales.service.ts
// ============================================================================

import { db } from '../config/database.js';
import { Knex } from 'knex';
import { logger } from '../utils/logger.js';
import { SalesRepository } from '../repositories/sales.repository.js';
import type { EmployeeSaleCreateInput, OnlineOrderCreateInput } from '../repositories/sales.repository.js';

// ────────────────────────────────────────────
// SALES SERVICE CLASS
// ────────────────────────────────────────────

export class SalesService {
  /**
   * Get all online orders
   */
  static async getOnlineOrders(limit = 20, offset = 0) {
    return SalesRepository.getOnlineOrders(limit, offset);
  }

  static async recordEmployeeSale(
    input: EmployeeSaleCreateInput,
    userId: string
  ): Promise<{ saleId: string; inventoryDeducted: number; message: string }> {
    try {
      logger.info('SUCCESS: Recording employee sale', { sellerId: input.seller_id, amount: input.final_amount });

      return await db.transaction(async (trx) => {
        // Step 1: Verify batch exists and get current stock
        const batch = await trx('ingredients')
          .where('id', input.batch_id)
          .whereNull('deleted_at')
          .forUpdate() //  GOOGLE STANDARD: Row Locking
          .first();

        if (!batch) {
          throw new Error(`Batch not found: ${input.batch_id}`);
        }

        if (batch.current_stock < input.quantity_sold) {
          throw new Error(
            `Insufficient stock. Available: ${batch.current_stock}, Requested: ${input.quantity_sold}`
          );
        }

        // Step 2: Deduct inventory
        const newStock = batch.current_stock - input.quantity_sold;
        await trx('ingredients')
          .where('id', input.batch_id)
          .update({
            current_stock: newStock,
            updated_at: trx.fn.now(),
          });

        // Step 3: Record sale
        const sale = await SalesRepository.createEmployeeSale(input, trx);

        // Step 4: Log audit
        await trx('audit_logs').insert({
          id: trx.raw('gen_random_uuid()'),
          user_id: userId,
          action: 'EMPLOYEE_SALE_RECORDED',
          resource: 'employee_sales',
          resource_id: sale.id,
          old_values: JSON.stringify({ stock: batch.current_stock }),
          new_values: JSON.stringify({ stock: newStock, sale_id: sale.id }),
          ip_address: null,
          user_agent: null,
          created_at: trx.fn.now(),
        });

        logger.info('SUCCESS: Employee sale recorded successfully', {
          saleId: sale.id,
          stockDeducted: input.quantity_sold,
          newStock,
        });

        return {
          saleId: sale.id,
          inventoryDeducted: input.quantity_sold,
          message: `Sale recorded. Inventory reduced from ${batch.current_stock} to ${newStock}`,
        };
      });
    } catch (error) {
      logger.error('ERROR: Record employee sale failed', { error });
      throw error;
    }
  }

  /**
   * Process online order WITH transaction
   * Reserves inventory and creates order
   */
  static async processOnlineOrder(
    input: OnlineOrderCreateInput,
    userId: string
  ): Promise<{ orderId: string; status: string; message: string }> {
    try {
      logger.info('Processing online order', { email: input.customer_email, amount: input.total_amount });

      return await db.transaction(async (trx) => {
        // Step 1: Create order
        const order = await SalesRepository.createOnlineOrder(input);

        // Step 2: If batch specified, reserve stock
        if (input.batch_id) {
          const batch = await trx('ingredients')
            .where('id', input.batch_id)
            .whereNull('deleted_at')
            .forUpdate() //  GOOGLE STANDARD: Row Locking
            .first();

          if (!batch) {
            throw new Error(`Batch not found: ${input.batch_id}`);
          }

          if (batch.current_stock < input.quantity) {
            throw new Error(`Insufficient stock: ${batch.current_stock} available`);
          }

          // Reserve stock (optional: only if order confirmed)
          if (input.status === 'PROCESSING') {
            await trx('ingredients')
              .where('id', input.batch_id)
              .update({
                current_stock: batch.current_stock - input.quantity,
                updated_at: trx.fn.now(),
              });
          }
        }

        // Step 3: Log audit
        await trx('audit_logs').insert({
          id: trx.raw('gen_random_uuid()'),
          user_id: userId,
          action: 'ONLINE_ORDER_CREATED',
          resource: 'online_orders',
          resource_id: order.id,
          old_values: null,
          new_values: JSON.stringify(order),
          ip_address: null,
          user_agent: null,
          created_at: trx.fn.now(),
        });

        logger.info('SUCCESS: Online order processed', {
          orderId: order.id,
          status: order.status,
        });

        return {
          orderId: order.id,
          status: order.status,
          message: `Order created with status: ${order.status}`,
        };
      });
    } catch (error) {
      logger.error('ERROR: Process online order failed', { error });
      throw error;
    }
  }

  /**
   * Update order with inventory adjustment
   */
  static async updateOrderStatus(
    orderId: string,
    newStatus: string,
    userId: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      logger.info('Updating order status', { orderId, newStatus });

      return await db.transaction(async (trx) => {
        // Get current order
        const order = await trx('online_orders')
          .where('id', orderId)
          .whereNull('deleted_at')
          .first();

        if (!order) {
          throw new Error(`Order not found: ${orderId}`);
        }

        const oldStatus = order.status;

        // Update order
        await trx('online_orders')
          .where('id', orderId)
          .update({
            status: newStatus,
            processed_date: newStatus === 'PROCESSING' ? trx.fn.now() : order.processed_date,
            updated_at: trx.fn.now(),
          });

        // If cancelling, restore inventory
        if (newStatus === 'CANCELLED' && ['PENDING', 'PROCESSING'].includes(oldStatus) && order.batch_id) {
          const batch = await trx('ingredients')
            .where('id', order.batch_id)
            .whereNull('deleted_at')
            .forUpdate() //  GOOGLE STANDARD: Row Locking
            .first();

          if (batch) {
            await trx('ingredients')
              .where('id', order.batch_id)
              .update({
                current_stock: batch.current_stock + order.quantity,
                updated_at: trx.fn.now(),
              });

            logger.info('SUCCESS: Inventory restored after cancellation', {
              orderId,
              quantityRestored: order.quantity,
            });
          }
        }

        // Log audit
        await trx('audit_logs').insert({
          id: trx.raw('gen_random_uuid()'),
          user_id: userId,
          action: 'ORDER_STATUS_UPDATED',
          resource: 'online_orders',
          resource_id: orderId,
          old_values: JSON.stringify({ status: oldStatus }),
          new_values: JSON.stringify({ status: newStatus }),
          ip_address: null,
          user_agent: null,
          created_at: trx.fn.now(),
        });

        return {
          success: true,
          message: `Order status updated from ${oldStatus} to ${newStatus}`,
        };
      });
    } catch (error) {
      logger.error('ERROR: Update order status failed', { orderId, error });
      throw error;
    }
  }

  /**
   *  Get sales summary for dashboard
   */
  static async getSalesSummary(
    startDate?: Date,
    endDate?: Date
  ): Promise<{
    totalSales: number;
    totalRevenue: number;
    averageOrderValue: number;
    totalOrders: number;
    pendingOrders: number;
    completedOrders: number;
  }> {
    try {
      const start = startDate || new Date(new Date().setDate(1));
      const end = endDate || new Date();

      // Employee sales
      const salesResult = await db('employee_sales')
        .whereBetween('created_at', [start, end])
        .whereNull('deleted_at')
        .select(
          db.raw('COUNT(*) as count'),
          db.raw('COALESCE(SUM(final_amount), 0) as total')
        )
        .first();

      // Online orders
      const ordersResult = await db('online_orders')
        .whereBetween('order_date', [start, end])
        .whereNull('deleted_at')
        .select(
          db.raw('COUNT(*) as total'),
          db.raw('COALESCE(SUM(total_amount), 0) as revenue')
        )
        .first();

      // Pending orders
      const pendingResult = await db('online_orders')
        .where('status', 'PENDING')
        .whereNull('deleted_at')
        .count('* as count')
        .first();

      // Completed orders
      const completedResult = await db('online_orders')
        .where('status', 'DELIVERED')
        .whereBetween('order_date', [start, end])
        .whereNull('deleted_at')
        .count('* as count')
        .first();

      const totalSales = Number(salesResult?.count || 0);
      const totalRevenue = Number(salesResult?.total || 0) + Number(ordersResult?.revenue || 0);
      const totalOrders = Number(ordersResult?.total || 0);

      return {
        totalSales,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        averageOrderValue: totalOrders > 0 ? Math.round((totalRevenue / totalOrders) * 100) / 100 : 0,
        totalOrders,
        pendingOrders: Number(pendingResult?.count || 0),
        completedOrders: Number(completedResult?.count || 0),
      };
    } catch (error) {
      logger.error(' Get sales summary failed', { error });
      throw error;
    }
  }

  /**
   *  Get top selling products
   */
  static async getTopSellingProducts(limit = 10): Promise<
    Array<{
      batchId: string;
      totalQuantity: number;
      totalRevenue: number;
      salesCount: number;
    }>
  > {
    try {
      return await db('employee_sales')
        .whereNull('deleted_at')
        .groupBy('batch_id')
        .select(
          'batch_id',
          db.raw('SUM(quantity_sold) as total_quantity'),
          db.raw('SUM(final_amount) as total_revenue'),
          db.raw('COUNT(*) as sales_count')
        )
        .orderBy('total_revenue', 'desc')
        .limit(limit);
    } catch (error) {
      logger.error(' Get top selling products failed', { error });
      throw error;
    }
  }

  /**
   *  Get customer order history
   */
  static async getCustomerOrderHistory(customerEmail: string): Promise<any[]> {
    try {
      return await db('online_orders')
        .where('customer_email', customerEmail.toLowerCase())
        .whereNull('deleted_at')
        .orderBy('order_date', 'desc')
        .select('*');
    } catch (error) {
      logger.error(' Get customer order history failed', { customerEmail, error });
      throw error;
    }
  }

  /**
   *  Get seller performance
   */
  static async getSellerPerformance(sellerId: string): Promise<{
    totalSales: number;
    totalRevenue: number;
    averageSaleValue: number;
    topProduct: string | null;
  }> {
    try {
      const result = await db('employee_sales')
        .where('seller_id', sellerId)
        .whereNull('deleted_at')
        .select(
          db.raw('COUNT(*) as sales_count'),
          db.raw('SUM(final_amount) as total_revenue'),
          db.raw('AVG(final_amount) as avg_value'),
          db.raw('MAX(batch_id) as top_batch')
        )
        .first();

      return {
        totalSales: Number(result?.sales_count || 0),
        totalRevenue: Math.round(Number(result?.total_revenue || 0) * 100) / 100,
        averageSaleValue: Math.round(Number(result?.avg_value || 0) * 100) / 100,
        topProduct: result?.top_batch || null,
      };
    } catch (error) {
      logger.error(' Get seller performance failed', { sellerId, error });
      throw error;
    }
  }

  /**
   *  Export sales data (for reports)
   */
  static async exportSalesData(
    startDate: Date,
    endDate: Date,
    format: 'json' | 'csv' = 'json'
  ): Promise<string> {
    try {
      const sales = await db('employee_sales')
        .whereBetween('created_at', [startDate, endDate])
        .whereNull('deleted_at')
        .select('*');

      const orders = await db('online_orders')
        .whereBetween('order_date', [startDate, endDate])
        .whereNull('deleted_at')
        .select('*');

      const data = {
        exportDate: new Date().toISOString(),
        dateRange: { start: startDate, end: endDate },
        employeeSales: sales,
        onlineOrders: orders,
        summary: {
          totalEmployeeSales: sales.length,
          totalOnlineOrders: orders.length,
          totalRevenue: sales.reduce((sum, s) => sum + s.final_amount, 0) +
            orders.reduce((sum, o) => sum + o.total_amount, 0),
        },
      };

      if (format === 'json') {
        return JSON.stringify(data, null, 2);
      }

      // CSV format
      return this.convertToCSV(data);
    } catch (error) {
      logger.error(' Export sales data failed', { error });
      throw error;
    }
  }

  /**
   *  Helper: Convert to CSV
   */
  private static convertToCSV(data: any): string {
    let csv = 'Sales Export Report\n';
    csv += `Date,${new Date().toISOString()}\n\n`;

    csv += 'EMPLOYEE SALES\n';
    csv += 'ID,Seller,Buyer,Amount,Status,Date\n';
    data.employeeSales.forEach((sale: any) => {
      csv += `${sale.id},${sale.seller_id},${sale.buyer_id},${sale.final_amount},${sale.status},${sale.created_at}\n`;
    });

    csv += '\nONLINE ORDERS\n';
    csv += 'ID,Customer,Amount,Status,Date\n';
    data.onlineOrders.forEach((order: any) => {
      csv += `${order.id},${order.customer_email},${order.total_amount},${order.status},${order.order_date}\n`;
    });

    return csv;
  }
}
