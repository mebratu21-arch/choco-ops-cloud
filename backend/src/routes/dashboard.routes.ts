import { Router } from 'express';
import * as dashboardController from '../controllers/dashboardController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

router.get('/stats', dashboardController.getDashboardStats);
router.get('/analytics', dashboardController.getAnalytics);

export default router;
