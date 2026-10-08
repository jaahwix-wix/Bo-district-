import { Request, Response, NextFunction } from 'express';
import { adminAuth } from '../lib/firebase-admin.ts';
import { getOrCreateUser } from '../db/users.ts';
import { verifySessionToken } from '../lib/tokens.ts';

export interface AuthRequest extends Request {
  user?: any;
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

  const token = authHeader.split('Bearer ')[1].trim();

  // 1. First verify signed session token
  const sessionUser = verifySessionToken(token);
  if (sessionUser) {
    req.user = {
      uid: sessionUser.uid,
      email: sessionUser.email,
      name: sessionUser.fullName,
      role: sessionUser.role
    };
    try {
      const dbUser = await getOrCreateUser(sessionUser.uid, sessionUser.email, sessionUser.fullName, sessionUser.role, sessionUser.chiefdom);
      req.dbUser = dbUser;
    } catch (e) {
      req.dbUser = {
        uid: sessionUser.uid,
        email: sessionUser.email,
        fullName: sessionUser.fullName,
        role: sessionUser.role,
        chiefdom: sessionUser.chiefdom || 'Kakua'
      };
    }
    return next();
  }

  // 2. Fallback to Firebase verifyIdToken if available
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    req.user = decodedToken;
    const dbUser = await getOrCreateUser(decodedToken.uid, decodedToken.email || '', decodedToken.name);
    req.dbUser = dbUser;
    return next();
  } catch (error) {
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
    const token = authHeader.split('Bearer ')[1].trim();
    const sessionUser = verifySessionToken(token);
    if (sessionUser) {
      req.user = {
        uid: sessionUser.uid,
        email: sessionUser.email,
        name: sessionUser.fullName,
        role: sessionUser.role
      };
      try {
        req.dbUser = await getOrCreateUser(sessionUser.uid, sessionUser.email, sessionUser.fullName, sessionUser.role, sessionUser.chiefdom);
      } catch (e) {
        req.dbUser = {
          uid: sessionUser.uid,
          email: sessionUser.email,
          fullName: sessionUser.fullName,
          role: sessionUser.role,
          chiefdom: sessionUser.chiefdom || 'Kakua'
        };
      }
      return next();
    }

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
