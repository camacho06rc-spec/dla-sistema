import { Router } from 'express';
import * as controller from './inventory.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

// Consultas (requieren autenticación)
router.get('/', authenticate, controller.getInventory);
router.get('/:productId/:branchId', authenticate, controller.getInventoryByProductAndBranch);
router.get('/:productId/:branchId/movements', authenticate, controller.getMovements);

// Ajustes (requieren autenticación)
router.post('/adjust', authenticate, controller.adjustInventory);
router.post('/open-box', authenticate, controller.openBox);

// Stock mínimo y alertas
router.post('/stock-rules', authenticate, controller.createStockRule);
router.put('/stock-rules/:productId/:branchId', authenticate, controller.updateStockRule);
router.get('/alerts', authenticate, controller.getStockAlerts);

export default router;
