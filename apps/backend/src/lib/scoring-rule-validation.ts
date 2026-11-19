import { TRIGGER_IDS } from '@club-portal/shared';

export const RULE_SPORTS = ['FOOTBALL', 'BGMI', 'CRICKET', 'BADMINTON', 'CARROM', 'CHESS'] as const;
export const AWARD_TYPES = ['TEAM', 'INDIVIDUAL'] as const;

export interface RuleInput {
  sport?: unknown;
  ruleCode?: unknown;
  ruleName?: unknown;
  category?: unknown;
  awardType?: unknown;
  isTournamentLevel?: unknown;
  points?: unknown;
  description?: unknown;
  enabled?: unknown;
  trigger?: unknown;
  minTeams?: unknown;
}

/** Validate and normalise a scoring rule payload. `partial` = update (all fields optional). */
export function validateRule(input: RuleInput, partial: boolean): { error: string | null; value: Record<string, any> } {
  const value: Record<string, any> = {};
  const has = (k: keyof RuleInput) => input[k] !== undefined;

  if (!partial || has('sport')) {
    const sport = String(input.sport || '').toUpperCase();
    if (!(RULE_SPORTS as readonly string[]).includes(sport)) return { error: `Sport must be one of ${RULE_SPORTS.join(', ')}`, value };
    value.sport = sport;
  }
  if (!partial) {
    const code = String(input.ruleCode || '').trim().toUpperCase();
    if (!/^[A-Z0-9_]{3,40}$/.test(code)) return { error: 'Rule code must be 3-40 characters: letters, numbers and underscores', value };
    value.ruleCode = code;
  }
  if (!partial || has('ruleName')) {
    const name = String(input.ruleName || '').trim();
    if (!name) return { error: 'Rule name is required', value };
    if (name.length > 120) return { error: 'Rule name must be at most 120 characters', value };
    value.ruleName = name;
  }
  if (!partial || has('points')) {
    const pts = Number(input.points);
    if (input.points === '' || input.points === null || input.points === undefined || !Number.isFinite(pts) || pts < 0 || pts > 10000) {
      return { error: 'Points must be a number between 0 and 10000', value };
    }
    value.points = pts;
  }
  if (!partial || has('awardType')) {
    const t = String(input.awardType || 'TEAM').toUpperCase();
    if (!(AWARD_TYPES as readonly string[]).includes(t)) return { error: 'Award type must be TEAM or INDIVIDUAL', value };
    value.awardType = t;
  }
  if (has('category')) {
    const c = String(input.category ?? '').trim();
    if (c.length > 60) return { error: 'Category must be at most 60 characters', value };
    value.category = c || null;
  }
  if (has('description')) {
    const d = String(input.description ?? '').trim();
    if (d.length > 500) return { error: 'Description must be at most 500 characters', value };
    value.description = d;
  }
  // When does a TEAM rule apply? (INDIVIDUAL awards are given through the result form, so they have no trigger)
  const awardTypeNow = String(value.awardType ?? input.awardType ?? 'TEAM').toUpperCase();
  if (awardTypeNow === 'INDIVIDUAL') {
    if (!partial || has('awardType') || has('trigger')) {
      value.trigger = null;
      value.conditions = null;
    }
  } else if (!partial || has('trigger')) {
    const t = String(input.trigger || '').toUpperCase();
    if (!TRIGGER_IDS.includes(t)) return { error: 'Choose when this team rule applies ("Awarded when")', value };
    value.trigger = t;
  }
  if (awardTypeNow !== 'INDIVIDUAL' && has('minTeams')) {
    const raw = input.minTeams;
    if (raw === '' || raw === null || raw === undefined || Number(raw) === 0) {
      value.conditions = null;
    } else {
      const n = Number(raw);
      if (!Number.isInteger(n) || n < 2 || n > 1000) return { error: 'Minimum teams must be a whole number of 2 or more', value };
      value.conditions = JSON.stringify({ minTeams: n });
    }
  }
  if (has('isTournamentLevel')) value.isTournamentLevel = Boolean(input.isTournamentLevel);
  if (has('enabled')) value.enabled = Boolean(input.enabled);
  return { error: null, value };
}
