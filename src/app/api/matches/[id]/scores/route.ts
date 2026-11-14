import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth();
    const body = await req.json();

    const match = await prisma.match.findFirst({
      where: {
        OR: [{ id: params.id }, { matchCode: params.id }],
      },
      include: {
        participants: true,
        referees: true,
      },
    });

    if (!match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }

    // Permission check for Referee
    if (user.role === 'REFEREE') {
      const isAssigned = match.referees.some((r) => r.refereeId === user.refereeId);
      if (!isAssigned) {
        return NextResponse.json({ error: 'You are not assigned to this match' }, { status: 403 });
      }
    }

    const {
      scores, // Array of { participantId, score, scoreDetail }
      status, // Optional updated status e.g. "IN_PROGRESS"
      scoreEntry, // Optional { participantId, setOrHalf, scoreValue, details }
    } = body;

    // Update participant scores
    if (scores && Array.isArray(scores)) {
      for (const s of scores) {
        await prisma.matchParticipant.update({
          where: { id: s.participantId },
          data: {
            score: s.score !== undefined ? parseInt(s.score) : undefined,
            scoreDetail: s.scoreDetail ? (typeof s.scoreDetail === 'string' ? s.scoreDetail : JSON.stringify(s.scoreDetail)) : undefined,
          },
        });
      }
    }

    // Insert score entry if provided
    if (scoreEntry && scoreEntry.participantId) {
      await prisma.scoreEntry.create({
        data: {
          matchId: match.id,
          participantId: scoreEntry.participantId,
          setOrHalf: scoreEntry.setOrHalf || 'Current',
          scoreValue: parseInt(scoreEntry.scoreValue) || 0,
          details: scoreEntry.details ? JSON.stringify(scoreEntry.details) : null,
        },
      });
    }

    // Optionally update status
    if (status) {
      await prisma.match.update({
        where: { id: match.id },
        data: { status },
      });
    }

    const updatedMatch = await prisma.match.findUnique({
      where: { id: match.id },
      include: {
        participants: { include: { club: true, player: true } },
        scoreEntries: { orderBy: { createdAt: 'desc' } },
      },
    });

    await createAuditLog({
      user,
      action: 'UPDATE_MATCH_SCORES',
      entity: 'Match',
      recordId: match.id,
      updatedValue: { scores, status },
    });

    return NextResponse.json(updatedMatch);
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED' || error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

