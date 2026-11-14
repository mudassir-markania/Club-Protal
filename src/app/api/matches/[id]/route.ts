import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const match = await db.match.findFirst({
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
            cricketTeam: true,
            players: {
              include: {
                player: true,
                club: true,
              },
            },
            distributions: {
              include: {
                allocations: {
                  include: { club: true },
                },
              },
            },
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
        distributions: {
          include: {
            allocations: {
              include: { club: true },
            },
          },
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

    const match = await db.match.findFirst({
      where: {
        OR: [{ id: params.id }, { matchCode: params.id }],
      },
    });

    if (!match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }

    const { round, stageName, matchDate, matchTime, venueId, status, notes } = body;

    const updated = await db.match.update({
      where: { id: match.id },
      data: {
        round: round ?? match.round,
        stageName: stageName !== undefined ? stageName : match.stageName,
        matchDate: matchDate ?? match.matchDate,
        matchTime: matchTime ?? match.matchTime,
        venueId: venueId !== undefined ? venueId : match.venueId,
        status: status ?? match.status,
        notes: notes !== undefined ? notes : match.notes,
      },
    });

    await createAuditLog({
      user,
      action: 'UPDATE_MATCH',
      entity: 'Match',
      recordId: match.id,
      previousValue: match,
      updatedValue: updated,
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth(['SUPER_ADMIN', 'ADMIN']);

    const match = await db.match.findFirst({
      where: {
        OR: [{ id: params.id }, { matchCode: params.id }],
      },
    });

    if (!match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }

    await db.match.delete({ where: { id: match.id } });

    await createAuditLog({
      user,
      action: 'DELETE_MATCH',
      entity: 'Match',
      recordId: match.id,
      previousValue: match,
    });

    return NextResponse.json({ success: true, message: 'Match deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
