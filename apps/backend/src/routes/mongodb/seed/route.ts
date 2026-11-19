import { NextResponse } from '@/http/next-server';
import { seedMongoDatabase } from '@/lib/seed-mongo';

export async function POST(req: Request) {
  try {
    await seedMongoDatabase();
    return NextResponse.json({
      success: true,
      message: 'MongoDB House Championship database successfully initialized and seeded with 5 clubs, 10 cricket teams, 6 sports, and demo fixtures.',
    });
  } catch (error: any) {
    console.error('MongoDB Seeding Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  return POST(req);
}

