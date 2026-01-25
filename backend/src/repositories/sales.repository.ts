// ============================================================================
// PRODUCTION-READY SALES REPOSITORY
// Path: src/repositories/sales.repository.ts
// ============================================================================

import { db } from '../config/database.js';
import { Knex } from 'knex';
import { logger } from '../utils/logger.js';

// ────────────────────────────────────────────
// INTERFACES
// ────────────────────────────────────────────

export interface EmployeeSaleCreateInput {
  seller_id: string;
  buyer_id: string;
  batch_id: string;
  quantity_sold: number;
  unit: string;
  original_price: number;
  discount_percentage?: number;
  final_amount: number;
  payment_method?: 'CASH' | 'CARD' | 'TRANSFER';
  notes?: string;
}

export interface EmployeeSale {
  id: string;
  seller_id: string;
  buyer_id: string;
  batch_id: string;
  quantity_sold: number;
  unit: string;
  original_price: number;
  discount_percentage: number;
  final_amount: number;
  payment_method: 'CASH' | 'CARD' | 'TRANSFER';
  status: 'PENDING' | 'PAID' | 'REFUNDED';
  notes: string | null;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export interface OnlineOrderCreateInput {
  customer_email: string;
  customer_name?: string;
  batch_id?: string;
  quantity: number;
  unit: string;
  total_amount: number;
  status?: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  notes?: string;
}

export interface OnlineOrder {
  id: string;
  customer_email: string;
  customer_name: string | null;
  batch_id: string | null;
  quantity: number;
  unit: string;
  total_amount: number;
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  order_date: Date;
  processed_date: Date | null;
  notes: string | null;
  deleted_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

// ────────────────────────────────────────────
// VALIDATION CLASS
// ────────────────────────────────────────────

class SalesValidator {
  /**
   * Validate employee sale input data
   */
  static validateEmployeeSaleInput(input: EmployeeSaleCreateInput): void {
    if (!input.seller_id?.trim()) throw new Error('seller_id is required');
    if (!input.buyer_id?.trim()) throw new Error('buyer_id is required');
    if (!input.batch_id?.trim()) throw new Error('batch_id is required');
    if (!input.unit?.trim()) throw new Error('unit is required');

    if (typeof input.quantity_sold !== 'number' || input.quantity_sold <= 0) {
      throw new Error('quantity_sold must be > 0');
    }
    if (input.quantity_sold > 1000000) throw new Error('quantity_sold exceeds max (1M)');

    if (typeof input.original_price !== 'number' || input.original_price <= 0) {
      throw new Error('original_price must be > 0');
    }
    if (input.original_price > 100000) throw new Error('original_price exceeds max (100K)');

    if (typeof input.final_amount !== 'number' || input.final_amount <= 0) {
      throw new Error('final_amount must be > 0');
    }
    if (input.final_amount > 100000000) throw new Error('final_amount exceeds max (100M)');

    if (input.discount_percentage !== undefined) {
      if (input.discount_percentage < 0 || input.discount_percentage > 100) {
        throw new Error('discount_percentage must be 0-100');
      }
    }

    const discountPercent = input.discount_percentage || 0;
    const expectedAmount = input.original_price * input.quantity_sold * (1 - discountPercent / 100);

    if (Math.abs(input.final_amount - expectedAmount) > 0.01) {
      throw new Error(
        `Final amount mismatch. Expected: ${expectedAmount.toFixed(2)}, Got: ${input.final_amount}`
      );
    }

    const validPaymentMethods = ['CASH', 'CARD', 'TRANSFER'];
    if (input.payment_method && !validPaymentMethods.includes(input.payment_method)) {
      throw new Error(`payment_method must be: ${validPaymentMethods.join(', ')}`);
    }

    if (input.notes && input.notes.length > 1000) {
      throw new Error('notes must not exceed 1000 characters');
    }
  }

  /**
   * Validate online order input
   */
  static validateOnlineOrderInput(input: OnlineOrderCreateInput): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(input.customer_email)) {
      throw new Error('Invalid email address format');
    }

