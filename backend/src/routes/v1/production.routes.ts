import { Router } from 'express';
import { ProductionController } from '../../controllers/production.controller.js';
import { authenticate, requireRole } from '../../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);

// Batches
router.get('/batches', ProductionController.getAllBatches);
router.get('/batches/stats', ProductionController.getStats);
router.get('/batches/status/:status', ProductionController.getBatchesByStatus);
router.get('/batches/:id', ProductionController.getBatchById);
router.post('/batches', requireRole(['ADMIN', 'MANAGER', 'PRODUCTION']), ProductionController.createBatch);
router.put('/batches/:id', requireRole(['ADMIN', 'MANAGER', 'PRODUCTION']), ProductionController.updateBatch);

// Production Batches (line details)
router.get('/production-batches', ProductionController.getProductionBatches);
router.post('/production-batches', requireRole(['ADMIN', 'MANAGER', 'PRODUCTION']), ProductionController.createProductionBatch);
router.put('/production-batches/:id', requireRole(['ADMIN', 'MANAGER', 'PRODUCTION']), ProductionController.updateProductionBatch);

export default router;
