'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import PublicNavbar from '@/components/public/PublicNavbar';
import PublicFooter from '@/components/public/PublicFooter';
import { Calendar, MapPin, Clock, Search, Filter, ArrowRight } from 'lucide-react';
import { SportIcon } from '@/components/ui/icons';

export default function SchedulePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState('');
  const [sportFilter, setSportFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchSchedule();
    setLastRefreshed(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  }, []);

  const fetchSchedule = async () => {
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
    fetchSchedule();
    setLastRefreshed(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  };

  const upcomingMatches = data?.upcomingMatches || [];
  const sports = data?.sports || [];

  const filteredMatches = upcomingMatches.filter((m: any) => {
    if (sportFilter && m.sportId !== sportFilter && m.sport?.name !== sportFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const p1 = m.participants?.[0]?.teamName || m.participants?.[0]?.cricketTeam?.name || m.participants?.[0]?.club?.name || '';
      const p2 = m.participants?.[1]?.teamName || m.participants?.[1]?.cricketTeam?.name || m.participants?.[1]?.club?.name || '';
      const sportName = m.sport?.name || '';
      const venueName = m.venue?.name || '';
      return p1.toLowerCase().includes(q) || p2.toLowerCase().includes(q) || sportName.toLowerCase().includes(q) || venueName.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#0A0D14] text-[#EDEDED] flex flex-col selection:bg-[#C6A04A] selection:text-[#0A0D14] antialiased">
      <PublicNavbar onRefresh={handleRefresh} refreshing={refreshing} lastUpdated={lastRefreshed} activeOverride="schedule" />

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-8 space-y-8">
        {/* Page Header */}
        <div className="border-b border-white/[0.08] pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs text-[#C6A04A] mb-3">
              <Calendar className="w-3.5 h-3.5" />
              <span>Official Tournament Schedule</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Match Radar & Timetable
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-2xl leading-relaxed">
              Track upcoming fixtures, court assignments, and match timings across all 7 sports. Fixtures update automatically as referees and directors confirm schedules.
            </p>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <div className="relative w-full sm:w-48">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search team or venue..."
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

        {/* Fixtures List */}
        {filteredMatches.length === 0 ? (
          <div className="py-16 px-6 rounded-2xl bg-[#141822] border border-white/[0.08] text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#0A0D14] border border-[#C6A04A]/30 flex items-center justify-center mx-auto text-[#C6A04A]">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg font-bold text-white">No Scheduled Matches Found</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              {sportFilter || searchQuery ? 'No fixtures match your current filter. Clear filters to view all scheduled events.' : 'Tournament officials will post upcoming fixture pairings, court allocations, and match timings shortly.'}
            </p>
            {(sportFilter || searchQuery) && (
              <button
                onClick={() => { setSportFilter(''); setSearchQuery(''); }}
                className="mt-2 px-3.5 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-xs text-[#C6A04A] font-semibold border border-white/[0.08] transition"
              >
                Reset Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredMatches.map((m: any) => {
              const p1 = m.participants?.[0]?.teamName || m.participants?.[0]?.cricketTeam?.name || m.participants?.[0]?.club?.name || 'TBD';
              const p2 = m.participants?.[1]?.teamName || m.participants?.[1]?.cricketTeam?.name || m.participants?.[1]?.club?.name || 'TBD';

              return (
                <article
                  key={m.id}
                  className="p-6 rounded-2xl bg-[#141822] border border-white/[0.08] hover:border-[#C6A04A]/40 transition space-y-4 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-[#0A0D14] border border-white/[0.06] flex items-center justify-center text-[#C6A04A]">
                        <SportIcon name={m.sport?.name} className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-bold text-xs text-white">{m.sport?.name}</span>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#0A0D14] text-[#C6A04A] border border-[#C6A04A]/30">
                      {m.round || 'Round 1'}
                    </span>
                  </div>

                  {/* Versus Box */}
                  <div className="p-4 rounded-xl bg-[#0A0D14] border border-white/[0.06] flex items-center justify-between text-center">
                    <div className="flex-1 font-serif font-bold text-sm text-white truncate px-2">
                      {p1}
                    </div>
                    <div className="px-3 shrink-0">
                      <span className="text-xs font-mono font-bold text-[#C6A04A] bg-[#141822] px-2 py-1 rounded-md border border-white/[0.06]">
                        VS
                      </span>
                    </div>
                    <div className="flex-1 font-serif font-bold text-sm text-white truncate px-2">
                      {p2}
                    </div>
                  </div>

                  {/* Venue & Date Footer */}
                  <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#C6A04A]" />
                      <span>{m.venue?.name || 'Main Sports Complex'}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#C6A04A]" />
                      <span>{new Date(m.matchDate).toLocaleDateString([], { month: 'short', day: 'numeric' })} at {m.matchTime || '14:00'}</span>
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

