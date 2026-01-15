import { Request, Response, NextFunction } from 'express';
import { auth } from '../lib/auth/factory.js';
import type { User } from '../../shared/schema.zod.js';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export function authMiddleware() {
  return async (req: Request, res: Response, next: NextFunction) => {
    console.log(`[Auth Middleware] ${req.method} ${req.path}`);

    const authHeader = req.headers.authorization;
    if (!authHeader) {
      console.warn('[Auth Middleware] No authorization header');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.replace('Bearer ', '');
    if (!token) {
      console.warn('[Auth Middleware] No token provided');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const user = await auth.verifyToken(token);
      console.log(`[Auth Middleware] Token verified for user: ${user.email}`);
      req.user = user;
      next();
    } catch (error) {
      console.error('[Auth Middleware] Token verification failed:', error);
      res.status(401).json({ error: 'Invalid token' });
    }
  };
}
