import { Router } from 'express';
import { getHealth, getHealthDb } from './health.controller';

const router = Router();

router.get('/', getHealth);
router.get('/db', getHealthDb);

export default router;
