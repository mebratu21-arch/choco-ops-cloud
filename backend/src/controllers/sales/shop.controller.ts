import { Request, Response } from 'express';

export class ShopController {
  static async getCatalog(req: Request, res: Response) {
    // Mock catalog for demo
    res.json({
      success: true,
      data: [
        { id: 'PROD-001', name: 'Dark Chocolate Bar', price: 5.00, discount_price: 3.50, stock: 'IN_STOCK' },
        { id: 'PROD-002', name: 'Milk Chocolate Truffles', price: 12.00, discount_price: 8.00, stock: 'LOW_STOCK' },
        { id: 'PROD-003', name: 'White Chocolate Chips', price: 4.50, discount_price: 3.00, stock: 'OUT_OF_STOCK' }
      ]
    });
  }

  static async getProduct(req: Request, res: Response) {
    const { id } = req.params;
    res.json({
      success: true,
      data: { 
        id, 
        name: 'Dark Chocolate Bar', 
        description: 'Rich 70% cocoa', 
        price: 5.00, 
        discount_price: 3.50 
      }
    });
  }

  static async createOrder(req: Request, res: Response) {
    res.status(201).json({
      success: true,
      data: { id: 'SHOP-ORD-' + Date.now(), status: 'CONFIRMED', ...req.body }
    });
  }
}
