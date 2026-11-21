import { NextResponse } from '@/http/next-server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';
import { validateSportIds, eligiblePlayerIds } from '@/lib/player-eligibility';
import { getCached, setCached, clearCache } from '@/lib/cache';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');
    const clubId = searchParams.get('clubId');
    const sportId = searchParams.get('sportId');
    const status = searchParams.get('status');

    const cacheKey = `players:${req.url}`;
    const cached = getCached(cacheKey);
    if (cached) return NextResponse.json(cached);

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
      // Club + Sport -> eligible players, resolved in the database via PlayerSport rows
      const ids = await eligiblePlayerIds(sportId, clubId);
      if (ids.length === 0) return NextResponse.json([]);
      where.id = { in: ids };
    }

    const players = await db.player.findMany({
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

    setCached(cacheKey, players, 30);
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

    if (!name || !clubId) {
      return NextResponse.json({ error: 'Participant Name and Assigned Club/House are required' }, { status: 400 });
    }

    const club = await db.club.findUnique({ where: { id: clubId } });
    if (!club) {
      return NextResponse.json({ error: 'Selected club does not exist' }, { status: 400 });
    }

    const sportCheck = await validateSportIds(sportIds, { requireAtLeastOne: true });
    if ('error' in sportCheck) {
      return NextResponse.json({ error: sportCheck.error }, { status: 400 });
    }

    // Auto generate unique registration ID and internal identifier email if not provided
    const cleanName = typeof name === 'string' ? name.trim() : '';
    const nameSlug = cleanName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'athlete';
    const uniqueSuffix = `${Date.now().toString().slice(-5)}${Math.floor(100 + Math.random() * 900)}`;
    const regId = (registrationId && registrationId.trim()) || `REG-${uniqueSuffix}`;
    const cleanEmail = (email && email.trim()?.toLowerCase()) || `${nameSlug}.${uniqueSuffix}@apl.internal`;

    // Check duplicate
    const existing = await db.player.findFirst({
      where: email
        ? { OR: [{ registrationId: regId }, { email: cleanEmail }] }
        : { name: { equals: cleanName, mode: 'insensitive' }, clubId },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'An athlete with this name in this house already exists' },
        { status: 409 }
      );
    }

    const player = await db.player.create({
      data: {
        name: cleanName,
        registrationId: regId,
        email: cleanEmail,
        phone: phone || null,
        gender: gender || 'MALE',
        age: age ? parseInt(age) : 22,
        clubId,
        teamName,
        status: status || 'APPROVED',
        paymentStatus: paymentStatus || 'PAID',
      },
    });

    // Assign sports
    if (sportCheck.ids) {
      for (const sId of sportCheck.ids) {
        await db.playerSport.create({
          data: {
            playerId: player.id,
            sportId: sId,
          },
        });
      }
    }

    const created = await db.player.findUnique({
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

    clearCache('players');
    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED' || error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await requireAuth(['SUPER_ADMIN', 'ADMIN']);

    const { count } = await db.player.deleteMany({});
    if (db.playerSport) {
      await db.playerSport.deleteMany({});
    }

    await createAuditLog({
      user,
      action: 'DELETE_ALL_PLAYERS',
      entity: 'Player',
      recordId: 'ALL',
      previousValue: { deletedCount: count },
    });

    clearCache('players');
    return NextResponse.json({ success: true, message: `Successfully deleted ${count} players`, count });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED' || error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

