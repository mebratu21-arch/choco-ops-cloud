import { Router } from 'express';
import { WarehouseController } from './warehouse.controller';

const router = Router();

router.get('/stock', WarehouseController.getStock);
router.get('/movements', WarehouseController.getMovements);

export default router;
