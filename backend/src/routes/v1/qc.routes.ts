import { Router } from 'express';
import { QcController } from '../../controllers/qc.controller.js';
import { authMiddleware, restrictTo } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { QualityUpdateSchema } from '../../schemas/qc.schema.js';

const router = Router();

router.use(authMiddleware);

router.patch(
  '/update-batch/:batch_id',
  restrictTo('CONTROLLER', 'MANAGER', 'ADMIN'),
  validate(QualityUpdateSchema),
  QcController.updateBatch
);

export default router;
