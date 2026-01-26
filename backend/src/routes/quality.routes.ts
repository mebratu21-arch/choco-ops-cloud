import { Router } from 'express';
import { QualityController } from '../controllers/quality.controller.js';
import { authenticate, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);

// Quality Controls
router.get('/', QualityController.getAllControls);
router.get('/stats', QualityController.getStats);
router.get('/status/:status', QualityController.getControlsByStatus);
router.get('/batch/:batchId', QualityController.getControlsByBatch);
router.get('/:id', QualityController.getControlById);
router.post('/', requireRole(['ADMIN', 'MANAGER', 'QC']), QualityController.createControl);
router.put('/:id', requireRole(['ADMIN', 'MANAGER', 'QC']), QualityController.updateControl);

// Quality Checks
router.get('/:controlId/checks', QualityController.getChecks);
router.post('/:controlId/checks', requireRole(['ADMIN', 'MANAGER', 'QC']), QualityController.createCheck);

export default router;
