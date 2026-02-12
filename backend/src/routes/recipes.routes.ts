import { Router } from 'express';
import { body } from 'express-validator';
import * as productionController from '../controllers/productionController.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

router.get('/', productionController.listRecipes);
router.get('/:id', productionController.getRecipe);

// Protected Management Routes
router.post(
  '/',
  authorizeRoles('admin', 'manager', 'production_worker'),
  [
    body('name').notEmpty().withMessage('Recipe name is required'),
    body('yield_quantity').isFloat({ min: 0 }).withMessage('Yield quantity required'),
    body('ingredients').isArray({ min: 1 }).withMessage('At least one ingredient required')
  ],
  productionController.createRecipe
);

router.put(
  '/:id',
  authorizeRoles('admin', 'manager', 'production_worker'),
  productionController.updateRecipe
);

router.delete(
  '/:id',
  authorizeRoles('admin', 'manager'),
  productionController.deleteRecipe
);

export default router;
