import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const match = await db.match.findFirst({
      where: {
        OR: [{ id: params.id }, { matchCode: params.id }],
      },
      include: {
        sport: true,
        venue: true,
        participants: {
          include: {
            club: true,
            player: true,
            cricketTeam: true,
            players: {
              include: {
                player: true,
                club: true,
              },
            },
            distributions: {
              include: {
                allocations: {
                  include: { club: true },
                },
              },
            },
          },
        },
        referees: {
          include: {
            referee: true,
          },
        },
        results: {
          include: {
            referee: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        distributions: {
          include: {
            allocations: {
              include: { club: true },
            },
          },
        },
      },
    });

    if (!match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }

    let starPlayer = null;
    if (match.starPlayerId) {
      starPlayer = await db.player.findUnique({
        where: { id: match.starPlayerId },
        include: { club: true },
      });
    }

    // Collect all participating players for this match (strictly excluding unrelated clubs/players)
    const eligibleMap = new Map<string, any>();

    for (const p of match.participants || []) {
      const teamLabel = p.teamName || p.cricketTeam?.name || p.club?.name;

      // 1. Direct squad / multi-player athletes
      if (p.players && p.players.length > 0) {
        for (const mpp of p.players) {
          if (mpp.player) {
            const key = `${mpp.player.name.trim().toLowerCase()}_${mpp.clubId}`;
            if (!eligibleMap.has(key)) {
              eligibleMap.set(key, {
                id: mpp.player.id,
                name: mpp.player.name,
                clubId: mpp.clubId,
                clubName: mpp.club?.name || 'House',
                clubCode: mpp.club?.code,
                teamName: teamLabel,
              });
            }
          }
        }
      }
      // 2. Direct individual player entry
      else if (p.playerId) {
        const directPlayer =
          p.player ||
          (await db.player.findUnique({
            where: { id: p.playerId },
            include: { club: true },
          }));
        if (directPlayer) {
          const key = `${directPlayer.name.trim().toLowerCase()}_${directPlayer.clubId}`;
          if (!eligibleMap.has(key)) {
            eligibleMap.set(key, {
              id: directPlayer.id,
              name: directPlayer.name,
              clubId: directPlayer.clubId,
              clubName: directPlayer.club?.name || p.club?.name || 'House',
              clubCode: directPlayer.club?.code || p.club?.code,
              teamName: teamLabel,
            });
          }
        }
      }
      // 3. House / Cricket Team entry (fetch players registered under this club)
      else if (p.clubId) {
        const housePlayers = await db.player.findMany({
          where: { clubId: p.clubId, status: 'APPROVED' },
          include: { club: true },
        });
        for (const hp of housePlayers) {
          const key = `${hp.name.trim().toLowerCase()}_${hp.clubId}`;
          if (!eligibleMap.has(key)) {
            eligibleMap.set(key, {
              id: hp.id,
              name: hp.name,
              clubId: hp.clubId,
              clubName: hp.club?.name || p.club?.name || 'House',
              clubCode: hp.club?.code || p.club?.code,
              teamName: teamLabel,
            });
          }
        }
      }
    }

    const eligibleStarPlayers = Array.from(eligibleMap.values());

    return NextResponse.json({
      ...match,
      starPlayer,
      eligibleStarPlayers,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth();
    const body = await req.json();

    const match = await db.match.findFirst({
      where: {
        OR: [{ id: params.id }, { matchCode: params.id }],
      },
    });

    if (!match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }

    const { round, stageName, matchDate, matchTime, venueId, status, notes } = body;

    const updated = await db.match.update({
      where: { id: match.id },
      data: {
        round: round ?? match.round,
        stageName: stageName !== undefined ? stageName : match.stageName,
        matchDate: matchDate ?? match.matchDate,
        matchTime: matchTime ?? match.matchTime,
        venueId: venueId !== undefined ? venueId : match.venueId,
        status: status ?? match.status,
        notes: notes !== undefined ? notes : match.notes,
      },
    });

    await createAuditLog({
      user,
      action: 'UPDATE_MATCH',
      entity: 'Match',
      recordId: match.id,
      previousValue: match,
      updatedValue: updated,
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth(['SUPER_ADMIN', 'ADMIN']);

    const match = await db.match.findFirst({
      where: {
        OR: [{ id: params.id }, { matchCode: params.id }],
      },
    });

    if (!match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }

    await db.match.delete({ where: { id: match.id } });

    await createAuditLog({
      user,
      action: 'DELETE_MATCH',
      entity: 'Match',
      recordId: match.id,
      previousValue: match,
    });

    return NextResponse.json({ success: true, message: 'Match deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
