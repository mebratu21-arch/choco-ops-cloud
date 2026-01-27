import { Router } from 'express';
import { MechanicsController } from '../../controllers/quality/mechanics.controller.js';
import { authenticate, authorize } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { mechanicsSchemas } from '../../schemas/index.js';

const router = Router();

router.use(authenticate);

router.post(
  '/',
  authorize('MECHANIC', 'MANAGER'),
  validate(mechanicsSchemas.create),
  MechanicsController.logFix
);

router.get('/:id', MechanicsController.getFix);

router.patch(
  '/:id',
  authorize('MECHANIC', 'MANAGER'),
  validate(mechanicsSchemas.update),
  MechanicsController.updateFix
);

export default router;
