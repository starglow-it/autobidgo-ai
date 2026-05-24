import { type Request, type Response } from 'express';
import { z } from 'zod';
import path from 'path';
import fs from 'fs';

import { prisma } from '../db/prisma.js';
import { recordingsDir, safeBasename } from '../services/upload.service.js';

const submitSchema = z.object({
  scriptId: z.string().min(1),
  durationSeconds: z.coerce.number().int().min(1).max(60 * 30).optional()
});

async function ensureUserCanTrain(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { ok: false as const, status: 401 as const, error: 'Unauthorized' };
  if (user.role !== 'user') return { ok: false as const, status: 403 as const, error: 'Forbidden' };
  if (user.mustChangePassword) return { ok: false as const, status: 403 as const, error: 'Must change password' };
  if (!user.isProfileComplete) return { ok: false as const, status: 403 as const, error: 'Profile incomplete' };
  if (user.status === 'disabled') return { ok: false as const, status: 403 as const, error: 'Account disabled' };
  return { ok: true as const, user };
}

async function getActiveBatch(userId: string) {
  const batches = await prisma.batch.findMany({ where: { userId }, orderBy: { batchNumber: 'asc' } });
  return (
    batches.find((b) => ['available', 'in_progress', 'rejected'].includes(b.status)) ||
    batches.find((b) => b.status === 'pending_review') ||
    null
  );
}

async function computeBatchCounters(batchId: string) {
  const recordings = await prisma.recording.findMany({ where: { batchId }, select: { status: true } });
  const approvedCount = recordings.filter((r) => r.status === 'approved').length;
  const rejectedCount = recordings.filter((r) => r.status === 'rejected').length;
  const pendingReviewCount = recordings.filter((r) => r.status === 'pending_review').length;
  const submittedCount = approvedCount + rejectedCount + pendingReviewCount;
  return { approvedCount, rejectedCount, pendingReviewCount, submittedCount };
}

export async function startBatch(req: Request, res: Response) {
  if (!req.auth) return res.status(401).json({ error: 'Unauthorized' });

  const can = await ensureUserCanTrain(req.auth.userId);
  if (!can.ok) return res.status(can.status).json({ error: can.error });

  // Ensure batch 1 exists and is available
  await prisma.batch.upsert({
    where: { userId_batchNumber: { userId: req.auth.userId, batchNumber: 1 } },
    update: { status: 'available' },
    create: { userId: req.auth.userId, batchNumber: 1, status: 'available' }
  });

  return res.json({ ok: true });
}

