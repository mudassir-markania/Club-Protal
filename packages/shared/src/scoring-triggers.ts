/**
 * Triggers connect a scoring rule to a moment in a match result.
 * The points engine finds the rule for (sport, trigger[, category]) and awards its points
 * to the winning/placed participant (a player or a team), split equally across the unique clubs
 * of that participant's players.
 */

export const RULE_TRIGGERS = [
  { id: 'MATCH_WIN', label: 'Match win', hint: 'Winner of a normal (league) match' },
  { id: 'MATCH_LOSS', label: 'Match loss', hint: 'Loser of a normal (league) match' },
  { id: 'FINAL_WINNER', label: 'Final winner', hint: 'Winner of the championship final' },
  { id: 'FINAL_LOSER', label: 'Final loser (runner-up)', hint: 'Loser of the championship final' },
  { id: 'THIRD_PLACE_WINNER', label: '3rd place playoff winner', hint: 'Winner of the 3rd place playoff' },
  { id: 'THIRD_PLACE_LOSER', label: '3rd place playoff loser', hint: 'Loser of the 3rd place playoff' },
  { id: 'QUARTER_FINAL_WIN', label: 'Quarter-final win', hint: 'Winner of a quarter-final (falls back to the normal win rule)' },
  { id: 'QUARTER_FINAL_LOSS', label: 'Quarter-final loss', hint: 'Loser of a quarter-final earns these points' },
  { id: 'SEMI_FINAL_WIN', label: 'Semi-final win', hint: 'Winner of a semi-final (falls back to the normal win rule)' },
  { id: 'SEMI_FINAL_LOSS', label: 'Semi-final loss', hint: 'Loser of a semi-final earns these points' },
  { id: 'PLACE_1', label: '1st place', hint: 'Placements: Chess, Badminton, Carrom' },
  { id: 'PLACE_2', label: '2nd place', hint: 'Placements: Chess, Badminton, Carrom' },
  { id: 'PLACE_3', label: '3rd place', hint: 'Placements: Chess, Badminton, Carrom' },
  { id: 'TOURNAMENT_WINNER', label: 'Overall tournament winner', hint: 'Tournament placement (e.g. BGMI)' },
  { id: 'TOURNAMENT_RUNNER_UP', label: 'Tournament runner-up', hint: 'Tournament placement (e.g. BGMI)' },
  { id: 'TOURNAMENT_THIRD', label: 'Tournament 3rd place', hint: 'Tournament placement (e.g. BGMI)' },
] as const;

export type RuleTrigger = (typeof RULE_TRIGGERS)[number]['id'];

export const TRIGGER_IDS: string[] = RULE_TRIGGERS.map((t) => t.id);

export const triggerLabel = (id?: string | null) => RULE_TRIGGERS.find((t) => t.id === id)?.label || id || '';

/** Triggers inferred for the official PDF rules (so existing database rows keep working without a migration). */
export function inferRuleTrigger(ruleCode: string, awardType?: string): RuleTrigger | null {
  if ((awardType || 'TEAM') === 'INDIVIDUAL') return null;
  const code = (ruleCode || '').toUpperCase();
  if (code.endsWith('_MATCH_WIN')) return 'MATCH_WIN';
  if (code.endsWith('_FINAL_WINNER')) return 'FINAL_WINNER';
  if (code.endsWith('_FINAL_LOSER')) return 'FINAL_LOSER';
  if (code === 'CRICK_THIRD_PLACE') return 'THIRD_PLACE_WINNER';
  if (code === 'BGMI_OVERALL_WINNER') return 'TOURNAMENT_WINNER';
  if (code === 'BGMI_RUNNER_UP') return 'TOURNAMENT_RUNNER_UP';
  if (code === 'BGMI_THIRD_PLACE') return 'TOURNAMENT_THIRD';
  if (code.endsWith('_1ST')) return 'PLACE_1';
  if (code.endsWith('_2ND')) return 'PLACE_2';
  if (code.endsWith('_3RD')) return 'PLACE_3';
  return null;
}

/** Event category of the official placement rules that have no explicit category stored. */
export function inferRuleCategory(ruleCode: string, stored?: string | null): string | null {
  if (stored) return stored;
  const code = (ruleCode || '').toUpperCase();
  if (code.includes('_MS_MD_')) return "Men's singles / doubles";
  if (code.includes('_WS_WD_')) return "Women's singles / doubles";
  return null;
}

export interface EffectiveRule {
  ruleCode: string;
  sport: string;
  points: number;
  trigger: RuleTrigger | null;
  category: string | null;
  minTeams: number | null;
}

/** Normalise a stored rule (database row or default) into what the engine needs. */
export function toEffectiveRule(r: any): EffectiveRule {
  let conditions: any = r.conditions;
  if (typeof conditions === 'string') {
    try {
      conditions = JSON.parse(conditions);
    } catch {
      conditions = null;
    }
  }
  const trigger = (r.trigger as RuleTrigger) || inferRuleTrigger(r.ruleCode, r.awardType);
  return {
    ruleCode: r.ruleCode,
    sport: r.sport,
    points: Number(r.points) || 0,
    trigger: trigger || null,
    category: inferRuleCategory(r.ruleCode, r.category),
    minTeams: conditions && Number(conditions.minTeams) > 0 ? Number(conditions.minTeams) : null,
  };
}

const norm = (v?: string | null) => (v || '').trim().toLowerCase();

/**
 * Pick the rule for a trigger: exact category match first, then a category-less rule,
 * then the default men's category. Rules with a minimum-team condition are skipped when not met.
 */
export function findRuleForTrigger(
  rules: EffectiveRule[],
  trigger: RuleTrigger,
  eventCategory?: string | null,
  teamCount?: number
): EffectiveRule | null {
  const candidates = rules.filter(
    (r) => r.trigger === trigger && (!r.minTeams || (teamCount ?? 0) >= r.minTeams)
  );
  if (candidates.length === 0) return null;

  const cat = norm(eventCategory);
  return (
    candidates.find((r) => r.category && cat && norm(r.category) === cat) ||
    candidates.find((r) => !r.category) ||
    candidates.find((r) => norm(r.category) === norm("Men's singles / doubles")) ||
    null
  );
}
