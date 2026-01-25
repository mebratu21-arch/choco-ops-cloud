import { Router } from 'express';
import { HealthController } from '../controllers/health.controller.js';

const router = Router();

// Public health checks - no auth required
router.get('/', HealthController.liveness);
router.get('/ready', HealthController.readiness);
router.get('/deep', HealthController.deepHealth);

export default router;
