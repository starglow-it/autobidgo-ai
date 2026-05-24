import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { createWithdrawal, listMyWithdrawals } from '../controllers/withdrawal.controller.js';

export const withdrawalRoutes = Router();

withdrawalRoutes.post('/', requireAuth, createWithdrawal);
withdrawalRoutes.get('/me', requireAuth, listMyWithdrawals);
