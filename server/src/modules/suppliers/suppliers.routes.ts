import { Router } from 'express';
import { SupplierController } from './suppliers.controller';

const router = Router();

router.get('/', SupplierController.getAll);
router.get('/:id', SupplierController.getById);

export default router;
