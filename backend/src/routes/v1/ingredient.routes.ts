import { Router } from 'express';
import { IngredientController } from '../../controllers/ingredient.controller.js';
import { authenticate, requireRole } from '../../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/', IngredientController.getAll);
router.get('/low-stock', IngredientController.getLowStock);
router.get('/expiring-soon', IngredientController.getExpiringSoon);
router.get('/:id', IngredientController.getById);

export default router;
