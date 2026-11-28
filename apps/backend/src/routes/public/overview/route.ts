import { NextResponse } from '@/http/next-server';
import { db } from '@/lib/db';
import { getPointsLockState } from '@/lib/points-lock';

export async function GET() {
  try {
    const { pointsLocked, hidePoints } = await getPointsLockState();
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
    if (championSetting?.value && !hidePoints) {
      championClub = clubs.find((c) => c.id === championSetting.value) || null;
    }

    // 5. Compute 7-Sport Points Matrix for each House
    const allApprovedPoints = await db.pointsHistory.findMany({
      include: { sport: true },
    });

    const displayClubs = hidePoints ? [...clubs].sort((a, b) => a.name.localeCompare(b.name)) : clubs;

    const standings = displayClubs.map((club, idx) => {
      const clubPoints = allApprovedPoints.filter((h) => h.clubId === club.id);
      const sportBreakdown: Record<string, number> = {};

      if (!hidePoints) {
        for (const sp of sports) {
          const pts = clubPoints
            .filter((h) => h.sportId === sp.id)
            .reduce((sum, h) => sum + Number(h.points), 0);
          sportBreakdown[sp.id] = Number(pts.toFixed(2));
          sportBreakdown[sp.name] = Number(pts.toFixed(2));
        }
      }

      return {
        id: club.id,
        name: club.name,
        code: club.code,
        color: club.color,
        captainName: club.captainName,
        rank: hidePoints ? null : idx + 1,
        totalPoints: hidePoints ? null : Number(club.totalPoints.toFixed(2)),
        sportBreakdown,
        cricketTeams: club.cricketTeams || [],
        matchesPlayed: clubPoints.length,
        pointsLocked: Boolean(pointsLocked),
      };
    });

    // 6. Fetch Completed / Approved Results for public viewing (including Star Player)
    const rawApprovedMatches = await db.match.findMany({
      where: { status: 'COMPLETED' },
      orderBy: [{ matchDate: 'desc' }, { matchTime: 'desc' }],
      take: 20,
      include: {
        sport: true,
        venue: true,
        starPlayer: true,
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

    // Populate club for starPlayer if needed
    const approvedMatches = await Promise.all(
      rawApprovedMatches.map(async (m: any) => {
        let starPlayerObj = m.starPlayer;
        if (!starPlayerObj && m.starPlayerId) {
          starPlayerObj = await db.player.findUnique({
            where: { id: m.starPlayerId },
            include: { club: true },
          });
        } else if (starPlayerObj && !starPlayerObj.club && starPlayerObj.clubId) {
          const club = await db.club.findUnique({ where: { id: starPlayerObj.clubId } });
          starPlayerObj = { ...starPlayerObj, club };
        }
        return {
          ...m,
          starPlayer: starPlayerObj,
        };
      })
    );

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
      pointsLocked: Boolean(pointsLocked),
    });
  } catch (error: any) {
    console.error('Public overview API error:', error);
    return NextResponse.json({ error: 'Failed to load public championship data' }, { status: 500 });
  }
}

