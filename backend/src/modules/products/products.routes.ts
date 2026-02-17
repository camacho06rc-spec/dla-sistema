import { Router } from 'express';
import * as controller from './products.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

router.get('/', controller.getProducts);
router.get('/:id', controller.getProduct);
router.post('/', authenticate, controller.createProduct);
router.put('/:id', authenticate, controller.updateProduct);
router.patch('/:id/toggle', authenticate, controller.toggleProduct);
router.delete('/:id', authenticate, controller.deleteProduct);

// Price management
router.put('/:id/prices', authenticate, controller.updateProductPrices);
router.get('/:id/price-history', controller.getProductPriceHistory);

// Image management
router.post('/:id/images', authenticate, controller.addProductImage);
router.delete('/:id/images/:imageId', authenticate, controller.deleteProductImage);

export default router;
