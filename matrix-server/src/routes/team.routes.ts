import { Router } from 'express';
import * as teamController from '../controllers/team.controller';
import { verifyToken } from '../middleware/auth';
import { validateBody } from '../middleware/validate';

const router = Router();

router.use(verifyToken);

router.get('/', teamController.list);
router.post('/', validateBody(teamController.createSchema), teamController.create);
router.get('/:id', teamController.getOne);
router.post('/:id/invite', validateBody(teamController.inviteSchema), teamController.invite);
router.patch('/:id/members/:userId', validateBody(teamController.roleSchema), teamController.updateMemberRole);
router.delete('/:id/members/:userId', teamController.removeMember);

export default router;
