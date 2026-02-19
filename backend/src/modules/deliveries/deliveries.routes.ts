import { Router } from 'express';
import * as controller from './deliveries.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();

router.post('/assign', authMiddleware, controller.assignDelivery);
router.post('/routes', authMiddleware, controller.createRoute);
router.get('/routes/list', authMiddleware, controller.getRoutes);
router.get('/routes/:id', authMiddleware, controller.getRouteById);
router.get('/reports/performance', authMiddleware, controller.getDriverPerformance);
router.get('/', authMiddleware, controller.getDeliveries);
router.get('/:id', authMiddleware, controller.getDeliveryById);
router.patch('/:id/status', authMiddleware, controller.updateDeliveryStatus);
router.patch('/:id/location', authMiddleware, controller.updateDriverLocation);

export default router;
