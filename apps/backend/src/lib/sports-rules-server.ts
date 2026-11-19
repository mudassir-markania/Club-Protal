import { db } from './db';
import {
  DEFAULT_OFFICIAL_RULES,
  OFFICIAL_CATEGORY_LABELS,
  SportScoringRuleDef,
  normalizeSportKey,
} from '@club-portal/shared';

const PURGE_PREFIX = 'SCORING_RULES_PURGED_';
const RULE_SPORT_KEYS = ['FOOTBALL', 'BGMI', 'CRICKET', 'BADMINTON', 'CARROM', 'CHESS'];

/** Sports whose rules an admin deliberately deleted: defaults must NOT be re-applied for them. */
export async function getPurgedSports(): Promise<Set<string>> {
  const rows = await db.tournamentSetting.findMany({ where: { key: { startsWith: PURGE_PREFIX } } });
  return new Set(rows.filter((r: any) => r.value === 'true').map((r: any) => String(r.key).slice(PURGE_PREFIX.length)));
}

export async function setSportPurged(sport: string, purged: boolean) {
  await db.tournamentSetting.upsert({
    where: { key: `${PURGE_PREFIX}${sport}` },
    update: { value: String(purged) },
    create: { key: `${PURGE_PREFIX}${sport}`, value: String(purged), description: `Scoring rules for ${sport} were deliberately cleared` },
  });
}

/**
 * Fetch all rules for a sport from MongoDB (falls back to defaults, unless the rules were deliberately deleted)
 */
export async function getSportRules(sportName: string): Promise<SportScoringRuleDef[]> {
  const norm = normalizeSportKey(sportName);
  if (!norm) return [];

  try {
    const dbRules = await db.sportScoringRule.findMany({
      where: { sport: norm },
    });
    if (dbRules && dbRules.length > 0) {
      return dbRules
        .filter((r: any) => r.enabled !== false)
        .map((r: any) => ({
        sport: r.sport,
        trigger: r.trigger || undefined,
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
    // no DB rules: only fall back to the PDF defaults when nobody deleted them on purpose
    if ((await getPurgedSports()).has(norm)) return [];
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
        enabled: true,
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

  // Restoring defaults clears any "deliberately deleted" markers
  for (const sport of RULE_SPORT_KEYS) await setSportPurged(sport, false);

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
