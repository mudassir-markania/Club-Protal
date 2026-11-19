import { db } from './db';

/**
 * Recalculates both sport-specific and overall club leaderboards based on
 * all approved points distributions and points history entries.
 */
export async function recalculateAllLeaderboards() {
  const sports = await db.sport.findMany({ where: { status: 'ACTIVE' } });

  // 1. Recalculate sport-wise standings for each sport
  for (const sport of sports) {
    await recalculateSportLeaderboard(sport.id);
  }

  // 2. Recalculate overall championship standings
  await recalculateOverallLeaderboard();

  // 3. Recalculate individual player performance totals (strictly separated from house points)
  await recalculatePlayerLeaderboards();
}

/**
 * Recalculate sport-specific leaderboard for a given sport
 */
export async function recalculateSportLeaderboard(sportId: string) {
  const sport = await db.sport.findUnique({
    where: { id: sportId },
  });

  if (!sport) return;

  const matches = await db.match.findMany({
    where: { sportId },
    include: { participants: true },
  });

  const clubs = await db.club.findMany();

  // Aggregate stats per club for this sport
  const clubStats: Record<
    string,
    {
      played: number;
      won: number;
      drawn: number;
      lost: number;
      points: number;
      scoreDiff: number;
    }
  > = {};

  for (const club of clubs) {
    clubStats[club.id] = { played: 0, won: 0, drawn: 0, lost: 0, points: 0, scoreDiff: 0 };
  }

  // 1. Count events/matches played by clubs in this sport
  const completedMatches = (matches || []).filter(
    (m: any) => m.status === 'COMPLETED' || m.status === 'APPROVED'
  );

  for (const match of completedMatches) {
    const parts = match.participants || [];
    for (const p of parts) {
      if (p.clubId && clubStats[p.clubId]) {
        clubStats[p.clubId].played += 1;
        if (p.isWinner) clubStats[p.clubId].won += 1;
      }
    }
  }

  // 2. Sum points directly from approved PointsHistory entries for this sport
  const historyEntries = await db.pointsHistory.findMany({
    where: { sportId },
  });

  for (const h of historyEntries) {
    if (clubStats[h.clubId]) {
      clubStats[h.clubId].points = Number(
        (clubStats[h.clubId].points + Number(h.points)).toFixed(2)
      );
    }
  }

  // Sort by points desc, then won desc
  const sorted = Object.entries(clubStats).sort((a, b) => {
    if (b[1].points !== a[1].points) return b[1].points - a[1].points;
    return b[1].won - a[1].won;
  });

  // Upsert sport leaderboard entries
  let currentRank = 1;
  for (let i = 0; i < sorted.length; i++) {
    const [clubId, stats] = sorted[i];
    await db.leaderboardEntry.upsert({
      where: {
        clubId_sportId: { clubId, sportId },
      },
      update: {
        rank: currentRank,
        played: stats.played,
        won: stats.won,
        drawn: stats.drawn,
        lost: stats.lost,
        points: stats.points,
        scoreDifference: stats.scoreDiff,
      },
      create: {
        clubId,
        sportId,
        rank: currentRank,
        played: stats.played,
        won: stats.won,
        drawn: stats.drawn,
        lost: stats.lost,
        points: stats.points,
        scoreDifference: stats.scoreDiff,
      },
    });
    currentRank++;
  }
}

/**
 * Recalculate the overall House Championship leaderboard across all 6 sports
 */
