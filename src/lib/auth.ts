import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { cookies, headers } from 'next/headers';
import { prisma } from './prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'sports-portal-default-secret-2026';

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
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyToken(token: string): AuthUser | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthUser;
  } catch (err) {
    return null;
  }
}

export async function getSessionUser(): Promise<AuthUser | null> {
  try {
    // 1. Try cookie
    const cookieStore = cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (token) {
      const decoded = verifyToken(token);
      if (decoded) return decoded;
    }

    // 2. Try Authorization header
    const headersList = headers();
    const authHeader = headersList.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const headerToken = authHeader.substring(7);
      const decoded = verifyToken(headerToken);
      if (decoded) return decoded;
    }

    return null;
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

