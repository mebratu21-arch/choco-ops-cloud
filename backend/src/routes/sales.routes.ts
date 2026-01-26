import { Router } from 'express';
import { SalesController } from '../controllers/sales.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { salesSchemas } from '../schemas/index.js';

const router = Router();

router.use(authenticate);

router.post(
  '/employee',
  authorize('WAREHOUSE', 'MANAGER'),
  validate(salesSchemas.employeeCreate),
  SalesController.createEmployeeSale
);

router.post(
  '/online',
  authorize('WAREHOUSE', 'MANAGER'),
  validate(salesSchemas.onlineCreate),
  SalesController.createOnlineOrder
);

router.patch(
  '/employee/:id',
  authorize('WAREHOUSE', 'MANAGER'),
  validate(salesSchemas.employeeUpdate),
  SalesController.updateEmployeeSale
);

router.patch(
  '/online/:id',
  authorize('WAREHOUSE', 'MANAGER'),
  validate(salesSchemas.onlineUpdate),
  SalesController.updateOnlineOrder
);

export default router;
