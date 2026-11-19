import { NextResponse } from '@/http/next-server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';
import { validateDoublesTeam, withDoublesRoster } from '@/lib/doubles-teams';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const where: any = {};
    for (const key of ['sportId', 'category']) {
      const v = searchParams.get(key);
      if (v) where[key] = v;
    }
    let teams = await db.doublesTeam.findMany({ where, orderBy: { name: 'asc' } });
    const clubId = searchParams.get('clubId');
    if (clubId) teams = teams.filter((t: any) => (t.clubIds?.length ? t.clubIds : [t.clubId]).includes(clubId));
    let result = await withDoublesRoster(teams);
    // ?gender=MALE|FEMALE|MIXED -> men's / women's / mixed doubles
    const gender = (searchParams.get('gender') || '').toUpperCase();
    if (gender) result = result.filter((t: any) => t.gender === gender);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuth(['SUPER_ADMIN', 'ADMIN']);
    const body = await req.json();
    const { name, sportId, category, playerIds } = body;

    const v = await validateDoublesTeam({ name, sportId, category, playerIds });
    if (v.error) return NextResponse.json({ error: v.error }, { status: 400 });

    const ids = playerIds.filter(Boolean);
    const first = await db.player.findUnique({ where: { id: ids[0] } });
    const team = await db.doublesTeam.create({
      data: { name: name.trim(), clubId: first.clubId, clubIds: v.clubIds, sportId, category, playerIds: ids, status: 'ACTIVE' },
    });
    await createAuditLog({ user, action: 'CREATE_DOUBLES_TEAM', entity: 'DoublesTeam', recordId: team.id, updatedValue: body });
    return NextResponse.json((await withDoublesRoster([team]))[0], { status: 201 });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED' || error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
