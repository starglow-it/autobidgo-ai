import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getBalance } from '../controllers/balance.controller.js';

export const balanceRoutes = Router();

balanceRoutes.get('/', requireAuth, getBalance);
