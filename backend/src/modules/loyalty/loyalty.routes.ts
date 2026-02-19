import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import {
  createRule,
  updateRule,
  getRules,
  getRuleById,
  deleteRule,
  getWallet,
  redeemPoints,
  adjustPoints,
  expirePoints,
  getMovements,
  getStats,
  getTopCustomers,
} from './loyalty.controller';

const router = Router();

router.use(authMiddleware);

// RULES
router.post('/rules', createRule);
router.get('/rules', getRules);
router.get('/rules/:id', getRuleById);
router.patch('/rules/:id', updateRule);
router.delete('/rules/:id', deleteRule);

// WALLETS
router.get('/wallets/customer/:customerId', getWallet);

// REDEEM
router.post('/redeem', redeemPoints);

// ADJUST
router.post('/adjust', adjustPoints);

// EXPIRE
router.post('/expire', expirePoints);

// MOVEMENTS
router.get('/movements', getMovements);

// STATS
router.get('/stats', getStats);

// TOP CUSTOMERS
router.get('/top-customers', getTopCustomers);

export default router;
