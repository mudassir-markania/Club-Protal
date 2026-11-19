import { db } from '@/lib/db';

/**
 * What a referee may see and act on:
 *  - every match of a sport the referee is assigned to (RefereeSport), plus
 *  - any match an admin assigned to them directly (MatchReferee).
 */
export async function getRefereeScope(refereeId: string) {
  const [sportRows, matchRows] = await Promise.all([
    db.refereeSport.findMany({ where: { refereeId } }),
    db.matchReferee.findMany({ where: { refereeId } }),
  ]);
  return {
    sportIds: Array.from(new Set<string>(sportRows.map((r: any) => r.sportId))),
    matchIds: Array.from(new Set<string>(matchRows.map((r: any) => r.matchId))),
  };
}

export async function canRefereeActOnMatch(refereeId: string | null | undefined, match: { id: string; sportId: string }) {
  if (!refereeId) return false;
  const scope = await getRefereeScope(refereeId);
  return scope.sportIds.includes(match.sportId) || scope.matchIds.includes(match.id);
}
