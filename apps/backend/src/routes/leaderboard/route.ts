import { NextResponse } from '@/http/next-server';
import { db } from '@/lib/db';
import { recalculateAllLeaderboards } from '@/lib/scoring';
import { getCached, setCached, clearCache } from '@/lib/cache';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'overall';
    const sportId = searchParams.get('sportId');

    const cacheKey = `leaderboard:${req.url}`;
    const cached = getCached(cacheKey);
    if (cached) return NextResponse.json(cached);

    const sports = await db.sport.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { name: 'asc' },
    });

    const statusSetting = await db.tournamentSetting.findUnique({
      where: { key: 'CHAMPIONSHIP_STATUS' },
    });
    const championshipStatus = statusSetting?.value || 'ACTIVE';

    const championSetting = await db.tournamentSetting.findUnique({
      where: { key: 'HOUSE_CHAMPION_CLUB_ID' },
    });
    let championClub = null;
    if (championSetting?.value) {
      championClub = await db.club.findUnique({ where: { id: championSetting.value } });
    }

    if (type === 'overall') {
      const clubs = await db.club.findMany({
        orderBy: [{ totalPoints: 'desc' }, { name: 'asc' }],
      });

      // Fetch all points history to compute sport-wise points matrix
      const allPointsHistory = await db.pointsHistory.findMany({
        include: { sport: true },
      });

      // Build sport-wise matrix per club
      const standings = clubs.map((club, idx) => {
        const clubHistory = allPointsHistory.filter((h) => h.clubId === club.id);
        const sportBreakdown: Record<string, number> = {};

        for (const sp of sports) {
          const spPts = clubHistory
            .filter((h) => h.sportId === sp.id)
            .reduce((sum, h) => sum + Number(h.points), 0);
          sportBreakdown[sp.id] = Number(spPts.toFixed(2));
          sportBreakdown[sp.name] = Number(spPts.toFixed(2));
        }

        return {
          id: club.id,
          clubId: club.id,
          club,
          rank: idx + 1,
          totalPoints: Number(club.totalPoints.toFixed(2)),
          points: Number(club.totalPoints.toFixed(2)),
          sportBreakdown,
          transactionsCount: clubHistory.length,
        };
      });

      const leadingClub = standings[0]?.club || null;

      // Recent 10 approved points transactions
      const recentPoints = await db.pointsHistory.findMany({
        take: 10,
        orderBy: { recordedAt: 'desc' },
        include: { club: true, sport: true, match: true },
      });

      const responseData = {
        type: 'overall',
        championshipStatus,
        championClub,
        leadingClub,
        standings,
        sports,
        recentPoints,
      };
      setCached(cacheKey, responseData, 30);
      return NextResponse.json(responseData);
    }

    if (type === 'sport' && sportId) {
      const sport = await db.sport.findUnique({ where: { id: sportId } });
      const entries = await db.leaderboardEntry.findMany({
        where: { sportId },
        orderBy: [{ rank: 'asc' }, { points: 'desc' }],
        include: { club: true },
      });

      const responseData = {
        type: 'sport',
        sport,
        standings: entries,
      };
      setCached(cacheKey, responseData, 30);
      return NextResponse.json(responseData);
    }

    // Default fallback
    const allEntries = await db.leaderboardEntry.findMany({
      where: { sportId: 'OVERALL' },
      orderBy: [{ rank: 'asc' }, { points: 'desc' }],
      include: { club: true },
    });

    const fallbackData = {
      type: 'overall',
      standings: allEntries,
      sports,
    };
    setCached(cacheKey, fallbackData, 30);
    return NextResponse.json(fallbackData);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    clearCache('leaderboard');
    await recalculateAllLeaderboards();
    return NextResponse.json({ success: true, message: 'All leaderboards recalculated' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