    if (input.customer_name && input.customer_name.length > 200) {
      throw new Error('customer_name exceeds 200 characters');
    }

    if (typeof input.quantity !== 'number' || input.quantity <= 0) {
      throw new Error('quantity must be > 0');
    }
    if (input.quantity > 1000) throw new Error('quantity exceeds max (1000 units)');

    if (!input.unit?.trim()) throw new Error('unit is required');
    const validUnits = ['kg', 'g', 'liter', 'ml', 'unit', 'pack'];
    if (!validUnits.includes(input.unit.toLowerCase())) {
      throw new Error(`unit must be: ${validUnits.join(', ')}`);
    }

    if (typeof input.total_amount !== 'number' || input.total_amount <= 0) {
      throw new Error('total_amount must be > 0');
    }
    if (input.total_amount > 10000000) throw new Error('total_amount exceeds max (10M)');

    if (input.status) {
      const validStatuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
      if (!validStatuses.includes(input.status)) {
        throw new Error(`status must be: ${validStatuses.join(', ')}`);
      }
    }

    if (input.notes && input.notes.length > 1000) {
      throw new Error('notes exceeds 1000 characters');
    }
  }
}

// ────────────────────────────────────────────
// REPOSITORY CLASS
// ────────────────────────────────────────────

export class SalesRepository {
  // ════════════════════════════════════════════
  // BATCHES
  // ════════════════════════════════════════════

  /**
   * Find a batch by ID
   */
  static async findBatch(batchId: string, trx?: Knex.Transaction) {
    const connection = trx || db;
    return connection('batches')
      .where({ id: batchId })
      .whereNull('deleted_at')
      .first();
  }

  /**
   * Get batch for sale with stock info
   */
  static async getBatchForSale(batchId: string, trx: Knex.Transaction) {
    return trx('batches')
      .where({ id: batchId })
      .whereNull('deleted_at')
      .first();
  }

  // ════════════════════════════════════════════
  // EMPLOYEE SALES
  // ════════════════════════════════════════════

  /**
   * Create employee sale WITH TRANSACTION
   */
  static async createEmployeeSale(
    input: EmployeeSaleCreateInput,
    trx: Knex.Transaction
  ): Promise<EmployeeSale> {
    try {
      SalesValidator.validateEmployeeSaleInput(input);

      // Verify parties and stock in parallel
      const [seller, buyer, batch] = await Promise.all([
        trx('users').where({ id: input.seller_id, is_active: true }).first(),
        trx('users').where({ id: input.buyer_id, is_active: true }).first(),
        trx('batches').where({ id: input.batch_id }).whereNull('deleted_at').first(),
      ]);

      if (!seller) throw new Error(`Seller not found or inactive: ${input.seller_id}`);
      if (!buyer) throw new Error(`Buyer not found or inactive: ${input.buyer_id}`);
      if (!batch) throw new Error(`Batch not found: ${input.batch_id}`);

      if (batch.current_stock < input.quantity_sold) {
        throw new Error(`Insufficient stock: ${batch.current_stock} available, ${input.quantity_sold} requested`);
      }

      const [sale] = await trx('employee_sales')
        .insert({
          id: trx.raw('gen_random_uuid()'),
          seller_id: input.seller_id,
          buyer_id: input.buyer_id,
          batch_id: input.batch_id,
          quantity_sold: input.quantity_sold,
          unit: input.unit,
          original_price: input.original_price,
          discount_percentage: input.discount_percentage || 0,
          final_amount: input.final_amount,
          payment_method: input.payment_method || 'CASH',
          status: 'PAID',
          notes: input.notes || null,
          created_at: trx.fn.now(),
          updated_at: trx.fn.now(),
        })
        .returning('*');

      logger.info('SUCCESS: Employee sale created', { saleId: sale.id, amount: input.final_amount });
      return sale;
    } catch (error) {
      logger.error(' Create employee sale repository failed', { error });
      throw error;
    }
  }

