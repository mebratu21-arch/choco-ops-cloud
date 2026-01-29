import { Request, Response } from 'express';
import { db } from '../../config/database.js';

export class ProductsController {
  /**
   * Get all products with optional filtering
   */
  static async getAll(req: Request, res: Response) {
    try {
      const { category, search, sort = 'name', order = 'asc' } = req.query;

      let query = db('products').select('*');

      // Filter by category
      if (category && category !== 'all') {
        query = query.where('category', 'ilike', `%${category}%`);
      }

      // Search by name or SKU
      if (search) {
        query = query.where(function() {
          this.where('name', 'ilike', `%${search}%`)
              .orWhere('sku', 'ilike', `%${search}%`);
        });
      }

      // Sorting
      const validSortFields = ['name', 'price', 'created_at', 'stock'];
      const sortField = validSortFields.includes(sort as string) ? sort : 'name';
      query = query.orderBy(sortField as string, order === 'desc' ? 'desc' : 'asc');

      const products = await query;

      res.json({
        success: true,
        data: products,
        count: products.length
      });
    } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch products'
      });
    }
  }

  /**
   * Get unique categories
   */
  static async getCategories(req: Request, res: Response) {
    try {
      const categories = await db('products')
        .distinct('category')
        .whereNotNull('category')
        .orderBy('category');

      const categoryList = categories.map(c => c.category);

      res.json({
        success: true,
        data: categoryList
      });
    } catch (error) {
      console.error('Error fetching categories:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch categories'
      });
    }
  }

  /**
   * Get single product by ID
   */
  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const product = await db('products')
        .where('id', id)
        .first();

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      res.json({
        success: true,
        data: product
      });
    } catch (error) {
      console.error('Error fetching product:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch product'
      });
    }
  }

  /**
   * Get low stock products (stock < 50)
   */
  static async getLowStock(req: Request, res: Response) {
    try {
      const threshold = parseInt(req.query.threshold as string) || 50;

      const lowStockProducts = await db('products')
        .where('stock', '<', threshold)
        .orderBy('stock', 'asc');

      res.json({
        success: true,
        data: lowStockProducts,
        count: lowStockProducts.length
      });
    } catch (error) {
      console.error('Error fetching low stock products:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch low stock products'
      });
    }
  }
}
