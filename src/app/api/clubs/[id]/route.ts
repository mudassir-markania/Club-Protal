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

    // Sync Captain as a Player in db.player
    if (captainName !== undefined && captainName.trim()) {
      const existingCaptainPlayer = await db.player.findFirst({
        where: {
          clubId: params.id,
          name: existing.captainName || captainName,
        },
      });
      if (existingCaptainPlayer) {
        await db.player.update({
          where: { id: existingCaptainPlayer.id },
          data: { name: captainName.trim() },
        });
      } else {
        await db.player.create({
          data: {
            name: captainName.trim(),
            clubId: params.id,
            status: 'APPROVED',
            registrationId: `REG-CAP-${params.id.slice(-4)}`,
          },
        });
      }
    }

    // Sync Vice Captain as a Player in db.player
    if (viceCaptainName !== undefined && viceCaptainName.trim()) {
      const existingVicePlayer = await db.player.findFirst({
        where: {
          clubId: params.id,
          name: existing.viceCaptainName || viceCaptainName,
        },
      });
      if (existingVicePlayer) {
        await db.player.update({
          where: { id: existingVicePlayer.id },
          data: { name: viceCaptainName.trim() },
        });
      } else {
        await db.player.create({
          data: {
            name: viceCaptainName.trim(),
            clubId: params.id,
            status: 'APPROVED',
            registrationId: `REG-VC-${params.id.slice(-4)}`,
          },
        });
      }
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
    const deletePlayers = new URL(req.url).searchParams.get('deletePlayers') === 'true';

    const club = await db.club.findUnique({ where: { id: params.id } });
    if (!club) {
      return NextResponse.json({ error: 'Club not found' }, { status: 404 });
    }

    // Matches: a club that has played / is scheduled is part of the competition record
    const matchEntries = await db.matchParticipant.count({ where: { clubId: params.id } });
    const matchPlayerEntries = await db.matchParticipantPlayer.count({ where: { clubId: params.id } });
    if (matchEntries > 0 || matchPlayerEntries > 0) {
      return NextResponse.json(
        { error: `Cannot delete "${club.name}": it or its players take part in scheduled/completed matches. Delete or reschedule those matches first.`, code: 'IN_MATCHES' },
        { status: 409 }
      );
    }

    const players = await db.player.findMany({ where: { clubId: params.id } });
    if (players.length > 0 && !deletePlayers) {
      return NextResponse.json(
        {
          error: `"${club.name}" has ${players.length} registered player(s). Deleting the club also deletes them.`,
          code: 'PLAYERS_EXIST',
          playerCount: players.length,
        },
        { status: 409 }
      );
    }

    // Players on BGMI / doubles teams must be removed from those teams first
    if (players.length > 0) {
      const ids = new Set<string>(players.map((p: any) => p.id));
      const [bgmiTeams, doublesTeams] = await Promise.all([db.bgmiTeam.findMany({}), db.doublesTeam.findMany({})]);
      const blocking = [...bgmiTeams, ...doublesTeams].filter((t: any) => (t.playerIds || []).some((pid: string) => ids.has(pid)));
      if (blocking.length > 0) {
        return NextResponse.json(
          {
            error: `Cannot delete "${club.name}": its players are on team(s) ${blocking.map((t: any) => `"${t.name}"`).join(', ')}. Edit or delete those teams first.`,
            code: 'IN_TEAMS',
          },
          { status: 409 }
        );
      }
      await db.playerSport.deleteMany({ where: { playerId: { in: Array.from(ids) } } });
      await db.player.deleteMany({ where: { clubId: params.id } });
    }

    // Club-owned records
    await db.cricketTeam.deleteMany({ where: { clubId: params.id } });
    await db.leaderboardEntry.deleteMany({ where: { clubId: params.id } });
    await db.club.delete({ where: { id: params.id } });

    await createAuditLog({
      user,
      action: 'DELETE_CLUB',
      entity: 'Club',
      recordId: params.id,
      previousValue: { ...club, playersDeleted: players.length },
    });

    return NextResponse.json({ success: true, message: 'Club deleted successfully', playersDeleted: players.length });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED' || error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
