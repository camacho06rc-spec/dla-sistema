import { Router } from 'express';
import { getProfile, createUser, getUsers, getUserById, updateUser, deleteUser, changePassword, resetPassword, getUserPermissions } from './users.controller';
import { authMiddleware, authenticate } from '../../middleware/auth.middleware';

const router = Router();

// Existing profile route
router.get('/profile', authMiddleware, getProfile);

// Admin specific routes (must be before /:id to avoid conflicts)
router.post('/change-password', authenticate, changePassword);
router.post('/reset-password', authenticate, resetPassword);

// Admin CRUD routes
router.post('/', authenticate, createUser);
router.get('/', authenticate, getUsers);
router.get('/:id/permissions', authenticate, getUserPermissions);
router.get('/:id', authenticate, getUserById);
router.patch('/:id', authenticate, updateUser);
router.delete('/:id', authenticate, deleteUser);

export default router;
