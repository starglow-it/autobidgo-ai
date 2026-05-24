import { type Request, type Response } from 'express';
import { z } from 'zod';

import { prisma } from '../../db/prisma.js';
import { generateTemporaryPassword, hashPassword } from '../../utils/password.js';

const createUserSchema = z.object({
  email: z.string().email().optional().nullable(),
  phone: z.string().min(6).optional().nullable(),
  firstName: z.string().min(1).optional().nullable(),
  lastName: z.string().min(1).optional().nullable(),
  invitedByAdminId: z.string().optional().nullable()
});

const updateUserSchema = z.object({
  status: z.enum(['active', 'disabled', 'pending_profile']).optional(),
  invitedByAdminId: z.string().optional().nullable()
});

export async function listUsers(req: Request, res: Response) {
  if (!req.auth) return res.status(401).json({ error: 'Unauthorized' });
  if (req.auth.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });

  const q = (req.query.q as string | undefined)?.trim();

  const users = await prisma.user.findMany({
    where: {
      role: 'user',
      ...(q
        ? {
            OR: [
              { email: { contains: q, mode: 'insensitive' } },
              { phone: { contains: q } },
              { profile: { firstName: { contains: q, mode: 'insensitive' } } },
              { profile: { lastName: { contains: q, mode: 'insensitive' } } }
            ]
          }
        : {})
    },
    include: {
      profile: { select: { firstName: true, lastName: true, profilePhotoPath: true } },
      balance: true
    },
    orderBy: { createdAt: 'desc' },
    take: 200
  });

  return res.json({ users });
}

export async function createUser(req: Request, res: Response) {
  if (!req.auth) return res.status(401).json({ error: 'Unauthorized' });
  if (req.auth.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });

  const parsed = createUserSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid request' });

  const { email, phone, invitedByAdminId } = parsed.data;
  if (!email && !phone) return res.status(400).json({ error: 'Email or phone is required' });

  const tempPassword = generateTemporaryPassword();
  const passwordHash = await hashPassword(tempPassword);

  const inviteAdminId = invitedByAdminId ?? req.auth.userId;

  const user = await prisma.user.create({
    data: {
      role: 'user',
      email: email ?? null,
      phone: phone ?? null,
      passwordHash,
      mustChangePassword: true,
      isProfileComplete: false,
      status: 'pending_profile',
      invitedByAdminId: inviteAdminId
    }
  });

  await prisma.balance.create({ data: { userId: user.id } });

  // prepare batches as locked; batch 1 becomes available after profile completion
  await prisma.batch.create({
    data: {
      userId: user.id,
      batchNumber: 1,
      status: 'locked'
    }
  });

  const loginUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/login`;

  return res.status(201).json({
    user: { id: user.id, email: user.email, phone: user.phone, status: user.status },
    temporaryCredentials: {
      loginUrl,
      identifier: user.email ?? user.phone,
      temporaryPassword: tempPassword,
      instructions:
        'Please log in, update your password, complete your profile, and begin your AutoBidGo training tasks.'
    }
  });
}

export async function getUserById(req: Request, res: Response) {
  if (!req.auth) return res.status(401).json({ error: 'Unauthorized' });
  if (req.auth.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });

  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
    include: {
      profile: true,
      balance: true,
      batches: { orderBy: { batchNumber: 'asc' } },
      recordings: {
        include: { script: true, batch: true },
        orderBy: { createdAt: 'desc' }
      },
      withdrawalRequests: { orderBy: { createdAt: 'desc' } }
    }
  });

  if (!user || user.role !== 'user') return res.status(404).json({ error: 'User not found' });

  return res.json({ user });
}

export async function updateUser(req: Request, res: Response) {
  if (!req.auth) return res.status(401).json({ error: 'Unauthorized' });
  if (req.auth.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });

  const parsed = updateUserSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid request' });

  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: parsed.data
  });

  return res.json({ user: { id: user.id, status: user.status, invitedByAdminId: user.invitedByAdminId } });
}

export async function resetPassword(req: Request, res: Response) {
  if (!req.auth) return res.status(401).json({ error: 'Unauthorized' });
  if (req.auth.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });

  const tempPassword = generateTemporaryPassword();
  const passwordHash = await hashPassword(tempPassword);

  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: {
      passwordHash,
      mustChangePassword: true
    }
  });

  const loginUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/login`;

  return res.json({
    user: { id: user.id, email: user.email, phone: user.phone },
    temporaryCredentials: {
      loginUrl,
      identifier: user.email ?? user.phone,
      temporaryPassword: tempPassword,
      instructions: 'Please log in to AutoBidGo and change your password immediately.'
    }
  });
}

export async function disableUser(req: Request, res: Response) {
  if (!req.auth) return res.status(401).json({ error: 'Unauthorized' });
  if (req.auth.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });

  const user = await prisma.user.update({ where: { id: req.params.id }, data: { status: 'disabled' } });
  return res.json({ user: { id: user.id, status: user.status } });
}

export async function enableUser(req: Request, res: Response) {
  if (!req.auth) return res.status(401).json({ error: 'Unauthorized' });
  if (req.auth.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });

  const user = await prisma.user.update({ where: { id: req.params.id }, data: { status: 'active' } });
  return res.json({ user: { id: user.id, status: user.status } });
}
