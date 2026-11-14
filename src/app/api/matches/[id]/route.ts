import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const match = await prisma.match.findFirst({
      where: {
        OR: [{ id: params.id }, { matchCode: params.id }],
      },
      include: {
        sport: true,
        venue: true,
        participants: {
          include: {
            club: true,
            player: true,
            scoreEntries: true,
          },
        },
        referees: {
          include: {
            referee: true,
          },
        },
        results: {
          include: {
            referee: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        scoreEntries: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }

    return NextResponse.json(match);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth();
    const body = await req.json();

    const existing = await prisma.match.findFirst({
      where: {
        OR: [{ id: params.id }, { matchCode: params.id }],
      },
      include: {
        participants: true,
        referees: true,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }

    // If referee, only allow status update (e.g. IN_PROGRESS)
    if (user.role === 'REFEREE') {
      const isAssigned = existing.referees.some((r) => r.refereeId === user.refereeId);
      if (!isAssigned) {
        return NextResponse.json({ error: 'Not authorized for this match' }, { status: 403 });
      }

      if (body.status && ['IN_PROGRESS', 'AWAITING_RESULT'].includes(body.status)) {
        const updated = await prisma.match.update({
          where: { id: existing.id },
          data: { status: body.status },
        });
        return NextResponse.json(updated);
      }
    }

    // Admin updates
    const {
      round,
      stageName,
      matchDate,
      matchTime,
      venueId,
      status,
      notes,
      refereeIds,
    } = body;

    const updated = await prisma.match.update({
      where: { id: existing.id },
      data: {
        round: round !== undefined ? round : existing.round,
        stageName: stageName !== undefined ? stageName : existing.stageName,
        matchDate: matchDate !== undefined ? matchDate : existing.matchDate,
        matchTime: matchTime !== undefined ? matchTime : existing.matchTime,
        venueId: venueId !== undefined ? venueId : existing.venueId,
        status: status !== undefined ? status : existing.status,
        notes: notes !== undefined ? notes : existing.notes,
      },
    });

    if (refereeIds && Array.isArray(refereeIds)) {
      await prisma.matchReferee.deleteMany({
        where: { matchId: existing.id },
      });

      for (const rId of refereeIds) {
        await prisma.matchReferee.create({
          data: {
            matchId: existing.id,
            refereeId: rId,
          },
        });
      }
    }

    const result = await prisma.match.findUnique({
      where: { id: existing.id },
      include: {
        sport: true,
        venue: true,
        participants: { include: { club: true, player: true } },
        referees: { include: { referee: true } },
      },
    });

    await createAuditLog({
      user,
      action: 'UPDATE_MATCH',
      entity: 'Match',
      recordId: existing.id,
      previousValue: existing,
      updatedValue: result,
    });

    return NextResponse.json(result);
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

    const match = await prisma.match.findFirst({
      where: {
        OR: [{ id: params.id }, { matchCode: params.id }],
      },
    });

    if (!match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }

    await prisma.match.delete({
      where: { id: match.id },
    });

    await createAuditLog({
      user,
      action: 'DELETE_MATCH',
      entity: 'Match',
      recordId: match.id,
      previousValue: match,
    });

    return NextResponse.json({ success: true, message: 'Match deleted successfully' });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED' || error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

