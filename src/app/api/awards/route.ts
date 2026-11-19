import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sportName = searchParams.get('sport');
    const status = searchParams.get('status') || 'APPROVED';
    const clubId = searchParams.get('clubId');

    const where: any = {};
    if (status) where.status = status;
    if (sportName) {
      where.sportName = { $regex: new RegExp(sportName, 'i') };
    }
    if (clubId) where.clubId = clubId;

    const awards = await db.awardAllocation.findMany({
      where,
      include: {
        player: true,
        club: true,
        match: true,
      },
      orderBy: [{ createdAt: 'desc' }],
    });

    return NextResponse.json({
      success: true,
      awards,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

