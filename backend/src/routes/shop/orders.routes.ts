import { Router } from 'express';
import { OrdersController } from '../../controllers/shop/orders.controller.js';

const router = Router();

router.post('/', OrdersController.create);
router.get('/today', OrdersController.getToday);
router.get('/:id', OrdersController.getById);
router.get('/', OrdersController.getAll);

export default router;
