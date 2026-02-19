import { Router } from 'express';
import * as controller from './permissions.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

router.post('/', authenticate, controller.createPermission);
router.get('/', authenticate, controller.getPermissions);
router.get('/:id', authenticate, controller.getPermissionById);
router.delete('/:id', authenticate, controller.deletePermission);

export default router;
