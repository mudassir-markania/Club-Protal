import { NextResponse } from '@/http/next-server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';
import { getCached, setCached, clearCache } from '@/lib/cache';
import { getPointsLockState } from '@/lib/points-lock';

export async function GET() {
  try {
    const { pointsLocked, isAdmin, hidePoints } = await getPointsLockState();
    const cacheKey = `clubs:all:${hidePoints ? 'locked' : isAdmin ? 'admin' : 'unlocked'}`;
    const cached = getCached(cacheKey);
    if (cached) return NextResponse.json(cached);

    const clubs = await db.club.findMany({
      orderBy: hidePoints ? { name: 'asc' } : { currentRank: 'asc' },
      include: {
        _count: {
          select: {
            players: true,
            matchParticipants: true,
          },
        },
      },
    });

    const safeClubs = hidePoints
      ? clubs.map((c) => ({
          ...c,
          totalPoints: 0,
          currentRank: null,
          pointsLocked: true,
        }))
      : clubs;

    setCached(cacheKey, safeClubs, 60);
    return NextResponse.json(safeClubs);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuth(['SUPER_ADMIN', 'ADMIN']);
    const body = await req.json();

    let { name, code, logoUrl, captainName, viceCaptainName, status, team1Name, team2Name } = body;

    if (!name) {
      return NextResponse.json({ error: 'House Name is required' }, { status: 400 });
    }

    if (!code) {
      const baseCode = name.replace(/[^a-zA-Z]/g, '').slice(0, 3).toUpperCase() || 'HSE';
      let candidate = baseCode;
      let counter = 1;
      while (await db.club.findFirst({ where: { code: candidate } })) {
        candidate = `${baseCode.slice(0, 2)}${counter++}`;
      }
      code = candidate;
    }

    const existing = await db.club.findFirst({
      where: {
        OR: [{ name: { equals: name } }, { code: { equals: code.toUpperCase() } }],
      },
    });

    if (existing) {
      return NextResponse.json({ error: 'House with this name or code already exists' }, { status: 409 });
    }

    const clubCount = await db.club.count();

    const club = await db.club.create({
      data: {
        name,
        code: code.toUpperCase(),
        logoUrl: logoUrl || 'shield',
        captainName,
        viceCaptainName,
        status: status || 'ACTIVE',
        currentRank: clubCount + 1,
        totalPoints: 0,
      },
    });

    if (team1Name) {
      await db.cricketTeam.create({
        data: {
          name: team1Name.trim(),
          clubId: club.id,
          status: 'ACTIVE',
        },
      });
    }
    if (team2Name) {
      await db.cricketTeam.create({
        data: {
          name: team2Name.trim(),
          clubId: club.id,
          status: 'ACTIVE',
        },
      });
    }

    await createAuditLog({
      user,
      action: 'CREATE_CLUB',
      entity: 'Club',
      recordId: club.id,
      updatedValue: club,
    });

    clearCache('clubs');
    clearCache('leaderboard');
    return NextResponse.json(club, { status: 201 });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED' || error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

