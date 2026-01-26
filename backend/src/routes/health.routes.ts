import { Router } from 'express';
import { HealthController } from '../controllers/health.controller.js';

const router = Router();

router.get('/', HealthController.health);
router.get('/ready', HealthController.ready);

export default router;
