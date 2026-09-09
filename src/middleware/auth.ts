import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface AuthRequest extends Request {
  user?: { id: string; roles: string[] };
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ ok: false, error: 'Authentication required.' });
  }

  try {
    const payload = jwt.verify(header.slice(7), env.JWT_SECRET) as { sub?: string; roles?: string[] };
    if (!payload.sub) throw new Error('Invalid token');
    req.user = { id: payload.sub, roles: payload.roles ?? [] };
    next();
  } catch {
    return res.status(401).json({ ok: false, error: 'Invalid or expired token.' });
  }
}

export function requireRoles(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.some((role) => req.user!.roles.includes(role))) {
      return res.status(403).json({ ok: false, error: 'Insufficient permissions.' });
    }
    next();
  };
}
