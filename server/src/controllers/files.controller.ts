import { type Request, type Response } from 'express';
import path from 'path';
import fs from 'fs';

import { prisma } from '../db/prisma.js';
import { getUploadRoot } from '../services/upload.service.js';

export async function getProfilePhoto(req: Request, res: Response) {
  if (!req.auth) return res.status(401).json({ error: 'Unauthorized' });

  const userId = req.params.userId;
  if (req.auth.role !== 'admin' && req.auth.userId !== userId) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const profile = await prisma.profile.findUnique({ where: { userId } });
  if (!profile?.profilePhotoPath) return res.status(404).json({ error: 'Not found' });

  const abs = path.join(getUploadRoot(), profile.profilePhotoPath);
  if (!fs.existsSync(abs)) return res.status(404).json({ error: 'Not found' });

  res.setHeader('Content-Type', 'application/octet-stream');
  return fs.createReadStream(abs).pipe(res);
}

export async function getRecordingFile(req: Request, res: Response) {
  if (!req.auth) return res.status(401).json({ error: 'Unauthorized' });

  const recordingId = req.params.recordingId;

  const recording = await prisma.recording.findUnique({
    where: { id: recordingId },
    select: { userId: true, audioFilePath: true }
  });

  if (!recording?.audioFilePath) return res.status(404).json({ error: 'Not found' });

  if (req.auth.role !== 'admin' && req.auth.userId !== recording.userId) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const abs = path.join(getUploadRoot(), recording.audioFilePath);
  if (!fs.existsSync(abs)) return res.status(404).json({ error: 'Not found' });

  // Let browser infer based on extension
  return fs.createReadStream(abs).pipe(res);
}
