import { Request, Response, NextFunction } from 'express';
import { adminAuth } from '../lib/firebase-admin.ts';
import { DecodedIdToken } from 'firebase-admin/auth';
import { getOrCreateUser, getUserByUid } from '../db/users.ts';

export interface AuthRequest extends Request {
  user?: DecodedIdToken;
  dbUser?: any;
}

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized: Missing or malformed authorization token' });
    return;
  }

  const token = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    req.user = decodedToken;
    
    // Sync or retrieve Postgres user record
    const dbUser = await getOrCreateUser(decodedToken.uid, decodedToken.email || '', decodedToken.name);
    req.dbUser = dbUser;

    next();
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error);
    res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
  }
};

export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split('Bearer ')[1];
    try {
      const decodedToken = await adminAuth.verifyIdToken(token);
      req.user = decodedToken;
      const dbUser = await getOrCreateUser(decodedToken.uid, decodedToken.email || '', decodedToken.name);
      req.dbUser = dbUser;
    } catch (error) {
      console.warn('Optional auth token invalid, proceeding unauthenticated:', error);
    }
  }
  next();
};

export const requireRole = (allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.dbUser) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const userRole = req.dbUser.role || 'citizen';
    if (allowedRoles.includes(userRole) || userRole === 'admin') {
      next();
    } else {
      res.status(403).json({ error: `Forbidden: Insufficient privileges. Required role: ${allowedRoles.join(' or ')}` });
    }
  };
};
