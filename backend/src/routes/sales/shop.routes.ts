import { Router } from 'express';
import { ShopController } from '../../controllers/sales/shop.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);

// Public shop for all authenticated employees
router.get('/catalog', ShopController.getCatalog);
router.get('/products/:id', ShopController.getProduct);
router.post('/orders', ShopController.createOrder);

export default router;
