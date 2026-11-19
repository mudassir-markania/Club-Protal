'use client';

import React, { useEffect, useState } from 'react';
import { Edit2, Plus, Trash2, X } from 'lucide-react';
import { ClubBadge, SportIcon } from '@/components/ui/icons';
import { getScheduleConfig } from '@club-portal/shared';
import DoublesTeamFormModal from '@/components/admin/DoublesTeamFormModal';

interface Props {
  clubs: any[];
  category: 'DOUBLES' | 'MIXED_DOUBLES';
  search?: string;
}

export default function DoublesTeamsManager({ clubs, category, search = '' }: Props) {
  const isMixed = category === 'MIXED_DOUBLES';
  const title = isMixed ? 'Mixed Doubles Teams' : 'Doubles Teams';

  const [teams, setTeams] = useState<any[]>([]);
  const [sports, setSports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  // Doubles are split into Men's and Women's; Mixed Doubles is its own tab
  const [section, setSection] = useState<'MALE' | 'FEMALE'>('MALE');

  const load = async () => {
    setLoading(true);
    try {
      const [t, s] = await Promise.all([fetch(`/api/doubles-teams?category=${category}`), fetch('/api/sports')]);
      const td = await t.json();
      const sd = await s.json();
      setTeams(Array.isArray(td) ? td : []);
      setSports(
        (Array.isArray(sd) ? sd : []).filter((x: any) => getScheduleConfig(x.name, x.sportType).allowDoubles)
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  const openForm = (team?: any) => {
    setEditing(team || null);
    setOpen(true);
  };

  const remove = async (team: any) => {
    if (!confirm(`Delete team "${team.name}"?`)) return;
    const res = await fetch(`/api/doubles-teams/${team.id}`, { method: 'DELETE' });
    const data = await res.json();
    setMessage(res.ok ? 'Team deleted.' : data.error || 'Failed to delete team');
    if (res.ok) load();
  };

  const toggleStatus = async (team: any) => {
    const status = team.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const res = await fetch(`/api/doubles-teams/${team.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    setMessage(res.ok ? `Team set to ${status}.` : data.error);
    load();
  };

  const countOf = (g: 'MALE' | 'FEMALE') => teams.filter((t) => t.gender === g).length;
  const unsorted = teams.filter((t) => !isMixed && t.gender !== 'MALE' && t.gender !== 'FEMALE'); // older teams with mixed genders

  const q = search.trim().toLowerCase();
  const visible = teams
    .filter((t) => isMixed || t.gender === section)
    .filter(
    (t) =>
      !q ||
      t.name.toLowerCase().includes(q) ||
      (t.clubs || []).some((c: any) => c.name.toLowerCase().includes(q)) ||
      (t.sport?.name || '').toLowerCase().includes(q) ||
      (t.players || []).some((p: any) => p.name.toLowerCase().includes(q))
  );

  const sectionLabel = isMixed ? title : section === 'MALE' ? "Men's Doubles Teams" : "Women's Doubles Teams";

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="p-4 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between gap-3 flex-wrap">
        <div>
          <span className="text-xs font-bold text-navy-950 uppercase tracking-wider block">{sectionLabel}</span>
          <span className="text-[11px] text-slate-500">
            {isMixed
              ? 'One male and one female player (from any clubs), registered for the sport.'
              : section === 'MALE'
              ? 'Two male players (from any clubs), registered for the sport.'
              : 'Two female players (from any clubs), registered for the sport.'}
          </span>
        </div>
        <button
          onClick={() => openForm()}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-navy-950 hover:bg-navy-900 text-white text-xs font-bold rounded-xl transition"
        >
          <Plus className="w-3.5 h-3.5" /> New Team
        </button>
      </div>

      {!isMixed && (
        <div className="px-4 pt-3 flex items-center gap-1.5 text-xs">
          {[
            { v: 'MALE' as const, l: "Men's Doubles" },
            { v: 'FEMALE' as const, l: "Women's Doubles" },
          ].map((o) => (
            <button
              key={o.v}
              onClick={() => setSection(o.v)}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                section === o.v ? 'bg-blue-600 text-white shadow-2xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {o.l} ({countOf(o.v)})
            </button>
          ))}
        </div>
      )}

      {unsorted.length > 0 && (
        <div className="mx-4 mt-3 p-2.5 text-xs rounded-lg bg-amber-50 border border-amber-200 text-amber-800">
          {unsorted.length} older doubles team(s) have one man and one woman: {unsorted.map((t) => t.name).join(', ')}. They fit neither
          section. Delete them or recreate them as Mixed Doubles.
        </div>
      )}

      {message && (
        <div className="mx-4 mt-3 p-2.5 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 flex items-center justify-between">
          <span>{message}</span>
          <button onClick={() => setMessage(null)} aria-label="Dismiss">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <div className="p-4">
        {loading ? (
          <p className="text-xs text-slate-400 text-center py-8">Loading teams…</p>
        ) : visible.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-8">
            {(isMixed ? teams.length : countOf(section)) === 0 ? `No ${sectionLabel.toLowerCase()} yet. Create the first one.` : 'No teams match your search.'}
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {visible.map((t) => (
              <div key={t.id} className="p-3.5 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <span className="font-extrabold text-sm text-navy-950 block truncate">{t.name}</span>
                    <span className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[11px] font-bold text-blue-700">
                      {(t.clubs?.length ? t.clubs : t.club ? [t.club] : []).map((c: any) => (
                        <span key={c.id} className="inline-flex items-center gap-1">
                          <ClubBadge code={c.code} name={c.name} className="w-3.5 h-3.5" />
                          {c.name}
                        </span>
                      ))}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-500">
                      <SportIcon name={t.sport?.name} className="w-3 h-3" />
                      {t.sport?.name}
                    </span>
                  </div>
                  <button
                    onClick={() => toggleStatus(t)}
                    title="Toggle active / inactive"
                    className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      t.status === 'ACTIVE'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-slate-100 text-slate-500 border-slate-200'
                    }`}
                  >
                    {t.status}
                  </button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {(t.players || []).map((p: any) => (
                    <span key={p.id} className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px] font-semibold text-slate-700">
                      {p.name}
                      {p.clubCode && <span className="ml-1 text-slate-400">({p.clubCode})</span>}
                    </span>
                  ))}
                </div>
                <div className="flex justify-end gap-1 pt-1 border-t border-slate-100">
                  <button onClick={() => openForm(t)} title="Edit team" className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-md">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => remove(t)} title="Delete team" className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-md">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <DoublesTeamFormModal
        open={open}
        onClose={() => setOpen(false)}
        editing={editing}
        clubs={clubs}
        sports={sports}
        category={category}
        fixedGender={isMixed || editing ? undefined : section}
        onSaved={(_team, wasEdit) => {
          setMessage(wasEdit ? 'Team updated.' : 'Team created.');
          load();
        }}
      />
    </div>
  );
}
