import { Router } from 'express';
import { requireAuth, requireAdmin } from '../../middleware/auth.js';

import { getAdminOverview } from '../../controllers/admin/dashboard.controller.js';
import { adminUsersRoutes } from './users.routes.js';
import { adminScriptsRoutes } from './scripts.routes.js';
import { adminRecordingsRoutes } from './recordings.routes.js';
import { adminBatchesRoutes } from './batches.routes.js';
import { adminWithdrawalsRoutes } from './withdrawals.routes.js';

export const adminRoutes = Router();

adminRoutes.use(requireAuth, requireAdmin);

adminRoutes.get('/dashboard', getAdminOverview);
adminRoutes.use('/users', adminUsersRoutes);
adminRoutes.use('/scripts', adminScriptsRoutes);
adminRoutes.use('/recordings', adminRecordingsRoutes);
adminRoutes.use('/batches', adminBatchesRoutes);
adminRoutes.use('/withdrawals', adminWithdrawalsRoutes);
