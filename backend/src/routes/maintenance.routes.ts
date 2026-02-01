import { Router } from 'express';
import { body } from 'express-validator';
import * as mechanicController from '../controllers/mechanicController.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

router.get('/', mechanicController.listMaintenance);
router.get('/upcoming', mechanicController.getUpcoming);

router.post(
  '/', 
  authorizeRoles('admin', 'manager', 'mechanic'),
  [
      body('machine_id').isUUID(),
      body('maintenance_type').isIn(['routine', 'repair', 'installation', 'inspection'])
  ],
  mechanicController.createMaintenance
);

export default router;
