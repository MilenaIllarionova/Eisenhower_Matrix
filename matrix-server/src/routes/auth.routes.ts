import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { validateBody } from '../middleware/validate';
import { verifyToken } from '../middleware/auth';

const router = Router();

router.post('/register', validateBody(authController.registerSchema), authController.register);
router.post('/login', validateBody(authController.loginSchema), authController.login);
router.get('/me', verifyToken, authController.me);

export default router;
