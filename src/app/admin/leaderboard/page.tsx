'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminLayout from '@/components/layout/AdminLayout';
import {
  Trophy,
  Medal,
  RefreshCw,
  Award,
  TrendingUp,
  Shield,
  Users,
  ChevronDown,
  Sparkles,
  Download,
  CheckCircle2,
  X,
  Crown,
  Lock,
  Unlock,
  ArrowRight,
  Eye,
} from 'lucide-react';
import { ClubBadge, SportIcon } from '@/components/ui/icons';

export default function LeaderboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);
  const [closing, setClosing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

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

  const handleRecalculate = async () => {
    setRecalculating(true);
    setMessage(null);
    try {
      const res = await fetch('/api/leaderboard', { method: 'POST' });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error);

      setMessage('All 5 House standings and 7-sport breakdowns recalculated from validated points history!');
      fetchLeaderboard();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setRecalculating(false);
    }
  };

  const handleToggleChampionship = async () => {
    const isCurrentlyClosed = data?.championshipStatus === 'CLOSED';
    const action = isCurrentlyClosed ? 'REOPEN' : 'CLOSE';
    const confirmText = isCurrentlyClosed
      ? 'Are you sure you want to reopen the championship for further score entries?'
      : `Are you sure you want to close the championship and declare ${data?.leadingClub?.name || 'the leading house'} as the official House Champion?`;

    if (!confirm(confirmText)) return;

    setClosing(true);
    try {
      const res = await fetch('/api/championship/close', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error);

      setMessage(resData.message);
      fetchLeaderboard();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setClosing(false);
    }
  };

  const standings = data?.standings || [];
  const sports = data?.sports || [];
  const championshipStatus = data?.championshipStatus || 'ACTIVE';
  const championClub = data?.championClub;
  const isClosed = championshipStatus === 'CLOSED';
  const leadingHouse = data?.leadingClub || standings[0]?.club;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-amber-500/40 p-1.5 flex items-center justify-center shrink-0 shadow-md shadow-amber-500/10">
              <img src="/logo.png" alt="APL Season 9" className="w-full h-full object-contain filter drop-shadow" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold tracking-tight text-navy-950">APL Season 9 Leaderboard</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-yellow-50 text-yellow-800 border border-yellow-200 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-yellow-600" />
                  Live Standings
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Official cumulative rankings of the 5 houses across all 7 sports derived from approved unique-club points distributions.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href="/leaderboard"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg shadow-2xs transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Public Big Screen View ↗</span>
            </Link>

            <button
              onClick={handleToggleChampionship}
              disabled={closing}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold rounded-lg shadow-sm transition ${
                isClosed
                  ? 'bg-amber-600 hover:bg-amber-500 text-white'
                  : 'bg-purple-900 hover:bg-purple-800 text-white'
              }`}
            >
              {isClosed ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
              {isClosed ? 'Reopen Championship' : 'Close Championship & Declare Champion'}
            </button>

            <button
              onClick={handleRecalculate}
              disabled={recalculating}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-navy-900 hover:bg-navy-800 text-white text-xs font-bold rounded-lg shadow-sm transition disabled:opacity-70"
            >
              <RefreshCw className={`w-4 h-4 ${recalculating ? 'animate-spin' : ''}`} />
              {recalculating ? 'Recalculating...' : 'Recalculate'}
            </button>
          </div>
        </div>

        {/* Success Alert */}
        {message && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center justify-between">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{message}</span>
            </span>
            <button onClick={() => setMessage(null)} className="text-emerald-700 hover:text-emerald-900">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* CHAMPION DECLARED HERO BANNER (When Closed) */}
        {isClosed && championClub && (
          <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 text-navy-950 shadow-xl border-2 border-yellow-200 relative overflow-hidden animate-in fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white/90 border border-amber-300 flex items-center justify-center shrink-0 shadow-md">
                  <ClubBadge code={championClub.code} name={championClub.name} className="w-10 h-10" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-navy-950 text-amber-300 uppercase tracking-wider flex items-center gap-1">
                      <Crown className="w-3 h-3 text-amber-400" />
                      Official House Champion Declared
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-navy-950">
                    House {championClub.name} Wins the Championship!
                  </h2>
                  <p className="text-xs font-semibold text-navy-900/80 mt-1">
                    With an unbeatable total of {Number(championClub.totalPoints || 0).toFixed(2)} points across the 7 sports.
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-3xl font-black font-mono text-navy-950">
                  {Number(championClub.totalPoints || 0).toFixed(2)}
                </span>
                <span className="block text-xs font-extrabold uppercase tracking-wider text-navy-900">Final Points</span>
              </div>
            </div>
          </div>
        )}

        {/* Top 3 Podium Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {standings.slice(0, 3).map((entry, idx) => (
            <div
              key={entry.club.id || idx}
              className={`p-6 rounded-2xl border relative overflow-hidden transition ${
                idx === 0
                  ? 'bg-gradient-to-b from-yellow-50/90 to-white border-yellow-300 shadow-md ring-2 ring-yellow-400/20'
                  : idx === 1
                  ? 'bg-gradient-to-b from-slate-100/80 to-white border-slate-300 shadow-xs'
                  : 'bg-gradient-to-b from-amber-50/70 to-white border-amber-300 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-extrabold text-sm ${
                    idx === 0
                      ? 'bg-yellow-400 text-yellow-950 shadow-sm'
                      : idx === 1
                      ? 'bg-slate-300 text-slate-800'
                      : 'bg-amber-300 text-amber-950'
                  }`}
                >
                  #{entry.rank}
                </span>
                <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-xs">
                  <ClubBadge code={entry.club.code} name={entry.club.name} className="w-7 h-7" />
                </div>
              </div>

              <h3 className="font-extrabold text-lg text-navy-950 mb-0.5">{entry.club.name}</h3>
              <span className="text-xs font-mono font-bold text-blue-600">{entry.club.code}</span>

              <div className="mt-4 pt-4 border-t border-slate-200/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Transactions</span>
                  <span className="font-extrabold text-slate-800 text-xs">{entry.transactionsCount || 0} events</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Total Points</span>
                  <span className="text-lg font-black text-navy-950 font-mono">
                    {Number(entry.totalPoints).toFixed(2)} pts
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 7-Sport Points Matrix Breakdown Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
            <div>
              <span className="text-xs font-bold text-navy-950 uppercase tracking-wider block">
                7-Sport Points Distribution Matrix (The 5 Houses)
              </span>
              <span className="text-[11px] text-slate-500">
                Detailed breakdown of exact points earned by each house per sport discipline
              </span>
            </div>
            <Link
              href="/admin/points-history"
              className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
            >
              View Points History <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Rank</th>
                  <th className="py-3 px-4">House Name</th>
                  {sports.map((sp) => (
                    <th key={sp.id} className="py-3 px-3 text-center">
                      <span className="inline-flex items-center gap-1" title={sp.name}>
                        <SportIcon name={sp.name} className="w-3.5 h-3.5 text-blue-600" />
                        <span className="truncate max-w-[70px]">{sp.name}</span>
                      </span>
                    </th>
                  ))}
                  <th className="py-3 px-4 text-right font-black">Total Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {standings.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4 font-extrabold text-slate-900">
                      <span
                        className={`w-6 h-6 rounded-full inline-flex items-center justify-center text-xs ${
                          entry.rank === 1
                            ? 'bg-yellow-100 text-yellow-800 border border-yellow-300 font-bold'
                            : entry.rank === 2
                            ? 'bg-slate-200 text-slate-800'
                            : entry.rank === 3
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        #{entry.rank}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                          <ClubBadge code={entry.club.code} name={entry.club.name} className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block text-xs">{entry.club.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{entry.club.code}</span>
                        </div>
                      </div>
                    </td>

                    {/* Sport matrix cells */}
                    {sports.map((sp) => {
                      const spPoints = entry.sportBreakdown?.[sp.name] || entry.sportBreakdown?.[sp.id] || 0;
                      return (
                        <td key={sp.id} className="py-3.5 px-3 text-center font-mono">
                          {spPoints > 0 ? (
                            <span className="font-extrabold text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                              {Number(spPoints).toFixed(2)}
                            </span>
                          ) : (
                            <span className="text-slate-300 text-[11px]">-</span>
                          )}
                        </td>
                      );
                    })}

                    <td className="py-3.5 px-4 text-right">
                      <span className="text-sm font-black text-navy-950 font-mono bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                        {Number(entry.totalPoints).toFixed(2)} pts
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
