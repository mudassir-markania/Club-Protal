import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';
import { recalculateAllLeaderboards } from '@/lib/scoring';
import { EVENT_SCORED_SPORTS, isValidEventCategory, buildAwards, computeStandings, eventKeyOf, eventLabel } from '@/lib/event-standings';
import { normalizeSportKey } from '@/lib/sports-rules';

async function loadEvent(sportId: string, category: string) {
  const sport = sportId ? await db.sport.findUnique({ where: { id: sportId } }) : null;
  if (!sport) return { error: NextResponse.json({ error: 'Sport not found' }, { status: 404 }) };
  if (!EVENT_SCORED_SPORTS.includes(normalizeSportKey(sport.name) || '')) {
    return { error: NextResponse.json({ error: `${sport.name} is scored per match, not by event standings` }, { status: 400 }) };
  }
  if (!isValidEventCategory(sport.name, category)) return { error: NextResponse.json({ error: 'Invalid event category' }, { status: 400 }) };
  return { sport };
}

/** Remove the points an event awarded (history rows + stored result). */
async function clearEvent(tx: any, eventKey: string) {
  await tx.pointsHistory.deleteMany({ where: { eventKey } });
  await tx.eventResult.deleteMany({ where: { eventKey } });
}

/**
 * POST { sportId, category, placements?: [key1, key2, key3] }
 * Awards the 1st / 2nd / 3rd place points of the scoring rules for this event. Placements default to the top 3 of the
 * standings; send explicit keys to settle a tie. Finalizing again replaces the earlier awards.
 */
export async function POST(req: Request) {
  try {
    const user = await requireAuth(['SUPER_ADMIN', 'ADMIN']);
    const { sportId, category, placements } = await req.json();

    const loaded = await loadEvent(sportId, category);
    if ('error' in loaded) return loaded.error;
    const { sport } = loaded;

    const standings = await computeStandings(sportId, category);
    if (!standings.some((s) => s.played > 0)) {
      return NextResponse.json({ error: 'No completed matches in this event yet. Record match winners first.' }, { status: 400 });
    }

    // order: explicit placements (to settle ties) or the standings order
    let ordered = standings;
    if (Array.isArray(placements) && placements.length) {
      const keys: string[] = placements.filter(Boolean);
      if (new Set(keys).size !== keys.length) return NextResponse.json({ error: 'A player or team cannot take two places' }, { status: 400 });
      const picked = keys.map((k) => standings.find((s) => s.key === k));
      if (picked.some((p) => !p)) return NextResponse.json({ error: 'One of the selected placements is not in this event' }, { status: 400 });
      ordered = [...(picked as typeof standings), ...standings.filter((s) => !keys.includes(s.key))];
    }

    const awards = await buildAwards(sport, category, ordered);
    if (awards.every((a) => a.points <= 0)) {
      return NextResponse.json(
        { error: `No scoring rule awards points for 1st/2nd/3rd place in ${eventLabel(sport.name, category)}. Add or restore the rules under Scoring Rules.`, code: 'NO_RULE' },
        { status: 400 }
      );
    }

    const eventKey = eventKeyOf(sportId, category);
    const stored = awards.map((a) => ({
      position: a.position,
      key: a.row.key,
      name: a.row.name,
      points: a.points,
      clubs: a.split.allocations.map((c) => ({ clubId: c.clubId, clubName: c.clubName, clubCode: c.clubCode, points: c.points })),
    }));

    await db.$transaction(async (tx: any) => {
      await clearEvent(tx, eventKey);
      for (const a of awards) {
        for (const alloc of a.split.allocations) {
          if (alloc.points <= 0) continue;
          await tx.pointsHistory.create({
            data: {
              clubId: alloc.clubId,
              sportId,
              eventKey,
              points: alloc.points,
              reason: `${eventLabel(sport.name, category)} - ${['1st', '2nd', '3rd'][a.position - 1]} place: ${a.row.name} (${alloc.points.toFixed(2)} pts of ${a.points.toFixed(2)} pts across ${a.split.uniqueClubCount} unique club${a.split.uniqueClubCount === 1 ? '' : 's'})`,
              recordedByUserId: user.id,
            },
          });
        }
      }
      await tx.eventResult.create({
        data: { eventKey, sportId, category, placements: JSON.stringify(stored), finalizedByUserId: user.id, finalizedAt: new Date() },
      });
    });

    await recalculateAllLeaderboards();
    await createAuditLog({ user, action: 'FINALIZE_EVENT', entity: 'EventResult', recordId: eventKey, updatedValue: stored });

    return NextResponse.json({
      success: true,
      message: `${eventLabel(sport.name, category)} finalized. Placement points were credited to the clubs and the leaderboard updated.`,
      placements: stored,
    });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED' || error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error('Finalize event error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/** DELETE ?sportId=&category= : undo a finalized event (removes its points). */
export async function DELETE(req: Request) {
  try {
    const user = await requireAuth(['SUPER_ADMIN', 'ADMIN']);
    const { searchParams } = new URL(req.url);
    const sportId = searchParams.get('sportId') || '';
    const category = searchParams.get('category') || '';

    const loaded = await loadEvent(sportId, category);
    if ('error' in loaded) return loaded.error;

    const eventKey = eventKeyOf(sportId, category);
    const existing = await db.eventResult.findUnique({ where: { eventKey } });
    if (!existing) return NextResponse.json({ error: 'This event has not been finalized' }, { status: 409 });

    await db.$transaction(async (tx: any) => clearEvent(tx, eventKey));
    await recalculateAllLeaderboards();
    await createAuditLog({ user, action: 'UNDO_FINALIZE_EVENT', entity: 'EventResult', recordId: eventKey, previousValue: existing });

    return NextResponse.json({ success: true, message: 'Event result undone. Its points were removed and the leaderboard updated.' });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED' || error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
