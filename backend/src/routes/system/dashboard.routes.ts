import { Router } from 'express';
import { DashboardController } from '../../controllers/system/dashboard.controller.js';
import { authenticate, requireRole } from '../../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.get(
  '/stats',
  requireRole(['MANAGER', 'ADMIN', 'CONTROLLER']),
  DashboardController.getStats
);

export default router;
