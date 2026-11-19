import { db } from '@/lib/db';

/**
 * Server-side rules for Club -> Players -> Sports.
 *  - A player belongs to exactly one club (Player.clubId).
 *  - A player participates in one or more sports (PlayerSport rows).
 *  - Eligible players for (club, sport) = players of that club with a PlayerSport row for that sport.
 */

/** Validate a sportIds payload. Returns { ids } (deduped) or { error }. */
export async function validateSportIds(sportIds: unknown, opts: { requireAtLeastOne: boolean }) {
  if (!Array.isArray(sportIds)) {
    return opts.requireAtLeastOne ? { error: 'Select at least one participating sport' } : { ids: null as string[] | null };
  }
  const ids = Array.from(new Set(sportIds.filter((s) => typeof s === 'string' && s))) as string[];
  if (opts.requireAtLeastOne && ids.length === 0) return { error: 'Select at least one participating sport' };
  if (ids.length === 0) return { ids };

  const found = await db.sport.findMany({ where: { id: { in: ids } } });
  if (found.length !== ids.length) return { error: 'One or more selected sports do not exist' };
  const inactive = found.find((s: any) => s.status && s.status !== 'ACTIVE');
  if (inactive) return { error: `Sport "${inactive.name}" is not active` };
  return { ids };
}

/** IDs of players registered for a sport (optionally restricted to one club). */
export async function eligiblePlayerIds(sportId: string, clubId?: string | null): Promise<string[]> {
  const rows = await db.playerSport.findMany({ where: { sportId } });
  let ids: string[] = Array.from(new Set(rows.map((r: any) => r.playerId as string)));
  if (clubId && ids.length) {
    const inClub = await db.player.findMany({ where: { id: { in: ids }, clubId } });
    ids = inClub.map((p: any) => p.id);
  }
  return ids;
}

/**
 * Every player must exist and be registered for the sport (and belong to clubId when given).
 * Returns an error message or null.
 */
export async function assertPlayersEligible(
  playerIds: string[],
  sportId: string,
  opts: { clubId?: string; sportName?: string } = {}
): Promise<string | null> {
  const ids = Array.from(new Set(playerIds.filter(Boolean)));
  if (ids.length === 0) return null;

  const players = await db.player.findMany({ where: { id: { in: ids } } });
  if (players.length !== ids.length) return 'One or more selected players no longer exist';

  if (opts.clubId) {
    const wrong = players.find((p: any) => p.clubId !== opts.clubId);
    if (wrong) return `${wrong.name} does not belong to the selected club`;
  }

  const regs = await db.playerSport.findMany({ where: { sportId, playerId: { in: ids } } });
  const registered = new Set(regs.map((r: any) => r.playerId));
  const missing = players.find((p: any) => !registered.has(p.id));
  if (missing) {
    return `${missing.name} is not registered for ${opts.sportName || 'this sport'}`;
  }
  return null;
}

/** Sports a club takes part in (derived from its players' registrations) with player counts. */
export async function clubSportsSummary(clubId: string) {
  const players = await db.player.findMany({ where: { clubId } });
  const playerIds = players.map((p: any) => p.id);
  if (playerIds.length === 0) return [];

  const regs = await db.playerSport.findMany({ where: { playerId: { in: playerIds } } });
  const counts = new Map<string, number>();
  regs.forEach((r: any) => counts.set(r.sportId, (counts.get(r.sportId) || 0) + 1));

  const sports = await db.sport.findMany({ where: { id: { in: Array.from(counts.keys()) } } });
  return sports
    .map((s: any) => ({ id: s.id, name: s.name, category: s.category, playerCount: counts.get(s.id) || 0 }))
    .sort((a: any, b: any) => a.name.localeCompare(b.name));
}

/** The BGMI sport record (matched by name), if configured. */
export async function findSportByName(name: string) {
  const all = await db.sport.findMany({});
  return all.find((s: any) => (s.name || '').trim().toUpperCase() === name.toUpperCase()) || null;
}
