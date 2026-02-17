import { Router } from 'express';
import * as controller from './categories.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

router.get('/', controller.getCategories);
router.get('/:id', controller.getCategory);
router.post('/', authenticate, controller.createCategory);
router.put('/:id', authenticate, controller.updateCategory);
router.patch('/:id/toggle', authenticate, controller.toggleCategory);
router.delete('/:id', authenticate, controller.deleteCategory);

export default router;
