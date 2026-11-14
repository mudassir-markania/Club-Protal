import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const sport = await prisma.sport.findUnique({
      where: { id: params.id },
      include: {
        referees: {
          include: {
            referee: true,
          },
        },
        players: {
          include: {
            player: {
              include: {
                club: true,
              },
            },
          },
        },
        matches: {
          include: {
            participants: {
              include: {
                club: true,
                player: true,
              },
            },
            venue: true,
            results: true,
          },
        },
      },
    });

    if (!sport) {
      return NextResponse.json({ error: 'Sport not found' }, { status: 404 });
    }

    return NextResponse.json(sport);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth(['SUPER_ADMIN', 'ADMIN']);
    const body = await req.json();

    const existing = await prisma.sport.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Sport not found' }, { status: 404 });
    }

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
      status,
      assignedRefereeIds,
    } = body;

    const updated = await prisma.sport.update({
      where: { id: params.id },
      data: {
        name: name !== undefined ? name : existing.name,
        category: category !== undefined ? category : existing.category,
        icon: icon !== undefined ? icon : existing.icon,
        sportType: sportType !== undefined ? sportType : existing.sportType,
        genderCategory: genderCategory !== undefined ? genderCategory : existing.genderCategory,
        maxParticipants: maxParticipants !== undefined ? parseInt(maxParticipants) : existing.maxParticipants,
        tournamentFormat: tournamentFormat !== undefined ? tournamentFormat : existing.tournamentFormat,
        numRounds: numRounds !== undefined ? parseInt(numRounds) : existing.numRounds,
        scoringConfig: scoringConfig !== undefined ? (typeof scoringConfig === 'string' ? scoringConfig : JSON.stringify(scoringConfig)) : existing.scoringConfig,
        pointsDistribution: pointsDistribution !== undefined ? (typeof pointsDistribution === 'string' ? pointsDistribution : JSON.stringify(pointsDistribution)) : existing.pointsDistribution,
        status: status !== undefined ? status : existing.status,
      },
    });

    if (assignedRefereeIds && Array.isArray(assignedRefereeIds)) {
      await prisma.refereeSport.deleteMany({
        where: { sportId: params.id },
      });

      for (const rId of assignedRefereeIds) {
        await prisma.refereeSport.create({
          data: {
            refereeId: rId,
            sportId: params.id,
          },
        });
      }
    }

    await createAuditLog({
      user,
      action: 'UPDATE_SPORT',
      entity: 'Sport',
      recordId: updated.id,
      previousValue: existing,
      updatedValue: updated,
    });

    return NextResponse.json(updated);
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

    const sport = await prisma.sport.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            matches: true,
          },
        },
      },
    });

    if (!sport) {
      return NextResponse.json({ error: 'Sport not found' }, { status: 404 });
    }

    if (sport._count.matches > 0) {
      return NextResponse.json(
        { error: `Cannot delete sport because it has ${sport._count.matches} matches scheduled/completed.` },
        { status: 400 }
      );
    }

    await prisma.sport.delete({
      where: { id: params.id },
    });

    await createAuditLog({
      user,
      action: 'DELETE_SPORT',
      entity: 'Sport',
      recordId: params.id,
      previousValue: sport,
    });

    return NextResponse.json({ success: true, message: 'Sport deleted successfully' });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED' || error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

