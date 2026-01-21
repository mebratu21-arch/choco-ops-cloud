import { Router } from 'express';
import { UserController } from './users.controller';

const router = Router();

router.get('/', UserController.getAll);
router.get('/me', UserController.getMe);

export default router;
