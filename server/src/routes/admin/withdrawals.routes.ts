import { Router } from 'express';
import { listWithdrawals, updateWithdrawalStatus } from '../../controllers/admin/withdrawals.controller.js';

export const adminWithdrawalsRoutes = Router();

adminWithdrawalsRoutes.get('/', listWithdrawals);
adminWithdrawalsRoutes.post('/:id/status', updateWithdrawalStatus);
