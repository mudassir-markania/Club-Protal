'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Trophy,
  Crown,
  Medal,
  Calendar,
  Sparkles,
  RefreshCw,
  ArrowRight,
  Shield,
  Zap,
  Award,
  ChevronRight,
  Lock,
} from 'lucide-react';
import { ClubBadge, SportIcon } from '@/components/ui/icons';

export default function PublicLeaderboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/leaderboard?type=overall');
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const standings = data?.standings || [];
  const sports = data?.sports || [];
  const championshipStatus = data?.championshipStatus || 'ACTIVE';
  const championClub = data?.championClub;
  const isClosed = championshipStatus === 'CLOSED';
  const leadingClub = data?.leadingClub || standings[0]?.club;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950">
      {/* Top Navbar */}
      <header className="h-16 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-slate-900 border border-amber-500/30 flex items-center justify-center p-1 shadow-md shadow-amber-500/10">
            <img src="/logo.png" alt="APL Season 9" className="w-full h-full object-contain filter drop-shadow" />
          </div>
          <div>
            <h1 className="font-extrabold text-base tracking-tight text-white flex items-center gap-2">
              <span>APL Season 9</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                House Championship
              </span>
            </h1>
            <p className="text-[11px] text-slate-400">Official Inter-Club Points & Standings</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchLeaderboard}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            title="Refresh Leaderboard"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition border border-slate-700"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span>Public Championship Home</span>
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-8 space-y-6">
        {/* CHAMPION DECLARED HERO BANNER (When Championship is Closed) */}
        {isClosed && championClub && (
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-400 p-8 text-slate-950 shadow-2xl shadow-amber-500/20 border-2 border-amber-300 animate-in fade-in duration-500">
            <div className="absolute right-0 top-0 translate-x-12 -translate-y-8 opacity-25 pointer-events-none">
              <img src="/logo.png" alt="APL Trophy" className="w-80 h-80 object-contain filter drop-shadow-2xl" />
            </div>

            <div className="relative z-10 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-950 text-amber-400 text-xs font-black uppercase tracking-wider mb-3">
                <Crown className="w-4 h-4 text-amber-400" />
                <span>OFFICIAL HOUSE CHAMPION DECLARED</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-950">
                {championClub.name} Wins the Championship!
              </h2>
              <p className="text-sm font-semibold text-slate-900 mt-2 leading-relaxed">
                The 2026 Inter-Club House Championship has officially concluded. With an outstanding performance across all 7 sports, {championClub.name} has claimed the coveted House Trophy with {championClub.totalPoints.toFixed(2)} total points.
              </p>
            </div>
          </div>
        )}

        {/* ACTIVE CHAMPIONSHIP HEADER (When Active) */}
        {!isClosed && leadingClub && (
          <div className="rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950/80 p-6 sm:p-8 border border-slate-800 shadow-xl relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-400">
                    Championship Active • Live Point Standings
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Overall Club Leaderboard
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
                  Points awarded across all 7 sports (BGMI, Carrom, Badminton, Chess, Table Tennis, Cricket, and Football). Points earned by mixed-club squads are distributed equally among participating clubs.
                </p>
              </div>

              {/* Leading Club Card */}
              <div className="bg-slate-800/80 border border-slate-700/80 p-4 rounded-2xl flex items-center gap-4 shrink-0 shadow-lg">
                <div className="w-12 h-12 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center font-bold text-lg text-amber-300">
                  <Crown className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider block">
                    Current Leader
                  </span>
                  <p className="text-lg font-black text-white">{leadingClub.name}</p>
                  <p className="text-xs font-mono font-bold text-slate-300">
                    {leadingClub.totalPoints?.toFixed(2) || '0.00'} Points
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Podium Standings (Top 3) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {standings.slice(0, 3).map((entry: any, idx: number) => {
            const isFirst = idx === 0;
            const isSecond = idx === 1;
            const isThird = idx === 2;

            return (
              <div
                key={entry.clubId}
                className={`p-6 rounded-2xl border transition relative overflow-hidden flex flex-col justify-between ${
                  isFirst
                    ? 'bg-gradient-to-b from-amber-500/15 via-slate-900 to-slate-950 border-amber-500/40 shadow-lg shadow-amber-500/5'
                    : isSecond
                    ? 'bg-gradient-to-b from-slate-400/10 via-slate-900 to-slate-950 border-slate-600/40'
                    : 'bg-gradient-to-b from-amber-700/10 via-slate-900 to-slate-950 border-amber-700/30'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${
                          isFirst
                            ? 'bg-amber-400 text-slate-950'
                            : isSecond
                            ? 'bg-slate-300 text-slate-950'
                            : 'bg-amber-700 text-white'
                        }`}
                      >
                        #{entry.rank}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-400">{entry.club.code}</span>
                    </div>

                    <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center">
                      <ClubBadge code={entry.club.code} name={entry.club.name} className="w-6 h-6" />
                    </div>
                  </div>

                  <h3 className="text-xl font-black text-white">{entry.club.name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Captain: {entry.club.captainName || 'TBD'}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-baseline justify-between">
                  <span className="text-xs text-slate-400 font-semibold">Championship Points</span>
                  <span className="font-mono text-3xl font-black text-amber-400">
                    {entry.totalPoints.toFixed(2)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Detailed Leaderboard Table with Sport Breakdown */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Medal className="w-4 h-4 text-amber-400" />
              <span>Full Championship Standings & 7-Sport Breakdown</span>
            </h3>
            <span className="text-xs text-slate-500">All points officially verified by Admin</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">Rank</th>
                  <th className="py-3 px-4 min-w-[180px]">Participating Club</th>
                  {sports.map((sp: any) => (
                    <th key={sp.id} className="py-3 px-3 text-center min-w-[90px]">
                      {sp.name}
                    </th>
                  ))}
                  <th className="py-3 px-4 text-right font-black text-amber-400 min-w-[120px]">
                    Total Points
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {standings.map((entry: any) => (
                  <tr key={entry.clubId} className="hover:bg-slate-900/50 transition">
                    <td className="py-4 px-4 text-center font-mono font-bold text-slate-400">
                      {entry.rank === 1 ? (
                        <Crown className="w-4 h-4 text-amber-400 mx-auto" />
                      ) : (
                        `#${entry.rank}`
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
                          <ClubBadge code={entry.club.code} name={entry.club.name} className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-bold text-white block">{entry.club.name}</span>
                          <span className="text-[10px] text-slate-500 font-mono">{entry.club.code}</span>
                        </div>
                      </div>
                    </td>

                    {sports.map((sp: any) => {
                      const pts = entry.sportBreakdown?.[sp.id] ?? entry.sportBreakdown?.[sp.name] ?? 0;
                      return (
                        <td key={sp.id} className="py-4 px-3 text-center font-mono font-medium">
                          {pts > 0 ? (
                            <span className="text-slate-200 font-bold">{pts.toFixed(2)}</span>
                          ) : (
                            <span className="text-slate-600">-</span>
                          )}
                        </td>
                      );
                    })}

                    <td className="py-4 px-4 text-right">
                      <span className="font-mono text-base font-black text-amber-400">
                        {entry.totalPoints.toFixed(2)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Information Callout: The Unique Clubs Formula */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 text-xs text-slate-400 space-y-2">
          <h4 className="font-bold text-slate-200 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>How Points Distribution Works</span>
          </h4>
          <p className="leading-relaxed">
            Points earned by participating squads (e.g. in BGMI or multi-club teams) are distributed equally among the <strong>unique clubs represented</strong> in the squad, regardless of the number of players from each club. Remainder rounding fractions are rotated fairly across occurrences to ensure the total distributed points always strictly equals the points earned.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-6 px-4 text-center text-xs text-slate-500">
        ApexArena • Inter-Club House Championship Management System • All points verified and audited
      </footer>
    </div>
  );
}

