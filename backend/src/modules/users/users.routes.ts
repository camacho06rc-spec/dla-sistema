import { Router } from 'express';
import { getProfile } from './users.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();

router.get('/profile', authMiddleware, getProfile);

export default router;
