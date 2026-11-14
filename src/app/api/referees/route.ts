import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword, requireAuth } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';

export async function GET() {
  try {
    const referees = await db.referee.findMany({
      orderBy: { name: 'asc' },
      include: {
        sports: {
          include: {
            sport: true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            status: true,
          },
        },
        _count: {
          select: {
            matches: true,
            results: true,
          },
        },
      },
    });

    return NextResponse.json(referees);
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
      refereeCode,
      email,
      phone,
      password,
      availability,
      status,
      sportIds,
    } = body;

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and Email are required' }, { status: 400 });
    }

    const code = refereeCode || `REF-${Math.floor(100 + Math.random() * 900)}`;

    const existingRef = await db.referee.findFirst({
      where: {
        OR: [{ email: email.toLowerCase().trim() }, { refereeCode: code }],
      },
    });

    if (existingRef) {
      return NextResponse.json({ error: 'Referee with this Email or Code already exists' }, { status: 409 });
    }

    // Find Referee Role
    let refRole = await db.role.findUnique({
      where: { name: 'REFEREE' },
    });

    if (!refRole) {
      refRole = await db.role.create({
        data: { name: 'REFEREE', description: 'Match referee' },
      });
    }

    const referee = await db.referee.create({
      data: {
        refereeCode: code,
        name,
        email: email.toLowerCase().trim(),
        phone,
        availability: availability || 'AVAILABLE',
        status: status || 'ACTIVE',
      },
    });

    // Create user login account for referee
    const pwdHash = await hashPassword(password || 'referee123');
    await db.user.create({
      data: {
        name,
        email: email.toLowerCase().trim(),
        passwordHash: pwdHash,
        roleId: refRole.id,
        refereeId: referee.id,
        status: status || 'ACTIVE',
      },
    });

    // Assign sports
    if (sportIds && Array.isArray(sportIds)) {
      for (const sId of sportIds) {
        await db.refereeSport.create({
          data: {
            refereeId: referee.id,
            sportId: sId,
          },
        });
      }
    }

    const created = await db.referee.findUnique({
      where: { id: referee.id },
      include: {
        sports: { include: { sport: true } },
        user: { select: { id: true, email: true, status: true } },
      },
    });

    await createAuditLog({
      user,
      action: 'CREATE_REFEREE',
      entity: 'Referee',
      recordId: referee.id,
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

