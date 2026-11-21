import { NextResponse } from '@/http/next-server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';
import { calculateMatchPoints } from '@club-portal/shared';
import { getSportRules } from '@/lib/sports-rules-server';
import { calculateClubPointsDistribution } from '@club-portal/shared';
import { clearCache } from '@/lib/cache';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth();
    const body = await req.json();

    const match = await db.match.findFirst({
      where: {
        OR: [{ id: params.id }, { matchCode: params.id }],
      },
      include: {
        sport: true,
        participants: {
          include: {
            club: true,
            cricketTeam: true,
            players: {
              include: {
                player: true,
                club: true,
              },
            },
          },
        },
        referees: true,
      },
    });

    if (!match) {
      clearCache();
    return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }

    // Role and referee assignment check
    let refereeId = user.refereeId;
    if (user.role === 'REFEREE') {
      const isAssigned = match.referees.some((r: any) => r.refereeId === user.refereeId);
      if (!isAssigned) {
        return NextResponse.json(
          { error: 'You are not assigned as referee for this match. Only assigned referees can submit results.' },
          { status: 403 }
        );
      }
    } else if (!refereeId) {
      refereeId = match.referees[0]?.refereeId;
      if (!refereeId) {
        const anyRef = await db.referee.findFirst();
        refereeId = anyRef?.id || 'admin-ref';
      }
    }

    // Fetch all players for lookup
    const allPlayers = await db.player.findMany({
      include: { club: true },
    });

    // Rotation setting for deterministic remainder allocation
    const rotationSetting = await db.tournamentSetting.findUnique({
      where: { key: 'REMAINDER_ROTATION_INDEX' },
    });
    let currentRotation = parseInt(rotationSetting?.value || '0', 10);
    if (isNaN(currentRotation)) currentRotation = 0;

    // Check if sport-specific payload or legacy entryResults
    const isStructuredPayload =
      body.winnerParticipantId !== undefined ||
      body.firstPlaceParticipantId !== undefined ||
      body.sportName !== undefined ||
      body.topScorerPlayerId !== undefined ||
      body.bgmiMvpPlayerId !== undefined ||
      body.bestBatsmanMenPlayerId !== undefined;

    let calculationResult: any;

    if (isStructuredPayload) {
      // Execute the automatic sports scoring rules calculation using active DB configured rules
      const sportName = match.sport?.name || body.sportName;
      const dbRules = await getSportRules(sportName);
      const customRuleMap = new Map<string, number>();
      dbRules.forEach((r) => customRuleMap.set(r.ruleCode, r.points));

      calculationResult = await calculateMatchPoints(
        {
          sportName,
          stageType: body.stageType || match.stageType || 'NORMAL',
          eventCategory: body.eventCategory || match.matchCategory,
          winnerParticipantId: body.winnerParticipantId,
          loserParticipantId: body.loserParticipantId,
          isDraw: body.isDraw,
          firstPlaceParticipantId: body.firstPlaceParticipantId,
          secondPlaceParticipantId: body.secondPlaceParticipantId,
          thirdPlaceParticipantId: body.thirdPlaceParticipantId,
          isTournamentPlacement: body.isTournamentPlacement,
          totalTeamsParticipating: body.totalTeamsParticipating || match.participants?.length,
          bgmiMvpPlayerId: body.bgmiMvpPlayerId,
          topScorerPlayerId: body.topScorerPlayerId,
          bestBatsmanMenPlayerId: body.bestBatsmanMenPlayerId,
          bestBatsmanWomenPlayerId: body.bestBatsmanWomenPlayerId,
          bestBowlerMenPlayerId: body.bestBowlerMenPlayerId,
          bestBowlerWomenPlayerId: body.bestBowlerWomenPlayerId,
          bestFielderMenPlayerId: body.bestFielderMenPlayerId,
          bestFielderWomenPlayerId: body.bestFielderWomenPlayerId,
          mostFoursPlayerId: body.mostFoursPlayerId,
          mostSixesPlayerId: body.mostSixesPlayerId,
          manOfTheTournamentMenPlayerId: body.manOfTheTournamentMenPlayerId,
          manOfTheTournamentWomenPlayerId: body.manOfTheTournamentWomenPlayerId,
          scoresSummary: body.scoresSummary || '',
          refereeNotes: body.refereeNotes,
          starPlayerId: body.starPlayerId,
        },
        match.participants,
        allPlayers,
        currentRotation,
        customRuleMap,
        dbRules
      );
    } else {
      // Fallback for legacy entryResults format
      const entryResults = body.entryResults || [];
      const teamPoints = entryResults.map((er: any) => {
        const participant = match.participants.find((p: any) => p.id === er.participantId);
        return {
          participantId: er.participantId,
          teamName: participant?.teamName || participant?.club?.name || 'Entry',
          points: Math.max(0, parseFloat(er.pointsEarned) || 0),
          reason: `${match.sport?.name || 'Match'} result`,
          isWinner: Boolean(er.isWinner),
          rank: er.rank ? parseInt(er.rank, 10) : undefined,
        };
      });

      const calculatedDistributions = [];
      for (const tp of teamPoints) {
        const participant = match.participants.find((p: any) => p.id === tp.participantId);
        if (!participant) continue;
        const playerContributions: any[] = [];
        if (participant.players && participant.players.length > 0) {
          for (const mpp of participant.players) {
            playerContributions.push({
              playerId: mpp.playerId,
              playerName: mpp.player?.name,
              clubId: mpp.clubId,
              clubName: mpp.club?.name || 'House',
              clubCode: mpp.club?.code,
            });
          }
        } else if (participant.clubId && participant.club) {
          playerContributions.push({
            playerId: participant.playerId || 'team',
            playerName: participant.teamName || participant.club.name,
            clubId: participant.clubId,
            clubName: participant.club.name,
            clubCode: participant.club.code,
          });
        }
        const dist = calculateClubPointsDistribution(tp.points, playerContributions, currentRotation);
        currentRotation += 1;
        calculatedDistributions.push({
          participantId: participant.id,
          teamName: tp.teamName,
          originalPoints: dist.originalPoints,
          uniqueClubCount: dist.uniqueClubCount,
          explanation: dist.explanation,
          allocations: dist.allocations,
        });
      }

      calculationResult = {
        sportKey: match.sport?.name,
        teamPoints,
        individualAwards: [],
        calculatedDistributions,
        clubPointsBreakdown: {},
        summary: body.scoresSummary || 'Match result',
      };
    }

    // Clean up any prior unapproved/pending records for this match
    await db.pointsHistory.deleteMany({ where: { matchId: match.id } });
    const prevDistributions = await db.pointsDistribution.findMany({
      where: { matchId: match.id },
    });
    for (const pd of prevDistributions) {
      await db.clubPointAllocation.deleteMany({ where: { distributionId: pd.id } });
      await db.pointsDistribution.delete({ where: { id: pd.id } });
    }
    await db.awardAllocation.deleteMany({ where: { matchId: match.id } });
    await db.playerPerformance.deleteMany({ where: { matchId: match.id } });
    await db.matchResult.deleteMany({ where: { matchId: match.id } });

    // 1. Update MatchParticipant scores and ranks
    for (const tp of calculationResult.teamPoints) {
      await db.matchParticipant.update({
        where: { id: tp.participantId },
        data: {
          score: tp.points,
          rank: tp.rank !== undefined ? tp.rank : null,
          isWinner: Boolean(tp.isWinner),
        },
      });
    }

    // 2. Create PointsDistribution and ClubPointAllocation (status: PENDING_APPROVAL)
    const createdDistributions = [];
    for (const dist of calculationResult.calculatedDistributions) {
      const distribution = await db.pointsDistribution.create({
        data: {
          matchId: match.id,
          participantId: dist.participantId,
          sportId: match.sportId,
          originalPoints: dist.originalPoints,
          uniqueClubCount: dist.uniqueClubCount,
          calculationNote: dist.explanation,
          status: 'PENDING_APPROVAL',
          submittedByRefereeId: refereeId,
        },
      });

      for (const alloc of dist.allocations) {
        await db.clubPointAllocation.create({
          data: {
            distributionId: distribution.id,
            clubId: alloc.clubId,
            points: alloc.points,
            playersContributed: alloc.playersContributed,
            isRemainderWinner: alloc.isRemainderWinner,
          },
        });
      }

      createdDistributions.push({
        ...distribution,
        allocations: dist.allocations,
      });
    }

    // 3. Create AwardAllocation records for individual awards (status: PENDING_APPROVAL)
    const createdAwards = [];
    for (const award of calculationResult.individualAwards) {
      const awardRec = await db.awardAllocation.create({
        data: {
          matchId: match.id,
          sportId: match.sportId,
          sportName: match.sport?.name || calculationResult.sportKey,
          awardKey: award.awardKey,
          awardTitle: award.awardTitle,
          awardType: 'INDIVIDUAL',
          playerId: award.playerId,
          playerName: award.playerName,
          clubId: award.clubId,
          clubName: award.clubName,
          points: award.points,
          status: 'PENDING_APPROVAL',
          notes: award.reason,
        },
      });
      createdAwards.push(awardRec);
    }

    // 4. Update fair remainder rotation index in settings
    currentRotation += calculationResult.calculatedDistributions.length;
    await db.tournamentSetting.upsert({
      where: { key: 'REMAINDER_ROTATION_INDEX' },
      update: { value: currentRotation.toString() },
      create: {
        key: 'REMAINDER_ROTATION_INDEX',
        value: currentRotation.toString(),
        description: 'Fair rotation index for remainder point distribution',
      },
    });

    const fullSummary = body.scoresSummary || calculationResult.summary;

    // Optional honorary star player
    let starPlayerRecord: any = null;
    if (body.starPlayerId) {
      starPlayerRecord = await db.player.findUnique({
        where: { id: body.starPlayerId },
        include: { club: true },
      });
      if (starPlayerRecord) {
        await db.playerPerformance.create({
          data: {
            matchId: match.id,
            playerId: starPlayerRecord.id,
            sportId: match.sportId,
            clubId: starPlayerRecord.clubId,
            teamName: starPlayerRecord.teamName || starPlayerRecord.club?.name,
            isStarPlayer: true,
            performancePoints: 0,
            status: 'PENDING_APPROVAL',
            awardedAt: new Date(),
          },
        });
      }
    }

    // 5. Create MatchResult record
    const matchResult = await db.matchResult.create({
      data: {
        matchId: match.id,
        submittedByRefereeId: refereeId,
        scoresSummary: fullSummary,
        refereeNotes: body.refereeNotes || null,
        stageType: body.stageType || match.stageType || 'NORMAL',
        eventCategory: body.eventCategory || match.matchCategory,
        resultPayload: JSON.stringify(body),
        starPlayerId: starPlayerRecord?.id || null,
        starPlayerPoints: 0,
        status: 'PENDING_APPROVAL',
      },
    });

    // 6. Update Match status to SUBMITTED
    await db.match.update({
      where: { id: match.id },
      data: {
        status: 'SUBMITTED',
        stageType: body.stageType || match.stageType || 'NORMAL',
        matchCategory: body.eventCategory || match.matchCategory,
        starPlayerId: starPlayerRecord?.id || null,
        starPlayerPoints: 0,
        notes: body.refereeNotes
          ? `${match.notes || ''}\n[Referee Result]: ${body.refereeNotes}`
          : match.notes,
      },
    });

    // 7. Notify Admins
    await db.notification.create({
      data: {
        recipientRole: 'ADMIN',
        title: `Result Submitted: ${match.matchCode} (${match.sport.name})`,
        message: `Referee ${user.name} submitted match outcome for ${match.matchCode}. Automatic calculation completed from official rules. Awaiting Admin verification and approval.`,
        type: 'RESULT_SUBMITTED',
        link: `/admin/matches`,
      },
    });

    // 8. Create Audit Log
    await createAuditLog({
      user,
      action: 'SUBMIT_MATCH_RESULT',
      entity: 'MatchResult',
      recordId: matchResult.id,
      updatedValue: {
        matchCode: match.matchCode,
        sport: match.sport.name,
        fullSummary,
        teamPoints: calculationResult.teamPoints,
        individualAwards: calculationResult.individualAwards,
        clubPointsBreakdown: calculationResult.clubPointsBreakdown,
      },
    });

    clearCache();
    return NextResponse.json({
      success: true,
      message: `Match result submitted successfully! Points automatically calculated and distributed across unique clubs. Awaiting Admin verification and approval.`,
      matchResult,
      calculation: calculationResult,
      distributions: createdDistributions,
      awards: createdAwards,
    });
  } catch (error: any) {
    console.error('Submit result error:', error);
    clearCache();
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
