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
    } = body;

    if (!entryResults || !Array.isArray(entryResults) || entryResults.length === 0) {
      return NextResponse.json({ error: 'At least one participant result is required' }, { status: 400 });
    }

    // Fetch current fair rotation index
    const rotationSetting = await db.tournamentSetting.findUnique({
      where: { key: 'REMAINDER_ROTATION_INDEX' },
    });
    let currentRotation = parseInt(rotationSetting?.value || '0', 10);
    if (isNaN(currentRotation)) currentRotation = 0;

    // Remove any previously pending distributions for this match if referee is resubmitting
    const pendingDistributions = await db.pointsDistribution.findMany({
      where: { matchId: match.id, status: 'PENDING_APPROVAL' },
    });
    for (const pd of pendingDistributions) {
      await db.clubPointAllocation.deleteMany({ where: { distributionId: pd.id } });
      await db.pointsDistribution.delete({ where: { id: pd.id } });
    }

    const createdDistributions = [];
    const summaryParts: string[] = [];

    // Process each participating entry
    for (const res of entryResults) {
      const participant = match.participants.find((p) => p.id === res.participantId);
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
        // Multi-player squad or pair
        for (const mpp of participant.players) {
          playerContributions.push({
            playerId: mpp.playerId,
            playerName: mpp.player.name,
            clubId: mpp.clubId,
            clubName: mpp.club.name,
            clubCode: mpp.club.code,
          });
        }
      } else if (participant.clubId && participant.club) {
        // Single club team or cricket team
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

      // Create PointsDistribution record
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

      // Create ClubPointAllocation records
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

    // Persist incremented rotation index
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

    // Create MatchResult record
    const matchResult = await db.matchResult.create({
      data: {
        matchId: match.id,
        submittedByRefereeId: refereeId,
        scoresSummary: fullSummary,
        refereeNotes: refereeNotes || null,
        status: 'PENDING_APPROVAL',
      },
    });

    // Update Match status
    await db.match.update({
      where: { id: match.id },
      data: {
        status: 'SUBMITTED',
        notes: refereeNotes
          ? `${match.notes || ''}\n[Referee Submission]: ${refereeNotes}`
          : match.notes,
      },
    });

    // Notify admins
    await db.notification.create({
      data: {
        recipientRole: 'ADMIN',
        title: `Results Submitted: ${match.matchCode} (${match.sport.name})`,
        message: `Referee ${user.name} submitted results with points distribution across unique clubs. Awaiting Admin verification.`,
        type: 'RESULT_SUBMITTED',
        link: `/admin/matches`,
      },
    });

    await createAuditLog({
      user,
      action: 'SUBMIT_RESULT',
      entity: 'MatchResult',
      recordId: matchResult.id,
      updatedValue: { matchCode: match.matchCode, fullSummary, createdDistributions },
    });

    return NextResponse.json({
      success: true,
      message: 'Match results submitted for admin verification and approval.',
      matchResult,
      distributions: createdDistributions,
    });
  } catch (error: any) {
    console.error('Submit result error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
