import { NextResponse } from '@/http/next-server';
import { db } from '@/lib/db';
import { recalculateAllLeaderboards } from '@/lib/scoring';
import { getCached, setCached, clearCache } from '@/lib/cache';
import { requireAuth } from '@/lib/auth';
import { getPointsLockState } from '@/lib/points-lock';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'overall';
    const sportId = searchParams.get('sportId');

    const { pointsLocked, isAdmin, hidePoints } = await getPointsLockState();

    const cacheKey = `leaderboard:${req.url}:${hidePoints ? 'public-locked' : isAdmin ? 'admin' : 'public-unlocked'}`;
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
    if (championSetting?.value && !hidePoints) {
      championClub = await db.club.findUnique({ where: { id: championSetting.value } });
    }

    if (type === 'overall') {
      const clubs = await db.club.findMany({
        orderBy: [{ totalPoints: 'desc' }, { name: 'asc' }],
      });

      // If points are locked for public, sort alphabetically so rank doesn't leak standings
      if (hidePoints) {
        const sortedClubs = [...clubs].sort((a, b) => a.name.localeCompare(b.name));
        const standings = sortedClubs.map((club, idx) => ({
          id: club.id,
          clubId: club.id,
          club: {
            ...club,
            totalPoints: null,
          },
          rank: idx + 1,
          totalPoints: null,
          points: null,
          sportBreakdown: {},
          transactionsCount: 0,
          locked: true,
        }));

        const responseData = {
          type: 'overall',
          championshipStatus,
          championClub: null,
          leadingClub: null,
          standings,
          sports,
          recentPoints: [],
          pointsLocked: true,
          lockNotice: 'Final Day Lockdown: Points and standings are currently frozen for the Grand Reveal ceremony!',
        };
        setCached(cacheKey, responseData, 30);
        return NextResponse.json(responseData);
      }

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
          locked: false,
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
        pointsLocked: Boolean(pointsLocked),
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

      const safeEntries = hidePoints
        ? entries.map((e) => ({
            ...e,
            points: null,
            rank: null,
            locked: true,
          }))
        : entries;

      const responseData = {
        type: 'sport',
        sport,
        standings: safeEntries,
        pointsLocked: Boolean(pointsLocked),
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
      standings: hidePoints
        ? allEntries.map((e) => ({ ...e, points: null, rank: null, locked: true }))
        : allEntries,
      sports,
      pointsLocked: Boolean(pointsLocked),
    };
    setCached(cacheKey, fallbackData, 30);
    return NextResponse.json(fallbackData);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));

    // Handle Lock / Unlock Points toggle
    if (body.action === 'TOGGLE_LOCK' || body.action === 'SET_LOCK') {
      await requireAuth(['SUPER_ADMIN', 'ADMIN']);
      const current = await db.tournamentSetting.findUnique({ where: { key: 'POINTS_LOCKED' } });
      const isCurrentlyLocked = current ? current.value === 'true' : true;
      const nextLocked = body.action === 'SET_LOCK' ? Boolean(body.locked) : !isCurrentlyLocked;

      await db.tournamentSetting.upsert({
        where: { key: 'POINTS_LOCKED' },
        update: { value: nextLocked ? 'true' : 'false' },
        create: {
          key: 'POINTS_LOCKED',
          value: nextLocked ? 'true' : 'false',
          description: 'Freeze all public points visibility for Final Day reveal',
        },
      });

      clearCache();
      return NextResponse.json({
        success: true,
        pointsLocked: nextLocked,
        message: nextLocked
          ? 'Points have been LOCKED. Public visitors cannot see scores or standings.'
          : 'Points have been UNLOCKED and are now visible to the public.',
      });
    }

    clearCache();
    await recalculateAllLeaderboards();
    return NextResponse.json({ success: true, message: 'All leaderboards recalculated' });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED' || error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
