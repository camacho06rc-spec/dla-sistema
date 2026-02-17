import { Router } from 'express';
import { CategoriesController } from './categories.controller';
import { authenticate } from '../../middlewares/authenticate';

const router = Router();
const controller = new CategoriesController();

// Rutas públicas
router.get('/', controller.findAll.bind(controller));
router.get('/:id', controller.findOne.bind(controller));

// Rutas protegidas
router.post('/', authenticate, controller.create.bind(controller));
router.put('/:id', authenticate, controller.update.bind(controller));
router.patch('/:id/toggle', authenticate, controller.toggle.bind(controller));
router.delete('/:id', authenticate, controller.delete.bind(controller));

export default router;
