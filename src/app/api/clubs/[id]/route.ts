import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const club = await db.club.findUnique({
      where: { id: params.id },
      include: {
        players: {
          include: {
            sports: {
              include: {
                sport: true,
              },
            },
          },
        },
        pointsHistory: {
          orderBy: { recordedAt: 'desc' },
          include: {
            sport: true,
          },
        },
        leaderboardEntries: true,
      },
    });

    if (!club) {
      return NextResponse.json({ error: 'Club not found' }, { status: 404 });
    }

    return NextResponse.json(club);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth(['SUPER_ADMIN', 'ADMIN']);
    const body = await req.json();

    const existing = await db.club.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Club not found' }, { status: 404 });
    }

    const { name, code, logoUrl, captainName, viceCaptainName, status, team1Name, team2Name } = body;

    const updated = await db.club.update({
      where: { id: params.id },
      data: {
        name: name !== undefined ? name : existing.name,
        code: code !== undefined && code !== '' ? code.toUpperCase() : existing.code,
        logoUrl: logoUrl !== undefined ? logoUrl : existing.logoUrl,
        captainName: captainName !== undefined ? captainName : existing.captainName,
        viceCaptainName: viceCaptainName !== undefined ? viceCaptainName : existing.viceCaptainName,
        status: status !== undefined ? status : existing.status,
      },
    });

    // Also sync 1st team (led by House Captain) and 2nd team (led by House Vice Captain)
    const teams = await db.cricketTeam.findMany({
      where: {
        OR: [{ clubId: params.id }, { clubId: existing.id }],
      },
      orderBy: { name: 'asc' },
    });

    const team1 = teams.find((t: any) => String(t.id).endsWith('-a') || String(t._id).endsWith('-a')) || teams[0];
    const team2 = teams.find((t: any) => String(t.id).endsWith('-b') || String(t._id).endsWith('-b')) || teams[1];

    if (team1) {
      const updateData: any = {};
      if (team1Name) updateData.name = team1Name.trim();
      if (captainName !== undefined) updateData.captainName = captainName.trim();
      if (Object.keys(updateData).length > 0) {
        await db.cricketTeam.update({
          where: { id: team1.id },
          data: updateData,
        });
      }
    } else if (team1Name) {
      await db.cricketTeam.create({
        data: {
          name: team1Name.trim(),
          clubId: params.id,
          captainName: captainName ? captainName.trim() : null,
          status: 'ACTIVE',
        },
      });
    }

    if (team2) {
      const updateData: any = {};
      if (team2Name) updateData.name = team2Name.trim();
      if (viceCaptainName !== undefined) updateData.captainName = viceCaptainName.trim();
      if (Object.keys(updateData).length > 0) {
        await db.cricketTeam.update({
          where: { id: team2.id },
          data: updateData,
        });
      }
    } else if (team2Name) {
      await db.cricketTeam.create({
        data: {
          name: team2Name.trim(),
          clubId: params.id,
          captainName: viceCaptainName ? viceCaptainName.trim() : null,
          status: 'ACTIVE',
        },
      });
    }

    await createAuditLog({
      user,
      action: 'UPDATE_CLUB',
      entity: 'Club',
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

    const club = await db.club.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            players: true,
            matchParticipants: true,
          },
        },
      },
    });

    if (!club) {
      return NextResponse.json({ error: 'Club not found' }, { status: 404 });
    }

    // Check dependency safety
    if (club._count.matchParticipants > 0) {
      return NextResponse.json(
        { error: `Cannot delete club because it is already participating in ${club._count.matchParticipants} scheduled/completed matches.` },
        { status: 400 }
      );
    }

    await db.club.delete({
      where: { id: params.id },
    });

    await createAuditLog({
      user,
      action: 'DELETE_CLUB',
      entity: 'Club',
      recordId: params.id,
      previousValue: club,
    });

    return NextResponse.json({ success: true, message: 'Club deleted successfully' });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED' || error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

