import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';
import { recalculateAllLeaderboards } from '@/lib/scoring';
import { calculateClubPointsDistribution } from '@/lib/points-distribution';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth(['SUPER_ADMIN', 'ADMIN']);
    const body = await req.json();

    const { action, resultId, rejectionReason, corrections } = body;
    // action: "APPROVE" | "REJECT" | "CORRECT"

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
            players: { include: { player: true, club: true } },
          },
        },
        results: { orderBy: { createdAt: 'desc' } },
        distributions: {
          include: {
            allocations: { include: { club: true } },
          },
        },
        referees: { include: { referee: true } },
      },
    });

    if (!match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }

    const targetResult = resultId
      ? match.results.find((r) => r.id === resultId)
      : match.results[0];

    if (!targetResult && action !== 'CORRECT') {
      return NextResponse.json({ error: 'No submitted result found for this match' }, { status: 404 });
    }

    // 1. APPROVE ACTION
    if (action === 'APPROVE') {
      // Prevent duplicate approval if already approved
      if (targetResult && targetResult.status === 'APPROVED' && match.status === 'COMPLETED') {
        return NextResponse.json({ error: 'This result has already been approved' }, { status: 400 });
      }

      // Execute approval atomically
      await db.$transaction(async (tx) => {
        // Mark MatchResult as APPROVED
        if (targetResult) {
          await tx.matchResult.update({
            where: { id: targetResult.id },
            data: {
              status: 'APPROVED',
              approvedByUserId: user.id,
              approvedAt: new Date(),
            },
          });
        }

        // Mark Match as COMPLETED and ensure Star Player is recorded
        const starPlayerId = targetResult?.starPlayerId || match.starPlayerId;
        const starPlayerPoints = targetResult?.starPlayerPoints !== undefined
          ? targetResult.starPlayerPoints
          : (match.starPlayerPoints || 0);

        await tx.match.update({
          where: { id: match.id },
          data: {
            status: 'COMPLETED',
            starPlayerId: starPlayerId || null,
            starPlayerPoints: starPlayerPoints || 0,
          },
        });

        // Ensure PlayerPerformance record exists and is APPROVED
        if (starPlayerId) {
          const starPlayer = await tx.player.findUnique({ where: { id: starPlayerId } });
          if (starPlayer) {
            const existingPerf = await tx.playerPerformance.findFirst({
              where: { matchId: match.id, playerId: starPlayer.id },
            });

            if (existingPerf) {
              await tx.playerPerformance.update({
                where: { id: existingPerf.id },
                data: {
                  status: 'APPROVED',
                  performancePoints: starPlayerPoints,
                  approvedByUserId: user.id,
                  approvedAt: new Date(),
                },
              });
            } else {
              await tx.playerPerformance.create({
                data: {
                  matchId: match.id,
                  playerId: starPlayer.id,
                  sportId: match.sportId,
                  clubId: starPlayer.clubId,
                  teamName: starPlayer.teamName || starPlayer.club?.name,
                  isStarPlayer: true,
                  performancePoints: starPlayerPoints,
                  status: 'APPROVED',
                  approvedByUserId: user.id,
                  approvedAt: new Date(),
                },
              });
            }
          }
        }

        // Clear any prior PointsHistory for this match to prevent duplicate allocation
        await tx.pointsHistory.deleteMany({
          where: { matchId: match.id },
        });

        // Approve all points distributions and create PointsHistory records
        const distributions = await tx.pointsDistribution.findMany({
          where: { matchId: match.id },
          include: {
            allocations: { include: { club: true } },
            participant: true,
          },
        });

        for (const dist of distributions) {
          await tx.pointsDistribution.update({
            where: { id: dist.id },
            data: {
              status: 'APPROVED',
              approvedByUserId: user.id,
              approvedAt: new Date(),
            },
          });

          // Create PointsHistory entry for each allocated club
          for (const alloc of dist.allocations) {
            const squadName = dist.participant?.teamName || alloc.club.name;
            const reason = `${match.sport.name} - ${squadName} (${alloc.points.toFixed(2)} pts of ${dist.originalPoints.toFixed(2)} pts across ${dist.uniqueClubCount} unique club${dist.uniqueClubCount === 1 ? '' : 's'})`;

            await tx.pointsHistory.create({
              data: {
                clubId: alloc.clubId,
                sportId: match.sportId,
                matchId: match.id,
                distributionId: dist.id,
                points: alloc.points,
                reason,
                recordedByUserId: user.id,
              },
            });
          }
        }

        // Approve and credit Individual Award Allocations
        const awards = await tx.awardAllocation.findMany({
          where: { matchId: match.id },
        });

        for (const award of awards) {
          await tx.awardAllocation.update({
            where: { id: award.id },
            data: {
              status: 'APPROVED',
              approvedByUserId: user.id,
              approvedAt: new Date(),
            },
          });

          await tx.pointsHistory.create({
            data: {
              clubId: award.clubId,
              sportId: match.sportId,
              matchId: match.id,
              points: award.points,
              reason: `${match.sport.name} - ${award.awardTitle}: ${award.playerName} (${award.points.toFixed(2)} pts)`,
              recordedByUserId: user.id,
            },
          });
        }

        // Approve PlayerPerformance records for Star Player tracking
        const performances = await tx.playerPerformance.findMany({
          where: { matchId: match.id },
        });
        for (const perf of performances) {
          await tx.playerPerformance.update({
            where: { id: perf.id },
            data: {
              status: 'APPROVED',
              approvedByUserId: user.id,
              approvedAt: new Date(),
            },
          });
        }
      });

      // Recalculate dynamic leaderboards
      await recalculateAllLeaderboards();

      // Notify referees
      for (const mr of match.referees) {
        await db.notification.create({
          data: {
            recipientRole: 'REFEREE',
            recipientUserId: mr.refereeId,
            title: `Result Approved: ${match.matchCode}`,
            message: `Admin approved results for ${match.matchCode}. Points have been credited to participating clubs.`,
            type: 'RESULT_APPROVED',
          },
        });
      }

      await createAuditLog({
        user,
        action: 'APPROVE_RESULT',
        entity: 'MatchResult',
        recordId: targetResult?.id || match.id,
        updatedValue: { matchCode: match.matchCode, status: 'APPROVED' },
      });

      return NextResponse.json({
        success: true,
        message: 'Result approved. Club points credited and leaderboard updated.',
      });
    }

    // 2. REJECT ACTION
    if (action === 'REJECT') {
      if (!rejectionReason) {
        return NextResponse.json({ error: 'Rejection reason is required' }, { status: 400 });
      }

      await db.$transaction(async (tx) => {
        if (targetResult) {
          await tx.matchResult.update({
            where: { id: targetResult.id },
            data: {
              status: 'REJECTED',
              rejectionReason,
            },
          });
        }

        await tx.pointsDistribution.updateMany({
          where: { matchId: match.id },
          data: {
            status: 'REJECTED',
            rejectionReason,
          },
        });

        await tx.playerPerformance.updateMany({
          where: { matchId: match.id },
          data: {
            status: 'REJECTED',
          },
        });

        await tx.awardAllocation.updateMany({
          where: { matchId: match.id },
          data: {
            status: 'REJECTED',
          },
        });

        await tx.pointsHistory.deleteMany({
          where: { matchId: match.id },
        });

        await tx.match.update({
          where: { id: match.id },
          data: {
            status: 'AWAITING_RESULT',
            notes: `${match.notes || ''}\n[Rejected by Admin]: ${rejectionReason}`,
          },
        });
      });

      await recalculateAllLeaderboards();

      for (const mr of match.referees) {
        await db.notification.create({
          data: {
            recipientRole: 'REFEREE',
            recipientUserId: mr.refereeId,
            title: `Result Rejected: ${match.matchCode}`,
            message: `Result for ${match.matchCode} was rejected by Admin. Reason: "${rejectionReason}". Please review and resubmit.`,
            type: 'RESULT_SUBMITTED',
            link: `/referee/matches/${match.matchCode}`,
          },
        });
      }

      await createAuditLog({
        user,
        action: 'REJECT_RESULT',
        entity: 'MatchResult',
        recordId: targetResult?.id || match.id,
        updatedValue: { rejectionReason, status: 'REJECTED' },
      });

      return NextResponse.json({
        success: true,
        message: 'Result rejected. Referee notified for correction.',
      });
    }

    // 3. CORRECT ACTION (Audited correction process)
    if (action === 'CORRECT') {
      if (!corrections || !Array.isArray(corrections)) {
        return NextResponse.json({ error: 'Corrections array required' }, { status: 400 });
      }

      const previousState = {
        distributions: match.distributions,
        participants: match.participants.map((p) => ({ id: p.id, score: p.score })),
      };

      await db.$transaction(async (tx) => {
        // Clear old allocations & distributions
        for (const dist of match.distributions) {
          await tx.clubPointAllocation.deleteMany({ where: { distributionId: dist.id } });
        }
        await tx.pointsDistribution.deleteMany({ where: { matchId: match.id } });
        await tx.pointsHistory.deleteMany({ where: { matchId: match.id } });

        // Apply corrected entries
        for (const c of corrections) {
          const participant = match.participants.find((p) => p.id === c.participantId);
          if (!participant) continue;

          const pointsEarned = Math.max(0, parseFloat(c.pointsEarned) || 0);

          await tx.matchParticipant.update({
            where: { id: participant.id },
            data: { score: pointsEarned, rank: c.rank ? parseInt(c.rank, 10) : participant.rank },
          });

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
                playerName: mpp.player.name,
                clubId: mpp.clubId,
                clubName: mpp.club.name,
                clubCode: mpp.club.code,
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

          const distCalc = calculateClubPointsDistribution(pointsEarned, playerContributions, 0);

          const newDist = await tx.pointsDistribution.create({
            data: {
              matchId: match.id,
              participantId: participant.id,
              sportId: match.sportId,
              originalPoints: pointsEarned,
              uniqueClubCount: distCalc.uniqueClubCount,
              calculationNote: `[Admin Corrected]: ${distCalc.explanation}`,
              status: 'APPROVED',
              approvedByUserId: user.id,
              approvedAt: new Date(),
            },
          });

          for (const alloc of distCalc.allocations) {
            await tx.clubPointAllocation.create({
              data: {
                distributionId: newDist.id,
                clubId: alloc.clubId,
                points: alloc.points,
                playersContributed: alloc.playersContributed,
                isRemainderWinner: alloc.isRemainderWinner,
              },
            });

            await tx.pointsHistory.create({
              data: {
                clubId: alloc.clubId,
                sportId: match.sportId,
                matchId: match.id,
                distributionId: newDist.id,
                points: alloc.points,
                reason: `[Corrected] ${match.sport.name} - ${participant.teamName || alloc.clubName} (${alloc.points.toFixed(2)} pts)`,
                recordedByUserId: user.id,
              },
            });
          }
        }

        const correctedStarPlayerId = body.starPlayerId || match.starPlayerId;
        const correctedStarPlayerPoints = body.starPlayerPoints !== undefined ? parseFloat(body.starPlayerPoints) : match.starPlayerPoints;

        if (correctedStarPlayerId) {
          const starPlayer = await tx.player.findUnique({ where: { id: correctedStarPlayerId } });
          if (starPlayer) {
            await tx.playerPerformance.deleteMany({ where: { matchId: match.id } });
            await tx.playerPerformance.create({
              data: {
                matchId: match.id,
                playerId: starPlayer.id,
                sportId: match.sportId,
                clubId: starPlayer.clubId,
                teamName: starPlayer.teamName || starPlayer.club?.name,
                isStarPlayer: true,
                performancePoints: Math.max(0, correctedStarPlayerPoints || 0),
                status: 'APPROVED',
                approvedByUserId: user.id,
                approvedAt: new Date(),
              },
            });
          }
        }

        await tx.match.update({
          where: { id: match.id },
          data: {
            status: 'COMPLETED',
            starPlayerId: correctedStarPlayerId,
            starPlayerPoints: Math.max(0, correctedStarPlayerPoints || 0),
          },
        });

        if (targetResult) {
          await tx.matchResult.update({
            where: { id: targetResult.id },
            data: {
              status: 'APPROVED',
              scoresSummary: `[Corrected by Admin] ${match.matchCode}`,
              approvedByUserId: user.id,
              approvedAt: new Date(),
            },
          });
        }
      });

      await recalculateAllLeaderboards();

      await createAuditLog({
        user,
        action: 'CORRECT_RESULT',
        entity: 'MatchResult',
        recordId: match.id,
        previousValue: previousState,
        updatedValue: corrections,
      });

      return NextResponse.json({
        success: true,
        message: 'Match results successfully corrected and re-distributed with full audit trail.',
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Approve result error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
