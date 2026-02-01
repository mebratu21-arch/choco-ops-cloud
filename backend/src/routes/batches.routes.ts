import { Router } from 'express';
import { body } from 'express-validator';
import * as productionController from '../controllers/productionController.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

router.get('/', productionController.listBatches);
router.get('/:id', productionController.getBatch);

router.post(
  '/check-ingredients', 
  productionController.checkIngredients
);

router.post(
  '/',
  authorizeRoles('admin', 'manager', 'production_worker'),
  [
    body('recipeId').isUUID().withMessage('Valid recipe ID required'),
    body('targetQuantity').isFloat({ min: 1 }).withMessage('Target quantity must be positive')
  ],
  productionController.createBatch
);

router.put(
  '/:id/status',
  authorizeRoles('admin', 'manager', 'production_worker'),
  [
    body('status').isIn(['pending', 'mixing', 'cooking', 'cooling', 'packaging', 'completed', 'failed'])
  ],
  productionController.updateBatchStatus
);

export default router;
