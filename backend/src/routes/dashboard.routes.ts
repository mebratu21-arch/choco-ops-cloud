import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller.js';
import { authMiddleware, restrictTo } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authMiddleware);

router.get(
  '/stats',
  restrictTo('MANAGER', 'ADMIN', 'CONTROLLER'),
  DashboardController.getStats
);

export default router;
