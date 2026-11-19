import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';
import { validateBgmiTeam, withRoster } from '@/lib/bgmi-teams';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth(['SUPER_ADMIN', 'ADMIN']);
    const existing = await db.bgmiTeam.findUnique({ where: { id: params.id } });
    if (!existing) return NextResponse.json({ error: 'BGMI team not found' }, { status: 404 });

    const body = await req.json();
    const name = body.name ?? existing.name;
    const playerIds = body.playerIds ?? existing.playerIds;

    const v = await validateBgmiTeam(name, playerIds, params.id);
    if (v.error) return NextResponse.json({ error: v.error }, { status: 400 });

    const ids = playerIds.filter(Boolean);
    const first = await db.player.findUnique({ where: { id: ids[0] } });
    const updated = await db.bgmiTeam.update({
      where: { id: params.id },
      data: {
        name: name.trim(),
        clubId: first.clubId,
        clubIds: v.clubIds,
        playerIds: ids,
        status: body.status ?? existing.status,
      },
    });

    await createAuditLog({
      user,
      action: 'UPDATE_BGMI_TEAM',
      entity: 'BgmiTeam',
      recordId: params.id,
      previousValue: existing,
      updatedValue: updated,
    });

    return NextResponse.json((await withRoster([updated]))[0]);
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
    const team = await db.bgmiTeam.findUnique({ where: { id: params.id } });
    if (!team) return NextResponse.json({ error: 'BGMI team not found' }, { status: 404 });

    const inMatches = await db.matchParticipant.count({ where: { bgmiTeamId: params.id } });
    if (inMatches > 0) {
      return NextResponse.json(
        { error: `Team is used in ${inMatches} match${inMatches > 1 ? 'es' : ''}. Set it to INACTIVE instead of deleting.` },
        { status: 409 }
      );
    }

    await db.bgmiTeam.delete({ where: { id: params.id } });
    await createAuditLog({
      user,
      action: 'DELETE_BGMI_TEAM',
      entity: 'BgmiTeam',
      recordId: params.id,
      previousValue: team,
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED' || error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
