import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const club = await db.club.findUnique({
      where: { id: params.id },
      include: {
        players: {
          include: {
            sports: {
              include: {
                sport: true,
              },
            },
          },
        },
        pointsHistory: {
          orderBy: { recordedAt: 'desc' },
          include: {
            sport: true,
          },
        },
        leaderboardEntries: true,
      },
    });

    if (!club) {
      return NextResponse.json({ error: 'Club not found' }, { status: 404 });
    }

    return NextResponse.json(club);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth(['SUPER_ADMIN', 'ADMIN']);
    const body = await req.json();

    const existing = await db.club.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Club not found' }, { status: 404 });
    }

    const { name, code, logoUrl, captainName, viceCaptainName, status } = body;

    const updated = await db.club.update({
      where: { id: params.id },
      data: {
        name: name !== undefined ? name : existing.name,
        code: code !== undefined ? code.toUpperCase() : existing.code,
        logoUrl: logoUrl !== undefined ? logoUrl : existing.logoUrl,
        captainName: captainName !== undefined ? captainName : existing.captainName,
        viceCaptainName: viceCaptainName !== undefined ? viceCaptainName : existing.viceCaptainName,
        status: status !== undefined ? status : existing.status,
      },
    });

    await createAuditLog({
      user,
      action: 'UPDATE_CLUB',
      entity: 'Club',
      recordId: updated.id,
      previousValue: existing,
      updatedValue: updated,
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED' || error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth(['SUPER_ADMIN', 'ADMIN']);

    const club = await db.club.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            players: true,
            matchParticipants: true,
          },
        },
      },
    });

    if (!club) {
      return NextResponse.json({ error: 'Club not found' }, { status: 404 });
    }

    // Check dependency safety
    if (club._count.matchParticipants > 0) {
      return NextResponse.json(
        { error: `Cannot delete club because it is already participating in ${club._count.matchParticipants} scheduled/completed matches.` },
        { status: 400 }
      );
    }

    await db.club.delete({
      where: { id: params.id },
    });

    await createAuditLog({
      user,
      action: 'DELETE_CLUB',
      entity: 'Club',
      recordId: params.id,
      previousValue: club,
    });

    return NextResponse.json({ success: true, message: 'Club deleted successfully' });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED' || error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

