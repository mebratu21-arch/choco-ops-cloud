import { Router } from 'express';
import { body } from 'express-validator';
import * as managerController from '../controllers/managerController.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

// --- ANNOUNCEMENTS ---
router.get('/announcements', managerController.listAnnouncements);
router.post(
  '/announcements',
  authorizeRoles('admin', 'manager'),
  [
      body('title').notEmpty(),
      body('content').notEmpty(),
      body('priority').isIn(['normal', 'high', 'urgent']),
      body('target_roles').isArray()
  ],
  managerController.createAnnouncement
);
router.put(
  '/announcements/:id', 
  authorizeRoles('admin', 'manager'),
  [
      body('title').optional().notEmpty(),
      body('content').optional().notEmpty(),
      body('priority').optional().isIn(['normal', 'high', 'urgent']),
      body('target_roles').optional().isArray()
  ],
  managerController.updateAnnouncement
);
router.delete('/announcements/:id', authorizeRoles('admin', 'manager'), managerController.deleteAnnouncement);

// --- TASKS ---
router.get('/tasks/my', managerController.getMyTasks); // Current user's tasks
router.get('/tasks/all', authorizeRoles('admin', 'manager'), managerController.listAllTasks);
router.get('/tasks/:id', managerController.getTaskById);
router.post(
    '/tasks',
    authorizeRoles('admin', 'manager'),
    [
        body('title').notEmpty(),
        body('assigned_to').isUUID(),
        body('priority').isIn(['low', 'medium', 'high', 'critical'])
    ],
    managerController.assignTask
);
router.put('/tasks/:id/status', managerController.updateTaskStatus); // Assignee can complete

// --- ORDERS ---
router.get('/orders', authorizeRoles('admin', 'manager', 'warehouse_worker'), managerController.listOrders);
router.get('/orders/:id', authorizeRoles('admin', 'manager', 'warehouse_worker'), managerController.getOrder);
router.post(
    '/orders',
    authorizeRoles('admin', 'manager'),
    [
        body('supplier_id').isUUID(),
        body('items').isArray({ min: 1 })
    ],
    managerController.createOrder
);
router.put(
    '/orders/:id/status',
    authorizeRoles('admin', 'manager'), // Only manager receives? Warehouse maybe too.
    managerController.updateOrderStatus
);

export default router;
