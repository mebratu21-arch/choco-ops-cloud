import { Router } from 'express';
import { body } from 'express-validator';
import * as qcController from '../controllers/qcController.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

router.get('/', qcController.listQCChecks);
router.get('/stats', qcController.getQCStats);
router.get('/defects/analysis', qcController.getDefectAnalysis);
router.get('/:id', qcController.getQCCheck);

router.post(
  '/',
  authorizeRoles('admin', 'manager', 'quality_controller'),
  [
    body('batch_id').isUUID().withMessage('Valid Batch ID required'),
    body('result').isIn(['approved', 'rejected', 'quarantine']).withMessage('Invalid result status'),
    body('appearance_score').isInt({ min: 1, max: 5 }).withMessage('Score must be 1-5'),
    body('texture_score').isInt({ min: 1, max: 5 }).withMessage('Score must be 1-5'),
    body('taste_score').isInt({ min: 1, max: 5 }).withMessage('Score must be 1-5')
  ],
  qcController.createQCCheck
);

router.put(
  '/:id',
  authorizeRoles('admin', 'manager', 'quality_controller'),
  qcController.updateQCCheck
);

router.delete(
  '/:id',
  authorizeRoles('admin', 'manager'),
  qcController.deleteQCCheck
);

export default router;
