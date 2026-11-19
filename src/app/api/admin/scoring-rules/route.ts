import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';
import { DEFAULT_OFFICIAL_RULES, OFFICIAL_CATEGORY_LABELS } from '@/lib/sports-rules';
import { seedOfficialScoringRules } from '@/lib/sports-rules-server';

export async function GET(req: Request) {
  try {
    // Both admin and referee can read; admins can configure
    const user = await requireAuth();

    // Ensure initial rules are in DB
    const count = await db.sportScoringRule.count();
    if (count === 0) {
      await seedOfficialScoringRules();
    }

    const rules = await db.sportScoringRule.findMany({
      orderBy: [{ sport: 'asc' }, { ruleCode: 'asc' }],
    });

    const categorySettings = await db.tournamentSetting.findMany({
      where: { key: { startsWith: 'CATEGORY_LABEL_' } },
    });

    const categoryLabels: Record<string, string> = { ...OFFICIAL_CATEGORY_LABELS };
    for (const cs of categorySettings) {
      for (const [key, origLabel] of Object.entries(OFFICIAL_CATEGORY_LABELS)) {
        const expectedKey = `CATEGORY_LABEL_${key.toUpperCase().replace(/[^A-Z0-9]/g, '_')}`;
        if (cs.key === expectedKey) {
          categoryLabels[key] = cs.value;
        }
      }
    }

    return NextResponse.json({
      success: true,
      rules: rules.length > 0 ? rules : DEFAULT_OFFICIAL_RULES,
      categoryLabels,
      officialDefaults: DEFAULT_OFFICIAL_RULES,
      isAdmin: user.role === 'ADMIN' || user.role === 'SUPER_ADMIN',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuth(['SUPER_ADMIN', 'ADMIN']);
    const body = await req.json();

    const { action, rules, categoryLabels } = body;

    if (action === 'RESET_TO_PDF') {
      await seedOfficialScoringRules();
      await createAuditLog({
        user,
        action: 'RESET_SCORING_RULES',
        entity: 'SportScoringRule',
        updatedValue: { message: 'Reset all sport scoring rules to official PDF values' },
      });
      return NextResponse.json({
        success: true,
        message: 'Scoring rules reset to official sports_points_distribution.pdf values.',
      });
    }

    // Update rules
    if (rules && Array.isArray(rules)) {
      for (const r of rules) {
        if (!r.ruleCode) continue;
        const pts = Number(r.points);
        if (isNaN(pts) || pts < 0) continue;

        await db.sportScoringRule.upsert({
          where: { ruleCode: r.ruleCode },
          update: {
            points: pts,
            description: r.description,
            enabled: r.enabled !== undefined ? Boolean(r.enabled) : true,
          },
          create: {
            sport: r.sport,
            ruleCode: r.ruleCode,
            ruleName: r.ruleName,
            category: r.category || null,
            awardType: r.awardType || 'TEAM',
            isTournamentLevel: Boolean(r.isTournamentLevel),
            points: pts,
            description: r.description || '',
            enabled: r.enabled !== undefined ? Boolean(r.enabled) : true,
          },
        });
      }
    }

    // Update category labels configuration
    if (categoryLabels && typeof categoryLabels === 'object') {
      for (const [catName, label] of Object.entries(categoryLabels)) {
        const settingKey = `CATEGORY_LABEL_${catName.toUpperCase().replace(/[^A-Z0-9]/g, '_')}`;
        await db.tournamentSetting.upsert({
          where: { key: settingKey },
          update: { value: String(label) },
          create: {
            key: settingKey,
            value: String(label),
            description: `Configurable label for official event category "${catName}"`,
          },
        });
      }
    }

    await createAuditLog({
      user,
      action: 'UPDATE_SCORING_RULES',
      entity: 'SportScoringRule',
      updatedValue: { rulesUpdatedCount: rules?.length, categoryLabels },
    });

    return NextResponse.json({
      success: true,
      message: 'Official scoring rules configuration updated successfully.',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
