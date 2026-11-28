import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { getRequestContext } from '@/http/context';
import { db } from './db';

function getJwtSecret(): string {
  return process.env.JWT_SECRET || 'sports-portal-default-secret-2026';
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  refereeId?: string | null;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(user: AuthUser): string {
  return jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      refereeId: user.refereeId,
    },
    getJwtSecret(),
    { expiresIn: '7d' }
  );
}

let cachedRevocationTimestamp: number | null = null;
let lastRevocationCheck = 0;

async function getRevocationTimestamp(): Promise<number> {
  const now = Date.now();
  if (cachedRevocationTimestamp !== null && now - lastRevocationCheck < 10000) {
    return cachedRevocationTimestamp;
  }
  try {
    const setting = await db.tournamentSetting.findUnique({
      where: { key: 'SESSIONS_REVOKED_BEFORE' },
    });
    cachedRevocationTimestamp = setting?.value ? parseInt(setting.value, 10) : 0;
  } catch {
    cachedRevocationTimestamp = 0;
  }
  lastRevocationCheck = now;
  return cachedRevocationTimestamp;
}

export async function revokeAllSessions(): Promise<number> {
  const now = Date.now();
  await db.tournamentSetting.upsert({
    where: { key: 'SESSIONS_REVOKED_BEFORE' },
    update: { value: String(now) },
    create: {
      key: 'SESSIONS_REVOKED_BEFORE',
      value: String(now),
      description: 'Timestamp before which all user sessions are invalid',
    },
  });
  cachedRevocationTimestamp = now;
  lastRevocationCheck = now;
  return now;
}

export function verifyToken(token: string): (AuthUser & { iat?: number }) | null {
  try {
    return jwt.verify(token, getJwtSecret()) as AuthUser & { iat?: number };
  } catch (err) {
    return null;
  }
}

export async function getSessionUser(): Promise<AuthUser | null> {
  try {
    const ctx = getRequestContext();
    if (!ctx) return null;

    let token: string | undefined;

    // 1. Try cookie
    if (ctx.cookies && ctx.cookies['auth_token']) {
      token = ctx.cookies['auth_token'];
    }

    // 2. Try Authorization header
    if (!token && ctx.headers) {
      const authHeader = ctx.headers['authorization'];
      const headerValue = Array.isArray(authHeader) ? authHeader[0] : authHeader;
      if (headerValue && headerValue.startsWith('Bearer ')) {
        token = headerValue.substring(7);
      }
    }

    if (!token) return null;

    const decoded = verifyToken(token);
    if (!decoded) return null;

    // Check if session was issued before a global revocation timestamp
    if (decoded.iat) {
      const revokedBefore = await getRevocationTimestamp();
      if (revokedBefore > 0 && decoded.iat * 1000 < revokedBefore) {
        return null;
      }
    }

    return {
      id: decoded.id,
      name: decoded.name,
      email: decoded.email,
      role: decoded.role,
      refereeId: decoded.refereeId,
    };
  } catch (e) {
    return null;
  }
}

export async function requireAuth(allowedRoles?: string[]): Promise<AuthUser> {
  const user = await getSessionUser();
  if (!user) {
    throw new Error('UNAUTHORIZED');
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const hasRole = allowedRoles.includes(user.role) || user.role === 'SUPER_ADMIN';
    if (!hasRole) {
      throw new Error('FORBIDDEN');
    }
  }

  return user;
}

