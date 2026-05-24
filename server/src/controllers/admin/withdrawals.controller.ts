import { type Request, type Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../db/prisma.js';

const updateSchema = z.object({
  status: z.enum(['pending', 'contacted', 'paid', 'rejected']),
  adminNote: z.string().max(2000).optional().nullable()
});

export async function listWithdrawals(req: Request, res: Response) {
  if (!req.auth) return res.status(401).json({ error: 'Unauthorized' });
  if (req.auth.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });

  const withdrawals = await prisma.withdrawalRequest.findMany({
    include: {
      user: { select: { id: true, email: true, phone: true, profile: { select: { firstName: true, lastName: true } } } },
      contactAdmin: { select: { id: true, email: true, phone: true } }
    },
    orderBy: { createdAt: 'desc' },
    take: 200
  });

  return res.json({ withdrawals });
}

export async function updateWithdrawalStatus(req: Request, res: Response) {
  if (!req.auth) return res.status(401).json({ error: 'Unauthorized' });
  if (req.auth.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });

  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid request' });

  const wr = await prisma.withdrawalRequest.findUnique({ where: { id: req.params.id } });
  if (!wr) return res.status(404).json({ error: 'Not found' });

  const updated = await prisma.$transaction(async (tx) => {
    const request = await tx.withdrawalRequest.update({
      where: { id: wr.id },
      data: {
        status: parsed.data.status,
        adminNote: parsed.data.adminNote ?? null
      }
    });

    const txRow = await tx.balanceTransaction.findFirst({
      where: {
        userId: wr.userId,
        type: 'withdrawal',
        description: `Withdrawal request #${wr.id}`
      }
    });

    if (txRow) {
      let txStatus: any = txRow.status;
      if (parsed.data.status === 'paid') txStatus = 'paid';
      if (parsed.data.status === 'rejected') txStatus = 'rejected';
      if (parsed.data.status === 'contacted') txStatus = 'approved';

      await tx.balanceTransaction.update({ where: { id: txRow.id }, data: { status: txStatus } });
    }

    if (parsed.data.status === 'paid') {
      await tx.balance.update({
        where: { userId: wr.userId },
        data: {
          lifetimePaid: { increment: wr.amount }
        }
      });
    }

    if (parsed.data.status === 'rejected') {
      // refund
      await tx.balance.update({
        where: { userId: wr.userId },
        data: {
          availableBalance: { increment: wr.amount }
        }
      });
    }

    return request;
  });

  return res.json({ withdrawalRequest: updated });
}
