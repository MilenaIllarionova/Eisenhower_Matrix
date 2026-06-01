import { Router } from 'express';
import * as projectController from '../controllers/project.controller';
import { verifyToken } from '../middleware/auth';
import { validateBody } from '../middleware/validate';

const router = Router();

router.use(verifyToken);

router.get('/', projectController.list);
router.post('/', validateBody(projectController.createSchema), projectController.create);
router.get('/:id/members', projectController.members);
router.post('/:id/invite', validateBody(projectController.inviteSchema), projectController.invite);
router.patch('/:id', validateBody(projectController.updateSchema), projectController.update);
router.delete('/:id', projectController.remove);

export default router;
