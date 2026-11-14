import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');
    const clubId = searchParams.get('clubId');
    const sportId = searchParams.get('sportId');
    const status = searchParams.get('status');

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { registrationId: { contains: search } },
      ];
    }

    if (clubId) {
      where.clubId = clubId;
    }

    if (status) {
      where.status = status;
    }

    if (sportId) {
      where.sports = {
        some: {
          sportId,
        },
      };
    }

    const players = await prisma.player.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        club: true,
        sports: {
          include: {
            sport: true,
          },
        },
      },
    });

    return NextResponse.json(players);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuth(['SUPER_ADMIN', 'ADMIN']);
    const body = await req.json();

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

    if (!name || !email || !clubId) {
      return NextResponse.json({ error: 'Name, Email, and Club are required' }, { status: 400 });
    }

    // Auto generate registration ID if not provided
    const regId = registrationId || `REG-${Date.now().toString().slice(-6)}`;

    // Check duplicate
    const existing = await prisma.player.findFirst({
      where: {
        OR: [{ registrationId: regId }, { email: email.toLowerCase().trim() }],
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'A player with this Registration ID or Email already exists' },
        { status: 409 }
      );
    }

    const player = await prisma.player.create({
      data: {
        name,
        registrationId: regId,
        email: email.toLowerCase().trim(),
        phone,
        gender: gender || 'MALE',
        age: age ? parseInt(age) : null,
        clubId,
        teamName,
        status: status || 'APPROVED',
        paymentStatus: paymentStatus || 'PAID',
      },
    });

    // Assign sports
    if (sportIds && Array.isArray(sportIds)) {
      for (const sId of sportIds) {
        await prisma.playerSport.create({
          data: {
            playerId: player.id,
            sportId: sId,
          },
        });
      }
    }

    const created = await prisma.player.findUnique({
      where: { id: player.id },
      include: {
        club: true,
        sports: { include: { sport: true } },
      },
    });

    await createAuditLog({
      user,
      action: 'CREATE_PLAYER',
      entity: 'Player',
      recordId: player.id,
      updatedValue: created,
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED' || error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

