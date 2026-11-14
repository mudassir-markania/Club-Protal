import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';
import { recalculateAllLeaderboards } from '@/lib/scoring';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth(['SUPER_ADMIN', 'ADMIN']);
    const body = await req.json();

    const { action, resultId, rejectionReason, overridePoints } = body; // action: "APPROVE" | "REJECT"

    const match = await prisma.match.findFirst({
      where: {
        OR: [{ id: params.id }, { matchCode: params.id }],
      },
      include: {
        sport: true,
        participants: { include: { club: true } },
        results: { orderBy: { createdAt: 'desc' } },
        referees: true,
      },
    });

    if (!match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }

    const targetResult = resultId
      ? match.results.find((r) => r.id === resultId)
      : match.results[0];

    if (!targetResult) {
      return NextResponse.json({ error: 'No submitted result found for this match' }, { status: 404 });
    }

    if (action === 'APPROVE') {
      // 1. Mark Match Result as APPROVED
      await prisma.matchResult.update({
        where: { id: targetResult.id },
        data: {
          status: 'APPROVED',
          approvedByUserId: user.id,
          approvedAt: new Date(),
        },
      });

      // 2. Mark Match as COMPLETED
      await prisma.match.update({
        where: { id: match.id },
        data: {
          status: 'COMPLETED',
        },
      });

      // 3. Prevent duplicate point allocation for this match
      await prisma.pointsHistory.deleteMany({
        where: { matchId: match.id },
      });

      // Determine points to award
      let pointsToAward = 3;
      try {
        if (match.sport.scoringConfig) {
          const cfg = JSON.parse(match.sport.scoringConfig);
          pointsToAward = cfg.win || 3;
        }
      } catch (e) {}

      if (overridePoints !== undefined && !isNaN(parseInt(overridePoints))) {
        pointsToAward = parseInt(overridePoints);
      }

      // Check winner club
      const winnerClubId = targetResult.winnerClubId || match.participants.find((p) => p.isWinner)?.clubId;

      if (winnerClubId) {
        await prisma.pointsHistory.create({
          data: {
            clubId: winnerClubId,
            sportId: match.sportId,
            matchId: match.id,
            points: pointsToAward,
            reason: `${match.sport.name} Win (${match.matchCode} - ${match.round})`,
            recordedByUserId: user.id,
          },
        });
      }

      // 4. Trigger automatic leaderboard recalculation
      await recalculateAllLeaderboards();

      // 5. Notify referee
      for (const r of match.referees) {
        await prisma.notification.create({
          data: {
            recipientRole: 'REFEREE',
            recipientUserId: null,
            title: `Result Approved: ${match.matchCode}`,
            message: `Your submitted result for ${match.sport.name} (${match.matchCode}) has been verified and approved by the Tournament Director.`,
            type: 'RESULT_SUBMITTED',
            link: `/referee/matches/${match.matchCode}`,
          },
        });
      }

      await createAuditLog({
        user,
        action: 'APPROVE_MATCH_RESULT',
        entity: 'MatchResult',
        recordId: targetResult.id,
        updatedValue: { status: 'APPROVED', pointsAwarded: pointsToAward, winnerClubId },
      });

      return NextResponse.json({
        success: true,
        message: 'Match result approved, points awarded, and leaderboards updated!',
      });
    } else if (action === 'REJECT') {
      // Reject result and ask referee for correction
      await prisma.matchResult.update({
        where: { id: targetResult.id },
        data: {
          status: 'REJECTED',
          disputeReason: rejectionReason || 'Result rejected by tournament director for review.',
        },
      });

      await prisma.match.update({
        where: { id: match.id },
        data: {
          status: 'AWAITING_RESULT',
          notes: rejectionReason ? `[Admin Rejection]: ${rejectionReason}` : 'Awaiting revised submission',
        },
      });

      for (const r of match.referees) {
        await prisma.notification.create({
          data: {
            recipientRole: 'REFEREE',
            recipientUserId: null,
            title: `Result Needs Revision: ${match.matchCode}`,
            message: `Result submission was rejected. Reason: ${rejectionReason || 'Please review scores and resubmit'}.`,
            type: 'DISPUTE',
            link: `/referee/matches/${match.matchCode}`,
          },
        });
      }

      await createAuditLog({
        user,
        action: 'REJECT_MATCH_RESULT',
        entity: 'MatchResult',
        recordId: targetResult.id,
        updatedValue: { status: 'REJECTED', rejectionReason },
      });

      return NextResponse.json({
        success: true,
        message: 'Match result marked for revision. Referee notified.',
      });
    } else {
      return NextResponse.json({ error: 'Invalid action. Must be APPROVE or REJECT' }, { status: 400 });
    }
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED' || error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

