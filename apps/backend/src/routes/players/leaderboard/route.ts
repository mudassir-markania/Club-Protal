import { NextResponse } from '@/http/next-server';
import { db } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sportId = searchParams.get('sportId');

    // Fetch all active sports for filters
    const sports = await db.sport.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { name: 'asc' },
    });

    // Fetch all approved player performances
    const perfWhere: any = { status: 'APPROVED' };
    if (sportId) {
      perfWhere.sportId = sportId;
    }

    const performances = await db.playerPerformance.findMany({
      where: perfWhere,
      include: {
        player: {
          include: {
            club: true,
          },
        },
        sport: true,
        match: {
          include: {
            venue: true,
          },
        },
      },
      orderBy: [{ awardedAt: 'desc' }],
    });

    // Aggregate performances per player
    const playerAggMap = new Map<
      string,
      {
        player: any;
        totalPoints: number;
        starPlayerCount: number;
        matchHistory: any[];
      }
    >();

    for (const perf of performances) {
      if (!perf.player) continue;

      const pId = perf.playerId;
      if (!playerAggMap.has(pId)) {
        playerAggMap.set(pId, {
          player: perf.player,
          totalPoints: 0,
          starPlayerCount: 0,
          matchHistory: [],
        });
      }

      const agg = playerAggMap.get(pId)!;
      agg.totalPoints += Number(perf.performancePoints || 0);
      if (perf.isStarPlayer) {
        agg.starPlayerCount += 1;
      }

      agg.matchHistory.push({
        id: perf.id,
        matchId: perf.matchId,
        matchCode: perf.match?.matchCode || 'MATCH',
        sportName: perf.sport?.name || 'Sport',
        sportId: perf.sportId,
        matchDate: perf.match?.matchDate || '',
        matchTime: perf.match?.matchTime || '',
        round: perf.match?.round || '',
        teamName: perf.teamName || perf.player.teamName || perf.player.club?.name,
        clubName: perf.player.club?.name || 'House',
        clubCode: perf.player.club?.code || '',
        isStarPlayer: perf.isStarPlayer,
        pointsEarned: Number(perf.performancePoints || 0),
        awardedAt: perf.awardedAt,
      });
    }

    // If overall view, also include all players so leaderboard is complete
    if (!sportId) {
      const allPlayers = await db.player.findMany({
        where: { status: 'APPROVED' },
        include: { club: true },
      });

      for (const p of allPlayers) {
        if (!playerAggMap.has(p.id)) {
          playerAggMap.set(p.id, {
            player: p,
            totalPoints: p.totalPerformancePoints || 0,
            starPlayerCount: p.starPlayerCount || 0,
            matchHistory: [],
          });
        }
      }
    }

    // Convert to sorted leaderboard array
    const sortedPlayers = Array.from(playerAggMap.values())
      .map((entry) => ({
        id: entry.player.id,
        name: entry.player.name,
        email: entry.player.email,
        registrationId: entry.player.registrationId,
        club: entry.player.club,
        teamName: entry.player.teamName || entry.player.club?.name,
        totalPerformancePoints: Number(entry.totalPoints.toFixed(2)),
        starPlayerCount: entry.starPlayerCount,
        matchCount: entry.matchHistory.length,
        matchHistory: entry.matchHistory,
      }))
      .sort((a, b) => {
        if (b.totalPerformancePoints !== a.totalPerformancePoints) {
          return b.totalPerformancePoints - a.totalPerformancePoints;
        }
        if (b.starPlayerCount !== a.starPlayerCount) {
          return b.starPlayerCount - a.starPlayerCount;
        }
        return a.name.localeCompare(b.name);
      });

    // Assign ranking with tie handling
    let currentRank = 1;
    const rankedPlayers: any[] = [];
    for (let index = 0; index < sortedPlayers.length; index++) {
      const p = sortedPlayers[index];
      if (
        index > 0 &&
        p.totalPerformancePoints === sortedPlayers[index - 1].totalPerformancePoints &&
        p.starPlayerCount === sortedPlayers[index - 1].starPlayerCount
      ) {
        // Tied with previous
        rankedPlayers.push({ ...p, rank: rankedPlayers[index - 1].rank });
      } else {
        rankedPlayers.push({ ...p, rank: currentRank });
      }
      currentRank++;
    }

    return NextResponse.json({
      leaderboard: rankedPlayers,
      sports,
      totalAthletes: rankedPlayers.length,
      activeSportFilter: sportId || 'OVERALL',
    });
  } catch (error: any) {
    console.error('Player leaderboard error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
