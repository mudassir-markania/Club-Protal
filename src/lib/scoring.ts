import { prisma } from './prisma';

/**
 * Recalculates both sport-specific and overall club leaderboards based on
 * all approved match results and points history entries.
 */
export async function recalculateAllLeaderboards() {
  const clubs = await prisma.club.findMany();
  const sports = await prisma.sport.findMany();

  // 1. Recalculate sport-wise standings for each sport
  for (const sport of sports) {
    await recalculateSportLeaderboard(sport.id);
  }

  // 2. Recalculate overall standings
  await recalculateOverallLeaderboard();
}

/**
 * Recalculate sport-specific leaderboard for a given sport
 */
export async function recalculateSportLeaderboard(sportId: string) {
  const sport = await prisma.sport.findUnique({
    where: { id: sportId },
    include: { matches: { include: { participants: true, results: true } } },
  });

  if (!sport) return;

  const clubs = await prisma.club.findMany();
  let scoringConfig = { win: 3, draw: 1, loss: 0, bonus: 0 };
  try {
    if (sport.scoringConfig) {
      scoringConfig = JSON.parse(sport.scoringConfig);
    }
  } catch (e) {
    // fallback
  }

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

  // Look at completed matches for this sport
  const completedMatches = sport.matches.filter(
    (m) => m.status === 'COMPLETED' || m.status === 'APPROVED'
  );

  for (const match of completedMatches) {
    const parts = match.participants;
    if (parts.length >= 2) {
      const p1 = parts[0];
      const p2 = parts[1];

      if (p1.clubId && clubStats[p1.clubId]) clubStats[p1.clubId].played += 1;
      if (p2.clubId && clubStats[p2.clubId]) clubStats[p2.clubId].played += 1;

      const diff1 = (p1.score || 0) - (p2.score || 0);
      if (p1.clubId && clubStats[p1.clubId]) clubStats[p1.clubId].scoreDiff += diff1;
      if (p2.clubId && clubStats[p2.clubId]) clubStats[p2.clubId].scoreDiff -= diff1;

      if (p1.isWinner) {
        if (p1.clubId && clubStats[p1.clubId]) {
          clubStats[p1.clubId].won += 1;
          clubStats[p1.clubId].points += scoringConfig.win || 3;
        }
        if (p2.clubId && clubStats[p2.clubId]) {
          clubStats[p2.clubId].lost += 1;
          clubStats[p2.clubId].points += scoringConfig.loss || 0;
        }
      } else if (p2.isWinner) {
        if (p2.clubId && clubStats[p2.clubId]) {
          clubStats[p2.clubId].won += 1;
          clubStats[p2.clubId].points += scoringConfig.win || 3;
        }
        if (p1.clubId && clubStats[p1.clubId]) {
          clubStats[p1.clubId].lost += 1;
          clubStats[p1.clubId].points += scoringConfig.loss || 0;
        }
      } else {
        // Draw
        if (p1.clubId && clubStats[p1.clubId]) {
          clubStats[p1.clubId].drawn += 1;
          clubStats[p1.clubId].points += scoringConfig.draw || 1;
        }
        if (p2.clubId && clubStats[p2.clubId]) {
          clubStats[p2.clubId].drawn += 1;
          clubStats[p2.clubId].points += scoringConfig.draw || 1;
        }
      }
    }
  }

  // Also include manual or tournament bonus points from PointsHistory for this sport
  const historyEntries = await prisma.pointsHistory.findMany({
    where: { sportId },
  });
  // Check if matches already covered them or if they are tournament placement points
  // PointsHistory is the ultimate single source of truth for allocated tournament points
  for (const h of historyEntries) {
    if (!h.matchId && clubStats[h.clubId]) {
      clubStats[h.clubId].points += h.points;
    }
  }

  // Sort by points desc, then scoreDiff desc
  const sorted = Object.entries(clubStats).sort((a, b) => {
    if (b[1].points !== a[1].points) return b[1].points - a[1].points;
    return b[1].scoreDiff - a[1].scoreDiff;
  });

  // Upsert leaderboard entries
  let currentRank = 1;
  for (let i = 0; i < sorted.length; i++) {
    const [clubId, stats] = sorted[i];
    await prisma.leaderboardEntry.upsert({
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
 * Recalculate the overall tournament club leaderboard
 */
export async function recalculateOverallLeaderboard() {
  const clubs = await prisma.club.findMany();

  // Aggregate points from PointsHistory
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

  // 1. Sum up all approved points from PointsHistory
  const allPointsHistory = await prisma.pointsHistory.findMany();
  for (const ph of allPointsHistory) {
    if (aggregated[ph.clubId]) {
      aggregated[ph.clubId].points += ph.points;
      if (ph.reason.toLowerCase().includes('gold')) aggregated[ph.clubId].gold += 1;
      if (ph.reason.toLowerCase().includes('silver')) aggregated[ph.clubId].silver += 1;
      if (ph.reason.toLowerCase().includes('bronze')) aggregated[ph.clubId].bronze += 1;
    }
  }

  // 2. Sum up match records from all completed matches
  const completedMatches = await prisma.match.findMany({
    where: { status: 'COMPLETED' },
    include: { participants: true },
  });

  for (const match of completedMatches) {
    const parts = match.participants;
    if (parts.length >= 2) {
      const p1 = parts[0];
      const p2 = parts[1];

      if (p1.clubId && aggregated[p1.clubId]) {
        aggregated[p1.clubId].played += 1;
        aggregated[p1.clubId].scoreDiff += (p1.score || 0) - (p2.score || 0);
        if (p1.isWinner) aggregated[p1.clubId].won += 1;
        else if (!p2.isWinner) aggregated[p1.clubId].drawn += 1;
        else aggregated[p1.clubId].lost += 1;
      }

      if (p2.clubId && aggregated[p2.clubId]) {
        aggregated[p2.clubId].played += 1;
        aggregated[p2.clubId].scoreDiff += (p2.score || 0) - (p1.score || 0);
        if (p2.isWinner) aggregated[p2.clubId].won += 1;
        else if (!p1.isWinner) aggregated[p2.clubId].drawn += 1;
        else aggregated[p2.clubId].lost += 1;
      }
    }
  }

  // Sort overall standings: Points desc -> Gold desc -> Silver desc -> Wins desc -> ScoreDiff desc
  const sortedOverall = Object.entries(aggregated).sort((a, b) => {
    if (b[1].points !== a[1].points) return b[1].points - a[1].points;
    if (b[1].gold !== a[1].gold) return b[1].gold - a[1].gold;
    if (b[1].silver !== a[1].silver) return b[1].silver - a[1].silver;
    if (b[1].won !== a[1].won) return b[1].won - a[1].won;
    return b[1].scoreDiff - a[1].scoreDiff;
  });

  let rank = 1;
  for (const [clubId, stats] of sortedOverall) {
    // Update club record
    await prisma.club.update({
      where: { id: clubId },
      data: {
        totalPoints: stats.points,
        currentRank: rank,
      },
    });

    // Update overall leaderboard entry
    await prisma.leaderboardEntry.upsert({
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
}

