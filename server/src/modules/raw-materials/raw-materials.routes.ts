import { Router } from 'express';
import { RawMaterialController } from './raw-materials.controller';

const router = Router();

router.get('/', RawMaterialController.getAll);
router.get('/low-stock', RawMaterialController.getLowStock);

export default router;
