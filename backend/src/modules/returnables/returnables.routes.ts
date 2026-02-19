import { Router } from 'express';
import * as controller from './returnables.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();

router.post('/events', authMiddleware, controller.createEvent);
router.get('/ledgers', authMiddleware, controller.getLedgers);
router.get('/ledgers/customer/:customerId', authMiddleware, controller.getLedgerByCustomer);
router.get('/events/list', authMiddleware, controller.getEvents);
router.get('/summary', authMiddleware, controller.getSummary);
router.post('/adjustments', authMiddleware, controller.adjustLedger);

export default router;
