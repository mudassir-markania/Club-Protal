import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';

export async function GET() {
  try {
    const clubs = await prisma.club.findMany({
      orderBy: { currentRank: 'asc' },
      include: {
        _count: {
          select: {
            players: true,
            matchParticipants: true,
          },
        },
      },
    });

    return NextResponse.json(clubs);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuth(['SUPER_ADMIN', 'ADMIN']);
    const body = await req.json();

    const { name, code, logoUrl, captainName, viceCaptainName, status } = body;

    if (!name || !code) {
      return NextResponse.json({ error: 'Club Name and Code are required' }, { status: 400 });
    }

    const existing = await prisma.club.findFirst({
      where: {
        OR: [{ name: { equals: name } }, { code: { equals: code.toUpperCase() } }],
      },
    });

    if (existing) {
      return NextResponse.json({ error: 'Club with this name or code already exists' }, { status: 409 });
    }

    const clubCount = await prisma.club.count();

    const club = await prisma.club.create({
      data: {
        name,
        code: code.toUpperCase(),
        logoUrl: logoUrl || 'shield',
        captainName,
        viceCaptainName,
        status: status || 'ACTIVE',
        currentRank: clubCount + 1,
        totalPoints: 0,
      },
    });

    await createAuditLog({
      user,
      action: 'CREATE_CLUB',
      entity: 'Club',
      recordId: club.id,
      updatedValue: club,
    });

    return NextResponse.json(club, { status: 201 });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED' || error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

