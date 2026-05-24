import { Router } from 'express';
import multer from 'multer';

import { requireAuth } from '../middleware/auth.js';
import { getMyProfile, upsertMyProfile, uploadProfilePhoto, profilePhotoMulterStorage } from '../controllers/profile.controller.js';

export const profileRoutes = Router();

profileRoutes.get('/me', requireAuth, getMyProfile);
profileRoutes.put('/me', requireAuth, upsertMyProfile);

const upload = multer({
  storage: multer.diskStorage(profilePhotoMulterStorage() as any),
  limits: { fileSize: 5 * 1024 * 1024 }
});

profileRoutes.post('/photo', requireAuth, upload.single('photo'), uploadProfilePhoto);
