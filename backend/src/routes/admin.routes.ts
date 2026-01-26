import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller.js';
import { authMiddleware, restrictTo } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { AdminUserSchema } from '../schemas/admin.schema.js';

const router = Router();

router.use(authMiddleware);

router.post(
  '/user',
  restrictTo('ADMIN'),
  validate(AdminUserSchema),
  AdminController.createUser
);

router.get(
  '/users',
  restrictTo('ADMIN'),
  AdminController.getAllUsers
);

export default router;
