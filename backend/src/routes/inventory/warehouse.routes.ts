import { Router } from 'express';
import { WarehouseController } from '../../controllers/inventory/warehouse.controller.js';
import { authenticate, requireRole } from '../../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);

// Stock
router.get('/stock', WarehouseController.getAllStock);
router.get('/stock/type/:type', WarehouseController.getStockByType);
router.get('/stock/location', WarehouseController.getStockByLocation);
router.get('/stock/:id', WarehouseController.getStockById);
router.put('/stock/:id', requireRole(['ADMIN', 'MANAGER', 'WAREHOUSE']), WarehouseController.updateStock);

// Movements
router.get('/movements', WarehouseController.getAllMovements);
router.get('/movements/item/:itemId', WarehouseController.getMovementsByItem);
router.post('/movements', requireRole(['ADMIN', 'MANAGER', 'WAREHOUSE']), WarehouseController.createMovement);

export default router;
