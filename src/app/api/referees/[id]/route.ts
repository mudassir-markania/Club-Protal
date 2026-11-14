import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword, requireAuth } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const referee = await db.referee.findUnique({
      where: { id: params.id },
      include: {
        sports: {
          include: {
            sport: true,
          },
        },
        matches: {
          include: {
            match: {
              include: {
                sport: true,
                venue: true,
                participants: {
                  include: {
                    club: true,
                  },
                },
              },
            },
          },
        },
        results: {
          include: {
            match: true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            status: true,
          },
        },
      },
    });

    if (!referee) {
      return NextResponse.json({ error: 'Referee not found' }, { status: 404 });
    }

    return NextResponse.json(referee);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth(['SUPER_ADMIN', 'ADMIN']);
    const body = await req.json();

    const existing = await db.referee.findUnique({
      where: { id: params.id },
      include: { user: true },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Referee not found' }, { status: 404 });
    }

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

    const updated = await db.referee.update({
      where: { id: params.id },
      data: {
        name: name !== undefined ? name : existing.name,
        refereeCode: refereeCode !== undefined ? refereeCode : existing.refereeCode,
        email: email !== undefined ? email.toLowerCase().trim() : existing.email,
        phone: phone !== undefined ? phone : existing.phone,
        availability: availability !== undefined ? availability : existing.availability,
        status: status !== undefined ? status : existing.status,
      },
    });

    // Update associated user
    if (existing.user) {
      const userDataToUpdate: any = {
        name: name !== undefined ? name : existing.name,
        email: email !== undefined ? email.toLowerCase().trim() : existing.email,
        status: status !== undefined ? status : existing.status,
      };

      if (password) {
        userDataToUpdate.passwordHash = await hashPassword(password);
      }

      await db.user.update({
        where: { id: existing.user.id },
        data: userDataToUpdate,
      });
    }

    // Update sports
    if (sportIds && Array.isArray(sportIds)) {
      await db.refereeSport.deleteMany({
        where: { refereeId: params.id },
      });

      for (const sId of sportIds) {
        await db.refereeSport.create({
          data: {
            refereeId: params.id,
            sportId: sId,
          },
        });
      }
    }

    const result = await db.referee.findUnique({
      where: { id: params.id },
      include: {
        sports: { include: { sport: true } },
        user: { select: { id: true, email: true, status: true } },
      },
    });

    await createAuditLog({
      user,
      action: 'UPDATE_REFEREE',
      entity: 'Referee',
      recordId: params.id,
      previousValue: existing,
      updatedValue: result,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED' || error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth(['SUPER_ADMIN', 'ADMIN']);

    const referee = await db.referee.findUnique({
      where: { id: params.id },
      include: {
        user: true,
        _count: {
          select: {
            matches: true,
          },
        },
      },
    });

    if (!referee) {
      return NextResponse.json({ error: 'Referee not found' }, { status: 404 });
    }

    if (referee.user) {
      await db.user.delete({
        where: { id: referee.user.id },
      });
    }

    await db.referee.delete({
      where: { id: params.id },
    });

    await createAuditLog({
      user,
      action: 'DELETE_REFEREE',
      entity: 'Referee',
      recordId: params.id,
      previousValue: referee,
    });

    return NextResponse.json({ success: true, message: 'Referee and associated account deleted successfully' });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED' || error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

