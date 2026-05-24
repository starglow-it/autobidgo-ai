import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getUserDashboard, getUserProgress } from '../controllers/user.controller.js';

export const userRoutes = Router();

userRoutes.get('/dashboard', requireAuth, getUserDashboard);
userRoutes.get('/progress', requireAuth, getUserProgress);
