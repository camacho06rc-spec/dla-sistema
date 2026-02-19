import { Router } from 'express';
import * as controller from './purchases.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

// ==========================================
// REPORTS ROUTES (must be before /:id)
// ==========================================

router.get('/supplier/:supplierId', authenticate, controller.getPurchasesBySupplier);
router.get('/product/:productId/history', authenticate, controller.getProductPurchaseHistory);

// ==========================================
// PURCHASES ROUTES
// ==========================================

router.get('/', authenticate, controller.getPurchases);
router.get('/:id', authenticate, controller.getPurchase);
router.post('/', authenticate, controller.createPurchase);
router.patch('/:id/status', authenticate, controller.updatePurchaseStatus);
router.patch('/:id/receive', authenticate, controller.receivePurchase);
router.patch('/:id/payment', authenticate, controller.registerPayment);
router.delete('/:id', authenticate, controller.cancelPurchase);

export default router;
