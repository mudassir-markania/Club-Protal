import { NextResponse } from '@/http/next-server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const team = await db.cricketTeam.findUnique({
      where: { id: params.id },
      include: {
        club: true,
      },
    });

    if (!team) {
      return NextResponse.json({ error: 'House team not found' }, { status: 404 });
    }

    return NextResponse.json(team);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth(['SUPER_ADMIN', 'ADMIN']);
    const body = await req.json();

    const existing = await db.cricketTeam.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'House team not found' }, { status: 404 });
    }

    const { name, captainName, status } = body;

    const updated = await db.cricketTeam.update({
      where: { id: params.id },
      data: {
        name: name !== undefined ? name : existing.name,
        captainName: captainName !== undefined ? captainName : existing.captainName,
        status: status !== undefined ? status : existing.status,
      },
      include: { club: true },
    });

    if (captainName !== undefined && existing.clubId) {
      const isTeamB =
        String(existing.id).endsWith('-b') ||
        String(existing._id).endsWith('-b') ||
        existing.name.endsWith(' B');
      if (isTeamB) {
        await db.club.update({
          where: { id: existing.clubId },
          data: { viceCaptainName: captainName.trim() },
        });
      } else {
        await db.club.update({
          where: { id: existing.clubId },
          data: { captainName: captainName.trim() },
        });
      }
    }

    await createAuditLog({
      user,
      action: 'UPDATE_CRICKET_TEAM',
      entity: 'CricketTeam',
      recordId: updated.id,
      previousValue: existing,
      updatedValue: updated,
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED' || error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth(['SUPER_ADMIN', 'ADMIN']);

    const team = await db.cricketTeam.findUnique({
      where: { id: params.id },
    });

    if (!team) {
      return NextResponse.json({ error: 'House team not found' }, { status: 404 });
    }

    await db.cricketTeam.delete({
      where: { id: params.id },
    });

    await createAuditLog({
      user,
      action: 'DELETE_CRICKET_TEAM',
      entity: 'CricketTeam',
      recordId: params.id,
      previousValue: team,
    });

    return NextResponse.json({ success: true, message: 'House team deleted successfully' });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED' || error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

