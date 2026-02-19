import { Router } from 'express';
import * as controller from './expenses.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

router.post('/', authenticate, controller.createExpense);
router.get('/', authenticate, controller.getExpenses);
router.get('/by-category', authenticate, controller.getExpensesByCategory);
router.get('/total', authenticate, controller.getTotalExpenses);
router.get('/branch/:branchId', authenticate, controller.getExpensesByBranch);
router.get('/:id', authenticate, controller.getExpense);
router.patch('/:id', authenticate, controller.updateExpense);
router.delete('/:id', authenticate, controller.deleteExpense);

export default router;
