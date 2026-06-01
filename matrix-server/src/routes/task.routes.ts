import { Router } from 'express';
import * as taskController from '../controllers/task.controller';
import { verifyToken } from '../middleware/auth';
import { validateBody } from '../middleware/validate';

const router = Router();

router.use(verifyToken);

router.get('/', taskController.list);
router.get('/matrix', taskController.matrix);
router.post('/', validateBody(taskController.createSchema), taskController.create);
router.get('/:id', taskController.getOne);
router.patch('/:id', validateBody(taskController.updateSchema), taskController.update);
router.delete('/:id', taskController.remove); // soft-delete → корзина
router.post('/:id/restore', taskController.restore);
router.delete('/:id/purge', taskController.purge); // окончательное удаление

export default router;
