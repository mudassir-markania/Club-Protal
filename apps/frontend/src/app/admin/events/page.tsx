'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { AlertTriangle, CheckCircle2, Medal, RotateCcw, Trophy } from 'lucide-react';
import { ClubBadge, SportIcon } from '@/components/ui/icons';
import SearchableSelect from '@/components/ui/SearchableSelect';
import { categoryDisplayName, getScheduleConfig } from '@club-portal/shared';

const EVENT_SPORTS = ['Badminton', 'Carrom', 'Chess'];
const ORDINAL = ['1st', '2nd', '3rd'];

export default function EventStandingsPage() {
  const [sports, setSports] = useState<any[]>([]);
  const [sportId, setSportId] = useState('');
  const [category, setCategory] = useState("Men's singles / doubles");
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [placements, setPlacements] = useState<string[]>(['', '', '']);

  // Only sports scored by event standings
  useEffect(() => {
    fetch('/api/sports')
      .then((r) => r.json())
      .then((d) => {
        const list = (Array.isArray(d) ? d : []).filter((s: any) => EVENT_SPORTS.includes(s.name));
        setSports(list);
        if (list[0]) setSportId((cur) => cur || list[0].id);
      })
      .catch(() => setSports([]));
  }, []);

  const sport = sports.find((s) => s.id === sportId);
  const categories = useMemo(() => {
    const cfg = getScheduleConfig(sport?.name, sport?.sportType);
    return cfg.formats.length
      ? cfg.formats.flatMap((f) => f.options.map((o) => ({ code: o.code, label: o.label, format: f.label })))
      : cfg.categories.map((c) => ({ code: c.code, label: c.label, format: c.label })); // e.g. Chess: Classical
  }, [sport]);

  // keep the selected event valid when switching sport
  useEffect(() => {
    if (!sport) return; // wait until the sport (and so its real categories) is known
    if (categories.length && !categories.some((c) => c.code === category)) setCategory(categories[0].code);
  }, [sport, categories, category]);

  const load = useCallback(async () => {
    // never request an event that does not belong to the selected sport (e.g. while switching sports)
    if (!sportId || !sport || !categories.some((c) => c.code === category)) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/events/standings?sportId=${sportId}&category=${encodeURIComponent(category)}`);
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || 'Failed to load standings');
      setData(d);
      setPlacements([d.standings[0]?.key || '', d.standings[1]?.key || '', d.standings[2]?.key || '']);
    } catch (e: any) {
      setData(null);
      setMessage({ type: 'error', text: e.message });
    } finally {
      setLoading(false);
    }
  }, [sportId, sport, categories, category]);

  useEffect(() => {
    load();
  }, [load]);

  const finalize = async () => {
    if (!data) return;
    const label = `${data.sport.name} ${categoryDisplayName(category)}`;
    if (
      !confirm(
        `${data.finalized ? 'Re-finalize' : 'Finalize'} ${label}?\n\nThe 1st, 2nd and 3rd place points are credited to the clubs and the leaderboard is updated.` +
          (data.finalized ? '\n\nThe points from the earlier result are replaced.' : '')
      )
    )
      return;
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch('/api/events/finalize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sportId, category, placements: placements.filter(Boolean) }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || 'Failed to finalize');
      setMessage({ type: 'success', text: d.message });
      load();
    } catch (e: any) {
      setMessage({ type: 'error', text: e.message });
    } finally {
      setBusy(false);
    }
  };

  const undo = async () => {
    if (!confirm('Undo this event result? Its points are removed from the clubs and the leaderboard is updated.')) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/events/finalize?sportId=${sportId}&category=${encodeURIComponent(category)}`, { method: 'DELETE' });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || 'Failed to undo');
      setMessage({ type: 'success', text: d.message });
      load();
    } catch (e: any) {
      setMessage({ type: 'error', text: e.message });
    } finally {
      setBusy(false);
    }
  };

  const pointsFor = (pos: number) => data?.pointsByPosition?.find((p: any) => p.position === pos)?.points ?? 0;
  const standings: any[] = data?.standings || [];
  const hasTie = standings.slice(0, 3).some((s) => s.tied);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold tracking-tight text-navy-950">Event Standings</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">Badminton, Carrom & Chess</span>
          </div>
          <p className="text-xs text-slate-500">
            Badminton, Carrom and Chess matches award no points. Each event is ranked by match wins, and finalizing it credits the 1st, 2nd and 3rd place points to the
            leaderboard.
          </p>
        </div>

        {message && (
          <div
            className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center justify-between ${
              message.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            <span className="flex items-center gap-2">
              {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
              {message.text}
            </span>
            <button onClick={() => setMessage(null)} aria-label="Dismiss" className="text-slate-500 hover:text-slate-800">
              ×
            </button>
          </div>
        )}

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mr-1">Sport:</span>
            {sports.map((s) => (
              <button
                key={s.id}
                onClick={() => setSportId(s.id)}
                className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                  sportId === s.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <SportIcon name={s.name} className="w-3.5 h-3.5" />
                {s.name}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-1.5 pt-3 border-t border-slate-100">
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mr-1">Event:</span>
            {categories.map((c) => (
              <button
                key={c.code}
                onClick={() => setCategory(c.code)}
                className={`px-3 py-1.5 rounded-lg font-bold transition ${
                  category === c.code ? 'bg-navy-950 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Standings */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-navy-950 flex items-center gap-2">
                <Medal className="w-4 h-4 text-blue-600" />
                {sport?.name} {categoryDisplayName(category)} standings
              </h3>
              {data && (
                <span className="text-[11px] text-slate-500">
                  {data.completedCount} of {data.matchCount} matches completed
                </span>
              )}
            </div>
            {loading ? (
              <p className="p-8 text-center text-xs text-slate-400">Loading standings…</p>
            ) : standings.length === 0 ? (
              <p className="p-8 text-center text-xs text-slate-400">No matches scheduled for this event yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="py-2 px-4">#</th>
                      <th className="py-2 px-4">Player / Team</th>
                      <th className="py-2 px-4">Clubs</th>
                      <th className="py-2 px-4 text-center">Played</th>
                      <th className="py-2 px-4 text-center">Won</th>
                      <th className="py-2 px-4 text-center">Lost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {standings.map((s) => (
                      <tr key={s.key} className={s.rank <= 3 ? 'bg-amber-50/30' : ''}>
                        <td className="py-2.5 px-4 font-black text-slate-700">{s.rank}</td>
                        <td className="py-2.5 px-4 font-bold text-slate-900">
                          {s.name}
                          {s.tied && s.rank <= 3 && <span className="ml-2 text-[10px] font-bold text-amber-700">tied</span>}
                        </td>
                        <td className="py-2.5 px-4">
                          <span className="inline-flex flex-wrap gap-x-2">
                            {s.clubs.map((c: any) => (
                              <span key={c.id} className="inline-flex items-center gap-1 text-slate-600">
                                <ClubBadge code={c.code} name={c.name} className="w-3 h-3" />
                                {c.code || c.name}
                              </span>
                            ))}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-center font-mono">{s.played}</td>
                        <td className="py-2.5 px-4 text-center font-mono font-bold text-emerald-700">{s.wins}</td>
                        <td className="py-2.5 px-4 text-center font-mono text-slate-500">{s.losses}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Finalize */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 space-y-3 text-xs">
            <h3 className="font-extrabold uppercase tracking-wider text-navy-950 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" />
              Award placement points
            </h3>

            {data?.finalized && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-1.5">
                <span className="font-bold block">Finalized {new Date(data.finalized.finalizedAt).toLocaleString()}</span>
                {data.finalized.placements.map((p: any) => (
                  <div key={p.position} className="flex items-start justify-between gap-2">
                    <span>
                      <strong>{ORDINAL[p.position - 1]}</strong> {p.name}
                      <span className="block text-[10px] text-emerald-700">
                        {p.clubs.map((c: any) => `${c.clubCode || c.clubName} +${Number(c.points).toFixed(2)}`).join(', ')}
                      </span>
                    </span>
                    <span className="font-mono font-bold shrink-0">{p.points} pts</span>
                  </div>
                ))}
              </div>
            )}

            {hasTie && (
              <p className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800">
                Some of the top 3 are tied on wins and losses. Check the placements below and adjust them before finalizing.
              </p>
            )}

            {[0, 1, 2].filter((i) => i === 0 || pointsFor(i + 1) > 0).map((i) => (
              <div key={i}>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[10px]">
                  {ORDINAL[i]} place <span className="normal-case font-semibold text-emerald-700">({pointsFor(i + 1)} pts)</span>
                </label>
                <SearchableSelect
                  value={placements[i]}
                  onChange={(v) => setPlacements((prev) => prev.map((x, k) => (k === i ? v : x)))}
                  placeholder={i === 0 ? 'Select 1st place' : 'Not awarded'}
                  searchPlaceholder="Search player or team…"
                  options={standings.map((s) => ({
                    value: s.key,
                    label: s.name,
                    hint: `${s.wins}W ${s.losses}L`,
                    disabled: placements.includes(s.key) && placements[i] !== s.key,
                    disabledReason: 'already placed',
                  }))}
                />
              </div>
            ))}

            <button
              onClick={finalize}
              disabled={busy || !placements[0] || !data?.completedCount}
              className="w-full px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold rounded-xl flex items-center justify-center gap-1.5"
            >
              <Trophy className="w-4 h-4" />
              {busy ? 'Working…' : data?.finalized ? 'Re-finalize event' : 'Finalize event & award points'}
            </button>
            {!data?.completedCount && <p className="text-slate-400">Record at least one match winner to finalize this event.</p>}

            {data?.finalized && (
              <button
                onClick={undo}
                disabled={busy}
                className="w-full px-4 py-2 border border-red-200 text-red-700 hover:bg-red-50 font-bold rounded-xl flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Undo event result
              </button>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
