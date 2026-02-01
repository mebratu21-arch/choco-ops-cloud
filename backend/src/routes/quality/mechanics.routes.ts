import { Router } from 'express';
import { MechanicsController } from '../../controllers/quality/mechanics.controller.js';
import { authenticate, authorize, requireRole } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { mechanicsSchemas } from '../../schemas/index.js';

const router = Router();

router.use(authenticate);

// ============= EQUIPMENT/MACHINES =============
router.post(
  '/machines',
  requireRole(['ADMIN', 'MANAGER']),
  MechanicsController.createEquipment
);

router.get('/machines', MechanicsController.getAllEquipment);

router.get('/machines/maintenance-needed', MechanicsController.getEquipmentNeedingMaintenance);

router.get('/machines/:id', MechanicsController.getEquipment);

router.get('/machines/:id/maintenance', MechanicsController.getEquipmentMaintenanceHistory);

router.put(
  '/machines/:id',
  requireRole(['ADMIN', 'MANAGER', 'MECHANIC']),
  MechanicsController.updateEquipment
);

router.delete(
  '/machines/:id',
  requireRole(['ADMIN']),
  MechanicsController.deleteEquipment
);

// ============= SOS ALERTS =============
router.post('/sos', MechanicsController.createSOS);

router.get('/sos', MechanicsController.getAllSOS);

router.get('/sos/open', MechanicsController.getOpenSOS);

router.get('/sos/my', requireRole(['MECHANIC']), MechanicsController.getMySOS);

router.get('/sos/:id', MechanicsController.getSOS);

router.put('/sos/:id', MechanicsController.updateSOS);

router.post(
  '/sos/:id/assign',
  requireRole(['MANAGER', 'MECHANIC']),
  MechanicsController.assignSOS
);

router.post(
  '/sos/:id/resolve',
  requireRole(['MECHANIC']),
  MechanicsController.resolveSOS
);

router.delete(
  '/sos/:id',
  requireRole(['ADMIN', 'MANAGER']),
  MechanicsController.deleteSOS
);

// ============= MAINTENANCE LOGS =============
router.post(
  '/maintenance',
  authorize('MECHANIC', 'MANAGER'),
  MechanicsController.logFix
);

router.get('/maintenance', MechanicsController.getAllFixes);

router.get('/maintenance/:id', MechanicsController.getFix);

router.patch(
  '/maintenance/:id',
  authorize('MECHANIC', 'MANAGER'),
  validate(mechanicsSchemas.update),
  MechanicsController.updateFix
);

export default router;
