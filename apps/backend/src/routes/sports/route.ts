import { NextResponse } from '@/http/next-server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';
import { normalizeSportKey, DEFAULT_OFFICIAL_RULES } from '@club-portal/shared';
import { getPurgedSports } from '@/lib/sports-rules-server';
import { getCached, setCached, clearCache } from '@/lib/cache';

export async function GET() {
  try {
    const cached = getCached('sports:all');
    if (cached) return NextResponse.json(cached);

    const sports = await db.sport.findMany({
      orderBy: { name: 'asc' },
      include: {
        referees: {
          include: {
            referee: true,
          },
        },
      },
    });

    // Real counts (the Mongo adapter has no _count support)
    const [playerRegs, allMatches] = await Promise.all([db.playerSport.findMany({}), db.match.findMany({})]);
    const countBy = (rows: any[]) => {
      const m = new Map<string, number>();
      rows.forEach((r) => m.set(r.sportId, (m.get(r.sportId) || 0) + 1));
      return m;
    };
    const playerCounts = countBy(playerRegs);
    const matchCounts = countBy(allMatches);

    // Attach sport-specific scoring rules from DB
    const allRules = await db.sportScoringRule.findMany({
      where: { enabled: true },
    });

    const purgedSports = await getPurgedSports();
    const enrichedSports = sports.map((s: any) => {
      const sportKey = normalizeSportKey(s.name);
      let rules = sportKey ? allRules.filter((r: any) => r.sport === sportKey) : [];
      if ((!rules || rules.length === 0) && sportKey && !purgedSports.has(sportKey)) {
        rules = DEFAULT_OFFICIAL_RULES.filter((r: any) => r.sport === sportKey);
      }
      return {
        ...s,
        sportKey,
        scoringRules: rules,
        _count: { players: playerCounts.get(s.id) || 0, matches: matchCounts.get(s.id) || 0 },
      };
    });

    setCached('sports:all', enrichedSports, 60);
    return NextResponse.json(enrichedSports);
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
      category,
      icon,
      sportType,
      genderCategory,
      maxParticipants,
      tournamentFormat,
      numRounds,
      scoringConfig,
      pointsDistribution,
      assignedRefereeIds,
    } = body;

    if (!name || !category || !sportType) {
      return NextResponse.json({ error: 'Name, Category, and Sport Type are required' }, { status: 400 });
    }

    const existing = await db.sport.findUnique({
      where: { name },
    });

    if (existing) {
      return NextResponse.json({ error: 'Sport with this name already exists' }, { status: 409 });
    }

    const sport = await db.sport.create({
      data: {
        name,
        category,
        icon: icon || 'trophy',
        sportType,
        genderCategory: genderCategory || 'OPEN',
        maxParticipants: parseInt(maxParticipants) || 11,
        tournamentFormat: tournamentFormat || 'KNOCKOUT',
        numRounds: parseInt(numRounds) || 3,
        scoringConfig: typeof scoringConfig === 'string' ? scoringConfig : JSON.stringify(scoringConfig || { win: 3, draw: 1, loss: 0 }),
        pointsDistribution: typeof pointsDistribution === 'string' ? pointsDistribution : JSON.stringify(pointsDistribution || { first: 25, second: 15, third: 10 }),
        status: 'ACTIVE',
      },
    });

    // Assign referees if provided
    if (assignedRefereeIds && Array.isArray(assignedRefereeIds)) {
      for (const refId of assignedRefereeIds) {
        await db.refereeSport.create({
          data: {
            refereeId: refId,
            sportId: sport.id,
          },
        });
      }
    }

    await createAuditLog({
      user,
      action: 'CREATE_SPORT',
      entity: 'Sport',
      recordId: sport.id,
      updatedValue: sport,
    });

    clearCache('sports');
    return NextResponse.json(sport, { status: 201 });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED' || error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

