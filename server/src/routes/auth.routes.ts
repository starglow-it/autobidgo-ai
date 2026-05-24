import { Router } from 'express';
import { login, logout, me, changePassword } from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.js';

export const authRoutes = Router();

authRoutes.post('/login', login);
authRoutes.post('/logout', logout);
authRoutes.get('/me', requireAuth, me);
authRoutes.post('/change-password', requireAuth, changePassword);
