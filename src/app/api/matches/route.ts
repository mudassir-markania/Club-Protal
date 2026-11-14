import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sportId = searchParams.get('sportId');
    const status = searchParams.get('status');
    const date = searchParams.get('date');
    const refereeId = searchParams.get('refereeId');
    const clubId = searchParams.get('clubId');

    const where: any = {};

    if (sportId) where.sportId = sportId;
    if (status) where.status = status;
    if (date) where.matchDate = date;

    if (refereeId) {
      where.referees = {
        some: {
          refereeId,
        },
      };
    }

    if (clubId) {
      where.participants = {
        some: {
          clubId,
        },
      };
    }

    const matches = await prisma.match.findMany({
      where,
      orderBy: [{ matchDate: 'asc' }, { matchTime: 'asc' }],
      include: {
        sport: true,
        venue: true,
        participants: {
          include: {
            club: true,
            player: true,
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
        },
      },
    });

    return NextResponse.json(matches);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuth(['SUPER_ADMIN', 'ADMIN']);
    const body = await req.json();

    const {
      sportId,
      round,
      stageName,
      matchDate,
      matchTime,
      venueId,
      notes,
      participants, // Array of { clubId?, playerId?, teamName? }
      refereeIds,   // Array of refereeId strings
    } = body;

    if (!sportId || !matchDate || !matchTime || !round) {
      return NextResponse.json(
        { error: 'Sport, Round, Match Date, and Match Time are required' },
        { status: 400 }
      );
    }

    // Auto generate match code
    const count = await prisma.match.count();
    const matchCode = `M-${round.slice(0, 2).toUpperCase()}-${(count + 1).toString().padStart(3, '0')}`;

    const match = await prisma.match.create({
      data: {
        matchCode,
        sportId,
        round,
        stageName: stageName || null,
        matchDate,
        matchTime,
        venueId: venueId || null,
        notes: notes || null,
        status: 'SCHEDULED',
      },
    });

    // Create participants
    if (participants && Array.isArray(participants)) {
      for (const p of participants) {
        await prisma.matchParticipant.create({
          data: {
            matchId: match.id,
            clubId: p.clubId || null,
            playerId: p.playerId || null,
            teamName: p.teamName || null,
            score: 0,
          },
        });
      }
    }

    // Assign referees & create notifications
    if (refereeIds && Array.isArray(refereeIds)) {
      for (const refId of refereeIds) {
        await prisma.matchReferee.create({
          data: {
            matchId: match.id,
            refereeId: refId,
          },
        });

        // Referee notification
        await prisma.notification.create({
          data: {
            recipientRole: 'REFEREE',
            recipientUserId: null,
            title: 'New Match Assignment',
            message: `You are assigned to match ${matchCode} (${round}) on ${matchDate} at ${matchTime}.`,
            type: 'ASSIGNMENT',
            link: `/referee/matches/${matchCode}`,
          },
        });
      }
    }

    const created = await prisma.match.findUnique({
      where: { id: match.id },
      include: {
        sport: true,
        venue: true,
        participants: { include: { club: true, player: true } },
        referees: { include: { referee: true } },
      },
    });

    await createAuditLog({
      user,
      action: 'CREATE_MATCH',
      entity: 'Match',
      recordId: match.id,
      updatedValue: created,
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED' || error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

