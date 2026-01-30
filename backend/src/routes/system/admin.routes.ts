import { Router } from 'express';
import { AdminController } from '../../controllers/admin.controller.js';
import { authenticate, requireRole } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';

const router = Router();

router.use(authenticate);

// ============= USER MANAGEMENT =============
router.post(
  '/user',
  requireRole(['ADMIN']),
  AdminController.createUser
);

router.get(
  '/users',
  requireRole(['ADMIN']),
  AdminController.getAllUsers
);

router.get(
  '/stats',
  requireRole(['ADMIN', 'MANAGER']),
  AdminController.getSystemStats
);

// ============= ANNOUNCEMENTS =============
router.post(
  '/announcements',
  requireRole(['ADMIN', 'MANAGER']),
  AdminController.createAnnouncement
);

router.get(
  '/announcements',
  AdminController.getAnnouncements
);

router.get(
  '/announcements/:id',
  AdminController.getAnnouncement
);

router.put(
  '/announcements/:id',
  requireRole(['ADMIN', 'MANAGER']),
  AdminController.updateAnnouncement
);

router.delete(
  '/announcements/:id',
  requireRole(['ADMIN', 'MANAGER']),
  AdminController.deleteAnnouncement
);

// ============= TASKS =============
router.post(
  '/tasks',
  requireRole(['ADMIN', 'MANAGER']),
  AdminController.createTask
);

router.get(
  '/tasks',
  AdminController.getTasks
);

router.get(
  '/tasks/my',
  AdminController.getMyTasks
);

router.get(
  '/tasks/:id',
  AdminController.getTask
);

router.put(
  '/tasks/:id',
  AdminController.updateTask
);

router.post(
  '/tasks/:id/complete',
  AdminController.completeTask
);

router.delete(
  '/tasks/:id',
  requireRole(['ADMIN', 'MANAGER']),
  AdminController.deleteTask
);

export default router;
