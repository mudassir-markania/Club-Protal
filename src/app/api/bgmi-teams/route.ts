import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';
import { validateBgmiTeam, withRoster } from '@/lib/bgmi-teams';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const clubId = searchParams.get('clubId');
    let teams = await db.bgmiTeam.findMany({ orderBy: { name: 'asc' } });
    // a team belongs to every club that has a player on it
    if (clubId) teams = teams.filter((t: any) => (t.clubIds?.length ? t.clubIds : [t.clubId]).includes(clubId));
    return NextResponse.json(await withRoster(teams));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuth(['SUPER_ADMIN', 'ADMIN']);
    const { name, playerIds } = await req.json();

    const v = await validateBgmiTeam(name, playerIds);
    if (v.error) return NextResponse.json({ error: v.error }, { status: 400 });

    const ids = playerIds.filter(Boolean);
    const first = await db.player.findUnique({ where: { id: ids[0] } });
    const team = await db.bgmiTeam.create({
      data: { name: name.trim(), clubId: first.clubId, clubIds: v.clubIds, playerIds: ids, status: 'ACTIVE' },
    });

    await createAuditLog({
      user,
      action: 'CREATE_BGMI_TEAM',
      entity: 'BgmiTeam',
      recordId: team.id,
      updatedValue: { name, clubIds: v.clubIds, playerIds },
    });

    return NextResponse.json((await withRoster([team]))[0], { status: 201 });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED' || error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
