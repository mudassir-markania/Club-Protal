import { NextResponse } from '@/http/next-server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';

export async function GET() {
  try {
    const teams = await db.cricketTeam.findMany({
      include: {
        club: true,
        _count: {
          select: { participants: true },
        },
      },
      orderBy: [{ club: { name: 'asc' } }, { name: 'asc' }],
    });
    return NextResponse.json(teams);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuth(['SUPER_ADMIN', 'ADMIN']);
    const body = await req.json();

    const { name, clubId, captainName } = body;

    if (!name || !clubId) {
      return NextResponse.json({ error: 'Team name and parent club are required' }, { status: 400 });
    }

    const team = await db.cricketTeam.create({
      data: {
        name,
        clubId,
        captainName: captainName || null,
        status: 'ACTIVE',
      },
      include: { club: true },
    });

    await createAuditLog({
      user,
      action: 'CREATE_CRICKET_TEAM',
      entity: 'CricketTeam',
      recordId: team.id,
      updatedValue: { name, clubId },
    });

    return NextResponse.json(team, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

