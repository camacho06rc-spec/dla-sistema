import { Router } from 'express';
import * as controller from './credit.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();

router.post('/accounts', authMiddleware, controller.createCreditAccount);
router.get('/accounts', authMiddleware, controller.getCreditAccounts);
router.get('/accounts/customer/:customerId', authMiddleware, controller.getAccountByCustomer);
router.patch('/accounts/:customerId/limit', authMiddleware, controller.updateCreditLimit);
router.post('/payments', authMiddleware, controller.registerPayment);
router.get('/movements', authMiddleware, controller.getCreditMovements);
router.get('/overdue', authMiddleware, controller.getOverdueAccounts);
router.get('/portfolio/summary', authMiddleware, controller.getPortfolioSummary);
router.post('/adjustments', authMiddleware, controller.creditAdjustment);

export default router;
