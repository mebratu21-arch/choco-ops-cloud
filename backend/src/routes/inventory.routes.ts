import { Router } from 'express';
import { body } from 'express-validator';
import * as inventoryController from '../controllers/inventoryController.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = Router();

// Apply auth to all routes
router.use(authenticateToken);

// Read Routes (Accessible to most)
router.get('/', inventoryController.listItems);
router.get('/search', inventoryController.searchItems);
router.get('/alerts/low-stock', inventoryController.getLowStockAlerts);
router.get('/alerts/expiry', inventoryController.getExpiryAlerts);
router.get('/:id', inventoryController.getItem);
router.get('/:id/movements', inventoryController.getMovements);

// Write Routes (Protected)
router.post(
  '/',
  authorizeRoles('ADMIN', 'MANAGER', 'WAREHOUSE'),
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('code').notEmpty().withMessage('Code is required'),
    body('category').isIn(['raw_material', 'packaging', 'ingredient']).withMessage('Invalid category'),
    body('unit').notEmpty().withMessage('Unit is required')
  ],
  inventoryController.createItem
);

router.put(
  '/:id',
  authorizeRoles('ADMIN', 'MANAGER', 'WAREHOUSE'),
  inventoryController.updateItem
);

router.delete(
  '/:id',
  authorizeRoles('ADMIN', 'MANAGER'), // Deletion strictly restricted
  inventoryController.deleteItem
);

router.post(
  '/:id/stock',
  authorizeRoles('ADMIN', 'MANAGER', 'WAREHOUSE', 'PRODUCTION'), // Production can consume stock
  [
    body('quantity').isFloat({ min: 0.01 }).withMessage('Quantity must be positive'),
    body('movementType').isIn(['in', 'out', 'adjustment', 'expired']).withMessage('Invalid movement type')
  ],
  inventoryController.updateStock
);

export default router;
