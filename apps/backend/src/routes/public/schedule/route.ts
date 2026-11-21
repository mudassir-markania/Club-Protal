import { NextResponse } from '@/http/next-server';
import { db } from '@/lib/db';
import { categoryDisplayName } from '@club-portal/shared';
import { getCached, setCached } from '@/lib/cache';

/**
 * Public schedule for viewers: every match with its sides, but only fields that are safe to show publicly
 * (no referees, results payloads, notes or internal ids beyond what the page needs).
 * GET /api/public/schedule
 */
export async function GET() {
  try {
    const cacheKey = 'public:schedule';
    const cached = getCached(cacheKey);
    if (cached) return NextResponse.json(cached);

    const matches = await db.match.findMany({
      orderBy: [{ matchDate: 'asc' }, { matchTime: 'asc' }],
      include: {
        sport: true,
        participants: {
          include: {
            club: true,
            cricketTeam: true,
            players: { include: { player: true, club: true } },
          },
        },
      },
    });

    const data = matches.map((m: any) => ({
      id: m.id,
      matchCode: m.matchCode,
      sport: m.sport ? { id: m.sport.id, name: m.sport.name } : null,
      round: m.round,
      stageType: m.stageType || 'NORMAL',
      category: m.matchCategory,
      categoryLabel: categoryDisplayName(m.matchCategory),
      date: m.matchDate,
      time: m.matchTime,
      status: m.status,
      sides: (m.participants || []).map((p: any) => {
        const clubs = new Map<string, { id: string; name: string; code?: string }>();
        if (p.club) clubs.set(p.club.id, { id: p.club.id, name: p.club.name, code: p.club.code });
        (p.players || []).forEach((mpp: any) => {
          if (mpp.club) clubs.set(mpp.club.id, { id: mpp.club.id, name: mpp.club.name, code: mpp.club.code });
        });
        return {
          id: p.id,
          name: p.cricketTeam?.name || p.teamName || p.player?.name || p.club?.name || 'TBA',
          players: (p.players || []).map((mpp: any) => mpp.player?.name).filter(Boolean),
          clubs: Array.from(clubs.values()),
          score: m.status === 'COMPLETED' ? p.score ?? 0 : null,
          isWinner: m.status === 'COMPLETED' ? Boolean(p.isWinner) : false,
        };
      }),
    }));

    const responseData = { generatedAt: new Date().toISOString(), matches: data };
    setCached(cacheKey, responseData, 30);
    return NextResponse.json(responseData);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
