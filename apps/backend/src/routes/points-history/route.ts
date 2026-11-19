import { NextResponse } from '@/http/next-server';
import { db } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const clubId = searchParams.get('clubId');
    const sportId = searchParams.get('sportId');

    const where: any = {};
    if (clubId) where.clubId = clubId;
    if (sportId) where.sportId = sportId;

    const history = await db.pointsHistory.findMany({
      where,
      orderBy: { recordedAt: 'desc' },
      include: {
        club: true,
        sport: true,
        match: {
          select: {
            id: true,
            matchCode: true,
            round: true,
            matchDate: true,
          },
        },
        distribution: {
          include: {
            allocations: {
              include: { club: true },
            },
            participant: true,
          },
        },
      },
    });

    return NextResponse.json(history);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