  /**
   *  Find employee sale by ID
   */
  static async findEmployeeSaleById(id: string): Promise<EmployeeSale | undefined> {
    try {
      return await db('employee_sales')
        .where({ id })
        .whereNull('deleted_at')
        .first();
    } catch (error) {
      logger.error(' Find employee sale failed', { id, error });
      throw error;
    }
  }

  /**
   *  Find sales by seller with pagination
   */
  static async findEmployeeSalesBySeller(
    sellerId: string,
    limit = 20,
    offset = 0
  ): Promise<EmployeeSale[]> {
    try {
      return await db('employee_sales')
        .where({ seller_id: sellerId })
        .whereNull('deleted_at')
        .orderBy('created_at', 'desc')
        .limit(Math.min(limit, 100))
        .offset(Math.max(offset, 0));
    } catch (error) {
      logger.error(' Find sales by seller failed', { sellerId, error });
      throw error;
    }
  }

  /**
   *  Find sales by status with pagination
   */
  static async findEmployeeSalesByStatus(
    status: 'PENDING' | 'PAID' | 'REFUNDED',
    limit = 20,
    offset = 0
  ): Promise<EmployeeSale[]> {
    try {
      return await db('employee_sales')
        .where({ status })
        .whereNull('deleted_at')
        .orderBy('created_at', 'desc')
        .limit(Math.min(limit, 100))
        .offset(Math.max(offset, 0));
    } catch (error) {
      logger.error(' Find sales by status failed', { status, error });
      throw error;
    }
  }

  /**
   *  Update employee sale
   */
  static async updateEmployeeSale(
    id: string,
    data: Partial<{ status: 'PENDING' | 'PAID' | 'REFUNDED'; notes: string }>,
    trx?: Knex.Transaction
  ): Promise<EmployeeSale | undefined> {
    try {
      const connection = trx || db;
      const [updated] = await connection('employee_sales')
        .where({ id })
        .whereNull('deleted_at')
        .update({
          ...data,
          updated_at: connection.fn.now(),
        })
        .returning('*');

      logger.info('SUCCESS: Employee sale updated', { saleId: id });
      return updated;
    } catch (error) {
      logger.error(' Update employee sale failed', { id, error });
      throw error;
    }
  }

  /**
   *  Soft delete sale (audit trail)
   */
  static async softDeleteEmployeeSale(
    id: string,
    trx?: Knex.Transaction
  ): Promise<EmployeeSale | undefined> {
    try {
      const connection = trx || db;
      const [deleted] = await connection('employee_sales')
        .where('id', id)
        .whereNull('deleted_at')
        .update({
          deleted_at: connection.fn.now(),
          updated_at: connection.fn.now(),
        })
        .returning('*');

      logger.info('SUCCESS: Employee sale soft deleted', { saleId: id });
      return deleted;
    } catch (error) {
      logger.error(' Soft delete sale failed', { id, error });
      throw error;
    }
  }

  // ════════════════════════════════════════════
  // ONLINE ORDERS
  // ════════════════════════════════════════════

  /**
   * Create online order with validation
   */
  static async createOnlineOrder(input: OnlineOrderCreateInput): Promise<OnlineOrder> {
    try {
      // Validate input
      SalesValidator.validateOnlineOrderInput(input);

      // Verify batch if provided
      if (input.batch_id) {
        const batch = await db('ingredients')
          .where('id', input.batch_id)
          .whereNull('deleted_at')
          .first();

        if (!batch) throw new Error(`Batch not found: ${input.batch_id}`);
        if (batch.current_stock < input.quantity) {
          throw new Error(`Insufficient stock: ${batch.current_stock} available`);
        }
      }

      // Create order
      const [order] = await db('online_orders')
        .insert({
          id: db.raw('gen_random_uuid()'),
          customer_email: input.customer_email.toLowerCase().trim(),
          customer_name: input.customer_name?.trim() || null,
          batch_id: input.batch_id || null,
          quantity: input.quantity,
          unit: input.unit.toLowerCase(),
          total_amount: input.total_amount,
          status: input.status || 'PENDING',
          notes: input.notes || null,
          order_date: db.fn.now(),
          created_at: db.fn.now(),
          updated_at: db.fn.now(),
        })
        .returning('*');

      logger.info('SUCCESS: Online order created', {
        orderId: order.id,
        customer: input.customer_email,
        amount: input.total_amount,
      });

      return order;
    } catch (error) {
      logger.error(' Create online order failed', { error });
      throw error;
    }
  }

