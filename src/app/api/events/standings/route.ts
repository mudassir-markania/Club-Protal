import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { EVENT_SCORED_SPORTS, isValidEventCategory, buildAwards, computeStandings, eventKeyOf } from '@/lib/event-standings';
import { normalizeSportKey } from '@/lib/sports-rules';

/**
 * GET ?sportId=&category=
 * Standings of one Badminton / Carrom event (built from recorded match winners), the points the top 3 would earn,
 * and the finalized result if the event was already finalized.
 */
export async function GET(req: Request) {
  try {
    await requireAuth(['SUPER_ADMIN', 'ADMIN']);
    const { searchParams } = new URL(req.url);
    const sportId = searchParams.get('sportId') || '';
    const category = searchParams.get('category') || '';

    const sport = sportId ? await db.sport.findUnique({ where: { id: sportId } }) : null;
    if (!sport) return NextResponse.json({ error: 'Sport not found' }, { status: 404 });
    if (!EVENT_SCORED_SPORTS.includes(normalizeSportKey(sport.name) || '')) {
      return NextResponse.json({ error: `${sport.name} is scored per match, not by event standings` }, { status: 400 });
    }
    if (!isValidEventCategory(sport.name, category)) return NextResponse.json({ error: 'Invalid event category' }, { status: 400 });

    const standings = await computeStandings(sportId, category);
    const awards = await buildAwards(sport, category, standings);
    const finalized = await db.eventResult.findUnique({ where: { eventKey: eventKeyOf(sportId, category) } });

    const matches = await db.match.findMany({ where: { sportId, matchCategory: category } });
    return NextResponse.json({
      sport: { id: sport.id, name: sport.name },
      category,
      standings: standings.map(({ contributions, ...row }) => row),
      matchCount: matches.length,
      completedCount: matches.filter((m: any) => m.status === 'COMPLETED').length,
      pointsByPosition: awards.map((a) => ({ position: a.position, points: a.points })),
      finalized: finalized
        ? { finalizedAt: finalized.finalizedAt, placements: JSON.parse(finalized.placements) }
        : null,
    });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED' || error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
