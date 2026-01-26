import { Router } from 'express';
import { QcController } from '../controllers/qc.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { qcSchemas } from '../schemas/index.js';

const router = Router();

router.use(authenticate);

router.post(
  '/',
  authorize('QC', 'MANAGER'),
  validate(qcSchemas.create),
  QcController.createCheck
);

router.get('/:id', QcController.getCheck);

router.patch(
  '/:id',
  authorize('QC', 'MANAGER'),
  validate(qcSchemas.update),
  QcController.updateCheck
);

export default router;
