import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const player = await db.player.findUnique({
      where: { id: params.id },
      include: {
        club: true,
        performances: {
          include: {
            match: {
              include: {
                sport: true,
                venue: true,
              },
            },
            sport: true,
          },
        },
        sports: {
          include: {
            sport: true,
          },
        },
        matchParticipants: {
          include: {
            match: {
              include: {
                sport: true,
                venue: true,
              },
            },
          },
        },
      },
    });

    if (!player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    }

    return NextResponse.json(player);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth(['SUPER_ADMIN', 'ADMIN']);
    const body = await req.json();

    const existing = await db.player.findUnique({
      where: { id: params.id },
      include: { sports: true },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    }

    const {
      name,
      registrationId,
      email,
      phone,
      gender,
      age,
      clubId,
      teamName,
      status,
      paymentStatus,
      sportIds,
    } = body;

    const updated = await db.player.update({
      where: { id: params.id },
      data: {
        name: name !== undefined ? name : existing.name,
        registrationId: registrationId !== undefined ? registrationId : existing.registrationId,
        email: email !== undefined ? email.toLowerCase().trim() : existing.email,
        phone: phone !== undefined ? phone : existing.phone,
        gender: gender !== undefined ? gender : existing.gender,
        age: age !== undefined ? (age ? parseInt(age) : null) : existing.age,
        clubId: clubId !== undefined ? clubId : existing.clubId,
        teamName: teamName !== undefined ? teamName : existing.teamName,
        status: status !== undefined ? status : existing.status,
        paymentStatus: paymentStatus !== undefined ? paymentStatus : existing.paymentStatus,
      },
    });

    // Update sports if provided
    if (sportIds && Array.isArray(sportIds)) {
      await db.playerSport.deleteMany({
        where: { playerId: params.id },
      });

      for (const sId of sportIds) {
        await db.playerSport.create({
          data: {
            playerId: params.id,
            sportId: sId,
          },
        });
      }
    }

    const result = await db.player.findUnique({
      where: { id: params.id },
      include: { club: true, sports: { include: { sport: true } } },
    });

    await createAuditLog({
      user,
      action: 'UPDATE_PLAYER',
      entity: 'Player',
      recordId: params.id,
      previousValue: existing,
      updatedValue: result,
    });

    return NextResponse.json(result);
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

    const player = await db.player.findUnique({
      where: { id: params.id },
    });

    if (!player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    }

    await db.player.delete({
      where: { id: params.id },
    });

    await createAuditLog({
      user,
      action: 'DELETE_PLAYER',
      entity: 'Player',
      recordId: params.id,
      previousValue: player,
    });

    return NextResponse.json({ success: true, message: 'Player deleted successfully' });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED' || error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

