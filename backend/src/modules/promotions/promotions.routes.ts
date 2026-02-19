import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import {
  createPromotion,
  updatePromotion,
  findAllPromotions,
  findPromotionById,
  getActivePromotions,
  validatePromotion,
  deletePromotion,
  getPromotionStats,
} from './promotions.controller';

const router = Router();

router.use(authMiddleware);

router.post('/', createPromotion);
router.get('/', findAllPromotions);
router.get('/active', getActivePromotions);
router.post('/validate', validatePromotion);
router.get('/:id/stats', getPromotionStats);
router.get('/:id', findPromotionById);
router.patch('/:id', updatePromotion);
router.delete('/:id', deletePromotion);

export default router;
