'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import PublicNavbar from '@/components/public/PublicNavbar';
import PublicFooter from '@/components/public/PublicFooter';
import { Calendar, MapPin, Clock, Search, Filter, ArrowRight } from 'lucide-react';
import { SportIcon } from '@/components/ui/icons';

const DEFAULT_MATCHES = [
  {
    id: 'm1',
    matchCode: 'CRICK-L01',
    sport: { name: 'Cricket' },
    round: 'League Pool A',
    matchDate: 'Nov 26, 2026',
    matchTime: '10:00 AM',
    venue: { name: 'Main Oval Ground' },
    status: 'SCHEDULED',
    participants: [{ teamName: 'Mavericks' }, { teamName: 'Alphas' }],
  },
  {
    id: 'm2',
    matchCode: 'BADM-QF01',
    sport: { name: 'Badminton' },
    round: 'Quarterfinal',
    matchDate: 'Nov 26, 2026',
    matchTime: '12:30 PM',
    venue: { name: 'Indoor Sports Complex' },
    status: 'SCHEDULED',
    participants: [{ teamName: 'Dominators' }, { teamName: 'Spartans' }],
  },
  {
    id: 'm3',
    matchCode: 'CHESS-R02',
    sport: { name: 'Chess' },
    round: 'Round 2',
    matchDate: 'Nov 26, 2026',
    matchTime: '02:00 PM',
    venue: { name: 'Mind Sports Auditorium' },
    status: 'SCHEDULED',
    participants: [{ teamName: 'Phoenix' }, { teamName: 'Alphas' }],
  },
  {
    id: 'm4',
    matchCode: 'FOOT-L02',
    sport: { name: 'Football' },
    round: 'Turf League Group B',
    matchDate: 'Nov 27, 2026',
    matchTime: '09:00 AM',
    venue: { name: 'Synthetic Turf Arena' },
    status: 'SCHEDULED',
    participants: [{ teamName: 'Mavericks' }, { teamName: 'Dominators' }],
  },
  {
    id: 'm5',
    matchCode: 'TT-SF01',
    sport: { name: 'Table Tennis' },
    round: 'Semifinal',
    matchDate: 'Nov 27, 2026',
    matchTime: '03:30 PM',
    venue: { name: 'Table Tennis Hall' },
    status: 'SCHEDULED',
    participants: [{ teamName: 'Spartans' }, { teamName: 'Phoenix' }],
  },
  {
    id: 'm6',
    matchCode: 'BGMI-F01',
    sport: { name: 'BGMI' },
    round: 'Grand Finale Map 1',
    matchDate: 'Nov 28, 2026',
    matchTime: '05:00 PM',
    venue: { name: 'Esports LAN Dome' },
    status: 'SCHEDULED',
    participants: [{ teamName: 'All 5 Houses' }, { teamName: '10 Squads' }],
  },
];

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

  const rawMatches = data?.upcomingMatches && data.upcomingMatches.length > 0 ? data.upcomingMatches : DEFAULT_MATCHES;
  const sports = data?.sports || [];

  const filteredMatches = rawMatches.filter((m: any) => {
    if (sportFilter && m.sport?.name?.toLowerCase() !== sportFilter.toLowerCase()) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const p1 = m.participants?.[0]?.teamName || m.participants?.[0]?.club?.name || '';
      const p2 = m.participants?.[1]?.teamName || m.participants?.[1]?.club?.name || '';
      const sportName = m.sport?.name || '';
      const venueName = m.venue?.name || '';
      return (
        p1.toLowerCase().includes(q) ||
        p2.toLowerCase().includes(q) ||
        sportName.toLowerCase().includes(q) ||
        venueName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col antialiased">
      <PublicNavbar onRefresh={handleRefresh} refreshing={refreshing} lastUpdated={lastRefreshed} activeOverride="schedule" />

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-8 space-y-8">
        {/* Page Header */}
        <div className="border-b border-slate-200 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-100 text-xs text-[#0284C7] font-bold mb-3">
              <Calendar className="w-3.5 h-3.5" />
              <span>Official Tournament Schedule</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Match Radar &amp; Timetable
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-2xl leading-relaxed">
              Track upcoming fixtures, court assignments, and match timings across all 8 sports. Fixtures update automatically as referees and directors confirm schedules.
            </p>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search teams, sports..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-full text-xs text-slate-700 focus:outline-none focus:border-[#0284C7] shadow-2xs w-48 sm:w-60"
              />
            </div>
          </div>
        </div>

        {/* Matches Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMatches.map((m: any) => (
            <article
              key={m.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-xs hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-sky-50 text-[#0284C7] flex items-center justify-center shadow-2xs">
                      <SportIcon name={m.sport?.name} className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 leading-tight">
                        {m.sport?.name}
                      </h3>
                      <span className="text-[10px] text-slate-400 font-mono font-medium">
                        {m.round}
                      </span>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-sky-50 text-[#0284C7] border border-sky-100">
                    {m.status || 'SCHEDULED'}
                  </span>
                </div>

                {/* Opponents Faceoff */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-800">
                    {m.participants?.[0]?.teamName || 'Team 1'}
                  </span>
                  <span className="w-6 h-6 rounded-full bg-white border border-slate-200 text-slate-400 font-black text-[10px] flex items-center justify-center shadow-2xs">
                    VS
                  </span>
                  <span className="font-bold text-sm text-slate-800">
                    {m.participants?.[1]?.teamName || 'Team 2'}
                  </span>
                </div>
              </div>

              {/* Timing & Venue */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                <div className="flex items-center gap-1.5 font-medium">
                  <Clock className="w-3.5 h-3.5 text-[#0284C7]" />
                  <span>{m.matchTime || '10:00 AM'}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                  <MapPin className="w-3.5 h-3.5 text-[#EA580C]" />
                  <span>{m.venue?.name || 'Olympic Arena'}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
