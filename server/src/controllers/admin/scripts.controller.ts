import { type Request, type Response } from 'express';
import { z } from 'zod';

import { prisma } from '../../db/prisma.js';

const scriptSchema = z.object({
  title: z.string().min(1),
  body: z.string().min(10),
  language: z.string().min(1),
  category: z.string().min(1),
  difficulty: z.string().min(1),
  estimatedDurationSeconds: z.number().int().min(10).max(600),
  batchNumber: z.number().int().min(1),
  orderIndex: z.number().int().min(1),
  isActive: z.boolean().optional()
});

export async function listScripts(req: Request, res: Response) {
  if (!req.auth) return res.status(401).json({ error: 'Unauthorized' });
  if (req.auth.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });

  const scripts = await prisma.script.findMany({
    orderBy: [{ batchNumber: 'asc' }, { orderIndex: 'asc' }],
    take: 500
  });

  return res.json({ scripts });
}

export async function createScript(req: Request, res: Response) {
  if (!req.auth) return res.status(401).json({ error: 'Unauthorized' });
  if (req.auth.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });

  const parsed = scriptSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid request' });

  const script = await prisma.script.create({ data: { ...parsed.data, isActive: parsed.data.isActive ?? true } });
  return res.status(201).json({ script });
}

export async function getScript(req: Request, res: Response) {
  if (!req.auth) return res.status(401).json({ error: 'Unauthorized' });
  if (req.auth.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });

  const script = await prisma.script.findUnique({ where: { id: req.params.id } });
  if (!script) return res.status(404).json({ error: 'Not found' });

  return res.json({ script });
}

export async function updateScript(req: Request, res: Response) {
  if (!req.auth) return res.status(401).json({ error: 'Unauthorized' });
  if (req.auth.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });

  const parsed = scriptSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid request' });

  const script = await prisma.script.update({ where: { id: req.params.id }, data: parsed.data });
  return res.json({ script });
}

export async function deactivateScript(req: Request, res: Response) {
  if (!req.auth) return res.status(401).json({ error: 'Unauthorized' });
  if (req.auth.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });

  const script = await prisma.script.update({ where: { id: req.params.id }, data: { isActive: false } });
  return res.json({ script });
}
