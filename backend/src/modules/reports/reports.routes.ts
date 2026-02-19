import { Router } from 'express';
import * as controller from './reports.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// ==========================================
// REPORTS ROUTES
// ==========================================

router.get('/sales', controller.getSalesReport);
router.get('/sales-by-period', controller.getSalesByPeriod);
router.get('/sales-by-category', controller.getSalesByCategory);
router.get('/customers-by-tier', controller.getCustomersByTier);
router.get('/top-products', controller.getTopProducts);
router.get('/top-customers', controller.getTopCustomers);
router.get('/inventory-status', controller.getInventoryStatus);
router.get('/profit-margin', controller.getProfitMargin);
router.get('/purchases-summary', controller.getPurchasesSummary);
router.get('/dashboard', controller.getDashboard);
router.get('/low-stock', controller.getLowStockAlert);

export default router;
