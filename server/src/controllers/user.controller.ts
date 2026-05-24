import { type Request, type Response } from 'express';
import { prisma } from '../db/prisma.js';

async function getCurrentBatch(userId: string) {
  // Current batch = lowest batchNumber that is not approved and not locked, otherwise null
  const batches = await prisma.batch.findMany({
    where: { userId },
    orderBy: { batchNumber: 'asc' }
  });

  return (
    batches.find((b) => b.status !== 'locked' && b.status !== 'approved') ||
    batches.find((b) => b.status === 'available') ||
    null
  );
}

export async function getUserDashboard(req: Request, res: Response) {
  if (!req.auth) return res.status(401).json({ error: 'Unauthorized' });
  if (req.auth.role !== 'user') return res.status(403).json({ error: 'Forbidden' });

  const user = await prisma.user.findUnique({
    where: { id: req.auth.userId },
    select: {
      id: true,
      email: true,
      phone: true,
      isProfileComplete: true,
      mustChangePassword: true,
      status: true,
      profile: { select: { firstName: true } }
    }
  });

  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const balance = await prisma.balance.findUnique({ where: { userId: user.id } });

  const currentBatch = await getCurrentBatch(user.id);

  let batchMetrics = null as null | {
    batchId: string;
    batchNumber: number;
    status: string;
    totalScripts: number;
    submittedCount: number;
    approvedCount: number;
    rejectedCount: number;
    pendingReviewCount: number;
  };

  if (currentBatch) {
    const recordings = await prisma.recording.findMany({
      where: { batchId: currentBatch.id },
      select: { status: true }
    });

    const pendingReviewCount = recordings.filter((r) => r.status === 'pending_review').length;

    batchMetrics = {
      batchId: currentBatch.id,
      batchNumber: currentBatch.batchNumber,
      status: currentBatch.status,
      totalScripts: currentBatch.totalScripts,
      submittedCount: currentBatch.submittedCount,
      approvedCount: currentBatch.approvedCount,
      rejectedCount: currentBatch.rejectedCount,
      pendingReviewCount
    };
  }

  const pendingRecordingsCount = await prisma.recording.count({
    where: { userId: user.id, status: 'pending_review' }
  });

  const rejectedCount = await prisma.recording.count({
    where: { userId: user.id, status: 'rejected' }
  });

  // compute pending earnings as $2 per pending_review
  const pendingEarnings = pendingRecordingsCount * 2;

  return res.json({
    user: {
      id: user.id,
      firstName: user.profile?.firstName || 'Contributor',
      isProfileComplete: user.isProfileComplete,
      mustChangePassword: user.mustChangePassword,
      status: user.status
    },
    currentBatch: batchMetrics,
    stats: {
      pendingReviewCount: pendingRecordingsCount,
      rejectedCount,
      availableBalance: balance?.availableBalance ?? 0,
      pendingEarnings,
      lifetimeEarned: balance?.lifetimeEarned ?? 0,
      lifetimePaid: balance?.lifetimePaid ?? 0
    }
  });
}

export async function getUserProgress(req: Request, res: Response) {
  if (!req.auth) return res.status(401).json({ error: 'Unauthorized' });
  if (req.auth.role !== 'user') return res.status(403).json({ error: 'Forbidden' });

  const batches = await prisma.batch.findMany({
    where: { userId: req.auth.userId },
    orderBy: { batchNumber: 'asc' }
  });

  return res.json({ batches });
}
