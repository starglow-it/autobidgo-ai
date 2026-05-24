import { Router } from 'express';
import multer from 'multer';

import { requireAuth } from '../middleware/auth.js';
import {
  getCurrentScript,
  submitRecording,
  listMyRecordings,
  getBatchStatus,
  startBatch,
  recordingMulterStorage
} from '../controllers/training.controller.js';

export const trainingRoutes = Router();

trainingRoutes.post('/start-batch', requireAuth, startBatch);
trainingRoutes.get('/current-script', requireAuth, getCurrentScript);
trainingRoutes.get('/recordings', requireAuth, listMyRecordings);
trainingRoutes.get('/batch-status', requireAuth, getBatchStatus);

const upload = multer({
  storage: multer.diskStorage(recordingMulterStorage() as any),
  limits: { fileSize: 25 * 1024 * 1024 }
});

trainingRoutes.post('/recordings', requireAuth, upload.single('audio'), submitRecording);

trainingRoutes.post('/next-script', requireAuth, getCurrentScript);
