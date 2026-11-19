import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';
import { normalizeSportKey } from '@/lib/sports-rules';

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
      stageType,
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

    const sportKey = normalizeSportKey(sport.name);

    if (!participants || !Array.isArray(participants) || participants.length === 0) {
      return NextResponse.json({ error: 'At least one participant is required' }, { status: 400 });
    }

    // Sport-Specific Backend Validation
    if (sportKey === 'BGMI') {
      if (participants.length < 2) {
        return NextResponse.json({ error: 'BGMI match requires at least 2 participating squads' }, { status: 400 });
      }
      const allPlayersInMatch = new Set<string>();
      for (let i = 0; i < participants.length; i++) {
        const p = participants[i];
        if (!p.teamName || !p.teamName.trim()) {
          return NextResponse.json({ error: `Squad #${i + 1} requires a squad name` }, { status: 400 });
        }
        if (!p.playerIds || !Array.isArray(p.playerIds) || p.playerIds.filter(Boolean).length !== 4) {
          return NextResponse.json({ error: `Squad "${p.teamName}" must contain exactly 4 registered players` }, { status: 400 });
        }
        const squadPlayers = new Set<string>();
        for (const plId of p.playerIds.filter(Boolean)) {
          if (squadPlayers.has(plId)) {
            return NextResponse.json({ error: `Squad "${p.teamName}" contains duplicate player selection` }, { status: 400 });
          }
          squadPlayers.add(plId);
          if (allPlayersInMatch.has(plId)) {
            return NextResponse.json({ error: 'A player cannot be registered in multiple squads in the same match' }, { status: 400 });
          }
          allPlayersInMatch.add(plId);
        }
      }
    } else if (sportKey === 'CRICKET') {
      if (participants.length !== 2) {
        return NextResponse.json({ error: 'Cricket match requires exactly 2 competing teams' }, { status: 400 });
      }
      const [t1, t2] = participants;
      if (!t1.cricketTeamId || !t2.cricketTeamId) {
        return NextResponse.json({ error: 'Please select both cricket teams' }, { status: 400 });
      }
      if (t1.cricketTeamId === t2.cricketTeamId) {
        return NextResponse.json({ error: 'Please select two distinct cricket teams' }, { status: 400 });
      }
    } else if (sportKey === 'FOOTBALL') {
      if (participants.length !== 2) {
        return NextResponse.json({ error: 'Football match requires exactly 2 competing houses' }, { status: 400 });
      }
      const [c1, c2] = participants;
      if (!c1.clubId || !c2.clubId) {
        return NextResponse.json({ error: 'Please select both competing houses' }, { status: 400 });
      }
      if (c1.clubId === c2.clubId) {
        return NextResponse.json({ error: 'Please select two distinct houses' }, { status: 400 });
      }
    } else if (sportKey === 'CHESS') {
      if (participants.length !== 2) {
        return NextResponse.json({ error: 'Chess requires exactly 2 competing players' }, { status: 400 });
      }
      const p1Id = participants[0].playerId || (participants[0].playerIds && participants[0].playerIds[0]);
      const p2Id = participants[1].playerId || (participants[1].playerIds && participants[1].playerIds[0]);
      if (!p1Id || !p2Id) {
        return NextResponse.json({ error: 'Please select both competing players' }, { status: 400 });
      }
      if (p1Id === p2Id) {
        return NextResponse.json({ error: 'Please select two distinct players for Chess' }, { status: 400 });
      }
    } else if (sportKey === 'BADMINTON' || sportKey === 'CARROM') {
      if (participants.length !== 2) {
        return NextResponse.json({ error: `${sport.name} requires exactly 2 competing sides` }, { status: 400 });
      }
      const sideAPlayers: string[] = (participants[0].playerIds || []).filter(Boolean);
      const sideBPlayers: string[] = (participants[1].playerIds || []).filter(Boolean);
      if (participants[0].playerId && sideAPlayers.length === 0) sideAPlayers.push(participants[0].playerId);
      if (participants[1].playerId && sideBPlayers.length === 0) sideBPlayers.push(participants[1].playerId);

      if (sideAPlayers.length === 0 || sideBPlayers.length === 0) {
        return NextResponse.json({ error: 'Please select players for both sides' }, { status: 400 });
      }
      if (sideAPlayers.length !== sideBPlayers.length) {
        return NextResponse.json({ error: 'Both sides must have the same number of players (1 for Singles, 2 for Doubles)' }, { status: 400 });
      }
      const allPlayers = [...sideAPlayers, ...sideBPlayers];
      if (new Set(allPlayers).size !== allPlayers.length) {
        return NextResponse.json({ error: 'A player cannot be selected more than once or appear on both sides of a match' }, { status: 400 });
      }
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
        stageType: stageType || 'NORMAL',
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

        // Single player participant (Chess / Singles)
        const primaryPlayerId = p.playerId || (p.playerIds && p.playerIds.length === 1 ? p.playerIds[0] : null);
        if (primaryPlayerId && !assignedClubId) {
          const playerRec = await db.player.findUnique({ where: { id: primaryPlayerId } });
          if (playerRec) assignedClubId = playerRec.clubId;
        }

        const participant = await db.matchParticipant.create({
          data: {
            matchId: match.id,
            clubId: assignedClubId,
            playerId: primaryPlayerId || null,
            cricketTeamId: p.cricketTeamId || null,
            teamName: p.teamName || (p.cricketTeamId ? undefined : `Entry ${i + 1}`),
            score: 0,
            rank: null,
          },
        });

        // Collect all distinct player IDs to link to this participant
        const playerIdsToLink = new Set<string>();
        if (p.playerIds && Array.isArray(p.playerIds)) {
          p.playerIds.filter(Boolean).forEach((id: string) => playerIdsToLink.add(id));
        }
        if (primaryPlayerId) {
          playerIdsToLink.add(primaryPlayerId);
        }

        for (const plId of Array.from(playerIdsToLink)) {
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