  /**
   *  Get all online orders
   */
  static async getOnlineOrders(limit = 20, offset = 0) {
    return db('online_orders')
      .whereNull('deleted_at')
      .orderBy('order_date', 'desc')
      .limit(Math.min(limit, 100))
      .offset(offset);
  }

  /**
   *  Find order by ID
   */
  static async findOnlineOrderById(id: string): Promise<OnlineOrder | undefined> {
    try {
      return await db('online_orders')
        .where('id', id)
        .whereNull('deleted_at')
        .first();
    } catch (error) {
      logger.error(' Find order failed', { id, error });
      throw error;
    }
  }

  /**
   *  Find orders by status with pagination
   */
  static async findOnlineOrdersByStatus(
    status: string,
    limit = 20,
    offset = 0
  ): Promise<OnlineOrder[]> {
    try {
      if (limit > 100) limit = 100;
      if (offset < 0) offset = 0;

      const validStatuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
      if (!validStatuses.includes(status)) throw new Error(`Invalid status: ${status}`);

      return await db('online_orders')
        .where('status', status)
        .whereNull('deleted_at')
        .orderBy('order_date', 'desc')
        .limit(limit)
        .offset(offset);
    } catch (error) {
      logger.error(' Find orders by status failed', { status, error });
      throw error;
    }
  }

  /**
   *  Find orders by customer email
   */
  static async findOnlineOrdersByCustomer(
    customerEmail: string,
    limit = 20,
    offset = 0
  ): Promise<OnlineOrder[]> {
    try {
      if (limit > 100) limit = 100;
      if (offset < 0) offset = 0;

      return await db('online_orders')
        .where('customer_email', customerEmail.toLowerCase().trim())
        .whereNull('deleted_at')
        .orderBy('order_date', 'desc')
        .limit(limit)
        .offset(offset);
    } catch (error) {
      logger.error(' Find orders by customer failed', { customerEmail, error });
      throw error;
    }
  }

  /**
   *  Get pending orders count
   */
  static async countOnlineOrdersPending(): Promise<number> {
    try {
      const result = await db('online_orders')
        .where('status', 'PENDING')
        .whereNull('deleted_at')
        .count('* as total')
        .first();
      return Number(result?.total || 0);
    } catch (error) {
      logger.error(' Count pending orders failed', { error });
      return 0;
    }
  }

  /**
   *  Get orders count by date range
   */
  static async getOrdersCountByDateRange(startDate: Date, endDate: Date): Promise<number> {
    try {
      const result = await db('online_orders')
        .whereBetween('order_date', [startDate, endDate])
        .whereNull('deleted_at')
        .count('* as total')
        .first();
      return Number(result?.total || 0);
    } catch (error) {
      logger.error(' Get orders count failed', { error });
      throw error;
    }
  }

  /**
   *  Update order status
   */
  static async updateOrderStatus(id: string, status: string, trx?: Knex.Transaction) {
    const connection = trx || db;
    const [updated] = await connection('online_orders')
      .where({ id })
      .update({
        status,
        processed_date: status === 'PROCESSING' ? connection.fn.now() : undefined,
        updated_at: connection.fn.now(),
      })
      .returning('*');
    return updated;
  }

