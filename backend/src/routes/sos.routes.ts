import { Router } from 'express';
import { body } from 'express-validator';
import * as mechanicController from '../controllers/mechanicController.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

router.get('/', mechanicController.listAlerts);

router.post(
  '/', // Any auth user can raise SOS
  [
    body('machineId').isUUID().withMessage('Valid Machine ID required'),
    body('priority').isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid priority')
  ],
  mechanicController.createAlert
);

router.put(
  '/:id/assign',
  authorizeRoles('admin', 'manager', 'mechanic'),
  mechanicController.assignAlert
);

router.put(
  '/:id/resolve',
  authorizeRoles('admin', 'manager', 'mechanic'),
  // Accept either 'notes' or 'resolutionNotes' for frontend compatibility
  mechanicController.resolveAlert
);

router.delete('/:id', authorizeRoles('admin', 'manager'), mechanicController.cancelAlert);

export default router;
