import { type Request, type Response } from 'express';
import { z } from 'zod';
import { prisma } from '../db/prisma.js';
import { verifyPassword, hashPassword } from '../utils/password.js';
import { signJwt } from '../utils/jwt.js';
import { clearAuthCookie, setAuthCookie } from '../utils/cookies.js';

const loginSchema = z.object({
  identifier: z.string().min(3),
  password: z.string().min(1)
});

const changePasswordSchema = z.object({
  oldPassword: z.string().min(1),
  newPassword: z.string().min(8)
});

function safeUser(u: { id: string; role: any; email: string | null; phone: string | null; mustChangePassword: boolean; isProfileComplete: boolean; status: string; }) {
  return {
    id: u.id,
    role: u.role,
    email: u.email,
    phone: u.phone,
    mustChangePassword: u.mustChangePassword,
    isProfileComplete: u.isProfileComplete,
    status: u.status
  };
}

export async function login(req: Request, res: Response) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid request' });

  const { identifier, password } = parsed.data;

  const user = await prisma.user.findFirst({
    where: {
      OR: [{ email: identifier }, { phone: identifier }]
    }
  });

  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  if (user.status === 'disabled') return res.status(403).json({ error: 'Account disabled' });

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() }
  });

  const token = signJwt({ sub: user.id, role: user.role });
  setAuthCookie(res, token);

  return res.json({ user: safeUser(user) });
}

export async function logout(_req: Request, res: Response) {
  clearAuthCookie(res);
  return res.json({ ok: true });
}

export async function me(req: Request, res: Response) {
  if (!req.auth) return res.status(401).json({ error: 'Unauthorized' });

  const user = await prisma.user.findUnique({
    where: { id: req.auth.userId }
  });

  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  return res.json({ user: safeUser(user) });
}

export async function changePassword(req: Request, res: Response) {
  if (!req.auth) return res.status(401).json({ error: 'Unauthorized' });

  const parsed = changePasswordSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid request' });

  const { oldPassword, newPassword } = parsed.data;

  const user = await prisma.user.findUnique({
    where: { id: req.auth.userId }
  });
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const ok = await verifyPassword(oldPassword, user.passwordHash);
  if (!ok) return res.status(400).json({ error: 'Current password is incorrect' });

  const passwordHash = await hashPassword(newPassword);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      mustChangePassword: false
    }
  });

  return res.json({ ok: true });
}
