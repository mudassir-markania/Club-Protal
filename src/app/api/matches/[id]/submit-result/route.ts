import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';
import { calculateClubPointsDistribution } from '@/lib/points-distribution';

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
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }

    let refereeId = user.refereeId;
    if (user.role === 'REFEREE') {
      const isAssigned = match.referees.some((r) => r.refereeId === user.refereeId);
      if (!isAssigned) {
        return NextResponse.json({ error: 'You are not assigned as referee for this match' }, { status: 403 });
      }
    } else if (!refereeId) {
      refereeId = match.referees[0]?.refereeId;
      if (!refereeId) {
        const anyRef = await db.referee.findFirst();
        refereeId = anyRef?.id || 'admin-ref';
      }
    }

    const {
      entryResults, // Array of { participantId, pointsEarned, rank?, isWinner? }
      scoresSummary,
      refereeNotes,
      starPlayerId,
      starPlayerPoints,
    } = body;

    if (!entryResults || !Array.isArray(entryResults) || entryResults.length === 0) {
      return NextResponse.json({ error: 'At least one participant result is required' }, { status: 400 });
    }

    // Mandatory Star Player Validation
    if (!starPlayerId || typeof starPlayerId !== 'string' || !starPlayerId.trim()) {
      return NextResponse.json(
        { error: 'Star Player of the Match is mandatory. Exactly one participating player must be selected.' },
        { status: 400 }
      );
    }

    const parsedStarPoints = parseFloat(starPlayerPoints);
    if (isNaN(parsedStarPoints) || parsedStarPoints < 0) {
      return NextResponse.json(
        { error: 'Valid non-negative individual performance points are required for the Star Player.' },
        { status: 400 }
      );
    }

    // Verify Star Player exists and participated in this specific match
    const starPlayer = await db.player.findUnique({
      where: { id: starPlayerId },
      include: { club: true },
    });

    if (!starPlayer) {
      return NextResponse.json({ error: 'Selected Star Player record not found in system.' }, { status: 404 });
    }

    let isParticipant = false;
    let starPlayerTeamName = starPlayer.teamName || starPlayer.club?.name;

    for (const p of match.participants) {
      // 1. Check squad / multi-player roster
      if (p.players && p.players.some((mpp: any) => mpp.playerId === starPlayer.id)) {
        isParticipant = true;
        starPlayerTeamName = p.teamName || p.cricketTeam?.name || p.club?.name;
        break;
      }
      // 2. Check direct individual player participant
      if (p.playerId === starPlayer.id) {
        isParticipant = true;
        starPlayerTeamName = p.teamName || p.cricketTeam?.name || p.club?.name;
        break;
      }
      // 3. Check house / cricket team participant representation
      if (p.clubId === starPlayer.clubId) {
        isParticipant = true;
        starPlayerTeamName = p.teamName || p.cricketTeam?.name || p.club?.name;
        break;
      }
    }

    if (!isParticipant) {
      return NextResponse.json(
        { error: `Player "${starPlayer.name}" did not participate in this match. Star Player must be a participating athlete.` },
        { status: 400 }
      );
    }

    // Fetch current fair rotation index for remainder handling
    const rotationSetting = await db.tournamentSetting.findUnique({
      where: { key: 'REMAINDER_ROTATION_INDEX' },
    });
    let currentRotation = parseInt(rotationSetting?.value || '0', 10);
    if (isNaN(currentRotation)) currentRotation = 0;

    // Clean up any prior pending records for this match if referee is updating / resubmitting
    await db.pointsHistory.deleteMany({ where: { matchId: match.id } });
    const prevDistributions = await db.pointsDistribution.findMany({
      where: { matchId: match.id },
    });
    for (const pd of prevDistributions) {
      await db.clubPointAllocation.deleteMany({ where: { distributionId: pd.id } });
      await db.pointsDistribution.delete({ where: { id: pd.id } });
    }
    await db.playerPerformance.deleteMany({ where: { matchId: match.id } });
    await db.matchResult.deleteMany({ where: { matchId: match.id } });

    const createdDistributions = [];
    const summaryParts: string[] = [];

    // Process each participating entry
    for (const res of entryResults) {
      const participant = match.participants.find((p: any) => p.id === res.participantId);
      if (!participant) continue;

      const pointsEarned = Math.max(0, parseFloat(res.pointsEarned) || 0);

      // Update participant's score and rank
      await db.matchParticipant.update({
        where: { id: participant.id },
        data: {
          score: pointsEarned,
          rank: res.rank ? parseInt(res.rank, 10) : null,
          isWinner: Boolean(res.isWinner),
        },
      });

      // Assemble player contributions to extract unique clubs
      const playerContributions: Array<{
        playerId: string;
        playerName?: string;
        clubId: string;
        clubName: string;
        clubCode?: string;
      }> = [];

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
          playerId: participant.playerId || 'team-entry',
          playerName: participant.teamName || participant.club.name,
          clubId: participant.clubId,
          clubName: participant.club.name,
          clubCode: participant.club.code,
        });
      }

      // Calculate fair points distribution across unique clubs
      const distCalc = calculateClubPointsDistribution(pointsEarned, playerContributions, currentRotation);
      currentRotation += 1;

      // Create PointsDistribution record with PENDING_APPROVAL status (Awaiting Admin Review)
      const distribution = await db.pointsDistribution.create({
        data: {
          matchId: match.id,
          participantId: participant.id,
          sportId: match.sportId,
          originalPoints: pointsEarned,
          uniqueClubCount: distCalc.uniqueClubCount,
          calculationNote: distCalc.explanation,
          status: 'PENDING_APPROVAL',
          submittedByRefereeId: refereeId,
        },
      });

      // Create ClubPointAllocation records (points will be credited to PointsHistory upon Admin approval)
      for (const alloc of distCalc.allocations) {
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
        allocations: distCalc.allocations,
      });

      summaryParts.push(
        `${participant.teamName || participant.club?.name || 'Entry'} (${pointsEarned} pts -> ${distCalc.uniqueClubCount} unique clubs)`
      );
    }

    // Persist fair rotation index
    await db.tournamentSetting.upsert({
      where: { key: 'REMAINDER_ROTATION_INDEX' },
      update: { value: currentRotation.toString() },
      create: {
        key: 'REMAINDER_ROTATION_INDEX',
        value: currentRotation.toString(),
        description: 'Fair rotation index for remainder point distribution',
      },
    });

    const fullSummary = scoresSummary || summaryParts.join(' | ');

    // Record Individual Star Player Performance (PENDING_APPROVAL)
    const playerPerf = await db.playerPerformance.create({
      data: {
        matchId: match.id,
        playerId: starPlayer.id,
        sportId: match.sportId,
        clubId: starPlayer.clubId,
        teamName: starPlayerTeamName,
        isStarPlayer: true,
        performancePoints: parsedStarPoints,
        status: 'PENDING_APPROVAL',
        awardedAt: new Date(),
      },
    });

    // Create MatchResult record with status PENDING_APPROVAL
    const matchResult = await db.matchResult.create({
      data: {
        matchId: match.id,
        submittedByRefereeId: refereeId,
        scoresSummary: fullSummary,
        refereeNotes: refereeNotes || null,
        starPlayerId: starPlayer.id,
        starPlayerPoints: parsedStarPoints,
        status: 'PENDING_APPROVAL',
      },
    });

    // Update Match status to SUBMITTED
    await db.match.update({
      where: { id: match.id },
      data: {
        status: 'SUBMITTED',
        starPlayerId: starPlayer.id,
        starPlayerPoints: parsedStarPoints,
        notes: refereeNotes
          ? `${match.notes || ''}\n[Referee Final Result]: ${refereeNotes}`
          : match.notes,
      },
    });

    // Notify admins of submission awaiting approval
    await db.notification.create({
      data: {
        recipientRole: 'ADMIN',
        title: `Result Submitted: ${match.matchCode} (${match.sport.name})`,
        message: `Referee ${user.name} submitted match outcome and nominated Star Player ${starPlayer.name} (${parsedStarPoints} individual pts). Awaiting Admin approval.`,
        type: 'RESULT_SUBMITTED',
        link: `/admin/matches`,
      },
    });

    await createAuditLog({
      user,
      action: 'SUBMIT_MATCH_RESULT',
      entity: 'MatchResult',
      recordId: matchResult.id,
      updatedValue: {
        matchCode: match.matchCode,
        fullSummary,
        starPlayer: {
          id: starPlayer.id,
          name: starPlayer.name,
          club: starPlayer.club?.name,
          points: parsedStarPoints,
        },
        createdDistributions,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Match result and Star Player (${starPlayer.name} - ${parsedStarPoints} pts) submitted successfully! Awaiting Admin verification and approval.`,
      matchResult,
      playerPerformance: playerPerf,
      distributions: createdDistributions,
    });
  } catch (error: any) {
    console.error('Submit result error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
