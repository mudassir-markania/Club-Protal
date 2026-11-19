import { db } from '@/lib/db';
import { assertPlayersEligible } from '@/lib/player-eligibility';
import { getScheduleConfig } from '@/lib/match-scheduling';

export type DoublesCategory = 'DOUBLES' | 'MIXED_DOUBLES';

export interface ValidatedDoublesTeam {
  error: string | null;
  clubIds: string[];
}

/**
 * Validate a doubles / mixed-doubles team. The two players may come from different clubs;
 * both must be registered for the sport. Clubs are derived from the players.
 */
export async function validateDoublesTeam(
  input: { name: unknown; sportId: unknown; category: unknown; playerIds: unknown },
  excludeTeamId?: string
): Promise<ValidatedDoublesTeam> {
  const fail = (error: string): ValidatedDoublesTeam => ({ error, clubIds: [] });
  const { name, sportId, category, playerIds } = input;

  if (typeof name !== 'string' || !name.trim()) return fail('Team name is required');
  if (typeof sportId !== 'string' || !sportId) return fail('Sport is required');
  if (category !== 'DOUBLES' && category !== 'MIXED_DOUBLES') return fail('Category must be DOUBLES or MIXED_DOUBLES');
  if (!Array.isArray(playerIds) || playerIds.filter(Boolean).length !== 2) return fail('A doubles team needs exactly 2 players');

  const ids = playerIds.filter(Boolean) as string[];
  if (ids[0] === ids[1]) return fail('A player cannot be added to the team twice');

  const sport = await db.sport.findUnique({ where: { id: sportId } });
  if (!sport) return fail('Sport not found');
  if (!getScheduleConfig(sport.name, sport.sportType).allowDoubles) return fail(`${sport.name} does not support doubles`);

  const eligibility = await assertPlayersEligible(ids, sportId, { sportName: sport.name });
  if (eligibility) return fail(eligibility);

  const players = await db.player.findMany({ where: { id: { in: ids } } });
  if (category === 'DOUBLES') {
    // Doubles are segregated: a team is either Men's (2 men) or Women's (2 women)
    const g = new Set(players.map((p: any) => String(p.gender || '').toUpperCase()));
    if (g.size !== 1 || !(g.has('MALE') || g.has('FEMALE'))) {
      return fail("A doubles team must be 2 men (Men's Doubles) or 2 women (Women's Doubles). Use Mixed Doubles for one of each");
    }
  }
  if (category === 'MIXED_DOUBLES') {
    const genders = players.map((p: any) => String(p.gender || '').toUpperCase()).sort();
    if (genders[0] !== 'FEMALE' || genders[1] !== 'MALE') return fail('A mixed doubles team needs one male and one female player');
  }

  const sameSport = await db.doublesTeam.findMany({ where: { sportId } });
  if (sameSport.some((t: any) => t.id !== excludeTeamId && t.name.trim().toLowerCase() === name.trim().toLowerCase())) {
    return fail('A doubles team with that name already exists for this sport');
  }
  return { error: null, clubIds: Array.from(new Set<string>(players.map((p: any) => p.clubId as string))) };
}

/** Attach clubs, sport and resolved players (with their club) to teams. */
export async function withDoublesRoster(teams: any[]) {
  const allIds = Array.from(new Set(teams.flatMap((t) => t.playerIds || [])));
  const [players, clubs, sports] = await Promise.all([
    allIds.length ? db.player.findMany({ where: { id: { in: allIds } } }) : [],
    db.club.findMany({}),
    db.sport.findMany({}),
  ]);
  return teams.map((t) => {
    const roster = (t.playerIds || [])
      .map((id: string) => players.find((p: any) => p.id === id))
      .filter(Boolean)
      .map((p: any) => {
        const c = clubs.find((x: any) => x.id === p.clubId);
        return { id: p.id, name: p.name, gender: p.gender, clubId: p.clubId, clubCode: c?.code, clubName: c?.name };
      });
    const clubIds: string[] = Array.from(new Set<string>(roster.map((p: any) => p.clubId)));
    // MALE / FEMALE for men's / women's doubles, MIXED for mixed doubles (null if an older team has mixed genders)
    const genders = new Set<string>(roster.map((p: any) => String(p.gender || '').toUpperCase()));
    const gender =
      t.category === 'MIXED_DOUBLES' ? 'MIXED' : genders.size === 1 ? Array.from(genders)[0] : null;
    return {
      ...t,
      gender,
      clubIds,
      clubs: clubIds.map((id) => clubs.find((c: any) => c.id === id)).filter(Boolean),
      club: clubs.find((c: any) => c.id === (clubIds[0] || t.clubId)) || null,
      sport: sports.find((s: any) => s.id === t.sportId) || null,
      players: roster,
    };
  });
}
