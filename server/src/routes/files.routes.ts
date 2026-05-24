import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getProfilePhoto, getRecordingFile } from '../controllers/files.controller.js';

export const fileRoutes = Router();

fileRoutes.get('/photos/:userId', requireAuth, getProfilePhoto);
fileRoutes.get('/recordings/:recordingId', requireAuth, getRecordingFile);
