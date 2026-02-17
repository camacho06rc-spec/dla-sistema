import { Router } from 'express';
import { ProductsController } from './products.controller';
import { authenticate } from '../../middlewares/authenticate';
import { writeLimiter } from '../../middlewares/rateLimiter';

const router = Router();
const controller = new ProductsController();

// Rutas públicas
router.get('/', controller.findAll.bind(controller));
router.get('/:id', controller.findOne.bind(controller));

// Rutas protegidas con rate limiting
router.post('/', authenticate, writeLimiter, controller.create.bind(controller));
router.put('/:id', authenticate, writeLimiter, controller.update.bind(controller));
router.patch('/:id/toggle', authenticate, writeLimiter, controller.toggle.bind(controller));
router.delete('/:id', authenticate, writeLimiter, controller.delete.bind(controller));

// Precios
router.put('/:id/prices', authenticate, writeLimiter, controller.updatePrices.bind(controller));
router.get('/:id/price-history', authenticate, controller.getPriceHistory.bind(controller));

// Imágenes
router.post('/:id/images', authenticate, writeLimiter, controller.addImage.bind(controller));
router.delete('/:id/images/:imageId', authenticate, writeLimiter, controller.deleteImage.bind(controller));
router.put('/:id/images/:imageId/order', authenticate, writeLimiter, controller.updateImageOrder.bind(controller));

export default router;
