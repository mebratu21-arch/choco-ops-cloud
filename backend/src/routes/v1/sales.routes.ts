// ============================================================================
// PRODUCTION-READY SALES ROUTES
// Path: src/routes/v1/sales.routes.ts
// ============================================================================

import { Router } from 'express';
import { SalesController } from '../../controllers/sales.controller.js';
import { authMiddleware, restrictTo } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { CreateEmployeeSaleSchema, UpdateOrderStatusSchema } from '../../schemas/sales.schema.js';

const router = Router();
router.use(authMiddleware);

const warehouseRole = restrictTo('WAREHOUSE', 'MANAGER', 'ADMIN');
const adminRole = restrictTo('ADMIN', 'MANAGER');

// ────────────────────────────────────────────
// EMPLOYEE SALES
// ────────────────────────────────────────────

router.post(
  '/employee', 
  warehouseRole, 
  validate(CreateEmployeeSaleSchema),
  SalesController.createEmployeeSale
);

router.get(
  '/employee/:id',
  warehouseRole,
  SalesController.getEmployeeSale
);

router.get(
  '/seller/me',
  warehouseRole,
  SalesController.getSalesForSeller
);

router.get(
  '/seller/performance',
  warehouseRole,
  SalesController.getSellerPerformance
);

// ────────────────────────────────────────────
// ONLINE ORDERS
// ────────────────────────────────────────────

router.post(
  '/online',
  warehouseRole,
  SalesController.createOnlineOrder
);

router.get(
  '/online-orders', 
  warehouseRole, 
  SalesController.getOrdersByStatus
);

router.get(
  '/online-orders/:id',
  warehouseRole,
  SalesController.getOnlineOrder
);

router.patch(
  '/online-orders/:id/status', 
  warehouseRole, 
  validate(UpdateOrderStatusSchema),
  SalesController.updateOrderStatus
);

router.get(
  '/online-orders/customer/:email',
  warehouseRole,
  SalesController.getCustomerHistory
);

// ────────────────────────────────────────────
// DASHBOARD & ANALYTICS
// ────────────────────────────────────────────

router.get(
  '/dashboard/summary',
  adminRole,
  SalesController.getDashboardSummary
);

router.get(
  '/export',
  adminRole,
  SalesController.exportSalesData
);

export default router;
