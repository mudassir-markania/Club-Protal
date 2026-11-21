import { NextResponse } from '@/http/next-server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';
import { recalculateAllLeaderboards } from '@/lib/scoring';
import { clearCache } from '@/lib/cache';

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

    let starPlayer = null;
    if (match.starPlayerId) {
      starPlayer = await db.player.findUnique({
        where: { id: match.starPlayerId },
        include: { club: true },
      });
    }

    // Collect all participating players for this match (strictly excluding unrelated clubs/players)
    const eligibleMap = new Map<string, any>();

    for (const p of match.participants || []) {
      const teamLabel = p.teamName || p.cricketTeam?.name || p.club?.name;

      // 1. Direct squad / multi-player athletes
      if (p.players && p.players.length > 0) {
        for (const mpp of p.players) {
          if (mpp.player) {
            const key = `${mpp.player.name.trim().toLowerCase()}_${mpp.clubId}`;
            if (!eligibleMap.has(key)) {
              eligibleMap.set(key, {
                id: mpp.player.id,
                name: mpp.player.name,
                clubId: mpp.clubId,
                clubName: mpp.club?.name || 'House',
                clubCode: mpp.club?.code,
                teamName: teamLabel,
              });
            }
          }
        }
      }
      // 2. Direct individual player entry
      else if (p.playerId) {
        const directPlayer =
          p.player ||
          (await db.player.findUnique({
            where: { id: p.playerId },
            include: { club: true },
          }));
        if (directPlayer) {
          const key = `${directPlayer.name.trim().toLowerCase()}_${directPlayer.clubId}`;
          if (!eligibleMap.has(key)) {
            eligibleMap.set(key, {
              id: directPlayer.id,
              name: directPlayer.name,
              clubId: directPlayer.clubId,
              clubName: directPlayer.club?.name || p.club?.name || 'House',
              clubCode: directPlayer.club?.code || p.club?.code,
              teamName: teamLabel,
            });
          }
        }
      }
      // 3. House / Cricket Team entry (fetch players registered under this club)
      else if (p.clubId) {
        const housePlayers = await db.player.findMany({
          where: { clubId: p.clubId, status: 'APPROVED' },
          include: { club: true },
        });
        for (const hp of housePlayers) {
          const key = `${hp.name.trim().toLowerCase()}_${hp.clubId}`;
          if (!eligibleMap.has(key)) {
            eligibleMap.set(key, {
              id: hp.id,
              name: hp.name,
              clubId: hp.clubId,
              clubName: hp.club?.name || p.club?.name || 'House',
              clubCode: hp.club?.code || p.club?.code,
              teamName: teamLabel,
            });
          }
        }
      }
    }

    const eligibleStarPlayers = Array.from(eligibleMap.values());

    const awardAllocations = await db.awardAllocation.findMany({
      where: { matchId: match.id },
      include: { club: true, player: true },
    });

    return NextResponse.json({
      ...match,
      starPlayer,
      eligibleStarPlayers,
      awardAllocations,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

const EDITABLE_STATUSES = ['SCHEDULED', 'IN_PROGRESS'];
const STAGE_TYPES = ['NORMAL', 'QUARTER_FINAL', 'SEMI_FINAL', 'FINAL', 'THIRD_PLACE'];

const isValidDate = (v: string) => /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v));
const isValidTime = (v: string) => /^([01]\d|2[0-3]):[0-5]\d$/.test(v);

