/**
 * Core Reusable Backend Service: Automatic Club-Wise Points Distribution Engine
 *
 * Rules:
 * 1. Count each unique club only once across participating players in a squad/entry.
 * 2. Never distribute points according to player count (e.g. 2 players from Club A doesn't mean 2x share).
 * 3. Divide total points equally among unique clubs with 2 decimal places.
 * 4. Sum of all distributed points must ALWAYS equal original points earned.
 * 5. Arithmetic is done in integer hundredths (cents) to eliminate floating point issues.
 * 6. Rotate the club receiving any remainder cent fairly using a deterministic rotation index.
 */

export interface PlayerContribution {
  playerId: string;
  playerName?: string;
  clubId: string;
  clubName: string;
  clubCode?: string;
}

export interface ClubAllocation {
  clubId: string;
  clubName: string;
  clubCode?: string;
  playersContributed: number;
  points: number; // e.g. 33.33 or 33.34
  pointsFormatted: string; // "33.33"
  isRemainderWinner: boolean;
}

export interface PointsDistributionResult {
  originalPoints: number;
  originalPointsFormatted: string;
  totalPlayers: number;
  uniqueClubCount: number;
  basePointsPerClub: number;
  remainderCents: number;
  allocations: ClubAllocation[];
  totalDistributed: number;
  isBalanced: boolean;
  explanation: string;
}

/**
 * Distributes points among unique clubs represented by participating players.
 *
 * @param originalPoints Total points earned by the squad/entry (e.g. 100)
 * @param players Array of players with their club affiliations
 * @param rotationIndex Deterministic counter or index to rotate remainder cent fairly
 */
export function calculateClubPointsDistribution(
  originalPoints: number,
  players: PlayerContribution[],
  rotationIndex: number = 0
): PointsDistributionResult {
  const sanitizedOriginal = Math.max(0, Number(originalPoints) || 0);

  // If no players, return empty
  if (!players || players.length === 0) {
    return {
      originalPoints: sanitizedOriginal,
      originalPointsFormatted: sanitizedOriginal.toFixed(2),
      totalPlayers: 0,
      uniqueClubCount: 0,
      basePointsPerClub: 0,
      remainderCents: 0,
      allocations: [],
      totalDistributed: 0,
      isBalanced: true,
      explanation: 'No participating players provided.',
    };
  }

  // 1. Group players by unique parent clubId
  const clubMap = new Map<
    string,
    {
      clubId: string;
      clubName: string;
      clubCode?: string;
      playerCount: number;
    }
  >();

  for (const p of players) {
    if (!p.clubId) continue;
    const existing = clubMap.get(p.clubId);
    if (existing) {
      existing.playerCount += 1;
    } else {
      clubMap.set(p.clubId, {
        clubId: p.clubId,
        clubName: p.clubName || 'Unknown Club',
        clubCode: p.clubCode,
        playerCount: 1,
      });
    }
  }

  const uniqueClubs = Array.from(clubMap.values());
  const uniqueClubCount = uniqueClubs.length;

  if (uniqueClubCount === 0) {
    return {
      originalPoints: sanitizedOriginal,
      originalPointsFormatted: sanitizedOriginal.toFixed(2),
      totalPlayers: players.length,
      uniqueClubCount: 0,
      basePointsPerClub: 0,
      remainderCents: 0,
      allocations: [],
      totalDistributed: 0,
      isBalanced: true,
      explanation: 'No valid club affiliations found for participating players.',
    };
  }

  // 2. Integer-based calculation in hundredths (cents)
  const totalCents = Math.round(sanitizedOriginal * 100);
  const baseCents = Math.floor(totalCents / uniqueClubCount);
  const remainderCents = totalCents % uniqueClubCount;

  // 3. Deterministic rotation for remainder cents
  // Sort clubs deterministically (by clubId) so order is stable across runs
  uniqueClubs.sort((a, b) => a.clubId.localeCompare(b.clubId));

  // Determine which clubs receive the +1 remainder cent
  // Using rotationIndex, we pick remainderCents consecutive clubs starting at normalized offset
  const normalizedOffset = Math.abs(rotationIndex) % uniqueClubCount;
  const remainderWinnerIndices = new Set<number>();
  for (let i = 0; i < remainderCents; i++) {
    const idx = (normalizedOffset + i) % uniqueClubCount;
    remainderWinnerIndices.add(idx);
  }

  let distributedCentsSum = 0;
  const allocations: ClubAllocation[] = uniqueClubs.map((club, idx) => {
    const getsRemainder = remainderWinnerIndices.has(idx);
    const allocatedCents = baseCents + (getsRemainder ? 1 : 0);
    distributedCentsSum += allocatedCents;

    const points = allocatedCents / 100;
    return {
      clubId: club.clubId,
      clubName: club.clubName,
      clubCode: club.clubCode,
      playersContributed: club.playerCount,
      points,
      pointsFormatted: points.toFixed(2),
      isRemainderWinner: getsRemainder,
    };
  });

  const totalDistributed = distributedCentsSum / 100;
  const isBalanced = distributedCentsSum === totalCents;

  const basePointsPerClub = baseCents / 100;
  const explanation = `${sanitizedOriginal.toFixed(2)} pts earned by squad across ${uniqueClubCount} unique club${
    uniqueClubCount === 1 ? '' : 's'
  } (${players.length} total player${players.length === 1 ? '' : 's'}). Base share: ${basePointsPerClub.toFixed(2)} pts each.${
    remainderCents > 0
      ? ` Remainder of ${remainderCents}¢ rotated to ${allocations
          .filter((a) => a.isRemainderWinner)
          .map((a) => a.clubName)
          .join(', ')}.`
      : ''
  }`;

  return {
    originalPoints: sanitizedOriginal,
    originalPointsFormatted: sanitizedOriginal.toFixed(2),
    totalPlayers: players.length,
    uniqueClubCount,
    basePointsPerClub,
    remainderCents,
    allocations,
    totalDistributed,
    isBalanced,
    explanation,
  };
}

