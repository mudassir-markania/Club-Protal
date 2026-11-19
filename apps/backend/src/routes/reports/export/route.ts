import { NextResponse } from '@/http/next-server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    await requireAuth(['SUPER_ADMIN', 'ADMIN']);

    const { searchParams } = new URL(req.url);
    const reportType = searchParams.get('type') || 'overall_leaderboard';
    const format = searchParams.get('format') || 'json'; // 'json' | 'csv'

    let filename = `report_${reportType}_${new Date().toISOString().slice(0, 10)}`;
    let headers: string[] = [];
    let rows: any[] = [];

    if (reportType === 'overall_leaderboard') {
      const entries = await db.leaderboardEntry.findMany({
        where: { sportId: 'OVERALL' },
        include: { club: true },
        orderBy: { rank: 'asc' },
      });
      filename = `Overall_Club_Leaderboard`;
      headers = ['Rank', 'Club Name', 'Club Code', 'Gold', 'Silver', 'Bronze', 'Played', 'Won', 'Drawn', 'Lost', 'Total Points', 'Score Diff'];
      rows = entries.map((e) => [
        e.rank,
        e.club.name,
        e.club.code,
        e.gold,
        e.silver,
        e.bronze,
        e.played,
        e.won,
        e.drawn,
        e.lost,
        e.points,
        e.scoreDifference,
      ]);
    } else if (reportType === 'players') {
      const players = await db.player.findMany({
        include: { club: true, sports: { include: { sport: true } } },
        orderBy: [{ club: { name: 'asc' } }, { name: 'asc' }],
      });
      filename = `Players_Roster_Report`;
      headers = ['Registration ID', 'Player Name', 'Club', 'Email', 'Phone', 'Gender', 'Age', 'Team', 'Sports', 'Status'];
      rows = players.map((p) => [
        p.registrationId,
        p.name,
        p.club.name,
        p.email,
        p.phone || 'N/A',
        p.gender || 'N/A',
        p.age || 'N/A',
        p.teamName || 'N/A',
        p.sports.map((s) => s.sport.name).join('; '),
        p.status,
      ]);
    } else if (reportType === 'matches') {
      const matches = await db.match.findMany({
        include: {
          sport: true,
          venue: true,
          participants: { include: { club: true, player: true } },
          referees: { include: { referee: true } },
          results: true,
        },
        orderBy: [{ matchDate: 'asc' }, { matchTime: 'asc' }],
      });
      filename = `Tournament_Fixtures_Results`;
      headers = ['Match Code', 'Sport', 'Round', 'Date', 'Time', 'Venue', 'Participants', 'Score / Status', 'Assigned Referees', 'Winner'];
      rows = matches.map((m) => {
        const participantStr = m.participants.map((p) => `${p.club?.name || p.player?.name || p.teamName} (${p.score})`).join(' vs ');
        const winner = m.participants.find((p) => p.isWinner);
        return [
          m.matchCode,
          m.sport.name,
          m.round,
          m.matchDate,
          m.matchTime,
          m.venue?.name || 'TBD',
          participantStr,
          m.status,
          m.referees.map((r) => r.referee.name).join('; '),
          winner ? (winner.club?.name || winner.player?.name || winner.teamName) : 'N/A',
        ];
      });
    } else if (reportType === 'registrations') {
      const registrations = await db.registration.findMany({
        orderBy: { createdAt: 'desc' },
      });
      filename = `Google_Forms_Registrations`;
      headers = ['Submission ID', 'Full Name', 'Email', 'Phone', 'Gender', 'Age', 'Club Preference', 'Sports Selected', 'Source', 'Status', 'Date'];
      rows = registrations.map((r) => [
        r.submissionId,
        r.fullName,
        r.email,
        r.phone || 'N/A',
        r.gender || 'N/A',
        r.age || 'N/A',
        r.clubPreference,
        r.sportsSelected,
        r.source,
        r.status,
        new Date(r.createdAt).toISOString().slice(0, 10),
      ]);
    } else if (reportType === 'referees') {
      const referees = await db.referee.findMany({
        include: { sports: { include: { sport: true } }, matches: { include: { match: true } } },
      });
      filename = `Referee_Assignments`;
      headers = ['Referee Code', 'Name', 'Email', 'Phone', 'Availability', 'Assigned Sports', 'Assigned Match Count'];
      rows = referees.map((r) => [
        r.refereeCode,
        r.name,
        r.email,
        r.phone || 'N/A',
        r.availability,
        r.sports.map((s) => s.sport.name).join('; '),
        r.matches.length,
      ]);
    } else if (reportType === 'points_history') {
      const history = await db.pointsHistory.findMany({
        include: { club: true, sport: true, match: true },
        orderBy: { recordedAt: 'desc' },
      });
      filename = `Points_Audit_History`;
      headers = ['ID', 'Club', 'Sport', 'Match', 'Points Awarded', 'Reason', 'Timestamp'];
      rows = history.map((h) => [
        h.id,
        h.club.name,
        h.sport.name,
        h.match?.matchCode || 'N/A',
        h.points,
        h.reason,
        new Date(h.recordedAt).toISOString(),
      ]);
    }

    if (format === 'csv') {
      const csvContent = [
        headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(','),
        ...rows.map((row) => row.map((val: any) => `"${String(val ?? '').replace(/"/g, '""')}"`).join(',')),
      ].join('\n');

      return new Response(csvContent, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="${filename}.csv"`,
        },
      });
    }

    return NextResponse.json({
      reportType,
      filename,
      headers,
      rows,
    });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED' || error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

