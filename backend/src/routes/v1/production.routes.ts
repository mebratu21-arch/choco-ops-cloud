import { Router } from 'express';
import { ProductionController } from '../../controllers/production.controller.js';
import { authMiddleware, restrictTo } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { CreateBatchBodySchema } from '../../schemas/production.schema.js';

const router = Router();

router.use(authMiddleware);

router.post(
  '/create',
  restrictTo('PRODUCTION', 'MANAGER', 'ADMIN'),
  validate(CreateBatchBodySchema),
  ProductionController.createBatch
);

router.get(
  '/',
  restrictTo('PRODUCTION', 'MANAGER', 'ADMIN', 'WAREHOUSE'),
  ProductionController.getBatches
);

export default router;
