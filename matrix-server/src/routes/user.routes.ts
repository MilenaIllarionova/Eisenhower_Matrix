import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { verifyToken } from '../middleware/auth';

const router = Router();

router.use(verifyToken);

router.get('/search', userController.search);

export default router;
