import { NextResponse } from '@/http/next-server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';
import { calculateMatchPoints } from '@club-portal/shared';
import { getSportRules } from '@/lib/sports-rules-server';
import { recalculateAllLeaderboards } from '@/lib/scoring';
import { canRefereeActOnMatch } from '@/lib/referee-access';
import { EVENT_SCORED_SPORTS, isRankedSport } from '@/lib/event-standings';
import { assertPlayersEligible } from '@/lib/player-eligibility';

const matchInclude = {
  sport: true,
  participants: {
    include: {
      club: true,
      cricketTeam: true,
      players: { include: { player: true, club: true } },
    },
  },
  referees: true,
};

const findMatch = (id: string) =>
  db.match.findFirst({ where: { OR: [{ id }, { matchCode: id }] }, include: matchInclude });

/** Run the scoring-rule engine for "participant X won this match". */
async function calculateForWinner(match: any, winnerParticipantId: string, rotation: number, awards: Record<string, any> = {}) {
  const winner = match.participants.find((p: any) => p.id === winnerParticipantId);
  if (!winner) return { error: 'Selected winner is not a participant of this match' as const };

  // Two-sided match: the other side is the loser. Multi-team (BGMI lobby): only the winner scores.
  const loser = match.participants.length === 2 ? match.participants.find((p: any) => p.id !== winnerParticipantId) : null;

  const sportName = match.sport?.name;
  const dbRules = await getSportRules(sportName);
  const customRuleMap = new Map<string, number>();
  dbRules.forEach((r) => customRuleMap.set(r.ruleCode, r.points));

  const allPlayers = await db.player.findMany({ include: { club: true } });
  const calculation = await calculateMatchPoints(
    {
      sportName,
      stageType: match.stageType || 'NORMAL',
      eventCategory: match.matchCategory,
      winnerParticipantId,
      loserParticipantId: loser?.id,
      totalTeamsParticipating: match.participants.length,
      ...awards,
      scoresSummary: `${winner.teamName || winner.club?.name || 'Winner'} won`,
    },
    match.participants,
    allPlayers,
    rotation,
    customRuleMap,
    dbRules
  );
  return { calculation, winner };
}

// Optional extras sent with a win: individual award winners and BGMI tournament placements
const AWARD_PLAYER_KEYS = [
  'topScorerPlayerId',
  'bgmiMvpPlayerId',
  'bestBatsmanMenPlayerId',
  'bestBatsmanWomenPlayerId',
  'bestBowlerMenPlayerId',
  'bestBowlerWomenPlayerId',
  'bestFielderMenPlayerId',
  'bestFielderWomenPlayerId',
  'mostFoursPlayerId',
  'mostSixesPlayerId',
  'manOfTheTournamentMenPlayerId',
  'manOfTheTournamentWomenPlayerId',
] as const;
const AWARD_TEAM_KEYS = ['firstPlaceParticipantId', 'secondPlaceParticipantId', 'thirdPlaceParticipantId'] as const;

/** Keep only known award fields; players must exist and be registered for this sport, teams must be in the match. */
async function cleanAwards(raw: any, match: any): Promise<{ awards: Record<string, any>; error?: string }> {
  const awards: Record<string, any> = {};
  if (!raw || typeof raw !== 'object') return { awards };

  const playerIds: string[] = [];
  for (const k of AWARD_PLAYER_KEYS) {
    if (raw[k]) {
      awards[k] = String(raw[k]);
      playerIds.push(String(raw[k]));
    }
  }
  if (playerIds.length) {
    const eligibility = await assertPlayersEligible(playerIds, match.sportId, { sportName: match.sport?.name });
    if (eligibility) return { awards: {}, error: eligibility };
  }

  if (raw.isTournamentPlacement) {
    awards.isTournamentPlacement = true;
    const ids = new Set<string>(match.participants.map((p: any) => p.id));
    const chosen: string[] = [];
    for (const k of AWARD_TEAM_KEYS) {
      if (raw[k]) {
        if (!ids.has(String(raw[k]))) return { awards: {}, error: 'A selected placement team is not part of this match' };
        awards[k] = String(raw[k]);
        chosen.push(String(raw[k]));
      }
    }
    if (new Set(chosen).size !== chosen.length) return { awards: {}, error: 'A team cannot take two tournament places' };
  }
  return { awards };
}

