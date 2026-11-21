'use client';

import React, { useState, useEffect } from 'react';
import RefereeLayout from '@/components/layout/RefereeLayout';
import {
  Trophy,
  Crown,
  Sparkles,
  RefreshCw,
  Flame,
} from 'lucide-react';

export default function RefereeLeaderboardPage() {
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

  return (
    <RefereeLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold tracking-tight text-navy-950">Official House Standings</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-600" />
                Live Cumulative Points
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Read-only official rankings of the 5 houses across all 6 sports, calculated via automatic unique-club points distribution.
            </p>
          </div>

          <button
            onClick={fetchLeaderboard}
            className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg shadow-2xs transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-500' : ''}`} />
            <span>Refresh Standings</span>
          </button>
        </div>

        {/* Champion Declaration Notice */}
        {isClosed && championClub && (
          <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 text-navy-950 shadow-md border border-amber-300">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider mb-1">
              <Crown className="w-4 h-4" />
              <span>Championship Concluded</span>
            </div>
            <h2 className="text-2xl font-black">{championClub.name} are the Champions!</h2>
            <p className="text-xs font-semibold mt-1">
              Final tournament standings have been certified by the Tournament Director.
            </p>
          </div>
        )}

        {/* 5 Houses Standings Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-sm text-navy-950">House Standings</h3>
            <span className="text-xs text-slate-500 font-medium">5 Houses</span>
          </div>

          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 text-center">Rank</th>
                  <th className="py-3 px-4">House Name</th>
                  <th className="py-3 px-4">Captain</th>
                  <th className="py-3 px-4 text-right">Total Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {standings.map((entry: any) => (
                  <tr key={entry.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4 text-center font-mono font-bold text-sm">
                      {entry.rank === 1 ? '🥇 1' : entry.rank === 2 ? '🥈 2' : entry.rank === 3 ? '🥉 3' : `#${entry.rank}`}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.club?.color || '#3b82f6' }}></span>
                      <span>{entry.club?.name}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{entry.club?.captainName || 'Senior Captain'}</td>
                    <td className="py-3 px-4 text-right font-mono font-black text-amber-700 text-sm">
                      {entry.totalPoints.toFixed(2)} pts
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 7-Sport Points Matrix */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <h3 className="font-bold text-sm text-navy-950">Points Breakdown per Sport</h3>
          </div>

          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">House</th>
                  {sports.map((sp: any) => (
                    <th key={sp.id} className="py-3 px-3 text-center">{sp.name}</th>
                  ))}
                  <th className="py-3 px-4 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {standings.map((entry: any) => (
                  <tr key={entry.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4 font-sans font-bold text-slate-800">
                      {entry.club?.name}
                    </td>
                    {sports.map((sp: any) => (
                      <td key={sp.id} className="py-3 px-3 text-center text-slate-600">
                        {entry.sportBreakdown?.[sp.id] ? `${entry.sportBreakdown[sp.id].toFixed(2)}` : '—'}
                      </td>
                    ))}
                    <td className="py-3 px-4 text-right font-bold text-navy-950">
                      {entry.totalPoints.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </RefereeLayout>
  );
}

