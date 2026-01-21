import { Router } from 'express';
import { ProductionController } from './production.controller';

const router = Router();

router.get('/', ProductionController.getAll);
router.get('/:id', ProductionController.getById);

export default router;
