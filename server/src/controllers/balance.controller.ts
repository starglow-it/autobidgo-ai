import { type Request, type Response } from 'express';
import { prisma } from '../db/prisma.js';

export async function getBalance(req: Request, res: Response) {
  if (!req.auth) return res.status(401).json({ error: 'Unauthorized' });
  if (req.auth.role !== 'user') return res.status(403).json({ error: 'Forbidden' });

  const balance = await prisma.balance.upsert({
    where: { userId: req.auth.userId },
    update: {},
    create: { userId: req.auth.userId }
  });

  const approvedCount = await prisma.recording.count({
    where: { userId: req.auth.userId, status: 'approved' }
  });
  const pendingCount = await prisma.recording.count({
    where: { userId: req.auth.userId, status: 'pending_review' }
  });
  const rejectedCount = await prisma.recording.count({
    where: { userId: req.auth.userId, status: 'rejected' }
  });

  const pendingBalance = pendingCount * 2;

  const transactions = await prisma.balanceTransaction.findMany({
    where: { userId: req.auth.userId },
    orderBy: { createdAt: 'desc' },
    take: 50
  });

  const withdrawals = await prisma.withdrawalRequest.findMany({
    where: { userId: req.auth.userId },
    orderBy: { createdAt: 'desc' },
    take: 50
  });

  return res.json({
    balance: {
      ...balance,
      pendingBalance
    },
    counts: {
      approvedCount,
      pendingCount,
      rejectedCount
    },
    transactions,
    withdrawals
  });
}