const getRotation = async () => {
  const setting = await db.tournamentSetting.findUnique({ where: { key: 'REMAINDER_ROTATION_INDEX' } });
  const n = parseInt(setting?.value || '0', 10);
  return Number.isNaN(n) ? 0 : n;
};

/**
 * POST { winnerParticipantId, preview?: boolean }
 * preview: returns the points that WOULD be awarded. Otherwise records the win, awards the points
 * according to the scoring rules and credits the clubs (equal split across the unique clubs of the winning side).
 */
export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth(['SUPER_ADMIN', 'ADMIN', 'REFEREE']);
    const isReferee = user.role === 'REFEREE';
    const { winnerParticipantId, preview, awards: rawAwards } = await req.json();
    if (!winnerParticipantId) return NextResponse.json({ error: 'Select the winner' }, { status: 400 });

    const match = await findMatch(params.id);
    if (!match) return NextResponse.json({ error: 'Match not found' }, { status: 404 });

    // A referee can only act on matches of their assigned sports (or matches assigned to them directly)
    if (isReferee && !(await canRefereeActOnMatch(user.refereeId, match))) {
      return NextResponse.json({ error: 'This match is not in a sport assigned to you.' }, { status: 403 });
    }

    if (match.status === 'COMPLETED') {
      return NextResponse.json(
        { error: isReferee ? 'This match already has an approved result.' : 'This match already has an approved result. Undo it first to change the winner.' },
        { status: 409 }
      );
    }
    if (match.status === 'SUBMITTED') {
      return NextResponse.json(
        {
          error: isReferee
            ? 'A result for this match is already under admin review.'
            : 'A referee has submitted a result for this match. Review and approve or reject it instead.',
        },
        { status: 409 }
      );
    }

    const cleaned = await cleanAwards(rawAwards, match);
    if (cleaned.error) return NextResponse.json({ error: cleaned.error }, { status: 400 });

    const rotation = await getRotation();
    const calc = await calculateForWinner(match, winnerParticipantId, rotation, cleaned.awards);
    if ('error' in calc) return NextResponse.json({ error: calc.error }, { status: 400 });
    const { calculation, winner } = calc;

    // Badminton / Carrom: matches only record the winner; points come from the event standings
    const eventScored = EVENT_SCORED_SPORTS.includes(calculation.sportKey);
    const rankedSport = isRankedSport(match.sport?.name || '');

    const winnerEntry = calculation.teamPoints.find((t: any) => t.participantId === winnerParticipantId);
    if (!eventScored && (!winnerEntry || winnerEntry.points <= 0)) {
      return NextResponse.json(
        {
          error: `No scoring rule awards points for this win (${winnerEntry?.reason || 'no rule matched'}). Add or enable a rule under Scoring Rules first.`,
          code: 'NO_RULE',
        },
        { status: 400 }
      );
    }

    if (preview) {
      return NextResponse.json({ success: true, preview: true, eventScored, rankedSport, calculation });
    }

    // Admin: result is approved immediately. Referee: result is submitted and waits for admin approval.
    const approvedNow = !isReferee;
    const refereeId = isReferee ? (user.refereeId as string) : match.referees?.[0]?.refereeId || user.refereeId || 'admin';
    const winnerClubId = winner.clubId || winner.players?.[0]?.clubId || null;

    await db.$transaction(async (tx: any) => {
      // Clear anything left over for this match (it is not completed, so nothing approved is lost)
      const oldDists = await tx.pointsDistribution.findMany({ where: { matchId: match.id } });
      for (const d of oldDists) await tx.clubPointAllocation.deleteMany({ where: { distributionId: d.id } });
      await tx.pointsDistribution.deleteMany({ where: { matchId: match.id } });
      await tx.pointsHistory.deleteMany({ where: { matchId: match.id } });
      await tx.awardAllocation.deleteMany({ where: { matchId: match.id } });
      await tx.matchResult.deleteMany({ where: { matchId: match.id } });

      // Participants: winner gets its points/rank, everyone else is reset
      for (const p of match.participants) {
        const tp = calculation.teamPoints.find((t: any) => t.participantId === p.id);
        await tx.matchParticipant.update({
          where: { id: p.id },
          data: { score: tp?.points ?? 0, rank: tp?.rank ?? null, isWinner: p.id === winnerParticipantId },
        });
      }

      // Distributions, club allocations and points history (approved straight away)
      for (const dist of calculation.calculatedDistributions) {
        const created = await tx.pointsDistribution.create({
          data: {
            matchId: match.id,
            participantId: dist.participantId,
            sportId: match.sportId,
            originalPoints: dist.originalPoints,
            uniqueClubCount: dist.uniqueClubCount,
            calculationNote: `[Declared by ${isReferee ? 'referee' : 'admin'}] ${dist.explanation}`,
            status: approvedNow ? 'APPROVED' : 'PENDING_APPROVAL',
            submittedByRefereeId: refereeId,
            ...(approvedNow ? { approvedByUserId: user.id, approvedAt: new Date() } : {}),
          },
        });
        for (const alloc of dist.allocations) {
          await tx.clubPointAllocation.create({
            data: {
              distributionId: created.id,
              clubId: alloc.clubId,
              points: alloc.points,
              playersContributed: alloc.playersContributed,
              isRemainderWinner: alloc.isRemainderWinner,
            },
          });
          // Points reach the clubs only once approved (the admin approval creates the history rows for referee submissions)
          if (approvedNow && alloc.points > 0) {
            await tx.pointsHistory.create({
              data: {
                clubId: alloc.clubId,
                sportId: match.sportId,
                matchId: match.id,
                distributionId: created.id,
                points: alloc.points,
                reason: `${match.sport.name} - ${dist.teamName} (${alloc.points.toFixed(2)} pts of ${dist.originalPoints.toFixed(2)} pts across ${dist.uniqueClubCount} unique club${dist.uniqueClubCount === 1 ? '' : 's'})`,
                recordedByUserId: user.id,
              },
            });
          }
        }
      }

      // Individual awards (Top scorer, MVP, cricket awards): credited to the awarded player's own club
      for (const award of calculation.individualAwards) {
        await tx.awardAllocation.create({
          data: {
            matchId: match.id,
            sportId: match.sportId,
            sportName: match.sport?.name || calculation.sportKey,
            awardKey: award.awardKey,
            awardTitle: award.awardTitle,
            awardType: 'INDIVIDUAL',
            playerId: award.playerId,
            playerName: award.playerName,
            clubId: award.clubId,
            clubName: award.clubName,
            points: award.points,
            status: approvedNow ? 'APPROVED' : 'PENDING_APPROVAL',
            notes: award.reason,
            ...(approvedNow ? { approvedByUserId: user.id, approvedAt: new Date() } : {}),
          },
        });
        if (approvedNow && award.points > 0) {
          await tx.pointsHistory.create({
            data: {
              clubId: award.clubId,
              sportId: match.sportId,
              matchId: match.id,
              points: award.points,
              reason: `${match.sport.name} - ${award.awardTitle}: ${award.playerName} (${Number(award.points).toFixed(2)} pts)`,
              recordedByUserId: user.id,
            },
          });
        }
      }

      await tx.matchResult.create({
        data: {
          matchId: match.id,
          submittedByRefereeId: refereeId,
          winnerParticipantId,
          winnerClubId,
          scoresSummary: `${winner.teamName || winner.club?.name || 'Winner'} declared winner by ${isReferee ? 'referee' : 'admin'}`,
          stageType: match.stageType || 'NORMAL',
          eventCategory: match.matchCategory,
          status: approvedNow ? 'APPROVED' : 'PENDING_APPROVAL',
          ...(approvedNow ? { approvedByUserId: user.id, approvedAt: new Date() } : {}),
        },
      });

      await tx.match.update({ where: { id: match.id }, data: { status: approvedNow ? 'COMPLETED' : 'SUBMITTED' } });
    });

    const nextRotation = String(rotation + calculation.calculatedDistributions.length);
    await db.tournamentSetting.upsert({
      where: { key: 'REMAINDER_ROTATION_INDEX' },
      update: { value: nextRotation },
      create: {
        key: 'REMAINDER_ROTATION_INDEX',
        value: nextRotation,
        description: 'Fair rotation index for remainder point distribution',
      },
    });

    if (approvedNow) {
      await recalculateAllLeaderboards();
    } else {
      await db.notification.create({
        data: {
          recipientRole: 'ADMIN',
          title: `Result Submitted: ${match.matchCode} (${match.sport.name})`,
          message: `Referee ${user.name} declared ${winner.teamName || winner.club?.name || 'a winner'} the winner of ${match.matchCode}. Points were calculated from the scoring rules. Awaiting Admin approval.`,
          type: 'RESULT_SUBMITTED',
          link: `/admin/matches`,
        },
      });
    }

    await createAuditLog({
      user,
      action: isReferee ? 'SUBMIT_MATCH_WINNER' : 'DECLARE_MATCH_WINNER',
      entity: 'Match',
      recordId: match.id,
      updatedValue: {
        matchCode: match.matchCode,
        winnerParticipantId,
        teamPoints: calculation.teamPoints,
        clubPointsBreakdown: calculation.clubPointsBreakdown,
      },
    });

    return NextResponse.json({
      success: true,
      eventScored,
      pendingApproval: !approvedNow,
      message: eventScored
        ? `${winner.teamName || winner.club?.name || 'Winner'} recorded as winner of ${match.matchCode}${approvedNow ? '' : ' and sent to the admin for approval'}. Points for ${match.sport.name} are awarded when the event is finalized under Event Standings.`
        : approvedNow
        ? `${winner.teamName || winner.club?.name || 'Winner'} declared winner of ${match.matchCode}. Points credited to the clubs and leaderboard updated.`
        : `${winner.teamName || winner.club?.name || 'Winner'} recorded as winner of ${match.matchCode}. Points were calculated and sent to the admin for approval.`,
      calculation,
    });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED' || error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error('Declare winner error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/** Undo a declared result: removes the awarded points and puts the match back to SCHEDULED. */
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth(['SUPER_ADMIN', 'ADMIN']);
    const match = await findMatch(params.id);
    if (!match) return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    if (match.status !== 'COMPLETED') {
      return NextResponse.json({ error: 'Only a completed match result can be undone' }, { status: 409 });
    }

    await db.$transaction(async (tx: any) => {
      const dists = await tx.pointsDistribution.findMany({ where: { matchId: match.id } });
      for (const d of dists) await tx.clubPointAllocation.deleteMany({ where: { distributionId: d.id } });
      await tx.pointsDistribution.deleteMany({ where: { matchId: match.id } });
      await tx.pointsHistory.deleteMany({ where: { matchId: match.id } });
      await tx.awardAllocation.deleteMany({ where: { matchId: match.id } });
      await tx.playerPerformance.deleteMany({ where: { matchId: match.id } });
      await tx.matchResult.deleteMany({ where: { matchId: match.id } });
      for (const p of match.participants) {
        await tx.matchParticipant.update({ where: { id: p.id }, data: { score: 0, rank: null, isWinner: false } });
      }
      await tx.match.update({
        where: { id: match.id },
        data: { status: 'SCHEDULED', starPlayerId: null, starPlayerPoints: 0 },
      });
    });

    await recalculateAllLeaderboards();
    await createAuditLog({ user, action: 'UNDO_MATCH_RESULT', entity: 'Match', recordId: match.id, updatedValue: { matchCode: match.matchCode } });

    return NextResponse.json({ success: true, message: `Result of ${match.matchCode} undone. Points removed and leaderboard updated.` });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED' || error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
