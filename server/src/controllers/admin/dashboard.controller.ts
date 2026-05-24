import { type Request, type Response } from 'express';
import { prisma } from '../../db/prisma.js';

export async function getAdminOverview(req: Request, res: Response) {
  if (!req.auth) return res.status(401).json({ error: 'Unauthorized' });
  if (req.auth.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });

  const [
    totalUsers,
    activeUsers,
    pendingProfiles,
    pendingRecordings,
    pendingBatches,
    totalApprovedRecordings,
    totalPayableBalance,
    withdrawalRequests
  ] = await Promise.all([
    prisma.user.count({ where: { role: 'user' } }),
    prisma.user.count({ where: { role: 'user', status: 'active' } }),
    prisma.user.count({ where: { role: 'user', isProfileComplete: false } }),
    prisma.recording.count({ where: { status: 'pending_review' } }),
    prisma.batch.count({ where: { status: 'pending_review' } }),
    prisma.recording.count({ where: { status: 'approved' } }),
    prisma.balance.aggregate({ _sum: { availableBalance: true } }),
    prisma.withdrawalRequest.count({ where: { status: 'pending' } })
  ]);

  return res.json({
    cards: {
      totalUsers,
      activeUsers,
      pendingProfiles,
      pendingRecordings,
      pendingBatches,
      totalApprovedRecordings,
      totalPayableBalance: totalPayableBalance._sum.availableBalance ?? 0,
      withdrawalRequests
    }
  });
}