export async function recalculateOverallLeaderboard() {
  const clubs = await db.club.findMany();

  const aggregated: Record<
    string,
    {
      points: number;
      played: number;
      won: number;
      drawn: number;
      lost: number;
      scoreDiff: number;
      gold: number;
      silver: number;
      bronze: number;
    }
  > = {};

  for (const c of clubs) {
    aggregated[c.id] = {
      points: 0,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      scoreDiff: 0,
      gold: 0,
      silver: 0,
      bronze: 0,
    };
  }

  // 1. Sum up all approved points from PointsHistory (Single Source of Truth)
  const allPointsHistory = await db.pointsHistory.findMany();
  for (const ph of allPointsHistory) {
    if (aggregated[ph.clubId]) {
      aggregated[ph.clubId].points = Number(
        (aggregated[ph.clubId].points + Number(ph.points)).toFixed(2)
      );
      const lower = ph.reason.toLowerCase();
      if (lower.includes('1st') || lower.includes('gold') || lower.includes('winner')) {
        aggregated[ph.clubId].gold += 1;
      } else if (lower.includes('2nd') || lower.includes('silver') || lower.includes('runner')) {
        aggregated[ph.clubId].silver += 1;
      } else if (lower.includes('3rd') || lower.includes('bronze')) {
        aggregated[ph.clubId].bronze += 1;
      }
    }
  }

  // 2. Count matches participated and won across completed matches
  const completedMatches = await db.match.findMany({
    where: { status: { in: ['COMPLETED', 'APPROVED'] } },
    include: { participants: true },
  });

  for (const match of completedMatches) {
    for (const p of match.participants) {
      if (p.clubId && aggregated[p.clubId]) {
        aggregated[p.clubId].played += 1;
        if (p.isWinner) aggregated[p.clubId].won += 1;
      }
    }
  }

  // 3. Sort overall standings by Points desc -> Gold desc -> Silver desc -> Won desc
  const sortedOverall = Object.entries(aggregated).sort((a, b) => {
    if (b[1].points !== a[1].points) return b[1].points - a[1].points;
    if (b[1].gold !== a[1].gold) return b[1].gold - a[1].gold;
    if (b[1].silver !== a[1].silver) return b[1].silver - a[1].silver;
    return b[1].won - a[1].won;
  });

  let rank = 1;
  let leaderClubId = sortedOverall[0]?.[0] || null;

  for (const [clubId, stats] of sortedOverall) {
    // Update club record
    await db.club.update({
      where: { id: clubId },
      data: {
        totalPoints: stats.points,
        currentRank: rank,
      },
    });

    // Update overall leaderboard entry
    await db.leaderboardEntry.upsert({
      where: {
        clubId_sportId: { clubId, sportId: 'OVERALL' },
      },
      update: {
        rank,
        played: stats.played,
        won: stats.won,
        drawn: stats.drawn,
        lost: stats.lost,
        points: stats.points,
        scoreDifference: stats.scoreDiff,
        gold: stats.gold,
        silver: stats.silver,
        bronze: stats.bronze,
      },
      create: {
        clubId,
        sportId: 'OVERALL',
        rank,
        played: stats.played,
        won: stats.won,
        drawn: stats.drawn,
        lost: stats.lost,
        points: stats.points,
        scoreDifference: stats.scoreDiff,
        gold: stats.gold,
        silver: stats.silver,
        bronze: stats.bronze,
      },
    });

    rank++;
  }

  // Update Championship Leader setting
  if (leaderClubId) {
    await db.tournamentSetting.upsert({
      where: { key: 'CURRENT_LEADER_CLUB_ID' },
      update: { value: leaderClubId },
      create: {
        key: 'CURRENT_LEADER_CLUB_ID',
        value: leaderClubId,
        description: 'Current 1st place club in House Championship',
      },
    });
  }

  return { leaderClubId, sortedOverall };
}

/**
 * Recalculates individual player performance points and star player award counts
 * based strictly on APPROVED player performance records.
 * CRITICAL RULE: These points belong exclusively to individual athletes and are
 * NEVER mixed or added into Club Championship points.
 */
export async function recalculatePlayerLeaderboards() {
  const approvedPerformances = await db.playerPerformance.findMany({
    where: { status: 'APPROVED' },
  });

  const playerStats: Record<string, { totalPoints: number; starPlayerCount: number }> = {};

  for (const perf of approvedPerformances) {
    if (!playerStats[perf.playerId]) {
      playerStats[perf.playerId] = { totalPoints: 0, starPlayerCount: 0 };
    }
    playerStats[perf.playerId].totalPoints += Number(perf.performancePoints || 0);
    if (perf.isStarPlayer) {
      playerStats[perf.playerId].starPlayerCount += 1;
    }
  }

  const allPlayers = await db.player.findMany();
  for (const p of allPlayers) {
    const stats = playerStats[p.id] || { totalPoints: 0, starPlayerCount: 0 };
    await db.player.update({
      where: { id: p.id },
      data: {
        totalPerformancePoints: Number(stats.totalPoints.toFixed(2)),
        starPlayerCount: stats.starPlayerCount,
      },
    });
  }
}
