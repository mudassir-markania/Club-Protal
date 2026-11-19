'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import PublicNavbar from '@/components/public/PublicNavbar';
import PublicFooter from '@/components/public/PublicFooter';
import { CheckCircle2, Trophy, MapPin, Calendar, Search, ArrowRight, ShieldCheck, Star } from 'lucide-react';
import { SportIcon } from '@/components/ui/icons';

export default function ResultsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState('');
  const [sportFilter, setSportFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchResults();
    setLastRefreshed(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  }, []);

  const fetchResults = async () => {
    try {
      const res = await fetch('/api/public/overview');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchResults();
    setLastRefreshed(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  };

  const approvedMatches = data?.approvedMatches || [];
  const sports = data?.sports || [];

  const filteredResults = approvedMatches.filter((m: any) => {
    if (sportFilter && m.sportId !== sportFilter && m.sport?.name !== sportFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const p1 = m.participants?.[0]?.teamName || m.participants?.[0]?.cricketTeam?.name || m.participants?.[0]?.club?.name || '';
      const p2 = m.participants?.[1]?.teamName || m.participants?.[1]?.cricketTeam?.name || m.participants?.[1]?.club?.name || '';
      const sportName = m.sport?.name || '';
      return p1.toLowerCase().includes(q) || p2.toLowerCase().includes(q) || sportName.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#0A0D14] text-[#EDEDED] flex flex-col selection:bg-[#C6A04A] selection:text-[#0A0D14] antialiased">
      <PublicNavbar onRefresh={handleRefresh} refreshing={refreshing} lastUpdated={lastRefreshed} activeOverride="results" />

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-8 space-y-8">
        {/* Page Header */}
        <div className="border-b border-white/[0.08] pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs text-[#C6A04A] mb-3">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Certified Championship Results</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Approved Match Results
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-2xl leading-relaxed">
              Official scores verified by tournament referees and locked by the Tournament Director. Points calculated from these scores are immediately applied to the official leaderboard.
            </p>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <div className="relative w-full sm:w-48">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search result..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 rounded-lg bg-[#141822] border border-white/[0.08] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#C6A04A]"
              />
            </div>

            <select
              value={sportFilter}
              onChange={(e) => setSportFilter(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 bg-[#141822] border border-white/[0.08] rounded-lg text-xs font-semibold text-white outline-none focus:border-[#C6A04A]"
            >
              <option value="">All Sports</option>
              {sports.map((sp: any) => (
                <option key={sp.id} value={sp.id}>{sp.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Results List */}
        {filteredResults.length === 0 ? (
          <div className="py-16 px-6 rounded-2xl bg-[#141822] border border-white/[0.08] text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#0A0D14] border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg font-bold text-white">No Approved Results Yet</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              {sportFilter || searchQuery ? 'No results match your active filter.' : 'Referees are actively entering match outcomes. Once submitted and approved by tournament directors, official verified scores will appear here.'}
            </p>
            <div className="pt-2">
              <Link
                href="/schedule"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#141822] hover:bg-white/[0.08] text-xs font-semibold text-[#C6A04A] border border-[#C6A04A]/30 transition"
              >
                <span>Check Match Schedule</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredResults.map((m: any) => {
              const p1 = m.participants?.[0]?.teamName || m.participants?.[0]?.cricketTeam?.name || m.participants?.[0]?.club?.name || 'Participant 1';
              const p2 = m.participants?.[1]?.teamName || m.participants?.[1]?.cricketTeam?.name || m.participants?.[1]?.club?.name || 'Participant 2';
              const p1Score = m.participants?.[0]?.score || 0;
              const p2Score = m.participants?.[1]?.score || 0;
              const p1Won = m.participants?.[0]?.isWinner;
              const p2Won = m.participants?.[1]?.isWinner;

              return (
                <article
                  key={m.id}
                  className="p-6 rounded-2xl bg-[#141822] border border-white/[0.08] hover:border-[#C6A04A]/40 transition space-y-4 shadow-sm"
                >
                  {/* Top Bar: Sport + Status */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-[#0A0D14] border border-white/[0.06] flex items-center justify-center text-[#C6A04A]">
                        <SportIcon name={m.sport?.name} className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-bold text-xs text-white">{m.sport?.name}</span>
                      {m.matchCategory && m.matchCategory !== 'Singles' && (
                        <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-[#C6A04A]/15 text-[#C6A04A] border border-[#C6A04A]/40">
                          {m.matchCategory}
                        </span>
                      )}
                    </div>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Approved</span>
                    </span>
                  </div>

                  {/* Scoreboard Display */}
                  <div className="p-4 rounded-xl bg-[#0A0D14] border border-white/[0.06] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-serif font-bold ${p1Won ? 'text-[#C6A04A]' : 'text-white'}`}>
                        {p1Won && '🏆 '} {p1}
                      </span>
                      <span className="font-mono text-xs font-bold text-white bg-[#141822] px-2 py-0.5 rounded">
                        {p1Score}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-serif font-bold ${p2Won ? 'text-[#C6A04A]' : 'text-white'}`}>
                        {p2Won && '🏆 '} {p2}
                      </span>
                      <span className="font-mono text-xs font-bold text-white bg-[#141822] px-2 py-0.5 rounded">
                        {p2Score}
                      </span>
                    </div>
                  </div>

                  {/* Star Player Spotlight */}
                  {m.starPlayer && (
                    <div className="p-3 rounded-xl bg-gradient-to-r from-[#1C2331] to-[#0A0D14] border border-[#C6A04A]/40 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-[#C6A04A]/20 border border-[#C6A04A]/40 flex items-center justify-center text-[#C6A04A]">
                          <Star className="w-3.5 h-3.5 fill-[#C6A04A]" />
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-[#F3D787] block">Star Player of Match</span>
                          <span className="font-bold text-white text-xs">{m.starPlayer.name} ({m.starPlayer.club?.name || 'House'})</span>
                        </div>
                      </div>
                      <span className="font-mono font-black text-amber-300 text-xs bg-black/40 px-2 py-1 rounded border border-amber-500/20">
                        +{m.starPlayerPoints || 0} pts
                      </span>
                    </div>
                  )}

                  {/* Date */}
                  <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#C6A04A]" />
                      <span>{new Date(m.matchDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      <PublicFooter />
    </div>
  );
}

