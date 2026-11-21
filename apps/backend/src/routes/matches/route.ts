import { NextResponse } from '@/http/next-server';
import { db } from '@/lib/db';
import { requireAuth, getSessionUser } from '@/lib/auth';
import { getRefereeScope } from '@/lib/referee-access';
import { createAuditLog } from '@/lib/audit';
import { assertPlayersEligible } from '@/lib/player-eligibility';
import { categoryRules, categoryDisplayName } from '@club-portal/shared';
import { normalizeSportKey } from '@club-portal/shared';
import { getCached, setCached, clearCache } from '@/lib/cache';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sportId = searchParams.get('sportId');
    const status = searchParams.get('status');
    const date = searchParams.get('date');
    const refereeId = searchParams.get('refereeId');
    const clubId = searchParams.get('clubId');

    const session = await getSessionUser();
    const isPublicUser = !session || session.role !== 'REFEREE';
    const cacheKey = `matches:${req.url}`;
    if (isPublicUser) {
      const cached = getCached(cacheKey);
      if (cached) return NextResponse.json(cached);
    }

    const where: any = {};

    if (sportId) where.sportId = sportId;
    if (status) where.status = status;
    if (date) where.matchDate = date;

    if (refereeId) {
      // matches directly assigned to this referee
      const assigned = await db.matchReferee.findMany({ where: { refereeId } });
      where.id = { in: assigned.map((r: any) => r.matchId) };
    }

    // A signed-in referee only ever sees matches of their assigned sports (plus matches assigned to them directly)
    if (session?.role === 'REFEREE') {
      if (!session.refereeId) return NextResponse.json([]);
      const scope = await getRefereeScope(session.refereeId);
      where.AND = [
        {
          OR: [
            ...(scope.sportIds.length ? [{ sportId: { in: scope.sportIds } }] : []),
            ...(scope.matchIds.length ? [{ id: { in: scope.matchIds } }] : []),
          ],
        },
      ];
      if (where.AND[0].OR.length === 0) return NextResponse.json([]);
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

    if (isPublicUser) {
      setCached(cacheKey, matches, 30);
    }

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
      // BGMI is team-based: every participant must be a registered BGMI team.
      if (participants.length < 2) {
        return NextResponse.json({ error: 'BGMI match requires at least 2 participating teams' }, { status: 400 });
      }
      const teamIds: string[] = participants.map((p: any) => p.bgmiTeamId).filter(Boolean);
      if (teamIds.length !== participants.length) {
        return NextResponse.json({ error: 'Only registered BGMI teams can participate. Select teams, not individual players.' }, { status: 400 });
      }
      if (new Set(teamIds).size !== teamIds.length) {
        return NextResponse.json({ error: 'The same BGMI team cannot be selected twice' }, { status: 400 });
      }
      const teams = await db.bgmiTeam.findMany({ where: { id: { in: teamIds } } });
      if (teams.length !== teamIds.length) {
        return NextResponse.json({ error: 'One or more selected BGMI teams no longer exist' }, { status: 400 });
      }
      if (teams.some((t: any) => t.status !== 'ACTIVE')) {
        return NextResponse.json({ error: 'Inactive BGMI teams cannot be scheduled' }, { status: 400 });
      }
      // Roster comes from the team record, never from the client
      const allPlayersInMatch = new Set<string>();
      for (const p of participants) {
        const team = teams.find((t: any) => t.id === p.bgmiTeamId);
        p.teamName = team.name;
        p.playerIds = [...(team.playerIds || [])];
        for (const plId of p.playerIds) {
          if (allPlayersInMatch.has(plId)) {
            return NextResponse.json({ error: 'A player cannot be in more than one selected team in the same match' }, { status: 400 });
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
      // Doubles / mixed doubles are played by registered doubles teams (roster comes from the team record)
      const looksLikeDoubles = participants.some(
        (p: any) => p.doublesTeamId || (p.playerIds || []).filter(Boolean).length === 2
      );
      if (looksLikeDoubles) {
        const teamIds: string[] = participants.map((p: any) => p.doublesTeamId).filter(Boolean);
        if (teamIds.length !== participants.length) {
          return NextResponse.json({ error: 'Doubles matches need registered doubles teams on both sides' }, { status: 400 });
        }
        if (new Set(teamIds).size !== teamIds.length) {
          return NextResponse.json({ error: 'The same doubles team cannot be selected on both sides' }, { status: 400 });
        }
        const teams = await db.doublesTeam.findMany({ where: { id: { in: teamIds } } });
        if (teams.length !== teamIds.length) {
          return NextResponse.json({ error: 'One or more selected doubles teams no longer exist' }, { status: 400 });
        }
        const wantedCategory = categoryRules(matchCategory)?.format === 'MIXED_DOUBLES' ? 'MIXED_DOUBLES' : 'DOUBLES';
        for (const t of teams) {
          if (t.status !== 'ACTIVE') {
            return NextResponse.json({ error: `Team "${t.name}" is inactive` }, { status: 400 });
          }
          if (t.sportId !== sportId) {
            return NextResponse.json({ error: `Team "${t.name}" is not a ${sport.name} team` }, { status: 400 });
          }
          if (t.category !== wantedCategory) {
            return NextResponse.json(
              { error: `Team "${t.name}" is a ${t.category === 'MIXED_DOUBLES' ? 'mixed doubles' : 'doubles'} team and cannot play in this category` },
              { status: 400 }
            );
          }
        }
        for (const p of participants) {
          const team = teams.find((t: any) => t.id === p.doublesTeamId);
          p.teamName = team.name;
          p.playerIds = [...(team.playerIds || [])];
          delete p.playerId;
        }
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

    // Every selected player must be registered for THIS sport (Club + Sport -> eligible players)
    const eligibilityError = await assertPlayersEligible(
      participants.flatMap((p: any) => [...(p.playerIds || []), p.playerId].filter(Boolean)),
      sportId,
      { sportName: sport.name }
    );
    if (eligibilityError) {
      return NextResponse.json({ error: eligibilityError }, { status: 400 });
    }

    // Badminton / Carrom: the category must fit the format (Singles / Doubles / Mixed Doubles) and the players' gender
    if (sportKey === 'BADMINTON' || sportKey === 'CARROM') {
      const rules = categoryRules(matchCategory);
      if (!rules) {
        return NextResponse.json({ error: "Choose a valid category: Men's/Women's Singles, Men's/Women's Doubles or Mixed Doubles" }, { status: 400 });
      }
      const sideSizes = participants.map((p: any) => (p.playerIds || []).filter(Boolean).length || (p.playerId ? 1 : 0));
      const isDoublesMatch = sideSizes.every((n: number) => n === 2);
      const isSinglesMatch = sideSizes.every((n: number) => n === 1);
      if (rules.format === 'SINGLES' && !isSinglesMatch) {
        return NextResponse.json({ error: `${categoryDisplayName(matchCategory)} is a singles category: each side needs exactly 1 player` }, { status: 400 });
      }
      if (rules.format !== 'SINGLES' && !isDoublesMatch) {
        return NextResponse.json({ error: `${categoryDisplayName(matchCategory)} is a doubles category: each side needs a doubles team of 2 players` }, { status: 400 });
      }

      const ids = participants.flatMap((p: any) => [...(p.playerIds || []), p.playerId].filter(Boolean));
      const people = await db.player.findMany({ where: { id: { in: Array.from(new Set(ids)) } } });
      if (rules.gender !== 'MIXED') {
        const wrong = people.find((pl: any) => String(pl.gender || '').toUpperCase() !== rules.gender);
        if (wrong) {
          return NextResponse.json(
            { error: `${wrong.name} cannot play in ${categoryDisplayName(matchCategory)} (${rules.gender === 'MALE' ? 'male' : 'female'} players only)` },
            { status: 400 }
          );
        }
      } else {
        for (const p of participants) {
          const g = (p.playerIds || []).map((id: string) => String(people.find((pl: any) => pl.id === id)?.gender || '').toUpperCase()).sort();
          if (g[0] !== 'FEMALE' || g[1] !== 'MALE') {
            return NextResponse.json({ error: 'Mixed Doubles teams need one male and one female player' }, { status: 400 });
          }
        }
      }
    }

    // Players must exist; players on the same Badminton/Carrom side must share a club
    const referencedPlayerIds: string[] = participants.flatMap((p: any) =>
      [...(p.playerIds || []), p.playerId].filter(Boolean)
    );
    if (referencedPlayerIds.length > 0) {
      const uniqueIds = Array.from(new Set(referencedPlayerIds));
      const found = await db.player.findMany({ where: { id: { in: uniqueIds } } });
      if (found.length !== uniqueIds.length) {
        return NextResponse.json({ error: 'One or more selected players no longer exist' }, { status: 400 });
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
            bgmiTeamId: p.bgmiTeamId || null,
            doublesTeamId: p.doublesTeamId || null,
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

    clearCache('matches');
    clearCache('public:schedule');
    clearCache('leaderboard');

    return NextResponse.json(fullMatch, { status: 201 });
  } catch (error: any) {
    console.error('Error creating match:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
