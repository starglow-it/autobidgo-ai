import { Router } from 'express';

import { authRoutes } from './auth.routes.js';
import { profileRoutes } from './profile.routes.js';
import { userRoutes } from './user.routes.js';
import { trainingRoutes } from './training.routes.js';
import { balanceRoutes } from './balance.routes.js';
import { withdrawalRoutes } from './withdrawal.routes.js';
import { fileRoutes } from './files.routes.js';

import { adminRoutes } from './admin/index.js';

export const apiRouter = Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/profile', profileRoutes);
apiRouter.use('/user', userRoutes);
apiRouter.use('/training', trainingRoutes);
apiRouter.use('/balance', balanceRoutes);
apiRouter.use('/withdrawals', withdrawalRoutes);
apiRouter.use('/files', fileRoutes);

apiRouter.use('/admin', adminRoutes);
