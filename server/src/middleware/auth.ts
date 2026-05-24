import { type Request, type Response, type NextFunction } from 'express';
import { getAuthCookieName, verifyJwt } from '../utils/jwt.js';

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.[getAuthCookieName()];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const payload = verifyJwt(token);
    req.auth = { userId: payload.sub, role: payload.role };
    return next();
  } catch {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.auth) return res.status(401).json({ error: 'Unauthorized' });
  if (req.auth.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  return next();
}
