import { type Request, type Response } from 'express';
import { z } from 'zod';

import { prisma } from '../../db/prisma.js';

const rejectSchema = z.object({
  reason: z.string().min(3).max(1000)
});

async function updateBatchCounters(batchId: string) {
  const recordings = await prisma.recording.findMany({ where: { batchId }, select: { status: true } });
  const approvedCount = recordings.filter((r) => r.status === 'approved').length;
  const rejectedCount = recordings.filter((r) => r.status === 'rejected').length;
  const pendingReviewCount = recordings.filter((r) => r.status === 'pending_review').length;
  const submittedCount = approvedCount + rejectedCount + pendingReviewCount;

  const batch = await prisma.batch.findUnique({ where: { id: batchId } });
  if (!batch) return;

  const status =
    rejectedCount > 0
      ? 'rejected'
      : submittedCount < batch.totalScripts
        ? submittedCount > 0
          ? 'in_progress'
          : 'available'
        : 'pending_review';

  await prisma.batch.update({
    where: { id: batchId },
    data: {
      status,
      submittedCount,
      approvedCount,
      rejectedCount
    }
  });
}

export async function listRecordings(req: Request, res: Response) {
  if (!req.auth) return res.status(401).json({ error: 'Unauthorized' });
  if (req.auth.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });

  const status = (req.query.status as string | undefined)?.trim();

  const recordings = await prisma.recording.findMany({
    where: {
      ...(status ? { status: status as any } : {})
    },
    include: {
      user: { select: { id: true, email: true, phone: true, profile: { select: { firstName: true, lastName: true } } } },
      script: true,
      batch: true
    },
    orderBy: { submittedAt: 'desc' },
    take: 200
  });

  return res.json({ recordings });
}

export async function getRecording(req: Request, res: Response) {
  if (!req.auth) return res.status(401).json({ error: 'Unauthorized' });
  if (req.auth.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });

  const recording = await prisma.recording.findUnique({
    where: { id: req.params.id },
    include: {
      user: { include: { profile: true } },
      script: true,
      batch: true
    }
  });

  if (!recording) return res.status(404).json({ error: 'Not found' });
  return res.json({ recording });
}

export async function approveRecording(req: Request, res: Response) {
  if (!req.auth) return res.status(401).json({ error: 'Unauthorized' });
  if (req.auth.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });

  const recording = await prisma.recording.findUnique({ where: { id: req.params.id } });
  if (!recording) return res.status(404).json({ error: 'Not found' });

  const updated = await prisma.$transaction(async (tx) => {
    const rec = await tx.recording.update({
      where: { id: recording.id },
      data: {
        status: 'approved',
        rejectionReason: null,
        reviewedByAdminId: req.auth!.userId,
        reviewedAt: new Date()
      }
    });

    // create earning transaction if not already created
    const existingTx = await tx.balanceTransaction.findFirst({
      where: { recordingId: rec.id, type: 'earning' }
    });

    if (!existingTx) {
      await tx.balanceTransaction.create({
        data: {
          userId: rec.userId,
          recordingId: rec.id,
          batchId: rec.batchId,
          type: 'earning',
          amount: 2,
          status: 'approved',
          description: 'Approved script earning ($2)'
        }
      });

      await tx.balance.upsert({
        where: { userId: rec.userId },
        update: {
          availableBalance: { increment: 2 },
          lifetimeEarned: { increment: 2 }
        },
        create: {
          userId: rec.userId,
          availableBalance: 2,
          lifetimeEarned: 2
        }
      });
    }

    return rec;
  });

  await updateBatchCounters(updated.batchId);

  return res.json({ recording: { id: updated.id, status: updated.status } });
}

export async function rejectRecording(req: Request, res: Response) {
  if (!req.auth) return res.status(401).json({ error: 'Unauthorized' });
  if (req.auth.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });

  const parsed = rejectSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid request' });

  const recording = await prisma.recording.findUnique({ where: { id: req.params.id } });
  if (!recording) return res.status(404).json({ error: 'Not found' });

  const updated = await prisma.recording.update({
    where: { id: recording.id },
    data: {
      status: 'rejected',
      rejectionReason: parsed.data.reason,
      reviewedByAdminId: req.auth.userId,
      reviewedAt: new Date()
    }
  });

  await updateBatchCounters(updated.batchId);

  return res.json({ recording: { id: updated.id, status: updated.status } });
}
