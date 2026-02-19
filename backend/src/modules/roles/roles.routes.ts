import { Router } from 'express';
import * as controller from './roles.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

router.post('/assign-permissions', authenticate, controller.assignPermissions);
router.post('/', authenticate, controller.createRole);
router.get('/', authenticate, controller.getRoles);
router.get('/:id', authenticate, controller.getRoleById);
router.patch('/:id', authenticate, controller.updateRole);
router.delete('/:id', authenticate, controller.deleteRole);

export default router;
