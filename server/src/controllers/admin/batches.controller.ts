import { type Request, type Response } from 'express';
import { prisma } from '../../db/prisma.js';

async function scriptsExistForBatch(batchNumber: number) {
  const count = await prisma.script.count({ where: { batchNumber, isActive: true } });
  return count >= 10;
}

export async function listBatches(req: Request, res: Response) {
  if (!req.auth) return res.status(401).json({ error: 'Unauthorized' });
  if (req.auth.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });

  const status = (req.query.status as string | undefined)?.trim();

  const batches = await prisma.batch.findMany({
    where: {
      ...(status ? { status: status as any } : {})
    },
    include: {
      user: { select: { id: true, email: true, phone: true, profile: { select: { firstName: true, lastName: true } } } }
    },
    orderBy: [{ updatedAt: 'desc' }],
    take: 200
  });

  return res.json({ batches });
}

export async function getBatch(req: Request, res: Response) {
  if (!req.auth) return res.status(401).json({ error: 'Unauthorized' });
  if (req.auth.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });

  const batch = await prisma.batch.findUnique({
    where: { id: req.params.id },
    include: {
      user: { include: { profile: true, balance: true } },
      recordings: {
        include: { script: true },
        orderBy: { createdAt: 'asc' }
      }
    }
  });

  if (!batch) return res.status(404).json({ error: 'Not found' });

  return res.json({ batch });
}

export async function approveBatch(req: Request, res: Response) {
  if (!req.auth) return res.status(401).json({ error: 'Unauthorized' });
  if (req.auth.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });

  const batch = await prisma.batch.findUnique({
    where: { id: req.params.id },
    include: { recordings: true }
  });

  if (!batch) return res.status(404).json({ error: 'Not found' });

  const approvedCount = batch.recordings.filter((r) => r.status === 'approved').length;
  if (approvedCount < batch.totalScripts) {
    return res.status(400).json({ error: 'All recordings must be approved before approving the batch.' });
  }

  const updated = await prisma.batch.update({
    where: { id: batch.id },
    data: {
      status: 'approved',
      approvedAt: new Date()
    }
  });

  return res.json({ batch: updated });
}

export async function unlockNextBatch(req: Request, res: Response) {
  if (!req.auth) return res.status(401).json({ error: 'Unauthorized' });
  if (req.auth.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });

  const batch = await prisma.batch.findUnique({ where: { id: req.params.id } });
  if (!batch) return res.status(404).json({ error: 'Not found' });

  const nextNumber = batch.batchNumber + 1;

  const hasScripts = await scriptsExistForBatch(nextNumber);
  if (!hasScripts) return res.status(400).json({ error: `No scripts seeded for batch ${nextNumber}.` });

  const next = await prisma.batch.upsert({
    where: { userId_batchNumber: { userId: batch.userId, batchNumber: nextNumber } },
    update: { status: 'available' },
    create: {
      userId: batch.userId,
      batchNumber: nextNumber,
      status: 'available'
    }
  });

  return res.json({ nextBatch: next });
}

export async function rejectBatch(req: Request, res: Response) {
  if (!req.auth) return res.status(401).json({ error: 'Unauthorized' });
  if (req.auth.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });

  const batch = await prisma.batch.update({
    where: { id: req.params.id },
    data: { status: 'rejected' }
  });

  return res.json({ batch });
}
