import { Request, Response, NextFunction } from 'express';
import { adminAuth } from '../lib/firebase-admin.ts';
import { DecodedIdToken } from 'firebase-admin/auth';
import { parseCookies, SESSION_COOKIE_NAME } from '../lib/authService.ts';
import {
  getSessionWithUser,
  getOrCreateUser,
  sanitizeUserRow,
  SanitizedUser,
} from '../db/users.ts';

export interface AuthRequest extends Request {
  user?: DecodedIdToken;
  sessionUser?: SanitizedUser;
  csrfToken?: string;
}

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // 1. Check server-managed HttpOnly session cookie first
    const cookies = parseCookies(req.headers.cookie);
    const sid = cookies[SESSION_COOKIE_NAME];
    if (sid) {
      const sessionData = await getSessionWithUser(sid);
      if (sessionData) {
        // Validate CSRF on state-changing requests
        const method = req.method.toUpperCase();
        if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
          const clientCsrf = req.headers['x-csrf-token'];
          if (
            clientCsrf &&
            typeof clientCsrf === 'string' &&
            clientCsrf !== sessionData.session.csrfToken
          ) {
            return res.status(403).json({ error: 'Forbidden: Invalid CSRF token' });
          }
        }
        req.sessionUser = sessionData.user;
        req.csrfToken = sessionData.session.csrfToken;
        req.user = {
          uid: sessionData.user.uid,
          email: sessionData.user.email,
          name: sessionData.user.name,
        } as unknown as DecodedIdToken;
        return next();
      }
    }

    // 2. Fallback to Firebase Bearer ID token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: Please sign in first' });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    req.user = decodedToken;
    const dbRow = await getOrCreateUser(
      decodedToken.uid,
      decodedToken.email || 'user@plastico.eg',
      decodedToken.name || ''
    );
    req.sessionUser = sanitizeUserRow(dbRow);
    return next();
  } catch (error) {
    console.error('Authentication check failed:', error);
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired session' });
  }
};

export const requireRole = (allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const user = req.sessionUser;
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized: Authentication required' });
    }
    if (user.accountType === 'admin' || allowedRoles.includes(user.accountType)) {
      return next();
    }
    return res.status(403).json({
      error: `Forbidden: Your account role (${user.accountType}) does not have permission for this action`,
    });
  };
};
