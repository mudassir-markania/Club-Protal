/**
 * Core Reusable Service: Automatic Club-Wise Points Distribution Engine
 *
 * Rules:
 * 1. The points earned by a team / pair are divided EQUALLY BETWEEN ITS PLAYERS (8 pts / 4 players = 2 pts each).
 * 2. Every player's share is credited to that player's own club, so a club receives the sum of its players' shares
 *    (two players from Club A and one each from B and C, 8 pts: A = 4, B = 2, C = 2).
 * 3. Arithmetic is done in integer hundredths (cents) to eliminate floating point issues.
 * 4. When the points do not divide evenly, the spare cents go to players in a fair rotation (rotationIndex), so the
 *    sum of all club allocations ALWAYS equals the original points earned.
 * 5. A single entry (a player, or a club with no roster) keeps all of its points.
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
 * Splits points equally between the players of a team and credits each player's share to that player's club.
 *
 * @param originalPoints Total points earned by the team / entry (e.g. 8)
 * @param players Players of the team with their club affiliations
 * @param rotationIndex Deterministic counter used to rotate the spare cents fairly
 */
export function calculateClubPointsDistribution(
  originalPoints: number,
  players: PlayerContribution[],
  rotationIndex: number = 0
): PointsDistributionResult {
  const sanitizedOriginal = Math.max(0, Number(originalPoints) || 0);

  const empty = (explanation: string, totalPlayers: number): PointsDistributionResult => ({
    originalPoints: sanitizedOriginal,
    originalPointsFormatted: sanitizedOriginal.toFixed(2),
    totalPlayers,
    uniqueClubCount: 0,
    basePointsPerClub: 0,
    remainderCents: 0,
    allocations: [],
    totalDistributed: 0,
    isBalanced: true,
    explanation,
  });

  if (!players || players.length === 0) return empty('No participating players provided.', 0);

  // only players that belong to a club can receive a share
  const valid = players.filter((p) => p.clubId);
  if (valid.length === 0) return empty('No valid club affiliations found for participating players.', players.length);

  const n = valid.length;

  // 1. Equal share per player, in cents
  const totalCents = Math.round(sanitizedOriginal * 100);
  const baseCents = Math.floor(totalCents / n);
  const remainderCents = totalCents % n;

  // 2. Spare cents go to consecutive players, starting at a rotating offset (stable player order)
  const ordered = [...valid].sort((a, b) => a.clubId.localeCompare(b.clubId) || String(a.playerId).localeCompare(String(b.playerId)));
  const offset = Math.abs(rotationIndex) % n;
  const extra = new Set<number>();
  for (let i = 0; i < remainderCents; i++) extra.add((offset + i) % n);

  // 3. Credit each player's share to the player's club
  const clubMap = new Map<string, { clubId: string; clubName: string; clubCode?: string; playerCount: number; cents: number; gotExtra: boolean }>();
  ordered.forEach((p, idx) => {
    const cents = baseCents + (extra.has(idx) ? 1 : 0);
    const existing = clubMap.get(p.clubId);
    if (existing) {
      existing.playerCount += 1;
      existing.cents += cents;
      existing.gotExtra = existing.gotExtra || extra.has(idx);
    } else {
      clubMap.set(p.clubId, {
        clubId: p.clubId,
        clubName: p.clubName || 'Unknown Club',
        clubCode: p.clubCode,
        playerCount: 1,
        cents,
        gotExtra: extra.has(idx),
      });
    }
  });

  const clubs = Array.from(clubMap.values()).sort((a, b) => a.clubId.localeCompare(b.clubId));
  let distributedCentsSum = 0;
  const allocations: ClubAllocation[] = clubs.map((club) => {
    distributedCentsSum += club.cents;
    const points = club.cents / 100;
    return {
      clubId: club.clubId,
      clubName: club.clubName,
      clubCode: club.clubCode,
      playersContributed: club.playerCount,
      points,
      pointsFormatted: points.toFixed(2),
      isRemainderWinner: club.gotExtra,
    };
  });

  const perPlayer = baseCents / 100;
  const explanation =
    `${sanitizedOriginal.toFixed(2)} pts earned by the team of ${n} player${n === 1 ? '' : 's'}: ` +
    `${perPlayer.toFixed(2)} pts per player${remainderCents > 0 ? ` (${remainderCents}¢ spare rotated between players)` : ''}. ` +
    `Credited to each player's club: ` +
    allocations.map((a) => `${a.clubName} ${a.pointsFormatted} (${a.playersContributed} player${a.playersContributed === 1 ? '' : 's'})`).join(', ') +
    '.';

  return {
    originalPoints: sanitizedOriginal,
    originalPointsFormatted: sanitizedOriginal.toFixed(2),
    totalPlayers: players.length,
    uniqueClubCount: clubs.length,
    basePointsPerClub: perPlayer, // now: points per player
    remainderCents,
    allocations,
    totalDistributed: distributedCentsSum / 100,
    isBalanced: distributedCentsSum === totalCents,
    explanation,
  };
}
