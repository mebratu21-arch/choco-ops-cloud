import { Router } from 'express';
import { SupplierController } from '../../controllers/supplier.controller.js';
import { authenticate, requireRole } from '../../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/', SupplierController.getAll);
router.get('/:id', SupplierController.getById);
router.post('/', requireRole(['ADMIN', 'MANAGER', 'WAREHOUSE']), SupplierController.create);
router.put('/:id', requireRole(['ADMIN', 'MANAGER', 'WAREHOUSE']), SupplierController.update);
router.delete('/:id', requireRole(['ADMIN', 'MANAGER']), SupplierController.delete);

export default router;
