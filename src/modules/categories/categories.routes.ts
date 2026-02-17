import { Router } from 'express';
import { CategoriesController } from './categories.controller';
import { authenticate } from '../../middlewares/authenticate';
import { writeLimiter } from '../../middlewares/rateLimiter';

const router = Router();
const controller = new CategoriesController();

// Rutas públicas
router.get('/', controller.findAll.bind(controller));
router.get('/:id', controller.findOne.bind(controller));

// Rutas protegidas con rate limiting
router.post('/', authenticate, writeLimiter, controller.create.bind(controller));
router.put('/:id', authenticate, writeLimiter, controller.update.bind(controller));
router.patch('/:id/toggle', authenticate, writeLimiter, controller.toggle.bind(controller));
router.delete('/:id', authenticate, writeLimiter, controller.delete.bind(controller));

export default router;
