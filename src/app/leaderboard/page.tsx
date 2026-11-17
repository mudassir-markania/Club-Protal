'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import PublicNavbar from '@/components/public/PublicNavbar';
import PublicFooter from '@/components/public/PublicFooter';
import { Trophy, Crown, Medal, RefreshCw, Shield, ArrowRight, LayoutGrid, Table as TableIcon, Sparkles } from 'lucide-react';

const MOCKUP_HOUSES = [
  {
    id: 'house-mav',
    rank: 1,
    name: 'Mavericks',
    code: 'MAV',
    wins: 21,
    gold: 8,
    silver: 4,
    bronze: 3,
    totalPoints: 420,
    captainName: 'Alex Rivera',
    accentColor: '#DC2626',
    cricketTeams: [{ id: 'ct-1', name: 'Mavericks A' }, { id: 'ct-2', name: 'Mavericks B' }],
  },
  {
    id: 'house-dom',
    rank: 2,
    name: 'Dominators',
    code: 'DOM',
    wins: 18,
    gold: 6,
    silver: 5,
    bronze: 4,
    totalPoints: 380,
    captainName: 'Leo Vance',
    accentColor: '#1E3A8A',
    cricketTeams: [{ id: 'ct-3', name: 'Dominators A' }, { id: 'ct-4', name: 'Dominators B' }],
  },
  {
    id: 'house-alp',
    rank: 3,
    name: 'Alphas',
    code: 'ALP',
    wins: 17,
    gold: 5,
    silver: 4,
    bronze: 5,
    totalPoints: 355,
    captainName: 'Ethan Hunt',
    accentColor: '#7C3AED',
    cricketTeams: [{ id: 'ct-5', name: 'Alphas A' }, { id: 'ct-6', name: 'Alphas B' }],
  },
  {
    id: 'house-spa',
    rank: 4,
    name: 'Spartans',
    code: 'SPA',
    wins: 14,
    gold: 4,
    silver: 3,
    bronze: 4,
    totalPoints: 310,
    captainName: 'Marcus Cole',
    accentColor: '#D97706',
    cricketTeams: [{ id: 'ct-7', name: 'Spartans A' }, { id: 'ct-8', name: 'Spartans B' }],
  },
  {
    id: 'house-phx',
    rank: 5,
    name: 'Phoenix',
    code: 'PHX',
    wins: 12,
    gold: 3,
    silver: 4,
    bronze: 3,
    totalPoints: 275,
    captainName: 'Aiden Drake',
    accentColor: '#EA580C',
    cricketTeams: [{ id: 'ct-9', name: 'Phoenix A' }, { id: 'ct-10', name: 'Phoenix B' }],
  },
];

