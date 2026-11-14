import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // 1. Fetch Sports
    const sports = await db.sport.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { name: 'asc' },
    });

    // 2. Fetch The 5 Houses
    const clubs = await db.club.findMany({
      orderBy: [{ totalPoints: 'desc' }, { name: 'asc' }],
      include: {
        cricketTeams: true,
      },
    });

    // 3. Fetch Cricket Teams (10 Teams rolling up to 5 Houses)
    const cricketTeams = await db.cricketTeam.findMany({
      include: { club: true },
      orderBy: [{ clubId: 'asc' }, { name: 'asc' }],
    });

    // 4. Fetch Championship Settings
    const statusSetting = await db.tournamentSetting.findUnique({
      where: { key: 'CHAMPIONSHIP_STATUS' },
    });
    const championshipStatus = statusSetting?.value || 'ACTIVE';

    const championSetting = await db.tournamentSetting.findUnique({
      where: { key: 'HOUSE_CHAMPION_CLUB_ID' },
    });
    let championClub = null;
    if (championSetting?.value) {
      championClub = clubs.find((c) => c.id === championSetting.value) || null;
    }

    // 5. Compute 7-Sport Points Matrix for each House
    const allApprovedPoints = await db.pointsHistory.findMany({
      include: { sport: true },
    });

    const standings = clubs.map((club, idx) => {
      const clubPoints = allApprovedPoints.filter((h) => h.clubId === club.id);
      const sportBreakdown: Record<string, number> = {};

      for (const sp of sports) {
        const pts = clubPoints
          .filter((h) => h.sportId === sp.id)
          .reduce((sum, h) => sum + Number(h.points), 0);
        sportBreakdown[sp.id] = Number(pts.toFixed(2));
        sportBreakdown[sp.name] = Number(pts.toFixed(2));
      }

      return {
        id: club.id,
        name: club.name,
        code: club.code,
        color: club.color,
        captainName: club.captainName,
        rank: idx + 1,
        totalPoints: Number(club.totalPoints.toFixed(2)),
        sportBreakdown,
        cricketTeams: club.cricketTeams || [],
        matchesPlayed: clubPoints.length,
      };
    });

    // 6. Fetch Completed / Approved Results for public viewing
    const approvedMatches = await db.match.findMany({
      where: { status: 'COMPLETED' },
      orderBy: [{ matchDate: 'desc' }, { matchTime: 'desc' }],
      take: 20,
      include: {
        sport: true,
        venue: true,
        participants: {
          include: {
            club: true,
            cricketTeam: true,
            players: {
              include: {
                player: true,
                club: true,
              },
            },
          },
        },
      },
    });

    // 7. Fetch Upcoming Fixtures
    const upcomingMatches = await db.match.findMany({
      where: { status: { in: ['SCHEDULED', 'IN_PROGRESS'] } },
      orderBy: [{ matchDate: 'asc' }, { matchTime: 'asc' }],
      take: 20,
      include: {
        sport: true,
        venue: true,
        participants: {
          include: {
            club: true,
            cricketTeam: true,
          },
        },
      },
    });

    return NextResponse.json({
      championship: {
        name: 'APL Season 9 House Championship',
        dates: 'Nov 25 – 28, 2026',
        venue: 'Main Sports Complex',
        status: championshipStatus,
        championClub,
        leadingHouse: standings[0] || null,
      },
      standings,
      sports,
      cricketTeams,
      approvedMatches,
      upcomingMatches,
    });
  } catch (error: any) {
    console.error('Public overview API error:', error);
    return NextResponse.json({ error: 'Failed to load public championship data' }, { status: 500 });
  }
}

