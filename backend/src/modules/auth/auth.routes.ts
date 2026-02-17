import { Router } from 'express';
import { register, login } from './auth.controller';
import { validateBody } from '../../middleware/validation.middleware';
import { registerSchema, loginSchema } from './auth.dto';

const router = Router();

router.post('/register', validateBody(registerSchema), register);
router.post('/login', validateBody(loginSchema), login);

export default router;