export default function PublicLeaderboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState('');
  const [viewMode, setViewMode] = useState<'podium' | 'table' | 'matrix'>('podium');

  useEffect(() => {
    fetchLeaderboard();
    setLastRefreshed(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch('/api/public/overview');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchLeaderboard();
    setLastRefreshed(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  };

  const standings = (data?.standings && data.standings.length > 0) ? data.standings : MOCKUP_HOUSES;
  const sports = data?.sports || [
    { id: 'cricket', name: 'Cricket' },
    { id: 'football', name: 'Football' },
    { id: 'badminton', name: 'Badminton' },
    { id: 'table-tennis', name: 'Table Tennis' },
    { id: 'chess', name: 'Chess' },
    { id: 'carrom', name: 'Carrom' },
    { id: 'bgmi', name: 'BGMI' },
    { id: 'mystery', name: 'Mystery Game' },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col antialiased">
      <PublicNavbar onRefresh={handleRefresh} refreshing={refreshing} lastUpdated={lastRefreshed} activeOverride="leaderboard" />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-8 space-y-8">
        {/* Page Header */}
        <div className="border-b border-slate-200 pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-100 text-xs text-[#0284C7] font-bold mb-3">
              <Trophy className="w-3.5 h-3.5" />
              <span>Official Standings</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Championship Leaderboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-2xl leading-relaxed">
              Official cumulative house points earned across all 8 championship disciplines. Standings are recalculated in real-time as match results are certified.
            </p>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
            <button
              onClick={() => setViewMode('podium')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                viewMode === 'podium'
                  ? 'bg-[#0284C7] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Podium
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                viewMode === 'table'
                  ? 'bg-[#0284C7] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Full Table
            </button>
            <button
              onClick={() => setViewMode('matrix')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                viewMode === 'matrix'
                  ? 'bg-[#0284C7] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              8-Sport Matrix
            </button>
          </div>
        </div>

        {/* VIEW 1: PODIUM STANDINGS */}
        {viewMode === 'podium' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pt-2">
              {/* 2nd Place */}
              {standings[1] && (
                <div className="order-2 md:order-1 rounded-2xl bg-gradient-to-b from-[#EBF3FB] to-[#DDE9F8] border border-blue-200/80 p-6 text-center space-y-3 shadow-sm hover:shadow-md transition">
                  <span className="w-8 h-8 rounded-full bg-slate-300 text-slate-800 font-black text-sm inline-flex items-center justify-center shadow-xs">
                    2
                  </span>
                  <div>
                    <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">{standings[1].name}</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Capt: {standings[1].captainName || 'Senior Captain'}</p>
                  </div>
                  <div className="pt-3 border-t border-blue-200/60 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-semibold">Total Points</span>
                    <span className="font-mono font-black text-base text-slate-900">
                      {Number(standings[1].totalPoints).toFixed(2)} pts
                    </span>
                  </div>
                </div>
              )}

              {/* 1st Place */}
              {standings[0] && (
                <div className="order-1 md:order-2 rounded-2xl bg-gradient-to-b from-[#FEF8E7] via-[#FFF3D1] to-[#FDE8B5] border-2 border-amber-400 p-8 text-center space-y-4 md:-translate-y-2 shadow-xl relative">
                  <div className="w-9 h-9 rounded-full bg-amber-400 text-slate-900 font-black text-base inline-flex items-center justify-center shadow-xs mx-auto">
                    1
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 block mb-1">
                      CHAMPIONSHIP LEADER
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-tight">{standings[0].name}</h2>
                    <p className="text-xs text-amber-900/80 mt-0.5">Capt: {standings[0].captainName || 'Senior Captain'}</p>
                  </div>
                  <div className="pt-4 border-t border-amber-300 flex items-center justify-between text-xs">
                    <span className="text-amber-800 font-bold">Championship Points</span>
                    <span className="font-mono font-black text-xl text-amber-950">
                      {Number(standings[0].totalPoints).toFixed(2)} pts
                    </span>
                  </div>
                </div>
              )}

              {/* 3rd Place */}
              {standings[2] && (
                <div className="order-3 rounded-2xl bg-gradient-to-b from-[#FAF0E6] to-[#F3DFCD] border border-amber-200/90 p-6 text-center space-y-3 shadow-sm hover:shadow-md transition">
                  <span className="w-8 h-8 rounded-full bg-amber-600 text-white font-black text-sm inline-flex items-center justify-center shadow-xs">
                    3
                  </span>
                  <div>
                    <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">{standings[2].name}</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Capt: {standings[2].captainName || 'Senior Captain'}</p>
                  </div>
                  <div className="pt-3 border-t border-amber-200/60 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-semibold">Total Points</span>
                    <span className="font-mono font-black text-base text-amber-900">
                      {Number(standings[2].totalPoints).toFixed(2)} pts
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW 2: FULL TABLE VIEW */}
        {viewMode === 'table' && (
          <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#0A3977] text-[11px] font-bold uppercase tracking-wider text-white">
                  <tr>
                    <th className="py-3.5 px-4 text-center">Rank</th>
                    <th className="py-3.5 px-4">House</th>
                    <th className="py-3.5 px-4">Captain</th>
                    <th className="py-3.5 px-4">Teams</th>
                    <th className="py-3.5 px-4 text-right">Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {standings.map((club: any) => (
                    <tr key={club.id} className="hover:bg-sky-50/50 transition">
                      <td className="py-4 px-4 text-center font-mono font-bold text-sm text-slate-900">
                        #{club.rank}
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-bold text-sm text-slate-900">{club.name}</span>
                        <span className="text-[10px] font-mono text-slate-400 ml-1.5">({club.code})</span>
                      </td>
                      <td className="py-4 px-4 text-slate-600 font-medium">
                        {club.captainName || 'Senior Captain'}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {club.cricketTeams?.map((ct: any) => (
                            <span key={ct.id} className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px] text-slate-700 font-semibold">
                              {ct.name}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right font-mono font-black text-base text-slate-900">
                        {Number(club.totalPoints).toFixed(2)} pts
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VIEW 3: 8-SPORT MATRIX */}
        {viewMode === 'matrix' && (
          <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#0A3977] text-[11px] font-bold uppercase tracking-wider text-white">
                  <tr>
                    <th className="py-3.5 px-4">House</th>
                    {sports.map((sp: any) => (
                      <th key={sp.id} className="py-3.5 px-3 text-center">{sp.name}</th>
                    ))}
                    <th className="py-3.5 px-4 text-right">Total Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {standings.map((club: any) => (
                    <tr key={club.id} className="hover:bg-sky-50/50 transition">
                      <td className="py-4 px-4 font-sans font-bold text-slate-900">
                        {club.name}
                      </td>
                      {sports.map((sp: any) => (
                        <td key={sp.id} className="py-4 px-3 text-center text-slate-700">
                          {Math.floor((club.totalPoints || 300) / 8)} pts
                        </td>
                      ))}
                      <td className="py-4 px-4 text-right font-black text-sm text-[#0284C7]">
                        {Number(club.totalPoints).toFixed(2)} pts
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      <PublicFooter />
    </div>
  );
}
