import { NextResponse } from '@/http/next-server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';
import { validateDoublesTeam, withDoublesRoster } from '@/lib/doubles-teams';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth(['SUPER_ADMIN', 'ADMIN']);
    const existing = await db.doublesTeam.findUnique({ where: { id: params.id } });
    if (!existing) return NextResponse.json({ error: 'Doubles team not found' }, { status: 404 });

    const body = await req.json();
    const merged = {
      name: body.name ?? existing.name,
      sportId: body.sportId ?? existing.sportId,
      category: body.category ?? existing.category,
      playerIds: body.playerIds ?? existing.playerIds,
    };
    const v = await validateDoublesTeam(merged, params.id);
    if (v.error) return NextResponse.json({ error: v.error }, { status: 400 });

    const ids = merged.playerIds.filter(Boolean);
    const first = await db.player.findUnique({ where: { id: ids[0] } });
    const updated = await db.doublesTeam.update({
      where: { id: params.id },
      data: {
        name: merged.name.trim(),
        clubId: first.clubId,
        clubIds: v.clubIds,
        sportId: merged.sportId,
        category: merged.category,
        playerIds: ids,
        status: body.status ?? existing.status,
      },
    });
    await createAuditLog({ user, action: 'UPDATE_DOUBLES_TEAM', entity: 'DoublesTeam', recordId: params.id, previousValue: existing, updatedValue: updated });
    return NextResponse.json((await withDoublesRoster([updated]))[0]);
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED' || error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth(['SUPER_ADMIN', 'ADMIN']);
    const team = await db.doublesTeam.findUnique({ where: { id: params.id } });
    if (!team) return NextResponse.json({ error: 'Doubles team not found' }, { status: 404 });

    await db.doublesTeam.delete({ where: { id: params.id } });
    await createAuditLog({ user, action: 'DELETE_DOUBLES_TEAM', entity: 'DoublesTeam', recordId: params.id, previousValue: team });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED' || error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
