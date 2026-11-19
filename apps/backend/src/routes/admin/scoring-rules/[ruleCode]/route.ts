import { NextResponse } from '@/http/next-server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';
import { validateRule } from '@/lib/scoring-rule-validation';
import { DEFAULT_OFFICIAL_RULES } from '@club-portal/shared';
import { findRuleConflict } from '@/lib/scoring-rule-conflicts';
import { toEffectiveRule } from '@club-portal/shared';

const authError = (error: any) =>
  error?.message === 'UNAUTHORIZED' || error?.message === 'FORBIDDEN'
    ? NextResponse.json({ error: error.message }, { status: 403 })
    : NextResponse.json({ error: error?.message || 'Server error' }, { status: 500 });

export async function PUT(req: Request, { params }: { params: { ruleCode: string } }) {
  try {
    const user = await requireAuth(['SUPER_ADMIN', 'ADMIN']);
    const existing = await db.sportScoringRule.findUnique({ where: { ruleCode: params.ruleCode } });
    if (!existing) return NextResponse.json({ error: 'Scoring rule not found' }, { status: 404 });

    const body = await req.json();
    // the rule code is the identifier and cannot be changed
    const { error, value } = validateRule({ ...body, ruleCode: undefined }, true);
    if (error) return NextResponse.json({ error }, { status: 400 });
    if (Object.keys(value).length === 0) return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });

    // the merged rule must not collide with another enabled rule for the same sport/trigger/category
    const merged = { ...existing, ...value };
    const eff = toEffectiveRule(merged);
    if ((merged.awardType || 'TEAM') === 'TEAM' && !eff.trigger) {
      return NextResponse.json({ error: 'Choose when this team rule applies ("Awarded when")' }, { status: 400 });
    }
    const conflict = await findRuleConflict(
      { sport: merged.sport, trigger: eff.trigger, category: eff.category, awardType: merged.awardType, enabled: merged.enabled, ruleCode: params.ruleCode },
      params.ruleCode
    );
    if (conflict) return NextResponse.json({ error: conflict }, { status: 409 });

    const updated = await db.sportScoringRule.update({ where: { ruleCode: params.ruleCode }, data: value });
    await createAuditLog({ user, action: 'UPDATE_SCORING_RULE', entity: 'SportScoringRule', recordId: params.ruleCode, previousValue: existing, updatedValue: updated });
    return NextResponse.json({ success: true, rule: updated });
  } catch (error: any) {
    return authError(error);
  }
}

export async function DELETE(_req: Request, { params }: { params: { ruleCode: string } }) {
  try {
    const user = await requireAuth(['SUPER_ADMIN', 'ADMIN']);
    const existing = await db.sportScoringRule.findUnique({ where: { ruleCode: params.ruleCode } });
    if (!existing) return NextResponse.json({ error: 'Scoring rule not found' }, { status: 404 });

    await db.sportScoringRule.delete({ where: { ruleCode: params.ruleCode } });
    await createAuditLog({ user, action: 'DELETE_SCORING_RULE', entity: 'SportScoringRule', recordId: params.ruleCode, previousValue: existing });

    const wasOfficial = DEFAULT_OFFICIAL_RULES.some((r) => r.ruleCode === params.ruleCode);
    return NextResponse.json({
      success: true,
      message: wasOfficial ? 'Rule deleted. Use "Reset to PDF Defaults" to restore official rules.' : 'Rule deleted.',
    });
  } catch (error: any) {
    return authError(error);
  }
}
