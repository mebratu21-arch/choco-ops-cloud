import { Router } from 'express';
import { QualityController } from './quality.controller';

const router = Router();

router.get('/', QualityController.getAll);

export default router;
