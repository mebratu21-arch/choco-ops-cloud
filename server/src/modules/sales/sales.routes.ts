import { Router } from 'express';
import { SalesController } from './sales.controller';

const router = Router();

router.get('/', SalesController.getAll);
router.get('/stats', SalesController.getStats);

export default router;
