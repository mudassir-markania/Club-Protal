'use client';

import React from 'react';
import Link from 'next/link';
import { houseColor, initials, useHouseStandings, HouseStanding } from './matchView';

const fmt = (n: number | null | undefined) => {
  if (n === null || n === undefined) return '🔒';
  return Number.isInteger(n) ? String(n) : n.toFixed(2);
};

function Podium({ top, locked }: { top: HouseStanding[]; locked?: boolean }) {
  // visual order: 2nd, 1st, 3rd
  const order = [top[1], top[0], top[2]].filter(Boolean) as HouseStanding[];
  const heights: Record<number, string> = { 1: 'h-32 sm:h-36', 2: 'h-24 sm:h-28', 3: 'h-20 sm:h-24' };
  const labels: Record<number, string> = { 1: 'GOLD', 2: 'SILVER', 3: 'BRONZE' };
  return (
    <div className="flex items-end justify-center gap-2 sm:gap-3 pt-6 pb-2">
      {order.map((h, i) => (
        <div key={h.id} className="flex flex-col items-center w-24 sm:w-28">
          <div
            className="w-12 h-12 rounded-full text-white flex items-center justify-center font-manrope text-lg font-bold mb-2 shadow-sm"
            style={{ backgroundColor: houseColor(h.club.code, h.club.name) }}
          >
            {initials(h.club.name)}
          </div>
          <span className="text-[11px] font-bold text-[#000f3f] uppercase text-center font-manrope leading-tight">{h.club.name}</span>
          <span className={`text-xs font-extrabold font-manrope ${locked ? 'text-amber-700' : 'text-[#0051d5]'}`}>
            {locked ? '🔒 Hidden' : `${fmt(h.points)} pts`}
          </span>
          <div className={`w-full ${locked ? 'h-24' : heights[h.rank || i + 1] || 'h-20'} bg-[#e2e7ff] rounded-t-lg mt-3 flex items-center justify-center text-xs font-bold text-[#45464f] uppercase font-manrope`}>
            {locked ? 'FINALS' : labels[h.rank || i + 1] || `#${h.rank}`}
          </div>
        </div>
      ))}
    </div>
  );
}

