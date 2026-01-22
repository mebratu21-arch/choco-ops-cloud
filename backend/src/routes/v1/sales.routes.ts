import { Router } from 'express';
import { SalesController } from '../../controllers/sales.controller.js';
import { authenticate, requireRole } from '../../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);

// Product Sales
router.get('/sales', SalesController.getAllSales);
router.get('/sales/stats', SalesController.getSalesStats);
router.get('/sales/:id', SalesController.getSaleById);
router.post('/sales', requireRole(['ADMIN', 'MANAGER', 'CONTROLLER']), SalesController.createSale);

// Online Orders
router.get('/orders', SalesController.getAllOrders);
router.get('/orders/status/:status', SalesController.getOrdersByStatus);
router.get('/orders/number/:orderNumber', SalesController.getOrderByNumber);
router.get('/orders/:id', SalesController.getOrderById);
router.post('/orders', SalesController.createOrder);
router.put('/orders/:id', requireRole(['ADMIN', 'MANAGER', 'CONTROLLER']), SalesController.updateOrder);

export default router;
