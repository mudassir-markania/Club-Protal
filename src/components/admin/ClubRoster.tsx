'use client';

import React, { useEffect, useState } from 'react';

/**
 * Club roster with a sport switcher.
 * Both lists come from the API (club -> players, club + sport -> players); nothing is filtered client-side.
 */
export default function ClubRoster({ clubId }: { clubId: string }) {
  const [sports, setSports] = useState<any[]>([]);
  const [sportId, setSportId] = useState('');
  const [players, setPlayers] = useState<any[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/clubs/${clubId}/sports`);
        const data = await res.json();
        if (!cancelled) setSports(Array.isArray(data) ? data : []);
      } catch {
        if (!cancelled) setSports([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [clubId]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const qs = new URLSearchParams({ clubId });
        if (sportId) qs.set('sportId', sportId);
        const res = await fetch(`/api/players?${qs.toString()}`);
        const data = await res.json();
        if (cancelled) return;
        const list = Array.isArray(data) ? data : [];
        setPlayers(list);
        if (!sportId) setTotal(list.length);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [clubId, sportId]);

  const activeSport = sports.find((s) => s.id === sportId);

  return (
    <div>
      <h4 className="font-bold text-navy-950 uppercase tracking-wider text-xs mb-3">
        {activeSport ? `${activeSport.name} Roster` : 'Registered Player Roster'} ({players.length})
      </h4>

      <div className="flex flex-wrap gap-1.5 mb-3">
        <button
          type="button"
          onClick={() => setSportId('')}
          className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition ${
            sportId === '' ? 'bg-navy-950 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          All players{total !== null ? ` (${total})` : ''}
        </button>
        {sports.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setSportId(s.id)}
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition ${
              sportId === s.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {s.name} ({s.playerCount})
          </button>
        ))}
      </div>

      <div className="border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
            <tr>
              <th className="py-2 px-3">Name</th>
              <th className="py-2 px-3">Gender</th>
              <th className="py-2 px-3">Assigned Sports</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={3} className="py-4 text-center text-slate-400 italic">
                  Loading…
                </td>
              </tr>
            ) : players.length === 0 ? (
              <tr>
                <td colSpan={3} className="py-4 text-center text-slate-400 italic">
                  {activeSport
                    ? `No players in this club are registered for ${activeSport.name}.`
                    : 'No players registered for this club.'}
                </td>
              </tr>
            ) : (
              players.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="py-2 px-3 font-bold text-slate-800">{p.name}</td>
                  <td className="py-2 px-3 text-slate-500">{p.gender || '-'}</td>
                  <td className="py-2 px-3 text-blue-600">
                    {p.sports?.map((s: any) => s.sport?.name || s.sport).join(', ') || 'None'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
