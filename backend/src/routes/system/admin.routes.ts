import { Router } from 'express';
import { AdminController } from '../../controllers/admin.controller.js';
import { authenticate, requireRole } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';

const router = Router();

router.use(authenticate);

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

export default router;
