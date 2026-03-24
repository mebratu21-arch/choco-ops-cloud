import { Router } from 'express';
import { AuditController } from '../../controllers/audit.controller.js';
import { authenticate, requireRole } from '../../middleware/auth.middleware.js';

const router = Router();

// All audit routes require authentication and admin/manager role
router.use(authenticate);
router.use(requireRole(['ADMIN', 'MANAGER', 'CONTROLLER']));

router.get('/', AuditController.getAll);
router.get('/date-range', AuditController.getByDateRange);
router.get('/user/:userId', AuditController.getByUser);
router.get('/entity/:entityType/:entityId?', AuditController.getByEntity);
router.get('/action/:action', AuditController.getByAction);
router.get('/:id', AuditController.getById);

export default router;