/** Home page points table: house podium and standings, straight from the leaderboard. */
export default function HomePointsTable() {
  const { data, loading, error } = useHouseStandings();
  const standings = data?.standings || [];
  const sports = data?.sports || [];
  const pointsLocked = Boolean(data?.pointsLocked);
  const scored = standings.some((h) => (h.points || 0) > 0) || pointsLocked;

  return (
    <section className="w-full py-16 lg:py-20 bg-[#faf8ff]" id="leaderboard">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">
        {/* Final Day Freeze Banner */}
        {pointsLocked && (
          <div className="mb-8 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-amber-400/10 to-amber-500/15 border-2 border-amber-400/60 shadow-md text-navy-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md text-2xl">
                🔒
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-sm sm:text-base uppercase tracking-tight text-[#000f3f] font-manrope">
                    Final Day Lockdown Active
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-500 text-white">
                    Grand Reveal Pending
                  </span>
                </div>
                <p className="text-xs text-slate-700 mt-1 max-w-2xl leading-relaxed">
                  Official house points and cumulative standings have been frozen for the final day. Live scores will remain hidden until the grand announcement at the Closing Ceremony!
                </p>
              </div>
            </div>
            <Link
              href="/schedule"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-navy-950 hover:bg-navy-900 text-white text-xs font-extrabold rounded-xl shrink-0 transition"
            >
              <span>View Match Schedule</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>
        )}

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-8 h-1 bg-[#0051d5] rounded-full" />
              <span className="text-xs text-[#0051d5] uppercase tracking-widest font-extrabold font-manrope">OFFICIAL STANDINGS</span>
            </div>
            <h2 className="font-manrope text-3xl sm:text-5xl font-extrabold text-[#000f3f] uppercase tracking-tight">ONLY ONE HOUSE CAN RULE</h2>
          </div>
          <Link
            href="/leaderboard"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-[#0051d5] hover:text-[#000f3f] font-bold font-manrope transition-colors"
          >
            <span>View Complete Standings</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </Link>
        </div>

        {loading ? (
          <p className="py-16 text-center text-sm text-[#45464f]">Loading the points table…</p>
        ) : error && !data ? (
          <p className="py-16 text-center text-sm text-[#ba1a1a]">Could not load the points table right now. Please try again shortly.</p>
        ) : standings.length === 0 ? (
          <p className="py-16 text-center text-sm text-[#45464f] bg-white rounded-xl border border-[#e2e7ff]">No houses have been registered yet.</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-xl shadow-md flex flex-col justify-end border border-[#e2e7ff]">
              <span className="text-xs text-[#45464f] uppercase tracking-widest text-center mb-2 font-bold font-manrope">
                {pointsLocked ? 'THE 5 CONTENDING HOUSES' : 'CURRENT PODIUM PLACINGS'}
              </span>
              {scored ? <Podium top={standings.slice(0, 3)} locked={pointsLocked} /> : <p className="py-10 text-center text-sm text-[#45464f]">The podium appears once the first points are awarded.</p>}
            </div>

            <div className="lg:col-span-7 bg-white rounded-xl shadow-md overflow-hidden border border-[#e2e7ff]">
              <div className="p-4 bg-[#000f3f] text-white flex items-center justify-between">
                <span className="text-xs sm:text-sm uppercase tracking-wider font-bold font-manrope">Overall Championship Table</span>
                <span className={`text-[11px] uppercase font-semibold font-manrope ${pointsLocked ? 'text-amber-400 font-extrabold' : 'text-[#dce1ff]'}`}>
                  {pointsLocked ? '🔒 Points Frozen for Final Reveal' : 'Updated live'}
                </span>
              </div>
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-[#e2e7ff] text-[#45464f] text-[11px] uppercase font-bold font-manrope">
                      <th className="py-3 px-4">{pointsLocked ? 'House' : 'Rank'}</th>
                      <th className="py-3 px-4">{pointsLocked ? 'Contender' : 'House'}</th>
                      <th className="py-3 px-3 hidden sm:table-cell">Points by sport</th>
                      <th className="py-3 px-4 text-right">Points</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs font-medium">
                    {standings.map((h, idx) => {
                      const color = houseColor(h.club.code, h.club.name);
                      const bySport = sports.map((s) => ({ name: s.name, pts: h.sportBreakdown?.[s.id] || 0 })).filter((x) => x.pts > 0);
                      return (
                        <tr key={h.id} className="bg-white hover:bg-[#f2f3ff] transition-colors border-b border-[#e2e7ff]/70">
                          <td className="py-3.5 px-4 font-manrope font-extrabold text-sm" style={{ color }}>
                            {pointsLocked ? (
                              <span className="w-6 h-6 rounded-md bg-amber-100 text-amber-800 flex items-center justify-center text-xs">
                                🔒
                              </span>
                            ) : (
                              String(h.rank || idx + 1).padStart(2, '0')
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2.5">
                              <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: color }} />
                              <strong className="font-manrope text-sm font-bold text-[#000f3f] uppercase">{h.club.name}</strong>
                            </div>
                          </td>
                          <td className="py-3.5 px-3 hidden sm:table-cell">
                            {pointsLocked ? (
                              <span className="px-2 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-900 text-[10px] font-bold">
                                🔒 Points Frozen
                              </span>
                            ) : (
                              <div className="flex flex-wrap gap-1">
                                {bySport.length === 0 ? (
                                  <span className="text-[#45464f]">-</span>
                                ) : (
                                  bySport.map((x) => (
                                    <span key={x.name} className="px-1.5 py-0.5 rounded bg-[#e2e7ff] text-[#000f3f] text-[10px] font-bold">
                                      {x.name} {fmt(x.pts)}
                                    </span>
                                  ))
                                )}
                              </div>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right font-manrope text-base font-extrabold" style={{ color }}>
                            {pointsLocked ? (
                              <span className="text-xs px-2 py-1 rounded bg-amber-100 text-amber-900 border border-amber-200 uppercase font-black tracking-wide">
                                🔒 Locked
                              </span>
                            ) : (
                              fmt(h.points)
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