export async function getCurrentScript(req: Request, res: Response) {
  if (!req.auth) return res.status(401).json({ error: 'Unauthorized' });

  const can = await ensureUserCanTrain(req.auth.userId);
  if (!can.ok) return res.status(can.status).json({ error: can.error });

  const batch = await getActiveBatch(req.auth.userId);
  if (!batch) {
    return res.json({
      batch: null,
      state: 'no_batch',
      message: 'No batch available yet. Please contact your invitation manager.'
    });
  }

  if (batch.status === 'pending_review') {
    // User cannot proceed to next batch until admin unlock
    return res.json({
      batch: { id: batch.id, batchNumber: batch.batchNumber, status: batch.status },
      state: 'batch_pending_review',
      message:
        'You completed this batch. Your recordings are now under review. Once approved, your balance will be updated and your next batch will be unlocked.'
    });
  }

  const scripts = await prisma.script.findMany({
    where: { batchNumber: batch.batchNumber, isActive: true },
    orderBy: { orderIndex: 'asc' },
    take: batch.totalScripts
  });

  const recordings = await prisma.recording.findMany({
    where: { batchId: batch.id },
    select: { id: true, scriptId: true, status: true, rejectionReason: true, audioFilePath: true, submittedAt: true }
  });

  const byScript = new Map(recordings.map((r) => [r.scriptId, r] as const));

  const rejectedScript = scripts.find((s) => byScript.get(s.id)?.status === 'rejected');
  const nextUnstarted = scripts.find((s) => !byScript.has(s.id) || byScript.get(s.id)?.status === 'not_started');

  const current = rejectedScript || nextUnstarted || null;

  const { approvedCount, rejectedCount, pendingReviewCount, submittedCount } = await computeBatchCounters(batch.id);

  // Make sure batch status reflects reality (without unlocking anything)
  let desiredStatus: any = batch.status;
  if (rejectedCount > 0) desiredStatus = 'rejected';
  else if (submittedCount === batch.totalScripts) desiredStatus = 'in_progress';
  else desiredStatus = submittedCount > 0 ? 'in_progress' : 'available';

  if (desiredStatus !== batch.status) {
    await prisma.batch.update({ where: { id: batch.id }, data: { status: desiredStatus } });
  }

  if (!current) {
    // all submitted, none rejected -> must be waiting on review
    await prisma.batch.update({ where: { id: batch.id }, data: { status: 'pending_review' } });

    return res.json({
      batch: { id: batch.id, batchNumber: batch.batchNumber, status: 'pending_review' },
      state: 'batch_pending_review',
      message:
        'You completed this batch. Your recordings are now under review. Once approved, your balance will be updated and your next batch will be unlocked.'
    });
  }

  const currentRecording = byScript.get(current.id) || null;

  return res.json({
    batch: {
      id: batch.id,
      batchNumber: batch.batchNumber,
      status: desiredStatus,
      totalScripts: batch.totalScripts,
      submittedCount,
      approvedCount,
      rejectedCount,
      pendingReviewCount
    },
    script: {
      id: current.id,
      title: current.title,
      body: current.body,
      instructions:
        'Read the full script exactly as shown. Speak naturally and clearly. Avoid background noise. Preview your recording before submitting.',
      estimatedDurationSeconds: current.estimatedDurationSeconds,
      orderIndex: current.orderIndex
    },
    recording: currentRecording
      ? {
          id: currentRecording.id,
          status: currentRecording.status,
          rejectionReason: currentRecording.rejectionReason,
          submittedAt: currentRecording.submittedAt
        }
      : null
  });
}

export async function submitRecording(req: Request, res: Response) {
  if (!req.auth) return res.status(401).json({ error: 'Unauthorized' });

  const can = await ensureUserCanTrain(req.auth.userId);
  if (!can.ok) return res.status(can.status).json({ error: can.error });

  const parsed = submitSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid request' });

  const file = (req as any).file as Express.Multer.File | undefined;
  if (!file) return res.status(400).json({ error: 'Audio file is required' });

  const allowedTypes = [
    'audio/webm',
    'audio/wav',
    'audio/x-wav',
    'audio/mpeg',
    'audio/mp4',
    'audio/ogg'
  ];

  if (!allowedTypes.includes(file.mimetype)) {
    fs.unlinkSync(file.path);
    return res.status(400).json({ error: 'Invalid audio type' });
  }

  const { scriptId, durationSeconds } = parsed.data;

  const batch = await getActiveBatch(req.auth.userId);
  if (!batch) {
    fs.unlinkSync(file.path);
    return res.status(400).json({ error: 'No active batch' });
  }

  if (batch.status === 'pending_review') {
    fs.unlinkSync(file.path);
    return res.status(403).json({ error: 'Batch is pending admin review' });
  }

  // Must submit only the current script (or a rejected one)
  const current = await getCurrentScriptInternal(req.auth.userId);
  if (!current.ok) {
    fs.unlinkSync(file.path);
    return res.status(current.status).json({ error: current.error });
  }

  const isRejected = current.rejectedScriptIdSet.has(scriptId);
  const isCurrent = current.currentScriptId === scriptId;

  if (!isRejected && !isCurrent) {
    fs.unlinkSync(file.path);
    return res.status(400).json({ error: 'You cannot skip scripts. Submit the current script first.' });
  }

  const relPath = path.join('recordings', path.basename(file.path));

  const rec = await prisma.recording.upsert({
    where: {
      userId_scriptId_batchId: { userId: req.auth.userId, scriptId, batchId: batch.id }
    },
    update: {
      audioFilePath: relPath,
      durationSeconds: durationSeconds ?? null,
      status: 'pending_review',
      rejectionReason: null,
      submittedAt: new Date()
    },
    create: {
      userId: req.auth.userId,
      scriptId,
      batchId: batch.id,
      audioFilePath: relPath,
      durationSeconds: durationSeconds ?? null,
      status: 'pending_review',
      submittedAt: new Date()
    }
  });

  const counters = await computeBatchCounters(batch.id);

  const newStatus =
    counters.rejectedCount > 0
      ? 'rejected'
      : counters.submittedCount >= batch.totalScripts
        ? 'pending_review'
        : 'in_progress';

  await prisma.batch.update({
    where: { id: batch.id },
    data: {
      status: newStatus,
      submittedCount: counters.submittedCount,
      approvedCount: counters.approvedCount,
      rejectedCount: counters.rejectedCount
    }
  });

  return res.json({ ok: true, recording: { id: rec.id, status: rec.status } });
}

