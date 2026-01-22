import { Router } from 'express';
import { RawMaterialController } from '../../controllers/raw-material.controller.js';
import { authenticate, requireRole } from '../../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/', RawMaterialController.getAll);
router.get('/low-stock', RawMaterialController.getLowStock);
router.get('/:id', RawMaterialController.getById);
router.post('/', requireRole(['ADMIN', 'MANAGER', 'WAREHOUSE']), RawMaterialController.create);
router.put('/:id', requireRole(['ADMIN', 'MANAGER', 'WAREHOUSE']), RawMaterialController.update);
router.delete('/:id', requireRole(['ADMIN', 'MANAGER']), RawMaterialController.delete);

export default router;
