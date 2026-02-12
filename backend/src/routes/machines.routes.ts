import { Router } from 'express';
import { body } from 'express-validator';
import * as mechanicController from '../controllers/mechanicController.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

router.get('/', mechanicController.listMachines);
router.get('/:id', mechanicController.getMachine);

router.post(
  '/',
  authorizeRoles('admin', 'manager', 'mechanic'),
  [
    body('name').notEmpty(),
    body('machine_code').notEmpty(),
    body('type').notEmpty()
  ],
  mechanicController.createMachine
);

router.put(
  '/:id',
  authorizeRoles('admin', 'manager', 'mechanic'),
  mechanicController.updateMachine
);

export default router;
