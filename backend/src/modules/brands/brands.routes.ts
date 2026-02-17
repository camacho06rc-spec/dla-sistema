import { Router } from 'express';
import * as controller from './brands.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

router.get('/', controller.getBrands);
router.get('/:id', controller.getBrand);
router.post('/', authenticate, controller.createBrand);
router.put('/:id', authenticate, controller.updateBrand);
router.patch('/:id/toggle', authenticate, controller.toggleBrand);
router.delete('/:id', authenticate, controller.deleteBrand);

export default router;
