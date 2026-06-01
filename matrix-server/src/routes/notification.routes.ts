import { Router } from 'express';
import * as notificationController from '../controllers/notification.controller';
import { verifyToken } from '../middleware/auth';

const router = Router();

router.use(verifyToken);

router.get('/', notificationController.list);
router.post('/read-all', notificationController.markAllRead);
router.post('/:id/read', notificationController.markRead);

export default router;
