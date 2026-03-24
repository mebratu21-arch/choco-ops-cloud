import { Router } from 'express';
import { ProductsController } from '../../controllers/shop/products.controller.js';

const router = Router();

// Public routes (no authentication required for shop)
router.get('/', ProductsController.getAll);
router.get('/categories', ProductsController.getCategories);
router.get('/low-stock', ProductsController.getLowStock);
router.get('/:id', ProductsController.getById);

export default router;
