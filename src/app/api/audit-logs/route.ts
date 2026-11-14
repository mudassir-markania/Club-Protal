import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    await requireAuth(['SUPER_ADMIN', 'ADMIN']);

    const { searchParams } = new URL(req.url);
    const entity = searchParams.get('entity');
    const action = searchParams.get('action');

    const where: any = {};
    if (entity) where.entity = entity;
    if (action) where.action = action;

    const logs = await db.auditLog.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: 100,
    });

    return NextResponse.json(logs);
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED' || error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

