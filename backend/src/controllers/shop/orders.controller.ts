import { Request, Response } from 'express';
import { db } from '../../config/database.js';

interface OrderItem {
  product_id: string;
  sku: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
}

interface CreateOrderRequest {
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  items: OrderItem[];
  payment_method: string;
  subtotal: number;
  tax: number;
  total: number;
  notes?: string;
}

export class OrdersController {
  /**
   * Create a new order
   */
  static async create(req: Request, res: Response) {
    try {
      const orderData: CreateOrderRequest = req.body;

      // Start transaction
      const result = await db.transaction(async (trx) => {
        // Create order
        const [order] = await trx('shop_orders').insert({
          customer_name: orderData.customer_name,
          customer_email: orderData.customer_email,
          customer_phone: orderData.customer_phone,
          payment_method: orderData.payment_method,
          subtotal: orderData.subtotal,
          tax: orderData.tax,
          total: orderData.total,
          status: 'completed',
          notes: orderData.notes,
          created_at: new Date()
        }).returning('*');

        // Create order items
        const orderItems = orderData.items.map(item => ({
          order_id: order.id,
          product_id: item.product_id,
          sku: item.sku,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          subtotal: item.subtotal
        }));

        await trx('shop_order_items').insert(orderItems);

        // Update product stock
        for (const item of orderData.items) {
          await trx('products')
            .where('id', item.product_id)
            .decrement('stock', item.quantity);
        }

        return order;
      });

      res.status(201).json({
        success: true,
        data: result,
        message: 'Order created successfully'
      });
    } catch (error) {
      console.error('Error creating order:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create order'
      });
    }
  }

  /**
   * Get today's orders
   */
  static async getToday(req: Request, res: Response) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const orders = await db('shop_orders')
        .where('created_at', '>=', today)
        .orderBy('created_at', 'desc');

      // Get order items for each order
      const ordersWithItems = await Promise.all(
        orders.map(async (order) => {
          const items = await db('shop_order_items')
            .where('order_id', order.id);
          
          return {
            ...order,
            items
          };
        })
      );

      res.json({
        success: true,
        data: ordersWithItems,
        count: ordersWithItems.length
      });
    } catch (error) {
      console.error('Error fetching today orders:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch orders'
      });
    }
  }

  /**
   * Get order by ID
   */
  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const order = await db('shop_orders')
        .where('id', id)
        .first();

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      const items = await db('shop_order_items')
        .where('order_id', id);

      res.json({
        success: true,
        data: {
          ...order,
          items
        }
      });
    } catch (error) {
      console.error('Error fetching order:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch order'
      });
    }
  }

  /**
   * Get all orders with pagination
   */
  static async getAll(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = (page - 1) * limit;

      const orders = await db('shop_orders')
        .orderBy('created_at', 'desc')
        .limit(limit)
        .offset(offset);

      const [{ count }] = await db('shop_orders').count('* as count');

      res.json({
        success: true,
        data: orders,
        pagination: {
          page,
          limit,
          total: parseInt(count as string),
          pages: Math.ceil(parseInt(count as string) / limit)
        }
      });
    } catch (error) {
      console.error('Error fetching orders:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch orders'
      });
    }
  }
}
