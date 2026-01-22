import { Router } from 'express';
import { UserController } from '../../controllers/user.controller.js';
import { authenticate, requireRole } from '../../middleware/auth.middleware.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Admin only routes
router.get('/', requireRole(['ADMIN', 'MANAGER']), UserController.getAll);
router.post('/', requireRole(['ADMIN']), UserController.create);
router.get('/role/:role', requireRole(['ADMIN', 'MANAGER']), UserController.getByRole);

// User-specific routes
router.get('/:id', requireRole(['ADMIN', 'MANAGER']), UserController.getById);
router.put('/:id', requireRole(['ADMIN']), UserController.update);
router.delete('/:id', requireRole(['ADMIN']), UserController.delete);
router.patch('/:id/toggle-active', requireRole(['ADMIN']), UserController.toggleActive);

export default router;
