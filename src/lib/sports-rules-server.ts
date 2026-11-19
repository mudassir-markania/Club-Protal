import { db } from './db';
import {
  DEFAULT_OFFICIAL_RULES,
  OFFICIAL_CATEGORY_LABELS,
  SportScoringRuleDef,
  normalizeSportKey,
} from './sports-rules';

/**
 * Fetch all rules for a sport from MongoDB (falls back to defaults)
 */
export async function getSportRules(sportName: string): Promise<SportScoringRuleDef[]> {
  const norm = normalizeSportKey(sportName);
  if (!norm) return [];

  try {
    const dbRules = await db.sportScoringRule.findMany({
      where: { sport: norm },
    });
    if (dbRules && dbRules.length > 0) {
      return dbRules.map((r: any) => ({
        sport: r.sport,
        ruleCode: r.ruleCode,
        ruleName: r.ruleName,
        category: r.category,
        awardType: r.awardType,
        isTournamentLevel: Boolean(r.isTournamentLevel),
        points: Number(r.points),
        description: r.description || '',
        conditions: r.conditions
          ? typeof r.conditions === 'string'
            ? JSON.parse(r.conditions)
            : r.conditions
          : undefined,
      }));
    }
  } catch (e) {
    // Fall back to constants
  }

  return DEFAULT_OFFICIAL_RULES.filter((r) => r.sport === norm);
}

/**
 * Seed or verify official rules in MongoDB
 */
export async function seedOfficialScoringRules() {
  for (const def of DEFAULT_OFFICIAL_RULES) {
    await db.sportScoringRule.upsert({
      where: { ruleCode: def.ruleCode },
      update: {
        sport: def.sport,
        ruleName: def.ruleName,
        category: def.category || null,
        awardType: def.awardType,
        isTournamentLevel: Boolean(def.isTournamentLevel),
        points: def.points,
        description: def.description,
        conditions: def.conditions ? JSON.stringify(def.conditions) : null,
      },
      create: {
        ruleCode: def.ruleCode,
        sport: def.sport,
        ruleName: def.ruleName,
        category: def.category || null,
        awardType: def.awardType,
        isTournamentLevel: Boolean(def.isTournamentLevel),
        points: def.points,
        description: def.description,
        conditions: def.conditions ? JSON.stringify(def.conditions) : null,
      },
    });
  }

  // Seed category labels configuration in tournament settings
  for (const [key, label] of Object.entries(OFFICIAL_CATEGORY_LABELS)) {
    const settingKey = `CATEGORY_LABEL_${key.toUpperCase().replace(/[^A-Z0-9]/g, '_')}`;
    await db.tournamentSetting.upsert({
      where: { key: settingKey },
      update: {},
      create: {
        key: settingKey,
        value: label,
        description: `Configurable label for official event category "${key}"`,
      },
    });
  }
}
