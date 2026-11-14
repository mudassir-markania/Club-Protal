import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';
import { recalculateAllLeaderboards } from '@/lib/scoring';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth();
    const body = await req.json();

    const match = await prisma.match.findFirst({
      where: {
        OR: [{ id: params.id }, { matchCode: params.id }],
      },
      include: {
        sport: true,
        participants: { include: { club: true } },
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
      // If admin submitting directly, use first assigned referee or create virtual referee
      refereeId = match.referees[0]?.refereeId;
      if (!refereeId) {
        const anyRef = await prisma.referee.findFirst();
        refereeId = anyRef?.id || 'admin-ref';
      }
    }

    const {
      scores,               // Array of { participantId, score, scoreDetail, isWinner }
      winnerParticipantId,  // Winner participant ID
      winnerClubId,         // Winner club ID
      scoresSummary,        // Text summary e.g. "Apex 3 - 1 Titan"
      refereeNotes,         // Observations/notes
    } = body;

    // Update participants with final scores & winner flag
    if (scores && Array.isArray(scores)) {
      for (const s of scores) {
        await prisma.matchParticipant.update({
          where: { id: s.participantId },
          data: {
            score: s.score !== undefined ? parseInt(s.score) : 0,
            scoreDetail: s.scoreDetail ? (typeof s.scoreDetail === 'string' ? s.scoreDetail : JSON.stringify(s.scoreDetail)) : undefined,
            isWinner: s.participantId === winnerParticipantId || Boolean(s.isWinner),
            rank: s.rank ? parseInt(s.rank) : (s.participantId === winnerParticipantId ? 1 : 2),
          },
        });
      }
    }

    // Determine auto-approval setting
    const autoApproveSetting = await prisma.tournamentSetting.findUnique({
      where: { key: 'AUTO_APPROVE_RESULTS' },
    });
    const autoApprove = autoApproveSetting?.value === 'TRUE';

    // Create MatchResult record
    const matchResult = await prisma.matchResult.create({
      data: {
        matchId: match.id,
        submittedByRefereeId: refereeId,
        winnerParticipantId: winnerParticipantId || null,
        winnerClubId: winnerClubId || null,
        scoresSummary: scoresSummary || `${match.matchCode} Completed`,
        refereeNotes: refereeNotes || null,
        status: autoApprove ? 'APPROVED' : 'PENDING_APPROVAL',
        approvedAt: autoApprove ? new Date() : null,
      },
    });

    // Update Match status
    await prisma.match.update({
      where: { id: match.id },
      data: {
        status: autoApprove ? 'COMPLETED' : 'SUBMITTED',
        notes: refereeNotes ? (match.notes ? `${match.notes}\n[Referee Note]: ${refereeNotes}` : refereeNotes) : match.notes,
      },
    });

    // Create Notification for Admins
    await prisma.notification.create({
      data: {
        recipientRole: 'ADMIN',
        title: `Match Result Submitted: ${match.matchCode}`,
        message: `Referee submitted final scores for ${match.sport.name} (${scoresSummary}). Status: ${autoApprove ? 'Approved' : 'Awaiting Approval'}.`,
        type: 'RESULT_SUBMITTED',
        link: `/admin/matches/${match.matchCode}`,
      },
    });

    // If auto approved, allocate points and recalculate leaderboards
    if (autoApprove && winnerClubId) {
      let scoringConfig = { win: 3, draw: 1, loss: 0 };
      try {
        if (match.sport.scoringConfig) scoringConfig = JSON.parse(match.sport.scoringConfig);
      } catch (e) {}

      await prisma.pointsHistory.create({
        data: {
          clubId: winnerClubId,
          sportId: match.sportId,
          matchId: match.id,
          points: scoringConfig.win || 3,
          reason: `Match Win (${match.matchCode} - ${match.round})`,
        },
      });

      await recalculateAllLeaderboards();
    }

    await createAuditLog({
      user,
      action: 'SUBMIT_MATCH_RESULT',
      entity: 'MatchResult',
      recordId: matchResult.id,
      updatedValue: { matchResult, scores },
    });

    return NextResponse.json({
      success: true,
      matchResult,
      status: autoApprove ? 'COMPLETED' : 'SUBMITTED',
      message: autoApprove
        ? 'Result submitted and automatically approved!'
        : 'Result submitted successfully. Awaiting tournament director review.',
    });
  } catch (error: any) {
    console.error('Submit result error:', error);
    if (error.message === 'UNAUTHORIZED' || error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

