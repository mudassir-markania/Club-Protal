import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function GET() {
  try {
    const venues = await db.venue.findMany({
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(venues);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await requireAuth(['SUPER_ADMIN', 'ADMIN']);
    const body = await req.json();

    const { name, location, capacity } = body;
    if (!name || !location) {
      return NextResponse.json({ error: 'Venue name and location are required' }, { status: 400 });
    }

    const venue = await db.venue.create({
      data: {
        name,
        location,
        capacity: capacity ? parseInt(capacity) : null,
      },
    });

    return NextResponse.json(venue, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

