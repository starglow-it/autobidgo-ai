import { Router } from 'express';
import { listBatches, getBatch, approveBatch, rejectBatch, unlockNextBatch } from '../../controllers/admin/batches.controller.js';

export const adminBatchesRoutes = Router();

adminBatchesRoutes.get('/', listBatches);
adminBatchesRoutes.get('/:id', getBatch);
adminBatchesRoutes.post('/:id/approve', approveBatch);
adminBatchesRoutes.post('/:id/reject', rejectBatch);
adminBatchesRoutes.post('/:id/unlock-next', unlockNextBatch);
