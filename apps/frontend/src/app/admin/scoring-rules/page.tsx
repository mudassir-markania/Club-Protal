'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import {
  FileText,
  Shield,
  Sparkles,
  RotateCcw,
  Save,
  CheckCircle2,
  AlertTriangle,
  Medal,
  Award,
  Gamepad2,
  Flame,
  Info,
  Check,
  Plus,
  Edit2,
  Trash2,
} from 'lucide-react';
import { SportIcon } from '@/components/ui/icons';
import ScoringRuleFormModal from '@/components/admin/ScoringRuleFormModal';
import { toEffectiveRule, triggerLabel } from '@club-portal/shared';
import { categoryDisplayName } from '@club-portal/shared';

export default function AdminScoringRulesPage() {
  const [rules, setRules] = useState<any[]>([]);
  const [categoryLabels, setCategoryLabels] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Filter sport tab
  const [selectedSport, setSelectedSport] = useState<string>('ALL');

  // Create / edit rule modal
  const [formOpen, setFormOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<any | null>(null);
  const [isAdmin, setIsAdmin] = useState(true);

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/scoring-rules');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setRules(data.rules || []);
      setCategoryLabels(data.categoryLabels || {});
      if (typeof data.isAdmin === 'boolean') setIsAdmin(data.isAdmin);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handlePointChange = (ruleCode: string, newPoints: number) => {
    setRules((prev) =>
      prev.map((r) => (r.ruleCode === ruleCode ? { ...r, points: Math.max(0, newPoints) } : r))
    );
  };

  const handleCategoryLabelChange = (catName: string, label: string) => {
    setCategoryLabels((prev) => ({
      ...prev,
      [catName]: label,
    }));
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/scoring-rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rules,
          categoryLabels,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessage({ type: 'success', text: 'Official scoring configuration saved successfully.' });
      fetchRules();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleResetToPdf = async () => {
    if (!confirm('Reset all sports rules and values to the official sports_points_distribution.pdf defaults?')) {
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/admin/scoring-rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'RESET_TO_PDF' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessage({ type: 'success', text: 'All rules successfully restored to official PDF values!' });
      fetchRules();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const openCreate = () => {
    setEditingRule(null);
    setFormOpen(true);
  };

  const openEdit = (rule: any) => {
    setEditingRule(rule);
    setFormOpen(true);
  };

  const handleDeleteRule = async (rule: any) => {
    if (!confirm(`Delete rule ${rule.ruleCode} ("${rule.ruleName}")?

Matches calculated after this will no longer award these points. Past results are not changed.`)) return;
    try {
      const res = await fetch(`/api/admin/scoring-rules/${encodeURIComponent(rule.ruleCode)}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete rule');
      setMessage({ type: 'success', text: data.message || 'Rule deleted.' });
      fetchRules();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const handleBulkDelete = async () => {
    const scope = selectedSport === 'ALL' ? 'ALL' : selectedSport;
    const label = scope === 'ALL' ? 'ALL scoring rules for every sport' : `all ${scope} scoring rules`;
    const count = scope === 'ALL' ? rules.length : rules.filter((r) => r.sport === scope).length;
    if (count === 0) return;

    const typed = window.prompt(
      `This will permanently delete ${label} (${count} rule${count !== 1 ? 's' : ''}).

` +
        `Matches calculated afterwards will award no points from these rules until you restore them with "Reset to PDF Defaults". Past results are not changed.

` +
        `Type DELETE to confirm:`
    );
    if (typed === null) return;
    if (typed.trim() !== 'DELETE') {
      setMessage({ type: 'error', text: 'Bulk delete cancelled: confirmation text did not match.' });
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/scoring-rules?sport=${encodeURIComponent(scope)}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete rules');
      setMessage({ type: 'success', text: data.message || 'Rules deleted.' });
      fetchRules();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const sportsList = ['ALL', 'FOOTBALL', 'BGMI', 'CRICKET', 'BADMINTON', 'CARROM', 'CHESS'];

  const filteredRules = rules.filter((r) => {
    if (selectedSport === 'ALL') return true;
    return r.sport === selectedSport;
  });

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Header & Source of Truth Banner */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold tracking-tight text-navy-950">
                Official Sports Scoring Configuration
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                PDF Source of Truth
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Automatic sports point values derived directly from{' '}
              <strong className="text-navy-900">sports_points_distribution.pdf</strong>. Referees submit match results and points are distributed automatically without manual calculations.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={openCreate}
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-2xs transition disabled:opacity-50"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Rule
            </button>
            {isAdmin && filteredRules.length > 0 && (
              <button
                onClick={handleBulkDelete}
                disabled={saving}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold rounded-xl shadow-2xs transition disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {selectedSport === 'ALL' ? 'Delete All Rules' : `Delete All ${selectedSport} Rules`}
              </button>
            )}
            <button
              onClick={handleResetToPdf}
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl shadow-2xs transition disabled:opacity-50"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset to PDF Defaults
            </button>
            <button
              onClick={handleSaveAll}
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-5 py-2 bg-navy-950 hover:bg-navy-900 text-white text-xs font-extrabold rounded-xl shadow-sm transition disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
            </button>
          </div>
        </div>

        {/* Message Banner */}
        {message && (
          <div
            className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center justify-between ${
              message.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{message.text}</span>
            </div>
            <button onClick={() => setMessage(null)} className="p-1 rounded text-slate-500 hover:text-slate-800">
              ×
            </button>
          </div>
        )}

        {/* PDF Rules Matrix Overview Banner */}
        <div className="bg-gradient-to-r from-navy-950 via-slate-900 to-navy-950 text-white rounded-2xl p-5 border border-navy-800 shadow-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#C6A04A] block">
                TOURNAMENT AUTOMATIC SCORING SPECIFICATION
              </span>
              <h3 className="text-base font-extrabold">APL Season 9 House Championship Matrix</h3>
              <p className="text-xs text-slate-300 max-w-2xl">
                Normal matches award match win points. Finals award final winner / runner-up points. Individual awards (Top Scorer, MVP, Best Batsman/Bowler, MOTM) are credited directly to the athlete&apos;s house. Team points are divided equally between the team&apos;s players, and each player&apos;s share goes to that player&apos;s house.
              </p>
            </div>
            <div className="shrink-0 flex items-center gap-2">
              <div className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-center">
                <span className="text-lg font-mono font-black text-amber-400 block">6</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Sports</span>
              </div>
              <div className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-center">
                <span className="text-lg font-mono font-black text-amber-400 block">35+</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Official Rules</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sport Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {sportsList.map((sp) => (
            <button
              key={sp}
              onClick={() => setSelectedSport(sp)}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition whitespace-nowrap ${
                selectedSport === sp
                  ? 'bg-navy-950 text-white shadow-2xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {sp === 'ALL' ? 'All Sports Rules' : sp}
            </button>
          ))}
        </div>

        {/* Rules Table / Cards */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-navy-950 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              <span>Official Rules Ledger ({filteredRules.length} Rules)</span>
            </h3>
            <span className="text-xs text-slate-400 font-medium">Editable by Authorized Admins Only</span>
          </div>

          <div className="divide-y divide-slate-100">
            {!loading && filteredRules.length === 0 && (
              <p className="p-8 text-center text-xs text-slate-400">
                No rules for this sport yet. Use <strong>Add Rule</strong> to create one.
              </p>
            )}
            {filteredRules.map((rule) => (
              <div
                key={rule.ruleCode}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 transition"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-[11px] font-extrabold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                      {rule.ruleCode}
                    </span>
                    <span className="font-extrabold text-sm text-navy-950">{rule.ruleName}</span>
                    <span className="text-xs font-bold text-slate-500">• {rule.sport}</span>
                    {rule.category && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                        {categoryDisplayName(toEffectiveRule(rule).category || rule.category)}
                      </span>
                    )}
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        rule.awardType === 'INDIVIDUAL'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {rule.awardType} AWARD
                    </span>
                    {rule.isTournamentLevel && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-700">
                        Tournament Level
                      </span>
                    )}
                    {toEffectiveRule(rule).trigger && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                        On: {triggerLabel(toEffectiveRule(rule).trigger)}
                        {toEffectiveRule(rule).minTeams ? ` (${toEffectiveRule(rule).minTeams}+ teams)` : ''}
                      </span>
                    )}
                    {rule.enabled === false && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200">
                        Disabled
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">{rule.description}</p>
                  {rule.conditions && (
                    <span className="text-[11px] text-amber-700 font-medium block">
                      Condition: {JSON.stringify(rule.conditions)} (e.g. 7 participating teams)
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min="0"
                      value={rule.points}
                      onChange={(e) => handlePointChange(rule.ruleCode, parseFloat(e.target.value) || 0)}
                      className="w-20 px-2.5 py-1.5 font-mono text-sm font-black text-right border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none text-navy-950"
                    />
                    <span className="text-xs font-bold text-slate-500">pts</span>
                  </div>
                  {isAdmin && rule.id && (
                    <div className="flex items-center gap-0.5">
                      <button
                        onClick={() => openEdit(rule)}
                        title="Edit rule"
                        className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-md transition"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteRule(rule)}
                        title="Delete rule"
                        className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-md transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <ScoringRuleFormModal
          open={formOpen}
          onClose={() => setFormOpen(false)}
          editing={editingRule}
          defaultSport={selectedSport !== 'ALL' ? selectedSport : undefined}
          onSaved={(text) => {
            setMessage({ type: 'success', text });
            fetchRules();
          }}
        />

        {/* Category Labels Configuration Section */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-sm text-navy-950 flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-600" />
              <span>Configurable Category Labels (MD, WD, Mixed, etc.)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              In accordance with tournament instructions, &quot;MD&quot; and &quot;WD&quot; are retained verbatim from the source PDF. Authorized administrators can describe and clarify their tournament meaning below.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(categoryLabels).map(([catKey, labelVal]) => (
              <div key={catKey} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-navy-950">{catKey}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">PDF Category</span>
                </div>
                <input
                  type="text"
                  value={labelVal}
                  onChange={(e) => handleCategoryLabelChange(catKey, e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg bg-white text-xs text-navy-950 font-medium focus:ring-2 focus:ring-blue-600 outline-none"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

