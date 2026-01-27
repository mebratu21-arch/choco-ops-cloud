import { Router } from 'express';
import { ProductionController } from '../../controllers/production/production.controller.js';
import { authenticate, authorize } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { productionSchemas } from '../../schemas/index.js';

const router = Router();

router.use(authenticate);

router.get('/:id', ProductionController.getBatch);

router.post(
  '/',
  authorize('MANAGER', 'PRODUCTION'),
  validate(productionSchemas.create),
  ProductionController.createBatch
);

router.patch(
  '/:id',
  authorize('MANAGER', 'PRODUCTION'),
  validate(productionSchemas.update),
  ProductionController.updateBatch
);

export default router;
