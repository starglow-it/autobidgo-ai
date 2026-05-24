import { type Request, type Response } from 'express';
import { z } from 'zod';
import { prisma } from '../db/prisma.js';

const createSchema = z.object({
  userMessage: z.string().max(1000).optional().nullable()
});

export async function createWithdrawal(req: Request, res: Response) {
  if (!req.auth) return res.status(401).json({ error: 'Unauthorized' });
  if (req.auth.role !== 'user') return res.status(403).json({ error: 'Forbidden' });

  const parsed = createSchema.safeParse(req.body ?? {});
  if (!parsed.success) return res.status(400).json({ error: 'Invalid request' });

  const user = await prisma.user.findUnique({ where: { id: req.auth.userId } });
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const balance = await prisma.balance.upsert({
    where: { userId: user.id },
    update: {},
    create: { userId: user.id }
  });

  if (balance.availableBalance <= 0) {
    return res.status(400).json({ error: 'You do not have an available balance yet.' });
  }

  const contact = user.invitedByAdminId
    ? await prisma.adminContact.findFirst({
        where: { adminId: user.invitedByAdminId, isActive: true }
      })
    : null;

  const amount = balance.availableBalance;

  const wr = await prisma.$transaction(async (tx) => {
    const request = await tx.withdrawalRequest.create({
      data: {
        userId: user.id,
        amount,
        status: 'pending',
        contactAdminId: user.invitedByAdminId ?? null,
        userMessage: parsed.data.userMessage ?? null
      }
    });

    await tx.balanceTransaction.create({
      data: {
        userId: user.id,
        type: 'withdrawal',
        amount: -amount,
        status: 'pending',
        description: `Withdrawal request #${request.id}`
      }
    });

    await tx.balance.update({
      where: { userId: user.id },
      data: {
        availableBalance: 0
      }
    });

    return request;
  });

  return res.json({
    withdrawalRequest: wr,
    message: 'To request payment, please contact your invitation manager.',
    contact: contact
      ? {
          displayName: contact.displayName,
          email: contact.email,
          phone: contact.phone,
          whatsapp: contact.whatsapp
        }
      : null
  });
}

export async function listMyWithdrawals(req: Request, res: Response) {
  if (!req.auth) return res.status(401).json({ error: 'Unauthorized' });
  if (req.auth.role !== 'user') return res.status(403).json({ error: 'Forbidden' });

  const withdrawals = await prisma.withdrawalRequest.findMany({
    where: { userId: req.auth.userId },
    orderBy: { createdAt: 'desc' }
  });

  return res.json({ withdrawals });
}
