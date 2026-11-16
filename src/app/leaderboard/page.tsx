'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import PublicNavbar from '@/components/public/PublicNavbar';
import PublicFooter from '@/components/public/PublicFooter';
import { Trophy, Crown, Medal, RefreshCw, Shield, ArrowRight, LayoutGrid, Table as TableIcon } from 'lucide-react';
import { ClubBadge } from '@/components/ui/icons';

const HOUSE_METADATA: Record<string, { accentColor: string }> = {
  ALP: { accentColor: '#2563EB' },
  CRW: { accentColor: '#D97706' },
  DOM: { accentColor: '#DC2626' },
  MAV: { accentColor: '#059669' },
  RYL: { accentColor: '#7C3AED' },
};

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

  const standings = data?.standings || [];
  const sports = data?.sports || [];
  const championship = data?.championship || {};
  const isClosed = championship?.status === 'CLOSED';
  const championClub = championship?.championClub;
  const leadingClub = championship?.leadingHouse || standings[0];

  return (
    <div className="min-h-screen bg-[#0A0D14] text-[#EDEDED] flex flex-col selection:bg-[#C6A04A] selection:text-[#0A0D14] antialiased">
      <PublicNavbar onRefresh={handleRefresh} refreshing={refreshing} lastUpdated={lastRefreshed} activeOverride="leaderboard" />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-8 space-y-8">
        {/* Championship Concluded Banner */}
        {isClosed && championClub && (
          <div className="rounded-2xl bg-[#141822] border border-[#C6A04A] p-8 text-white space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#C6A04A] flex items-center gap-2">
              <Crown className="w-4 h-4 text-[#C6A04A]" />
              Official Champion Declared
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white">
              {championClub.name} Wins APL Season 9!
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Congratulations to {championClub.name}! They take the prestigious APL Season 9 Trophy with {Number(championClub.totalPoints).toFixed(2)} total points across 8 sports.
            </p>
          </div>
        )}

        {/* Page Header */}
        <div className="border-b border-white/[0.08] pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs text-[#C6A04A] mb-3">
              <Trophy className="w-3.5 h-3.5" />
              <span>Official Standings</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Championship Leaderboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-2xl leading-relaxed">
              Official cumulative house points earned across all 8 championship disciplines. Standings are recalculated in real-time as match results are verified and approved.
            </p>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center bg-[#141822] p-1 rounded-lg border border-white/[0.08] shrink-0">
            <button
              onClick={() => setViewMode('podium')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                viewMode === 'podium'
                  ? 'bg-[#C6A04A] text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Podium
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                viewMode === 'table'
                  ? 'bg-[#C6A04A] text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Full Table
            </button>
            <button
              onClick={() => setViewMode('matrix')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                viewMode === 'matrix'
                  ? 'bg-[#C6A04A] text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
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
                <article className="order-2 md:order-1 rounded-2xl bg-[#141822] border border-white/[0.08] p-6 text-center space-y-4 shadow-sm">
                  <span className="w-9 h-9 rounded-xl bg-[#0A0D14] border border-slate-400/40 text-slate-200 font-serif font-bold text-base inline-flex items-center justify-center">
                    2
                  </span>
                  <div>
                    <h2 className="font-serif text-2xl font-bold text-white">{standings[1].name}</h2>
                    <p className="text-xs text-slate-400 mt-1">Captain: {standings[1].captainName || 'Senior Captain'}</p>
                  </div>
                  <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs">
                    <span className="text-slate-400">Total Points</span>
                    <span className="font-mono font-bold text-lg text-white">
                      {Number(standings[1].totalPoints).toFixed(2)} pts
                    </span>
                  </div>
                </article>
              )}

              {/* 1st Place */}
              {standings[0] && (
                <article className="order-1 md:order-2 rounded-2xl bg-[#141822] border-2 border-[#C6A04A] p-8 text-center space-y-4 md:-translate-y-3 shadow-xl">
                  <span className="w-11 h-11 rounded-xl bg-[#0A0D14] border border-[#C6A04A] text-[#C6A04A] font-serif font-bold text-lg inline-flex items-center justify-center">
                    1
                  </span>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#C6A04A] block mb-1">
                      Tournament Leader
                    </span>
                    <h2 className="font-serif text-3xl font-bold text-white">{standings[0].name}</h2>
                    <p className="text-xs text-slate-300 mt-1">Captain: {standings[0].captainName || 'Senior Captain'}</p>
                  </div>
                  <div className="pt-4 border-t border-[#C6A04A]/30 flex items-center justify-between text-xs">
                    <span className="text-[#C6A04A] font-semibold">Championship Tally</span>
                    <span className="font-mono font-bold text-2xl text-[#C6A04A]">
                      {Number(standings[0].totalPoints).toFixed(2)} pts
                    </span>
                  </div>
                </article>
              )}

              {/* 3rd Place */}
              {standings[2] && (
                <article className="order-3 rounded-2xl bg-[#141822] border border-white/[0.08] p-6 text-center space-y-4 shadow-sm">
                  <span className="w-9 h-9 rounded-xl bg-[#0A0D14] border border-amber-700/40 text-amber-500 font-serif font-bold text-base inline-flex items-center justify-center">
                    3
                  </span>
                  <div>
                    <h2 className="font-serif text-2xl font-bold text-white">{standings[2].name}</h2>
                    <p className="text-xs text-slate-400 mt-1">Captain: {standings[2].captainName || 'Senior Captain'}</p>
                  </div>
                  <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs">
                    <span className="text-slate-400">Total Points</span>
                    <span className="font-mono font-bold text-lg text-amber-500">
                      {Number(standings[2].totalPoints).toFixed(2)} pts
                    </span>
                  </div>
                </article>
              )}
            </div>

            {/* 4th & 5th Place Cards */}
            {standings.length > 3 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {standings.slice(3).map((club: any) => (
                  <div
                    key={club.id}
                    className="p-5 rounded-2xl bg-[#141822] border border-white/[0.08] flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg bg-[#0A0D14] border border-white/[0.08] flex items-center justify-center font-serif font-bold text-xs text-slate-400">
                        #{club.rank}
                      </span>
                      <div>
                        <h3 className="font-serif font-bold text-white text-base leading-tight">{club.name}</h3>
                        <p className="text-xs text-slate-400">Captain: {club.captainName || 'Senior Captain'}</p>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-base text-slate-200">
                      {Number(club.totalPoints).toFixed(2)} pts
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: FULL TABLE VIEW */}
        {viewMode === 'table' && (
          <div className="rounded-2xl bg-[#141822] border border-white/[0.08] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#0A0D14] text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-white/[0.08]">
                  <tr>
                    <th className="py-3.5 px-4 text-center">Rank</th>
                    <th className="py-3.5 px-4">House</th>
                    <th className="py-3.5 px-4">Captain</th>
                    <th className="py-3.5 px-4">Cricket Franchises</th>
                    <th className="py-3.5 px-4 text-right">Championship Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06]">
                  {standings.map((club: any) => {
                    const meta = HOUSE_METADATA[club.code] || HOUSE_METADATA.ALP;
                    return (
                      <tr key={club.id} className="hover:bg-white/[0.02] transition">
                        <td className="py-4 px-4 text-center font-mono font-bold text-sm text-white">
                          #{club.rank}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2.5">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: meta.accentColor }} />
                            <span className="font-serif font-bold text-sm text-white">{club.name}</span>
                            <span className="text-[10px] font-mono text-slate-400">({club.code})</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-slate-300">
                          {club.captainName || 'Senior Captain'}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {club.cricketTeams?.map((ct: any) => (
                              <span key={ct.id} className="px-2 py-0.5 rounded bg-[#0A0D14] border border-white/[0.06] text-[10px] text-slate-300">
                                🏏 {ct.name}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right font-mono font-bold text-base text-[#C6A04A]">
                          {Number(club.totalPoints).toFixed(2)} pts
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VIEW 3: 8-SPORT MATRIX */}
        {viewMode === 'matrix' && (
          <div className="rounded-2xl bg-[#141822] border border-white/[0.08] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#0A0D14] text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-white/[0.08]">
                  <tr>
                    <th className="py-3.5 px-4">House</th>
                    {sports.map((sp: any) => (
                      <th key={sp.id} className="py-3.5 px-3 text-center">{sp.name}</th>
                    ))}
                    <th className="py-3.5 px-4 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06] font-mono">
                  {standings.map((club: any) => {
                    const meta = HOUSE_METADATA[club.code] || HOUSE_METADATA.ALP;
                    return (
                      <tr key={club.id} className="hover:bg-white/[0.02] transition">
                        <td className="py-4 px-4 font-sans font-bold text-white flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: meta.accentColor }} />
                          <span>{club.name}</span>
                        </td>
                        {sports.map((sp: any) => {
                          const score = club.sportBreakdown?.[sp.id] ?? club.sportBreakdown?.[sp.name] ?? 0;
                          return (
                            <td key={sp.id} className="py-4 px-3 text-center">
                              {score > 0 ? (
                                <span className="px-1.5 py-0.5 rounded bg-[#0A0D14] text-[#C6A04A] font-bold border border-[#C6A04A]/30">
                                  {score.toFixed(2)}
                                </span>
                              ) : (
                                <span className="text-slate-600">—</span>
                              )}
                            </td>
                          );
                        })}
                        <td className="py-4 px-4 text-right font-black text-sm text-[#C6A04A]">
                          {Number(club.totalPoints).toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
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
