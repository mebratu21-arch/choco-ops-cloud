import { Router } from 'express';
import { MechanicsController } from '../../controllers/mechanics.controller.js';
import { authMiddleware, restrictTo } from '../../middleware/auth.middleware.js'; // Corrected import
import { validate } from '../../middleware/validate.middleware.js';
import { MachineFixSchema } from '../../schemas/mechanics.schema.js';

const router = Router();

router.use(authMiddleware);

router.post(
  '/fix',
  restrictTo('MECHANIC', 'MANAGER', 'ADMIN'),
  validate(MachineFixSchema),
  MechanicsController.logFix
);

export default router;
