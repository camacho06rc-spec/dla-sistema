import { Router } from 'express';
import * as controller from './cash-register.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

router.post('/open', authenticate, controller.openSession);
router.post('/:id/close', authenticate, controller.closeSession);
router.get('/', authenticate, controller.getSessions);
router.get('/active', authenticate, controller.getActiveSession);
router.get('/branch/:branchId', authenticate, controller.getSessionsByBranch);
router.get('/:id/stats', authenticate, controller.getSessionStats);
router.get('/:id', authenticate, controller.getSession);

export default router;
