import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth(['SUPER_ADMIN', 'ADMIN']);
    const body = await req.json().catch(() => ({}));

    const registration = await prisma.registration.findUnique({
      where: { id: params.id },
    });

    if (!registration) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 });
    }

    if (registration.status === 'APPROVED') {
      return NextResponse.json({ error: 'Registration is already approved' }, { status: 400 });
    }

    // 1. Resolve Club: check if user passed assignedClubId or match by clubPreference
    let club = null;
    if (body.clubId) {
      club = await prisma.club.findUnique({ where: { id: body.clubId } });
    }
    if (!club && registration.clubPreference) {
      club = await prisma.club.findFirst({
        where: {
          OR: [
            { name: { contains: registration.clubPreference } },
            { code: { equals: registration.clubPreference.toUpperCase() } },
          ],
        },
      });
    }
    if (!club) {
      club = await prisma.club.findFirst();
    }

    if (!club) {
      return NextResponse.json({ error: 'No active club available for assignment. Please create a club first.' }, { status: 400 });
    }

    // 2. Generate unique Registration ID
    const count = await prisma.player.count();
    const regCode = `REG-${club.code}-${(count + 1).toString().padStart(3, '0')}`;

    // 3. Create Player
    const player = await prisma.player.create({
      data: {
        registrationId: regCode,
        name: registration.fullName,
        email: registration.email,
        phone: registration.phone,
        gender: registration.gender || 'MALE',
        age: registration.age,
        clubId: club.id,
        teamName: registration.teamName || `${club.name} Team`,
        status: 'APPROVED',
        paymentStatus: 'PAID',
      },
    });

    // 4. Resolve Sports & Create PlayerSport records
    const allSports = await prisma.sport.findMany();
    const selectedSportsList = (registration.sportsSelected || '')
      .split(',')
      .map((s) => s.trim().toLowerCase());

    for (const sport of allSports) {
      const matchName = sport.name.toLowerCase();
      const isSelected = selectedSportsList.some(
        (selected) => matchName.includes(selected) || selected.includes(matchName)
      );

      if (isSelected) {
        await prisma.playerSport.create({
          data: {
            playerId: player.id,
            sportId: sport.id,
          },
        });
      }
    }

    // 5. Update Registration status
    await prisma.registration.update({
      where: { id: registration.id },
      data: { status: 'APPROVED' },
    });

    await createAuditLog({
      user,
      action: 'APPROVE_REGISTRATION',
      entity: 'Registration',
      recordId: registration.id,
      updatedValue: { playerId: player.id, registrationId: regCode, club: club.name },
    });

    return NextResponse.json({
      success: true,
      message: `Registration approved! Player created with ID ${regCode} in ${club.name}.`,
      player,
    });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED' || error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

