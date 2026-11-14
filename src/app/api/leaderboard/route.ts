import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { recalculateAllLeaderboards } from '@/lib/scoring';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'overall'; // 'overall' | 'sport' | 'individual' | 'doubles'
    const sportId = searchParams.get('sportId');

    if (type === 'overall') {
      const entries = await prisma.leaderboardEntry.findMany({
        where: { sportId: 'OVERALL' },
        orderBy: [{ rank: 'asc' }, { points: 'desc' }],
        include: {
          club: true,
        },
      });

      return NextResponse.json({
        type: 'overall',
        standings: entries,
      });
    }

    if (type === 'sport') {
      if (!sportId) {
        // Return sport leaderboards for all active sports
        const allSports = await prisma.sport.findMany();
        const results = await Promise.all(
          allSports.map(async (sport) => {
            const entries = await prisma.leaderboardEntry.findMany({
              where: { sportId: sport.id },
              orderBy: [{ rank: 'asc' }, { points: 'desc' }],
              include: { club: true },
            });
            return {
              sport,
              standings: entries,
            };
          })
        );
        return NextResponse.json({ type: 'sport_all', data: results });
      }

      const sport = await prisma.sport.findUnique({
        where: { id: sportId },
      });

      const entries = await prisma.leaderboardEntry.findMany({
        where: { sportId },
        orderBy: [{ rank: 'asc' }, { points: 'desc' }],
        include: { club: true },
      });

      return NextResponse.json({
        type: 'sport',
        sport,
        standings: entries,
      });
    }

    if (type === 'individual') {
      // Find individual matches and aggregate player stats
      const individualSports = await prisma.sport.findMany({
        where: { sportType: 'INDIVIDUAL' },
      });

      const sportIds = individualSports.map((s) => s.id);

      const players = await prisma.player.findMany({
        where: {
          sports: {
            some: {
              sportId: { in: sportIds },
            },
          },
        },
        include: {
          club: true,
          matchParticipants: {
            include: {
              match: {
                include: {
                  sport: true,
                },
              },
            },
          },
        },
      });

      const playerStandings = players.map((p) => {
        let played = 0;
        let won = 0;
        let points = 0;

        for (const mp of p.matchParticipants) {
          if (mp.match.status === 'COMPLETED') {
            played++;
            if (mp.isWinner) {
              won++;
              points += 2; // individual win points
            }
          }
        }

        return {
          id: p.id,
          registrationId: p.registrationId,
          name: p.name,
          club: p.club,
          played,
          won,
          lost: played - won,
          points,
        };
      });

      playerStandings.sort((a, b) => b.points - a.points || b.won - a.won);

      return NextResponse.json({
        type: 'individual',
        standings: playerStandings.map((p, idx) => ({ ...p, rank: idx + 1 })),
      });
    }

    if (type === 'doubles') {
      // Find doubles matches and aggregate pair stats
      const doublesSports = await prisma.sport.findMany({
        where: { sportType: 'DOUBLES' },
      });

      const doublesMatches = await prisma.match.findMany({
        where: {
          sportId: { in: doublesSports.map((s) => s.id) },
          status: 'COMPLETED',
        },
        include: {
          sport: true,
          participants: {
            include: {
              club: true,
            },
          },
        },
      });

      const pairStats: Record<
        string,
        {
          teamName: string;
          club: any;
          sportName: string;
          played: number;
          won: number;
          points: number;
        }
      > = {};

      for (const m of doublesMatches) {
        for (const p of m.participants) {
          const key = p.teamName || (p.club ? `${p.club.name} Pair` : 'Unnamed Pair');
          if (!pairStats[key]) {
            pairStats[key] = {
              teamName: key,
              club: p.club,
              sportName: m.sport.name,
              played: 0,
              won: 0,
              points: 0,
            };
          }
          pairStats[key].played++;
          if (p.isWinner) {
            pairStats[key].won++;
            pairStats[key].points += 2;
          }
        }
      }

      const pairs = Object.values(pairStats).sort((a, b) => b.points - a.points);

      return NextResponse.json({
        type: 'doubles',
        standings: pairs.map((pair, idx) => ({ ...pair, rank: idx + 1 })),
      });
    }

    return NextResponse.json({ error: 'Invalid leaderboard type' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST() {
  try {
    await requireAuth(['SUPER_ADMIN', 'ADMIN']);
    await recalculateAllLeaderboards();
    return NextResponse.json({ success: true, message: 'All leaderboards recalculated successfully' });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED' || error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

