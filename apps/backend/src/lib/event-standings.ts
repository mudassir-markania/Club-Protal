import { db } from '@/lib/db';
import { calculateClubPointsDistribution, PlayerContribution } from '@club-portal/shared';
import { getSportRules } from '@/lib/sports-rules-server';
import { toEffectiveRule, findRuleForTrigger, RuleTrigger } from '@club-portal/shared';
import { categoryDisplayName, categoryRules, getScheduleConfig } from '@club-portal/shared';

/** An event category is valid when it is one of the sport's categories (Badminton formats, Chess Classical, ...). */
export const isValidEventCategory = (sportName: string, category: string) =>
  !!categoryRules(category) || getScheduleConfig(sportName).categories.some((c) => c.code === category);

/** Sports whose points come from event standings (1st / 2nd / 3rd), not from individual matches. */
export const EVENT_SCORED_SPORTS = ['BADMINTON', 'CARROM', 'CHESS'];

export const eventKeyOf = (sportId: string, category: string) => `${sportId}|${category}`;

export interface StandingRow {
  key: string; // identity of the player / doubles team
  name: string;
  clubs: { id: string; name: string; code?: string }[];
  played: number;
  wins: number;
  losses: number;
  rank: number;
  tied: boolean; // shares wins and losses with a neighbour
  contributions: PlayerContribution[]; // players and their clubs (used for the equal split)
}

const PLACE_TRIGGERS: RuleTrigger[] = ['PLACE_1', 'PLACE_2', 'PLACE_3'];

/**
 * Standings for one event (sport + category), built from the winners recorded on completed matches.
 * Sorted by wins (most first), then losses (fewest first), then name.
 */
export async function computeStandings(sportId: string, category: string): Promise<StandingRow[]> {
  const matches = await db.match.findMany({
    where: { sportId, matchCategory: category },
    include: {
      participants: {
        include: { club: true, player: true, players: { include: { player: true, club: true } } },
      },
    },
  });

  const rows = new Map<string, StandingRow>();

  const identity = (p: any) => (p.doublesTeamId ? `D:${p.doublesTeamId}` : p.playerId ? `P:${p.playerId}` : `E:${p.id}`);

  for (const m of matches) {
    const completed = m.status === 'COMPLETED';
    for (const p of m.participants || []) {
      const key = identity(p);
      let row = rows.get(key);
      if (!row) {
        const contributions: PlayerContribution[] = (p.players || []).map((mpp: any) => ({
          playerId: mpp.playerId,
          playerName: mpp.player?.name,
          clubId: mpp.clubId,
          clubName: mpp.club?.name || 'Club',
          clubCode: mpp.club?.code,
        }));
        const clubMap = new Map<string, { id: string; name: string; code?: string }>();
        contributions.forEach((c) => clubMap.set(c.clubId, { id: c.clubId, name: c.clubName, code: c.clubCode }));
        row = {
          key,
          name: p.teamName || p.player?.name || p.club?.name || 'Entry',
          clubs: Array.from(clubMap.values()),
          played: 0,
          wins: 0,
          losses: 0,
          rank: 0,
          tied: false,
          contributions,
        };
        rows.set(key, row);
      }
      if (completed) {
        row.played += 1;
        if (p.isWinner) row.wins += 1;
        else row.losses += 1;
      }
    }
  }

  const list = Array.from(rows.values()).sort(
    (a, b) => b.wins - a.wins || a.losses - b.losses || a.name.localeCompare(b.name)
  );
  list.forEach((r, i) => {
    r.rank = i + 1;
    const prev = list[i - 1];
    const next = list[i + 1];
    r.tied =
      (!!prev && prev.wins === r.wins && prev.losses === r.losses) || (!!next && next.wins === r.wins && next.losses === r.losses);
  });
  return list;
}

/** Points the rules award for a finishing position in this event (0 when no rule exists). */
export async function placePoints(sportName: string, category: string, position: 1 | 2 | 3, teamCount: number) {
  const rules = (await getSportRules(sportName)).map(toEffectiveRule);
  return findRuleForTrigger(rules, PLACE_TRIGGERS[position - 1], category, teamCount)?.points ?? 0;
}

/** Points each of the top 3 placements would earn, with the equal split across their unique clubs. */
export async function buildAwards(sport: any, category: string, ordered: StandingRow[]) {
  const awards = [];
  for (let i = 0; i < Math.min(3, ordered.length); i++) {
    const row = ordered[i];
    const points = await placePoints(sport.name, category, (i + 1) as 1 | 2 | 3, ordered.length);
    const split = calculateClubPointsDistribution(points, row.contributions, 0);
    awards.push({ position: i + 1, row, points, split });
  }
  return awards;
}

export const eventLabel = (sportName: string, category: string) => `${sportName} ${categoryDisplayName(category)}`;