  /**
   *  Update order status and details
   */
  static async updateOnlineOrder(
    id: string,
    data: Partial<{
      status: string;
      processed_date: Date;
      notes: string;
    }>,
    trx?: Knex.Transaction
  ): Promise<OnlineOrder | undefined> {
    try {
      const connection = trx || db;

      if (data.status) {
        const validStatuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
        if (!validStatuses.includes(data.status)) throw new Error(`Invalid status: ${data.status}`);
      }

      if (data.notes && data.notes.length > 1000) {
        throw new Error('notes exceeds 1000 characters');
      }

      const [updated] = await connection('online_orders')
        .where('id', id)
        .whereNull('deleted_at')
        .update({
          ...data,
          updated_at: connection.fn.now(),
        })
        .returning('*');

      logger.info('SUCCESS: Online order updated', { orderId: id });
      return updated;
    } catch (error) {
      logger.error(' Update order failed', { id, error });
      throw error;
    }
  }

  /**
   *  Soft delete order
   */
  static async softDeleteOnlineOrder(
    id: string,
    trx?: Knex.Transaction
  ): Promise<OnlineOrder | undefined> {
    try {
      const connection = trx || db;
      const [deleted] = await connection('online_orders')
        .where('id', id)
        .whereNull('deleted_at')
        .update({
          deleted_at: connection.fn.now(),
          updated_at: connection.fn.now(),
        })
        .returning('*');

      logger.info('SUCCESS: Online order soft deleted', { orderId: id });
      return deleted;
    } catch (error) {
      logger.error(' Soft delete order failed', { id, error });
      throw error;
    }
  }

  // ════════════════════════════════════════════
  // DASHBOARD HELPERS
  // ════════════════════════════════════════════

  /**
   * Get today's employee sales count
   */
  static async countEmployeeSalesToday(): Promise<number> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const result = await db('employee_sales')
        .whereBetween('created_at', [today, tomorrow])
        .whereNull('deleted_at')
        .count('* as total')
        .first();
      return Number(result?.total || 0);
    } catch (error) {
      logger.error(' Count today sales failed', { error });
      return 0;
    }
  }

  /**
   * Get sales summary for dashboard (Optimized Parallel Query)
   */
  static async getSalesSummary(): Promise<{
    totalToday: number;
    amountToday: number;
    totalMonth: number;
    amountMonth: number;
    pendingOrders: number;
  }> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

      // [SECURITY] GOOGLE STANDARD: Parallel Queries for Speed
      const [todayStats, monthStats, pendingStats] = await Promise.all([
        // Today
        db('employee_sales')
          .where('created_at', '>=', today)
          .whereNull('deleted_at')
          .select(db.raw('COUNT(id) as count, COALESCE(SUM(final_amount), 0) as amount'))
          .first(),
        
        // Month
        db('employee_sales')
          .where('created_at', '>=', monthStart)
          .whereNull('deleted_at')
          .select(db.raw('COUNT(id) as count, COALESCE(SUM(final_amount), 0) as amount'))
          .first(),

        // Pending
        db('online_orders')
          .where('status', 'PENDING')
          .whereNull('deleted_at')
          .count('id as count')
          .first()
      ]);

      return {
        totalToday: Number(todayStats?.count || 0),
        amountToday: Number(todayStats?.amount || 0),
        totalMonth: Number(monthStats?.count || 0),
        amountMonth: Number(monthStats?.amount || 0),
        pendingOrders: Number(pendingStats?.count || 0),
      };
    } catch (error: any) {
      logger.error(' Get sales summary failed', { error: error.message });
      throw error;
    }
  }

  /**
   *  Get sales count by date range
   */
  static async getSalesCountByDateRange(startDate: Date, endDate: Date): Promise<number> {
    const result = await db('employee_sales')
      .whereBetween('created_at', [startDate, endDate])
      .whereNull('deleted_at')
      .count('* as total')
      .first();
    return Number(result?.total || 0);
  }

  /**
   *  Get total sales amount by date range
   */
  static async getTotalSalesAmountByDateRange(startDate: Date, endDate: Date): Promise<number> {
    const result = await db('employee_sales')
      .whereBetween('created_at', [startDate, endDate])
      .whereNull('deleted_at')
      .sum('final_amount as total')
      .first();
    return Number(result?.total || 0);
  }
}
