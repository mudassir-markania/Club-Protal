'use client';

import React, { useEffect, useState } from 'react';
import { Edit2, Plus, Trash2, X } from 'lucide-react';
import { ClubBadge } from '@/components/ui/icons';
import { BGMI_TEAM_SIZE } from '@club-portal/shared';
import BgmiTeamFormModal from '@/components/admin/BgmiTeamFormModal';

interface Props {
  clubs: any[];
  search?: string;
}

const inputCls =
  'w-full px-3 py-2 border border-slate-200 rounded-lg bg-white font-semibold text-xs text-slate-900 outline-none focus:ring-2 focus:ring-blue-600 disabled:bg-slate-100 disabled:text-slate-400';

export default function BgmiTeamsManager({ clubs, search = '' }: Props) {
  const [teams, setTeams] = useState<any[]>([]);
  const [bgmiSportId, setBgmiSportId] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [t, s] = await Promise.all([fetch('/api/bgmi-teams'), fetch('/api/sports')]);
      const td = await t.json();
      const sd = await s.json();
      setTeams(Array.isArray(td) ? td : []);
      const bgmi = Array.isArray(sd) ? sd.find((x: any) => (x.name || '').toUpperCase() === 'BGMI') : null;
      setBgmiSportId(bgmi?.id || '');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openForm = (team?: any) => {
    setEditing(team || null);
    setOpen(true);
  };

  const remove = async (team: any) => {
    if (!confirm(`Delete BGMI team "${team.name}"?`)) return;
    const res = await fetch(`/api/bgmi-teams/${team.id}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error || 'Failed to delete team');
      return;
    }
    setMessage('Team deleted.');
    load();
  };

  const toggleStatus = async (team: any) => {
    const status = team.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const res = await fetch(`/api/bgmi-teams/${team.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    setMessage(res.ok ? `Team set to ${status}.` : data.error);
    load();
  };

  const q = search.trim().toLowerCase();
  const visible = teams.filter(
    (t) =>
      !q ||
      t.name.toLowerCase().includes(q) ||
      (t.clubs || []).some((c: any) => c.name.toLowerCase().includes(q)) ||
      (t.players || []).some((p: any) => p.name.toLowerCase().includes(q))
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="p-4 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between gap-3 flex-wrap">
        <div>
          <span className="text-xs font-bold text-navy-950 uppercase tracking-wider block">BGMI Teams</span>
          <span className="text-[11px] text-slate-500">
            Teams can have 1 to {BGMI_TEAM_SIZE} players (4 players are not mandatory) and may include players from different clubs. Teams are scheduled into BGMI matches as a unit.
          </span>
        </div>
        <button
          onClick={() => openForm()}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-navy-950 hover:bg-navy-900 text-white text-xs font-bold rounded-xl transition"
        >
          <Plus className="w-3.5 h-3.5" /> New Team
        </button>
      </div>

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
            {teams.length === 0 ? 'No BGMI teams yet. Create the first one.' : 'No teams match your search.'}
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {visible.map((t) => (
              <div key={t.id} className="p-3.5 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-extrabold text-sm text-navy-950 block truncate">{t.name}</span>
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                        {(t.players || []).length} player{(t.players || []).length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <span className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[11px] font-bold text-blue-700">
                      {(t.clubs?.length ? t.clubs : t.club ? [t.club] : []).map((c: any) => (
                        <span key={c.id} className="inline-flex items-center gap-1">
                          <ClubBadge code={c.code} name={c.name} className="w-3.5 h-3.5" />
                          {c.name}
                        </span>
                      ))}
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
                    <span
                      key={p.id}
                      className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px] font-semibold text-slate-700"
                    >
                      {p.name}
                      {p.clubCode && <span className="ml-1 text-slate-400">({p.clubCode})</span>}
                    </span>
                  ))}
                </div>
                <div className="flex justify-end gap-1 pt-1 border-t border-slate-100">
                  <button
                    onClick={() => openForm(t)}
                    title="Edit team"
                    className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-md"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => remove(t)}
                    title="Delete team"
                    className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-md"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BgmiTeamFormModal
        open={open}
        onClose={() => setOpen(false)}
        editing={editing}
        clubs={clubs}
        bgmiSportId={bgmiSportId}
        onSaved={(_team, wasEdit) => {
          setMessage(wasEdit ? 'Team updated.' : 'Team created.');
          load();
        }}
      />
    </div>
  );
}
