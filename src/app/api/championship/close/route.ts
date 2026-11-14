import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';
import { recalculateOverallLeaderboard } from '@/lib/scoring';

export async function POST(req: Request) {
  try {
    const user = await requireAuth(['SUPER_ADMIN', 'ADMIN']);
    const body = await req.json();
    const { action } = body; // "CLOSE" | "REOPEN"

    // Re-verify latest standings
    const { leaderClubId, sortedOverall } = await recalculateOverallLeaderboard();

    const newStatus = action === 'REOPEN' ? 'ACTIVE' : 'CLOSED';

    await db.tournamentSetting.upsert({
      where: { key: 'CHAMPIONSHIP_STATUS' },
      update: { value: newStatus },
      create: {
        key: 'CHAMPIONSHIP_STATUS',
        value: newStatus,
        description: 'Championship status: ACTIVE or CLOSED',
      },
    });

    let championClub = null;
    if (newStatus === 'CLOSED' && leaderClubId) {
      championClub = await db.club.findUnique({ where: { id: leaderClubId } });
      if (championClub) {
        await db.tournamentSetting.upsert({
          where: { key: 'HOUSE_CHAMPION_CLUB_ID' },
          update: { value: championClub.id },
          create: {
            key: 'HOUSE_CHAMPION_CLUB_ID',
            value: championClub.id,
            description: 'Official House Champion',
          },
        });
      }
    }

    await createAuditLog({
      user,
      action: newStatus === 'CLOSED' ? 'CLOSE_CHAMPIONSHIP' : 'REOPEN_CHAMPIONSHIP',
      entity: 'Championship',
      recordId: 'CHAMPIONSHIP_2026',
      updatedValue: { status: newStatus, champion: championClub?.name },
    });

    return NextResponse.json({
      success: true,
      status: newStatus,
      champion: championClub,
      message:
        newStatus === 'CLOSED'
          ? `House Championship closed! ${championClub?.name || 'Leading House'} is officially declared the House Champion!`
          : 'House Championship reopened for active competition.',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
