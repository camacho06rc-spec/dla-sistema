import { Router } from 'express';
import * as controller from './orders.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

// Pedidos (requieren autenticación)
router.get('/', authenticate, controller.getOrders);
router.get('/:id', authenticate, controller.getOrder);
router.post('/', authenticate, controller.createOrder);
router.patch('/:id/status', authenticate, controller.updateOrderStatus);

export default router;
