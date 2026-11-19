import { db } from '@/lib/db';
import { BGMI_TEAM_SIZE } from '@club-portal/shared';
import { assertPlayersEligible, findSportByName } from '@/lib/player-eligibility';

export interface ValidatedTeam {
  error: string | null;
  clubIds: string[]; // distinct clubs of the team's players (derived, never trusted from the client)
}

/**
 * Validate a BGMI team payload. Players may come from several clubs; each must be registered for BGMI.
 * Club membership is derived from the players themselves.
 */
export async function validateBgmiTeam(name: unknown, playerIds: unknown, excludeTeamId?: string): Promise<ValidatedTeam> {
  const fail = (error: string): ValidatedTeam => ({ error, clubIds: [] });

  if (typeof name !== 'string' || !name.trim()) return fail('Team name is required');
  if (!Array.isArray(playerIds)) {
    return fail('Player list is required');
  }
  const ids = playerIds.filter(Boolean) as string[];
  if (ids.length < 1) {
    return fail('A BGMI team requires at least 1 player');
  }
  if (ids.length > BGMI_TEAM_SIZE) {
    return fail(`A BGMI team cannot exceed ${BGMI_TEAM_SIZE} players`);
  }
  if (new Set(ids).size !== ids.length) return fail('A player cannot be added to the team twice');

  const bgmi = await findSportByName('BGMI');
  if (!bgmi) return fail('BGMI sport is not configured');
  const eligibility = await assertPlayersEligible(ids, bgmi.id, { sportName: 'BGMI' });
  if (eligibility) return fail(eligibility);

  const players = await db.player.findMany({ where: { id: { in: ids } } });
  const clubIds = Array.from(new Set<string>(players.map((p: any) => p.clubId as string)));

  const all = await db.bgmiTeam.findMany({});
  if (all.some((t: any) => t.id !== excludeTeamId && t.name.trim().toLowerCase() === name.trim().toLowerCase())) {
    return fail('A BGMI team with that name already exists');
  }
  return { error: null, clubIds };
}

/** Attach clubs and resolved players (with their club) to teams. Older single-club teams are handled too. */
export async function withRoster(teams: any[]) {
  const allIds = Array.from(new Set(teams.flatMap((t) => t.playerIds || [])));
  const [players, clubs] = await Promise.all([
    allIds.length ? db.player.findMany({ where: { id: { in: allIds } } }) : [],
    db.club.findMany({}),
  ]);
  return teams.map((t) => {
    const roster = (t.playerIds || [])
      .map((id: string) => players.find((p: any) => p.id === id))
      .filter(Boolean)
      .map((p: any) => {
        const c = clubs.find((x: any) => x.id === p.clubId);
        return { id: p.id, name: p.name, clubId: p.clubId, clubCode: c?.code, clubName: c?.name };
      });
    const clubIds: string[] = Array.from(new Set<string>(roster.map((p: any) => p.clubId)));
    return {
      ...t,
      clubIds,
      clubs: clubIds.map((id) => clubs.find((c: any) => c.id === id)).filter(Boolean),
      club: clubs.find((c: any) => c.id === (clubIds[0] || t.clubId)) || null,
      players: roster,
    };
  });
}
