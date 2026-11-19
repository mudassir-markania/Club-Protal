import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { clubSportsSummary } from '@/lib/player-eligibility';

// Club -> Sports (derived from the club's players' registrations), with player counts
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const club = await db.club.findUnique({ where: { id: params.id } });
    if (!club) return NextResponse.json({ error: 'Club not found' }, { status: 404 });
    return NextResponse.json(await clubSportsSummary(params.id));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
