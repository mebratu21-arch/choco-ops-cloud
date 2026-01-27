import { Router } from 'express';
import { RecipeController } from '../../controllers/production/recipe.controller.js';
import { authenticate, requireRole } from '../../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/', RecipeController.getAll);
router.get('/:id', RecipeController.getById);
router.get('/:id/full', RecipeController.getWithIngredients);
router.post('/', requireRole(['ADMIN', 'MANAGER', 'PRODUCTION']), RecipeController.create);
router.put('/:id', requireRole(['ADMIN', 'MANAGER', 'PRODUCTION']), RecipeController.update);
router.delete('/:id', requireRole(['ADMIN', 'MANAGER']), RecipeController.delete);

// Recipe ingredients
router.post('/:id/ingredients', requireRole(['ADMIN', 'MANAGER', 'PRODUCTION']), RecipeController.addIngredient);
router.delete('/:id/ingredients/:ingredientId', requireRole(['ADMIN', 'MANAGER']), RecipeController.removeIngredient);

export default router;