async function getCurrentScriptInternal(userId: string) {
  const batch = await getActiveBatch(userId);
  if (!batch) return { ok: false as const, status: 400 as const, error: 'No active batch' };
  if (batch.status === 'pending_review') return { ok: false as const, status: 403 as const, error: 'Batch is pending review' };

  const scripts = await prisma.script.findMany({
    where: { batchNumber: batch.batchNumber, isActive: true },
    orderBy: { orderIndex: 'asc' },
    take: batch.totalScripts
  });

  const recordings = await prisma.recording.findMany({ where: { batchId: batch.id }, select: { scriptId: true, status: true } });
  const byScript = new Map(recordings.map((r) => [r.scriptId, r.status] as const));

  const rejected = scripts.filter((s) => byScript.get(s.id) === 'rejected').map((s) => s.id);
  const rejectedSet = new Set(rejected);

  const rejectedScript = scripts.find((s) => byScript.get(s.id) === 'rejected');
  const nextUnstarted = scripts.find((s) => !byScript.has(s.id) || byScript.get(s.id) === 'not_started');

  const current = rejectedScript || nextUnstarted || null;

  return {
    ok: true as const,
    batchId: batch.id,
    currentScriptId: current?.id ?? null,
    rejectedScriptIdSet: rejectedSet
  };
}

export async function listMyRecordings(req: Request, res: Response) {
  if (!req.auth) return res.status(401).json({ error: 'Unauthorized' });
  if (req.auth.role !== 'user') return res.status(403).json({ error: 'Forbidden' });

  const recordings = await prisma.recording.findMany({
    where: { userId: req.auth.userId },
    include: { script: { select: { title: true, orderIndex: true, batchNumber: true } }, batch: { select: { batchNumber: true } } },
    orderBy: { createdAt: 'desc' }
  });

  return res.json({ recordings });
}

export async function getBatchStatus(req: Request, res: Response) {
  if (!req.auth) return res.status(401).json({ error: 'Unauthorized' });
  if (req.auth.role !== 'user') return res.status(403).json({ error: 'Forbidden' });

  const batch = await getActiveBatch(req.auth.userId);
  return res.json({ batch });
}

export function recordingMulterStorage() {
  const dir = recordingsDir();
  return {
    destination: dir,
    filename: (_req: Request, file: Express.Multer.File, cb: (error: any, filename: string) => void) => {
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const ext = path.extname(file.originalname) || '.webm';
      cb(null, `${unique}-${safeBasename(file.originalname).replace(path.extname(file.originalname), '')}${ext}`);
    }
  };
}
