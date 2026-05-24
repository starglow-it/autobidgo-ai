import { Router } from 'express';
import {
  listRecordings,
  getRecording,
  approveRecording,
  rejectRecording
} from '../../controllers/admin/recordings.controller.js';

export const adminRecordingsRoutes = Router();

adminRecordingsRoutes.get('/', listRecordings);
adminRecordingsRoutes.get('/:id', getRecording);
adminRecordingsRoutes.post('/:id/approve', approveRecording);
adminRecordingsRoutes.post('/:id/reject', rejectRecording);
