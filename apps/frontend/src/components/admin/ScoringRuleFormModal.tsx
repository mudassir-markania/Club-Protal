'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, Check, X } from 'lucide-react';
import { RULE_TRIGGERS, toEffectiveRule } from '@club-portal/shared';

const SPORTS = ['FOOTBALL', 'BGMI', 'CRICKET', 'BADMINTON', 'CARROM', 'CHESS'];
const PREFIX: Record<string, string> = { FOOTBALL: 'FT', BGMI: 'BG', CRICKET: 'CR', BADMINTON: 'BD', CARROM: 'CM', CHESS: 'CH' };

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: (message: string) => void;
  editing?: any | null; // existing rule when editing
  defaultSport?: string;
}

const inputCls =
  'w-full px-3 py-2 border border-slate-200 rounded-lg bg-white font-semibold text-xs text-slate-900 outline-none focus:ring-2 focus:ring-blue-600 disabled:bg-slate-100 disabled:text-slate-500';

const slug = (s: string) => s.toUpperCase().replace(/[^A-Z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 30);

/** Create or edit a scoring rule. */
export default function ScoringRuleFormModal({ open, onClose, onSaved, editing = null, defaultSport }: Props) {
  const [mounted, setMounted] = useState(false);
  const [sport, setSport] = useState('FOOTBALL');
  const [ruleCode, setRuleCode] = useState('');
  const [codeTouched, setCodeTouched] = useState(false);
  const [ruleName, setRuleName] = useState('');
  const [category, setCategory] = useState('');
  const [awardType, setAwardType] = useState('TEAM');
  const [isTournamentLevel, setIsTournamentLevel] = useState(false);
  const [points, setPoints] = useState('0');
  const [description, setDescription] = useState('');
  const [enabled, setEnabled] = useState(true);
  const [trigger, setTrigger] = useState('MATCH_WIN');
  const [minTeams, setMinTeams] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    setSport(editing?.sport || (defaultSport && SPORTS.includes(defaultSport) ? defaultSport : 'FOOTBALL'));
    setRuleCode(editing?.ruleCode || '');
    setCodeTouched(false);
    setRuleName(editing?.ruleName || '');
    setCategory(editing?.category || '');
    setAwardType(editing?.awardType || 'TEAM');
    setIsTournamentLevel(Boolean(editing?.isTournamentLevel));
    setPoints(editing ? String(editing.points) : '0');
    setDescription(editing?.description || '');
    setEnabled(editing ? editing.enabled !== false : true);
    const eff = editing ? toEffectiveRule(editing) : null;
    setTrigger(eff?.trigger || 'MATCH_WIN');
    setMinTeams(eff?.minTeams ? String(eff.minTeams) : '');
    setError(null);
    setSaving(false);
  }, [open, editing, defaultSport]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && !saving && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, saving, onClose]);

  if (!mounted || !open) return null;

  const suggestCode = (sp: string, name: string) => (name.trim() ? `${PREFIX[sp] || sp.slice(0, 2)}_${slug(name)}` : '');

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!ruleName.trim()) return setError('Enter a rule name.');
    if (!editing && !/^[A-Z0-9_]{3,40}$/.test(ruleCode.trim().toUpperCase())) {
      return setError('Rule code must be 3-40 characters: letters, numbers and underscores.');
    }
    if (awardType === 'TEAM' && !trigger) return setError('Choose when this rule applies.');
    const pts = Number(points);
    if (points.trim() === '' || !Number.isFinite(pts) || pts < 0) return setError('Points must be a number, 0 or more.');

    const rule = { sport, ruleCode: ruleCode.trim().toUpperCase(), ruleName: ruleName.trim(), category: category.trim(), awardType, isTournamentLevel, points: pts, description: description.trim(), enabled, trigger: awardType === 'TEAM' ? trigger : null, minTeams: awardType === 'TEAM' ? minTeams : '' };

    setSaving(true);
    try {
      const res = editing
        ? await fetch(`/api/admin/scoring-rules/${encodeURIComponent(editing.ruleCode)}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(rule),
          })
        : await fetch('/api/admin/scoring-rules', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'CREATE', rule }),
          });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save rule');
      onSaved(editing ? `Rule ${rule.ruleCode} updated.` : `Rule ${rule.ruleCode} created.`);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] bg-navy-950/80 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4"
      onMouseDown={(e) => e.target === e.currentTarget && !saving && onClose()}
    >
      <form
        onSubmit={save}
        noValidate
        className="bg-white sm:rounded-2xl rounded-t-2xl w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl"
      >
        <div className="p-4 bg-navy-950 text-white flex items-center justify-between">
          <h3 className="font-extrabold text-sm">{editing ? `Edit Rule ${editing.ruleCode}` : 'Add Scoring Rule'}</h3>
          <button type="button" onClick={onClose} aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-3 overflow-y-auto text-xs">
          {error && (
            <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 rounded-lg font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[10px]">
                Sport <span className="text-red-500">*</span>
              </label>
              <select
                value={sport}
                disabled={!!editing}
                onChange={(e) => {
                  setSport(e.target.value);
                  if (!codeTouched) setRuleCode(suggestCode(e.target.value, ruleName));
                }}
                className={inputCls}
              >
                {SPORTS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[10px]">
                Rule code <span className="text-red-500">*</span>
              </label>
              <input
                value={ruleCode}
                disabled={!!editing}
                onChange={(e) => {
                  setCodeTouched(true);
                  setRuleCode(e.target.value.toUpperCase());
                }}
                placeholder="e.g. FT_HAT_TRICK"
                className={`${inputCls} font-mono`}
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[10px]">
              Rule name <span className="text-red-500">*</span>
            </label>
            <input
              value={ruleName}
              onChange={(e) => {
                setRuleName(e.target.value);
                if (!editing && !codeTouched) setRuleCode(suggestCode(sport, e.target.value));
              }}
              placeholder="e.g. Hat-trick bonus"
              className={inputCls}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[10px]">
                Points <span className="text-red-500">*</span>
              </label>
              <input type="number" min="0" step="any" value={points} onChange={(e) => setPoints(e.target.value)} className={`${inputCls} font-mono`} />
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[10px]">Award type</label>
              <select value={awardType} onChange={(e) => setAwardType(e.target.value)} className={inputCls}>
                <option value="TEAM">Team award</option>
                <option value="INDIVIDUAL">Individual award</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[10px]">
                Category <span className="normal-case font-medium text-slate-400">(optional)</span>
              </label>
              <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. MD, Mixed" className={inputCls} />
            </div>
          </div>

          {awardType === 'TEAM' ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-xl bg-blue-50/60 border border-blue-100">
              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[10px]">
                  Awarded when <span className="text-red-500">*</span>
                </label>
                <select value={trigger} onChange={(e) => setTrigger(e.target.value)} className={inputCls}>
                  {RULE_TRIGGERS.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-[11px] text-slate-500">
                  {RULE_TRIGGERS.find((t) => t.id === trigger)?.hint}. The winning player or team earns these points; if its players
                  come from several clubs, every club gets an equal share.
                </p>
              </div>
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[10px]">
                  Min. teams <span className="normal-case font-medium text-slate-400">(optional)</span>
                </label>
                <input
                  type="number"
                  min="2"
                  value={minTeams}
                  onChange={(e) => setMinTeams(e.target.value)}
                  placeholder="e.g. 7"
                  className={`${inputCls} font-mono`}
                />
              </div>
            </div>
          ) : (
            <p className="p-2.5 rounded-lg bg-amber-50 border border-amber-100 text-[11px] text-amber-800">
              Individual awards (MVP, Top Scorer, ...) are given to a player chosen in the match result form, and credited to that player&apos;s club.
            </p>
          )}

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[10px]">
              Description <span className="normal-case font-medium text-slate-400">(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="When is this awarded?"
              className={inputCls}
            />
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <label className="inline-flex items-center gap-2 font-semibold text-slate-700 cursor-pointer">
              <input type="checkbox" checked={isTournamentLevel} onChange={(e) => setIsTournamentLevel(e.target.checked)} className="rounded border-slate-300" />
              Tournament-level award
            </label>
            <label className="inline-flex items-center gap-2 font-semibold text-slate-700 cursor-pointer">
              <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} className="rounded border-slate-300" />
              Enabled (used when calculating points)
            </label>
          </div>
        </div>

        <div className="p-3 border-t border-slate-100 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-bold text-xs"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 bg-navy-950 hover:bg-navy-900 disabled:opacity-50 text-white font-extrabold rounded-xl text-xs flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            {saving ? 'Saving…' : editing ? 'Save Rule' : 'Create Rule'}
          </button>
        </div>
      </form>
    </div>,
    document.body
  );
}
