import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';
import {
  normalizeSportKey,
  DEFAULT_OFFICIAL_RULES,
} from '@/lib/sports-rules';
import {
  getSportRules,
  seedOfficialScoringRules,
  getPurgedSports,
} from '@/lib/sports-rules-server';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const sport = await db.sport.findFirst({
      where: {
        OR: [{ id: params.id }, { name: params.id }],
      },
    });

    if (!sport) {
      return NextResponse.json({ error: 'Sport not found' }, { status: 404 });
    }

    const sportKey = normalizeSportKey(sport.name);
    if (!sportKey) {
      return NextResponse.json({
        sport: { id: sport.id, name: sport.name },
        sportKey: null,
        rules: [],
        message: 'No sport-specific scoring profile configured for this custom sport',
      });
    }

    let rules = await getSportRules(sportKey);
    if (!rules || rules.length === 0) {
      // do not bring back rules an admin deliberately deleted
      if (!(await getPurgedSports()).has(sportKey)) {
        await seedOfficialScoringRules();
        rules = await getSportRules(sportKey);
      }
    }

    return NextResponse.json({
      sport: { id: sport.id, name: sport.name },
      sportKey,
      rules,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth(['SUPER_ADMIN', 'ADMIN']);
    const body = await req.json();

    const sport = await db.sport.findFirst({
      where: {
        OR: [{ id: params.id }, { name: params.id }],
      },
    });

    if (!sport) {
      return NextResponse.json({ error: 'Sport not found' }, { status: 404 });
    }

    const sportKey = normalizeSportKey(sport.name);
    if (!sportKey) {
      return NextResponse.json(
        { error: `Cannot configure official scoring rules for unsupported sport "${sport.name}"` },
        { status: 400 }
      );
    }

    // Check if reset to official PDF defaults was requested
    if (body.resetToDefaults) {
      const defaultRules = DEFAULT_OFFICIAL_RULES.filter((r) => r.sport === sportKey);
      for (const def of defaultRules) {
        await db.sportScoringRule.updateMany({
          where: { ruleCode: def.ruleCode },
          data: {
            points: def.points,
            ruleName: def.ruleName,
            category: def.category,
            description: def.description,
          },
        });
      }

      await createAuditLog({
        user,
        action: 'RESET_SPORT_RULES_TO_DEFAULT',
        entity: 'SportScoringRule',
        recordId: sport.id,
        updatedValue: {
          sport: sport.name,
          sportKey,
          restoredRuleCount: defaultRules.length,
          source: 'sports_points_distribution.pdf',
        },
      });

      const updatedRules = await getSportRules(sportKey);
      return NextResponse.json({
        success: true,
        message: `Restored official PDF default scoring rules for ${sport.name}`,
        rules: updatedRules,
      });
    }

    // Process updated rules array: { rules: [{ ruleCode: string, points: number }] }
    const rulesToUpdate = Array.isArray(body.rules) ? body.rules : [];
    if (rulesToUpdate.length === 0) {
      return NextResponse.json({ error: 'No rules provided to update' }, { status: 400 });
    }

    const updatedList: any[] = [];

    for (const item of rulesToUpdate) {
      if (!item.ruleCode) continue;
      const pts = Number(item.points);
      if (isNaN(pts) || pts < 0) {
        return NextResponse.json(
          { error: `Invalid points value for rule ${item.ruleCode}: must be a non-negative number` },
          { status: 400 }
        );
      }

      const existingRule = await db.sportScoringRule.findUnique({
        where: { ruleCode: item.ruleCode },
      });

      if (existingRule) {
        await db.sportScoringRule.update({
          where: { ruleCode: item.ruleCode },
          data: {
            points: pts,
            ...(item.ruleName ? { ruleName: item.ruleName } : {}),
            ...(item.category ? { category: item.category } : {}),
            ...(item.enabled !== undefined ? { enabled: Boolean(item.enabled) } : {}),
          },
        });
        updatedList.push({ ruleCode: item.ruleCode, oldPoints: existingRule.points, newPoints: pts });
      } else {
        // If rule doesn't exist yet in DB, check defaults and insert
        const def = DEFAULT_OFFICIAL_RULES.find((r) => r.ruleCode === item.ruleCode);
        if (def) {
          await db.sportScoringRule.create({
            data: {
              sport: def.sport,
              ruleCode: def.ruleCode,
              ruleName: def.ruleName,
              category: def.category,
              awardType: def.awardType,
              isTournamentLevel: def.isTournamentLevel || false,
              points: pts,
              description: def.description,
              conditions: def.conditions ? JSON.stringify(def.conditions) : null,
              enabled: true,
            },
          });
          updatedList.push({ ruleCode: item.ruleCode, oldPoints: def.points, newPoints: pts });
        }
      }
    }

    // Audit log
    await createAuditLog({
      user,
      action: 'UPDATE_SPORT_RULES',
      entity: 'SportScoringRule',
      recordId: sport.id,
      updatedValue: {
        sport: sport.name,
        sportKey,
        updatedCount: updatedList.length,
        updates: updatedList,
      },
    });

    const refreshedRules = await getSportRules(sportKey);

    return NextResponse.json({
      success: true,
      message: `Successfully updated ${updatedList.length} scoring rules for ${sport.name}`,
      rules: refreshedRules,
    });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    if (error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
