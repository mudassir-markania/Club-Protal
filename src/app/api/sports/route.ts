import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';

export async function GET() {
  try {
    const sports = await prisma.sport.findMany({
      orderBy: { name: 'asc' },
      include: {
        referees: {
          include: {
            referee: true,
          },
        },
        _count: {
          select: {
            players: true,
            matches: true,
          },
        },
      },
    });

    return NextResponse.json(sports);
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
      category,
      icon,
      sportType,
      genderCategory,
      maxParticipants,
      tournamentFormat,
      numRounds,
      scoringConfig,
      pointsDistribution,
      assignedRefereeIds,
    } = body;

    if (!name || !category || !sportType) {
      return NextResponse.json({ error: 'Name, Category, and Sport Type are required' }, { status: 400 });
    }

    const existing = await prisma.sport.findUnique({
      where: { name },
    });

    if (existing) {
      return NextResponse.json({ error: 'Sport with this name already exists' }, { status: 409 });
    }

    const sport = await prisma.sport.create({
      data: {
        name,
        category,
        icon: icon || 'trophy',
        sportType,
        genderCategory: genderCategory || 'OPEN',
        maxParticipants: parseInt(maxParticipants) || 11,
        tournamentFormat: tournamentFormat || 'KNOCKOUT',
        numRounds: parseInt(numRounds) || 3,
        scoringConfig: typeof scoringConfig === 'string' ? scoringConfig : JSON.stringify(scoringConfig || { win: 3, draw: 1, loss: 0 }),
        pointsDistribution: typeof pointsDistribution === 'string' ? pointsDistribution : JSON.stringify(pointsDistribution || { first: 25, second: 15, third: 10 }),
        status: 'ACTIVE',
      },
    });

    // Assign referees if provided
    if (assignedRefereeIds && Array.isArray(assignedRefereeIds)) {
      for (const refId of assignedRefereeIds) {
        await prisma.refereeSport.create({
          data: {
            refereeId: refId,
            sportId: sport.id,
          },
        });
      }
    }

    await createAuditLog({
      user,
      action: 'CREATE_SPORT',
      entity: 'Sport',
      recordId: sport.id,
      updatedValue: sport,
    });

    return NextResponse.json(sport, { status: 201 });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED' || error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

