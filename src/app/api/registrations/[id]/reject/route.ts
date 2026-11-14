import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth(['SUPER_ADMIN', 'ADMIN']);
    const body = await req.json().catch(() => ({}));

    const registration = await db.registration.findUnique({
      where: { id: params.id },
    });

    if (!registration) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 });
    }

    const updated = await db.registration.update({
      where: { id: params.id },
      data: {
        status: 'REJECTED',
      },
    });

    await createAuditLog({
      user,
      action: 'REJECT_REGISTRATION',
      entity: 'Registration',
      recordId: registration.id,
      updatedValue: { status: 'REJECTED', reason: body.reason },
    });

    return NextResponse.json({
      success: true,
      message: 'Registration rejected.',
      registration: updated,
    });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED' || error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

