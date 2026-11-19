import { db } from '@/lib/db';
import { toEffectiveRule, triggerLabel } from '@club-portal/shared';

const norm = (v?: string | null) => (v || '').trim().toLowerCase();

/**
 * Two enabled team rules must not claim the same sport + trigger + category, otherwise the points are ambiguous.
 * Returns a message when a conflicting rule exists.
 */
export async function findRuleConflict(
  rule: { sport: string; trigger?: string | null; category?: string | null; awardType?: string; enabled?: boolean; ruleCode: string },
  excludeRuleCode?: string
): Promise<string | null> {
  if ((rule.awardType || 'TEAM') !== 'TEAM' || rule.enabled === false || !rule.trigger) return null;

  const existing = await db.sportScoringRule.findMany({ where: { sport: rule.sport } });
  const clash = existing.find((r: any) => {
    if (r.ruleCode === excludeRuleCode || r.ruleCode === rule.ruleCode || r.enabled === false) return false;
    const e = toEffectiveRule(r);
    return e.trigger === rule.trigger && norm(e.category) === norm(rule.category);
  });
  return clash
    ? `Rule ${clash.ruleCode} already awards points for "${triggerLabel(rule.trigger)}"${rule.category ? ` (${rule.category})` : ''} in ${rule.sport}. Edit or disable it instead.`
    : null;
}
