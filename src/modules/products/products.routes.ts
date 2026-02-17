import { Router } from 'express';
import { ProductsController } from './products.controller';
import { authenticate } from '../../middlewares/authenticate';

const router = Router();
const controller = new ProductsController();

// Rutas públicas
router.get('/', controller.findAll.bind(controller));
router.get('/:id', controller.findOne.bind(controller));

// Rutas protegidas
router.post('/', authenticate, controller.create.bind(controller));
router.put('/:id', authenticate, controller.update.bind(controller));
router.patch('/:id/toggle', authenticate, controller.toggle.bind(controller));
router.delete('/:id', authenticate, controller.delete.bind(controller));

// Precios
router.put('/:id/prices', authenticate, controller.updatePrices.bind(controller));
router.get('/:id/price-history', authenticate, controller.getPriceHistory.bind(controller));

// Imágenes
router.post('/:id/images', authenticate, controller.addImage.bind(controller));
router.delete('/:id/images/:imageId', authenticate, controller.deleteImage.bind(controller));
router.put('/:id/images/:imageId/order', authenticate, controller.updateImageOrder.bind(controller));

export default router;
