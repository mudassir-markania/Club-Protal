import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
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
      where.OR = [
        { participants: { some: { clubId } } },
        { participants: { some: { players: { some: { clubId } } } } },
      ];
    }

    const matches = await db.match.findMany({
      where,
      orderBy: [{ matchDate: 'asc' }, { matchTime: 'asc' }],
      include: {
        sport: true,
        venue: true,
        starPlayer: true,
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
              include: {
                club: true,
              },
            },
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
      matchCategory,
      matchDate,
      matchTime,
      venueId,
      notes,
      participants, // Array of { clubId?, playerId?, cricketTeamId?, teamName?, playerIds?: string[] }
      refereeIds,   // Array of refereeId strings
    } = body;

    if (!sportId || !matchDate || !matchTime || !round) {
      return NextResponse.json(
        { error: 'Sport, Round, Match Date, and Match Time are required' },
        { status: 400 }
      );
    }

    const sport = await db.sport.findUnique({ where: { id: sportId } });
    if (!sport) {
      return NextResponse.json({ error: 'Sport not found' }, { status: 404 });
    }

    // Auto generate match code
    const count = await db.match.count();
    const prefix = sport.name.slice(0, 2).toUpperCase();
    const matchCode = `M-${prefix}-${(count + 1).toString().padStart(3, '0')}`;

    const match = await db.match.create({
      data: {
        matchCode,
        sportId,
        round,
        stageName: stageName || 'Championship Stage',
        matchCategory: matchCategory || 'Singles',
        matchDate,
        matchTime,
        venueId: venueId || null,
        notes: notes || null,
        status: 'SCHEDULED',
      },
    });

    // Add participants
    if (participants && Array.isArray(participants)) {
      for (let i = 0; i < participants.length; i++) {
        const p = participants[i];
        let assignedClubId = p.clubId || null;

        // If cricket team, assign parent club
        if (p.cricketTeamId && !assignedClubId) {
          const cTeam = await db.cricketTeam.findUnique({ where: { id: p.cricketTeamId } });
          if (cTeam) assignedClubId = cTeam.clubId;
        }

        const participant = await db.matchParticipant.create({
          data: {
            matchId: match.id,
            clubId: assignedClubId,
            playerId: p.playerId || null,
            cricketTeamId: p.cricketTeamId || null,
            teamName: p.teamName || (p.cricketTeamId ? undefined : `Entry ${i + 1}`),
            score: 0,
            rank: null,
          },
        });

        // If playerIds provided (squad roster)
        if (p.playerIds && Array.isArray(p.playerIds)) {
          for (const plId of p.playerIds) {
            const playerRecord = await db.player.findUnique({ where: { id: plId } });
            if (playerRecord) {
              await db.matchParticipantPlayer.create({
                data: {
                  participantId: participant.id,
                  playerId: playerRecord.id,
                  clubId: playerRecord.clubId,
                },
              });
            }
          }
        }
      }
    }

    // Add referee assignments
    if (refereeIds && Array.isArray(refereeIds)) {
      for (const refId of refereeIds) {
        await db.matchReferee.create({
          data: {
            matchId: match.id,
            refereeId: refId,
          },
        });
      }
    }

    await createAuditLog({
      user,
      action: 'CREATE_MATCH',
      entity: 'Match',
      recordId: match.id,
      updatedValue: { matchCode, sportId, matchDate, round },
    });

    const fullMatch = await db.match.findUnique({
      where: { id: match.id },
      include: {
        sport: true,
        venue: true,
        starPlayer: true,
        participants: {
          include: {
            club: true,
            cricketTeam: true,
            players: { include: { player: true, club: true } },
          },
        },
        referees: { include: { referee: true } },
      },
    });

    return NextResponse.json(fullMatch, { status: 201 });
  } catch (error: any) {
    console.error('Error creating match:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
