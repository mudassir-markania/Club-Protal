'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Search, Users, X } from 'lucide-react';
import { ClubBadge, SportIcon } from '@/components/ui/icons';

interface Props {
  sport: any | null;
  clubs: any[];
  onClose: () => void;
}

/** Players registered for one sport. The list comes from /api/players?sportId=… (database-side filter). */
export default function SportPlayersModal({ sport, clubs, onClose }: Props) {
  const [mounted, setMounted] = useState(false);
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [clubId, setClubId] = useState('');

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!sport) return;
    setSearch('');
    setClubId('');
  }, [sport]);

  useEffect(() => {
    if (!sport) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    const qs = new URLSearchParams({ sportId: sport.id });
    if (clubId) qs.set('clubId', clubId);
    fetch(`/api/players?${qs.toString()}`)
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || 'Failed to load players');
        return d;
      })
      .then((d) => !cancelled && setPlayers(Array.isArray(d) ? d : []))
      .catch((e) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [sport, clubId]);

  useEffect(() => {
    if (!sport) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [sport, onClose]);

  if (!mounted || !sport) return null;

  const q = search.trim().toLowerCase();
  const visible = players.filter((p) => !q || p.name.toLowerCase().includes(q));
  const clubsInSport = new Set(players.map((p) => p.clubId)).size;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] bg-navy-950/80 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="bg-white sm:rounded-2xl rounded-t-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden"
      >
        <div className="p-4 bg-navy-950 text-white flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-400 shrink-0">
              <SportIcon name={sport.name} className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-extrabold text-sm sm:text-base truncate">{sport.name} Players</h3>
              <p className="text-xs text-blue-300 font-medium">
                {loading ? 'Loading…' : `${players.length} player${players.length !== 1 ? 's' : ''} from ${clubsInSport} club${clubsInSport !== 1 ? 's' : ''}`}
              </p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close" className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-navy-900">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3 sm:p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-2 shrink-0 text-xs">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search player name"
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
            />
          </div>
          <select
            value={clubId}
            onChange={(e) => setClubId(e.target.value)}
            aria-label="Filter by club"
            className="px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-700 outline-none focus:ring-2 focus:ring-blue-600 sm:w-52"
          >
            <option value="">All clubs</option>
            {clubs.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1 overflow-y-auto">
          {error ? (
            <p className="p-8 text-center text-xs font-semibold text-red-600">{error}</p>
          ) : loading ? (
            <p className="p-8 text-center text-xs text-slate-400">Loading players…</p>
          ) : visible.length === 0 ? (
            <div className="p-10 text-center text-xs text-slate-400">
              <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p className="font-semibold text-slate-600">
                {players.length === 0 ? `No players are registered for ${sport.name} yet.` : 'No players match your search.'}
              </p>
              {players.length === 0 && <p className="mt-1">Assign this sport to players on the Players page.</p>}
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] sticky top-0">
                <tr>
                  <th className="py-2 px-4">Player</th>
                  <th className="py-2 px-4">Club</th>
                  <th className="py-2 px-4 hidden sm:table-cell">Other sports</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visible.map((p) => {
                  const others = (p.sports || [])
                    .filter((s: any) => s.sportId !== sport.id)
                    .map((s: any) => s.sport?.name)
                    .filter(Boolean);
                  return (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-4">
                        <span className="font-bold text-slate-900 block">{p.name}</span>
                        <span className="text-[10px] text-slate-400">{p.gender}</span>
                      </td>
                      <td className="py-2.5 px-4">
                        <span className="inline-flex items-center gap-1.5 font-semibold text-slate-700">
                          <ClubBadge code={p.club?.code} name={p.club?.name} className="w-4 h-4" />
                          {p.club?.name}
                          <span className="text-slate-400 font-normal">({p.club?.code})</span>
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-slate-500 hidden sm:table-cell">{others.join(', ') || '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