/**
 * Edit a match's schedule details: stage, title, date, time, venue, referee, notes and
 * Scheduled / In progress status. Participants are not editable here (delete and re-schedule the match instead).
 * Matches with a submitted or approved result are locked: undo the result first.
 */
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth(['SUPER_ADMIN', 'ADMIN']);
    const body = await req.json();

    const match = await db.match.findFirst({
      where: {
        OR: [{ id: params.id }, { matchCode: params.id }],
      },
    });

    if (!match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }

    if (!EDITABLE_STATUSES.includes(match.status)) {
      return NextResponse.json(
        {
          error:
            match.status === 'COMPLETED'
              ? 'This match already has an approved result. Undo the result before editing it.'
              : 'This match has a submitted result. Approve or reject it before editing.',
        },
        { status: 409 }
      );
    }

    const { round, stageType, matchDate, matchTime, venueId, status, notes, refereeIds } = body;
    const data: Record<string, any> = {};

    if (round !== undefined) {
      const r = String(round).trim();
      if (!r) return NextResponse.json({ error: 'Match title cannot be empty' }, { status: 400 });
      if (r.length > 120) return NextResponse.json({ error: 'Match title must be at most 120 characters' }, { status: 400 });
      data.round = r;
    }
    if (stageType !== undefined) {
      if (!STAGE_TYPES.includes(stageType)) return NextResponse.json({ error: 'Invalid stage' }, { status: 400 });
      data.stageType = stageType;
    }
    if (matchDate !== undefined) {
      if (!isValidDate(String(matchDate))) return NextResponse.json({ error: 'Enter a valid match date' }, { status: 400 });
      data.matchDate = matchDate;
    }
    if (matchTime !== undefined) {
      if (!isValidTime(String(matchTime))) return NextResponse.json({ error: 'Enter a valid start time (HH:MM)' }, { status: 400 });
      data.matchTime = matchTime;
    }
    if (venueId !== undefined) {
      if (venueId) {
        const venue = await db.venue.findUnique({ where: { id: venueId } });
        if (!venue) return NextResponse.json({ error: 'Selected venue does not exist' }, { status: 400 });
      }
      data.venueId = venueId || null;
    }
    if (status !== undefined) {
      if (!EDITABLE_STATUSES.includes(status)) {
        return NextResponse.json({ error: 'Status can only be set to Scheduled or In progress here' }, { status: 400 });
      }
      data.status = status;
    }
    if (notes !== undefined) {
      const n = String(notes ?? '').trim();
      if (n.length > 1000) return NextResponse.json({ error: 'Notes must be at most 1000 characters' }, { status: 400 });
      data.notes = n || null;
    }

    if (refereeIds !== undefined) {
      if (!Array.isArray(refereeIds)) return NextResponse.json({ error: 'refereeIds must be a list' }, { status: 400 });
      const ids = Array.from(new Set(refereeIds.filter(Boolean))) as string[];
      if (ids.length) {
        const found = await db.referee.findMany({ where: { id: { in: ids } } });
        if (found.length !== ids.length) return NextResponse.json({ error: 'One or more selected referees do not exist' }, { status: 400 });
      }
      await db.matchReferee.deleteMany({ where: { matchId: match.id } });
      for (const refereeId of ids) {
        await db.matchReferee.create({ data: { matchId: match.id, refereeId } });
      }
    }

    if (Object.keys(data).length === 0 && refereeIds === undefined) {
      return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
    }

    const updated = Object.keys(data).length
      ? await db.match.update({ where: { id: match.id }, data })
      : match;

    await createAuditLog({
      user,
      action: 'UPDATE_MATCH',
      entity: 'Match',
      recordId: match.id,
      previousValue: match,
      updatedValue: { ...updated, refereeIds },
    });

    clearCache('matches');
    clearCache('public:schedule');
    clearCache('leaderboard');

    return NextResponse.json(updated);
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED' || error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * Delete a match together with everything that hangs off it (participants, referees, results, awarded points).
 * Points already credited to clubs are removed and the leaderboard is recalculated.
 */
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

    const hadPoints = (await db.pointsHistory.count({ where: { matchId: match.id } })) > 0;

    await db.$transaction(async (tx: any) => {
      const participants = await tx.matchParticipant.findMany({ where: { matchId: match.id } });
      const participantIds = participants.map((p: any) => p.id);
      if (participantIds.length) {
        await tx.matchParticipantPlayer.deleteMany({ where: { participantId: { in: participantIds } } });
      }
      const dists = await tx.pointsDistribution.findMany({ where: { matchId: match.id } });
      for (const d of dists) await tx.clubPointAllocation.deleteMany({ where: { distributionId: d.id } });
      await tx.pointsDistribution.deleteMany({ where: { matchId: match.id } });
      await tx.pointsHistory.deleteMany({ where: { matchId: match.id } });
      await tx.awardAllocation.deleteMany({ where: { matchId: match.id } });
      await tx.playerPerformance.deleteMany({ where: { matchId: match.id } });
      await tx.scoreEntry.deleteMany({ where: { matchId: match.id } });
      await tx.matchResult.deleteMany({ where: { matchId: match.id } });
      await tx.matchReferee.deleteMany({ where: { matchId: match.id } });
      await tx.matchParticipant.deleteMany({ where: { matchId: match.id } });
      await tx.match.delete({ where: { id: match.id } });
    });

    if (hadPoints) await recalculateAllLeaderboards();

    await createAuditLog({
      user,
      action: 'DELETE_MATCH',
      entity: 'Match',
      recordId: match.id,
      previousValue: match,
    });

    clearCache('matches');
    clearCache('public:schedule');
    clearCache('leaderboard');

    return NextResponse.json({
      success: true,
      message: hadPoints
        ? 'Match deleted. Its awarded points were removed and the leaderboard updated.'
        : 'Match deleted successfully',
    });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED' || error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
