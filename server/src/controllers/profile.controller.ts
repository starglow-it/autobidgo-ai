import { type Request, type Response } from 'express';
import { z } from 'zod';
import path from 'path';
import fs from 'fs';

import { prisma } from '../db/prisma.js';
import { photosDir, safeBasename } from '../services/upload.service.js';

const profileSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  birthday: z.string().min(1),
  gender: z.string().min(1),
  homeAddress: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  country: z.string().min(1),
  postalCode: z.string().min(1),
  email: z.string().min(3),
  phone: z.string().min(3),
  emergencyContactName: z.string().min(1),
  emergencyContactPhone: z.string().min(3),
  nativeLanguage: z.string().optional().nullable(),
  otherLanguages: z.string().optional().nullable(),
  accentDialect: z.string().optional().nullable(),
  workAvailability: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  preferredPaymentMethod: z.string().min(1),
  paymentAccountDetails: z.string().min(1),
  consentVoiceTraining: z.boolean(),
  consentAccurateInfo: z.boolean()
});

export async function getMyProfile(req: Request, res: Response) {
  if (!req.auth) return res.status(401).json({ error: 'Unauthorized' });

  const profile = await prisma.profile.findUnique({
    where: { userId: req.auth.userId }
  });

  return res.json({ profile });
}

export async function upsertMyProfile(req: Request, res: Response) {
  if (!req.auth) return res.status(401).json({ error: 'Unauthorized' });
  if (req.auth.role !== 'user') return res.status(403).json({ error: 'Forbidden' });

  const parsed = profileSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid profile data' });

  const data = parsed.data;

  if (!data.consentAccurateInfo || !data.consentVoiceTraining) {
    return res.status(400).json({ error: 'Consents are required' });
  }

  const birthday = new Date(data.birthday);
  if (Number.isNaN(birthday.getTime())) return res.status(400).json({ error: 'Invalid birthday' });

  const profile = await prisma.profile.upsert({
    where: { userId: req.auth.userId },
    update: {
      ...data,
      birthday
    },
    create: {
      userId: req.auth.userId,
      ...data,
      birthday
    }
  });

  await prisma.user.update({
    where: { id: req.auth.userId },
    data: {
      isProfileComplete: true,
      status: 'active'
    }
  });

  // ensure batch 1 exists and is available
  await prisma.batch.upsert({
    where: {
      userId_batchNumber: { userId: req.auth.userId, batchNumber: 1 }
    },
    update: {
      status: 'available'
    },
    create: {
      userId: req.auth.userId,
      batchNumber: 1,
      status: 'available'
    }
  });

  await prisma.balance.upsert({
    where: { userId: req.auth.userId },
    update: {},
    create: { userId: req.auth.userId }
  });

  return res.json({ profile });
}

export async function uploadProfilePhoto(req: Request, res: Response) {
  if (!req.auth) return res.status(401).json({ error: 'Unauthorized' });
  if (req.auth.role !== 'user') return res.status(403).json({ error: 'Forbidden' });

  const file = (req as any).file as Express.Multer.File | undefined;
  if (!file) return res.status(400).json({ error: 'No file uploaded' });

  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowed.includes(file.mimetype)) {
    fs.unlinkSync(file.path);
    return res.status(400).json({ error: 'Invalid file type' });
  }

  const relPath = path.join('photos', path.basename(file.path));

  const profile = await prisma.profile.upsert({
    where: { userId: req.auth.userId },
    update: { profilePhotoPath: relPath },
    create: {
      userId: req.auth.userId,
      firstName: 'Pending',
      lastName: 'Profile',
      birthday: new Date('2000-01-01'),
      gender: 'Prefer not to say',
      homeAddress: 'Pending',
      city: 'Pending',
      state: 'Pending',
      country: 'Pending',
      postalCode: 'Pending',
      email: 'pending@example.com',
      phone: 'pending',
      emergencyContactName: 'Pending',
      emergencyContactPhone: 'pending',
      preferredPaymentMethod: 'Pending',
      paymentAccountDetails: 'Pending',
      consentVoiceTraining: false,
      consentAccurateInfo: false,
      profilePhotoPath: relPath
    }
  });

  return res.json({ profile });
}

export function profilePhotoMulterStorage() {
  const dir = photosDir();
  return {
    destination: dir,
    filename: (_req: Request, file: Express.Multer.File, cb: (error: any, filename: string) => void) => {
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `${unique}-${safeBasename(file.originalname)}`);
    }
  };
}
