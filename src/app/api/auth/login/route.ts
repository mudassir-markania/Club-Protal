import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { comparePassword, signToken } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const cleanInput = (email || '').toLowerCase().trim();
    const cleanPassword = typeof password === 'string' ? password.trim() : password;

    // Support both direct email and common username aliases
    const searchEmails = [cleanInput];
    if (['admin', 'director', 'superadmin', 'administrator'].includes(cleanInput)) {
      searchEmails.push('admin@sportsportal.com');
    } else if (['marcus', 'ref.marcus', 'referee.marcus', 'marcus@gmail.com'].includes(cleanInput)) {
      searchEmails.push('marcus@gmail.com');
    }

    const user = await db.user.findFirst({
      where: { email: { in: searchEmails } },
      include: { role: true, referee: true },
    });

    if (!user || user.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const isValid = await comparePassword(cleanPassword, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const authUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role.name,
      refereeId: user.refereeId,
    };

    const token = signToken(authUser);

    await createAuditLog({
      user: authUser,
      action: 'USER_LOGIN',
      entity: 'User',
      recordId: user.id,
      updatedValue: { email: user.email, role: user.role.name },
    });

    const response = NextResponse.json({
      success: true,
      user: authUser,
      token,
    });

    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

