import { Router } from 'express';
import { InventoryController } from '../../controllers/inventory/inventory.controller.js';
import { authenticate, authorize } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { inventorySchemas } from '../../schemas/index.js';

const router = Router();

router.use(authenticate);

router.get('/low-stock', InventoryController.getLowStock);
router.get('/expiring', InventoryController.getExpiringSoon);

router.post(
  '/',
  authorize('MANAGER', 'WAREHOUSE'),
  validate(inventorySchemas.create),
  InventoryController.create
);

router.put(
  '/:id',
  authorize('MANAGER', 'WAREHOUSE'),
  validate(inventorySchemas.update),
  InventoryController.updateStock
);

export default router;
