import { Router } from 'express';
import { InventoryController } from '../../controllers/inventory.controller.js';
import { authMiddleware, restrictTo } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { inventoryLimiter } from '../../middleware/rate-limit.middleware.js';
import {
  GetInventoryQuerySchema,
  UpdateStockBodySchema,
  GetIngredientParamsSchema,
} from '../../schemas/inventory.schema.js';

const router = Router();

// All routes require JWT authentication
router.use(authMiddleware);

// Warehouse or higher roles only for most actions
const warehouseOrHigher = restrictTo('WAREHOUSE', 'MANAGER', 'ADMIN');

// Read-only routes (multiple roles can view)
router.get(
  '/',
  validate(GetInventoryQuerySchema),
  warehouseOrHigher,
  InventoryController.getAllStock
);

router.get(
  '/low-stock',
  warehouseOrHigher,
  InventoryController.getLowStock
);

router.get(
  '/expiring-soon',
  warehouseOrHigher,
  InventoryController.getExpiringSoon
);

router.get(
  '/:id',
  validate(GetIngredientParamsSchema),
  warehouseOrHigher,
  InventoryController.getIngredient
);

// Write routes (update stock) - restricted + rate limited
router.patch(
  '/update',
  inventoryLimiter,
  validate(UpdateStockBodySchema),
  restrictTo('WAREHOUSE', 'MANAGER', 'ADMIN'),
  InventoryController.updateStock
);

export default router;
