'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import RefereeLayout from '@/components/layout/RefereeLayout';
import {
  Swords,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Play,
  Trophy,
  ArrowRight,
  Shield,
  Medal,
  MapPin,
  RefreshCw,
  UserCheck,
  Radio,
  FileCheck2,
  AlertCircle,
  HelpCircle,
  Users,
  Search,
  Sparkles,
  Info,
  Check,
  X,
} from 'lucide-react';
import { ClubBadge, SportIcon } from '@/components/ui/icons';
import { calculateClubPointsDistribution } from '@/lib/points-distribution';

interface RefereeProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  refereeId?: string;
  referee?: {
    id: string;
    refereeCode: string;
    availability: string;
    sports?: Array<{
      sport: {
        id: string;
        name: string;
        category: string;
        icon: string;
      };
    }>;
  };
}

export default function RefereeDashboardPage() {
  const [user, setUser] = useState<RefereeProfile | null>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'ALL' | 'AWAITING' | 'SCHEDULED' | 'SUBMITTED' | 'COMPLETED'>('ALL');
  const [sportFilter, setSportFilter] = useState('');
  const [search, setSearch] = useState('');
  const [filterOnlyMine, setFilterOnlyMine] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);

  useEffect(() => {
    fetchRefereeData();
  }, [filterOnlyMine]);

  const fetchRefereeData = async () => {
    setLoading(true);
    try {
      const meRes = await fetch('/api/auth/me');
      const meData = await meRes.json();

      let currentUser = meData.user;

      // If not logged in as referee, auto-authenticate as default referee Marcus
      if (!meData.authenticated || meData.user?.role !== 'REFEREE') {
        const loginRes = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'marcus@gmail.com', password: 'marcus123' }),
        });
        if (loginRes.ok) {
          const loginData = await loginRes.json();
          currentUser = loginData.user;
        }
      }

      setUser(currentUser);

      // Fetch matches
      const refId = currentUser?.refereeId;
      const url = filterOnlyMine && refId ? `/api/matches?refereeId=${refId}` : '/api/matches';
      const matchesRes = await fetch(url);
      const matchesData = await matchesRes.json();

      setMatches(Array.isArray(matchesData) ? matchesData : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const switchRefereePersona = async (email: string) => {
    setRefreshing(true);
    try {
      const loginRes = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: 'marcus123' }),
      });
      if (loginRes.ok) {
        const loginData = await loginRes.json();
        setUser(loginData.user);

        const refId = loginData.user?.refereeId;
        const url = filterOnlyMine && refId ? `/api/matches?refereeId=${refId}` : '/api/matches';
        const matchesRes = await fetch(url);
        const matchesData = await matchesRes.json();
        setMatches(Array.isArray(matchesData) ? matchesData : []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRefreshing(false);
    }
  };

  const assignedSports = user?.referee?.sports || [];

  // Categorize matches
  const awaitingSubmission = matches.filter((m) => m.status === 'SCHEDULED' || m.status === 'IN_PROGRESS');
  const upcomingMatches = matches.filter((m) => m.status === 'SCHEDULED');
  const pendingApproval = matches.filter((m) => m.status === 'SUBMITTED');
  const completedMatches = matches.filter((m) => m.status === 'COMPLETED');

  const championshipSports = [
    { label: 'All Sports', value: '' },
    { label: 'BGMI', value: 'BGMI' },
    { label: 'Carrom', value: 'Carrom' },
    { label: 'Badminton', value: 'Badminton' },
    { label: 'Chess', value: 'Chess' },
    { label: 'Cricket', value: 'Cricket' },
    { label: 'Football', value: 'Football' },
  ];

  const filteredMatches = matches.filter((m) => {
    // Tab filter
    if (activeTab === 'AWAITING' && m.status !== 'SCHEDULED' && m.status !== 'IN_PROGRESS') return false;
    if (activeTab === 'SCHEDULED' && m.status !== 'SCHEDULED') return false;
    if (activeTab === 'SUBMITTED' && m.status !== 'SUBMITTED') return false;
    if (activeTab === 'COMPLETED' && m.status !== 'COMPLETED') return false;

    // Sport filter
    if (sportFilter && m.sport?.name.toLowerCase() !== sportFilter.toLowerCase()) return false;

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchCode = m.matchCode?.toLowerCase() || '';
      const sportName = m.sport?.name?.toLowerCase() || '';
      const venueName = m.venue?.name?.toLowerCase() || '';
      const participantsStr = (m.participants || [])
        .map((p: any) => `${p.teamName} ${p.club?.name} ${p.cricketTeam?.name}`)
        .join(' ')
        .toLowerCase();

      if (!matchCode.includes(q) && !sportName.includes(q) && !venueName.includes(q) && !participantsStr.includes(q)) {
        return false;
      }
    }

    return true;
  });

  return (
    <RefereeLayout>
      <div className="space-y-6">
        {/* Referee Official Banner & Persona Bar */}
        <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-navy-850 text-white p-6 rounded-2xl shadow-lg border border-navy-700/70 relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 relative z-10">
            <div className="flex items-start gap-4">
              <div className="hidden sm:flex w-16 h-16 rounded-2xl bg-navy-850/90 border border-amber-500/40 p-1.5 items-center justify-center shrink-0 shadow-lg shadow-amber-500/10">
                <img src="/logo.png" alt="APL Season 9" className="w-full h-full object-contain filter drop-shadow" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase tracking-wider flex items-center gap-1.5">
                    <Shield className="w-3 h-3 text-amber-400" />
                    APL Season 9 Official Panel
                  </span>
                  <span className="text-xs text-navy-300 font-mono bg-navy-800/80 px-2.5 py-0.5 rounded-full border border-navy-700">
                    ID: {user?.referee?.refereeCode || 'REF-001'}
                  </span>
                  <span className="text-xs text-emerald-400 font-medium flex items-center gap-1 bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-800/60">
                    <CheckCircle2 className="w-3 h-3" />
                    Certified & Active
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                  Referee Console: {user?.name || 'Marcus Sterling'}
                </h1>
                <p className="text-xs sm:text-sm text-navy-200 mt-1 max-w-2xl leading-relaxed">
                  Inter-club House Championship result recording portal. Enter final scores and positions for assigned competition fixtures. Points are automatically distributed equally among unique participating clubs.
                </p>

                {/* Active Official Badge */}
                <div className="mt-4 pt-3 border-t border-navy-800 flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] text-navy-400 font-semibold">Active Official:</span>
                  <div className="text-xs px-3 py-1 rounded-lg font-bold border border-amber-400 bg-amber-500 text-navy-950 flex items-center gap-1.5 shadow-xs">
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Marcus (marcus@gmail.com • All Sports)</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex sm:flex-col items-center sm:items-end gap-2.5 shrink-0">
              <Link
                href="/referee/matches"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-navy-950 font-extrabold text-xs rounded-xl shadow-md transition"
              >
                <Swords className="w-4 h-4" />
                All Assigned Fixtures
              </Link>
              <button
                onClick={() => setShowRulesModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-navy-800/80 hover:bg-navy-700 text-navy-300 hover:text-white text-xs font-semibold rounded-xl border border-navy-700 transition"
              >
                <HelpCircle className="w-3.5 h-3.5 text-navy-400" />
                Unique-Club Points Rules
              </button>
            </div>
          </div>
        </div>

        {/* 5 Championship Metrics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:shadow-xs transition">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Assigned Fixtures
            </span>
            <p className="text-2xl font-extrabold text-navy-950">{matches.length}</p>
            <div className="flex items-center gap-1 mt-1 text-[11px] text-slate-500 truncate font-medium">
              Across 6 Championship Sports
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-amber-200/80 bg-amber-50/20 shadow-2xs hover:shadow-xs transition">
            <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block mb-1">
              Awaiting Submission
            </span>
            <p className="text-2xl font-extrabold text-amber-700">{awaitingSubmission.length}</p>
            <span className="text-[11px] text-amber-600 mt-1 block font-medium">Ready for points entry</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-blue-200/80 bg-blue-50/20 shadow-2xs hover:shadow-xs transition">
            <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider block mb-1">
              Upcoming Events
            </span>
            <p className="text-2xl font-extrabold text-blue-700">{upcomingMatches.length}</p>
            <span className="text-[11px] text-blue-600 mt-1 block font-medium">Scheduled fixtures</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-purple-200/80 bg-purple-50/20 shadow-2xs hover:shadow-xs transition">
            <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wider block mb-1">
              Pending Admin Review
            </span>
            <p className="text-2xl font-extrabold text-purple-700">{pendingApproval.length}</p>
            <span className="text-[11px] text-purple-600 mt-1 block font-medium">Under admin review</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-emerald-200/80 bg-emerald-50/20 shadow-2xs hover:shadow-xs transition">
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block mb-1">
              Approved & Completed
            </span>
            <p className="text-2xl font-extrabold text-emerald-700">{completedMatches.length}</p>
            <span className="text-[11px] text-emerald-600 mt-1 block font-medium">Credited to clubs</span>
          </div>
        </div>

        {/* Fixtures Filter Bar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3.5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            {/* Search and Scope Toggle */}
            <div className="flex items-center gap-2 flex-1 w-full lg:max-w-md">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search match code, house, venue..."
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white text-xs"
                />
              </div>
              <button
                type="button"
                onClick={() => setFilterOnlyMine(!filterOnlyMine)}
                className={`text-xs px-3 py-2 rounded-lg font-bold border transition flex items-center gap-1.5 shrink-0 ${filterOnlyMine
                  ? 'bg-navy-950 text-white border-navy-950 shadow-2xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                title={filterOnlyMine ? 'Showing only matches assigned to you' : 'Showing all championship events'}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>{filterOnlyMine ? 'My Matches' : 'All Events'}</span>
              </button>
            </div>

            {/* Status Pills */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('ALL')}
                className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap ${activeTab === 'ALL'
                  ? 'bg-navy-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
              >
                All ({matches.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('AWAITING')}
                className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap ${activeTab === 'AWAITING'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                  }`}
              >
                Awaiting Submission ({awaitingSubmission.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('SUBMITTED')}
                className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap ${activeTab === 'SUBMITTED'
                  ? 'bg-purple-600 text-white shadow-2xs'
                  : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                  }`}
              >
                Under Review ({pendingApproval.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('COMPLETED')}
                className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap ${activeTab === 'COMPLETED'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                  }`}
              >
                Approved ({completedMatches.length})
              </button>
            </div>
          </div>

          {/* Sport Selector Pills - Clean Flex Wrap without side-scroll */}
          <div className="flex flex-wrap items-center gap-1.5 pt-3 border-t border-slate-100">
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mr-1 shrink-0">
              Championship Sport:
            </span>
            {championshipSports.map((s) => (
              <button
                key={s.value}
                onClick={() => setSportFilter(s.value)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${sportFilter === s.value
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 hover:border-slate-300'
                  }`}
              >
                {s.value && <SportIcon name={s.value} className="w-3.5 h-3.5" />}
                <span>{s.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Assigned Events Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-navy-950 tracking-tight flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-600" />
              <span>Assigned Competition Events ({filteredMatches.length})</span>
            </h2>
            <span className="text-xs text-slate-500">
              Click &quot;Enter Result & Points&quot; to preview unique-club distribution and submit
            </span>
          </div>

          {filteredMatches.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-xs">
              <Swords className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="font-semibold text-slate-600">No competition fixtures found.</p>
              <p className="mt-1">Try resetting the sport filter or switching official persona above.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredMatches.map((match) => {
                const participants = match.participants || [];
                const isBgmiOrSquad = match.sport?.category === 'SQUAD' || match.sport?.category === 'Adventure Quest' || match.sport?.sportType === 'SQUAD' || match.sport?.name === 'BGMI';
                const isSubmitted = match.status === 'SUBMITTED';
                const isCompleted = match.status === 'COMPLETED';

                return (
                  <div
                    key={match.id}
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 hover:shadow-sm transition"
                  >
                    <div>
                      {/* Card Header */}
                      <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] font-extrabold px-2.5 py-0.5 rounded-md bg-navy-950 text-white">
                            {match.matchCode}
                          </span>
                          <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                            <SportIcon name={match.sport?.name} className="w-4 h-4 text-blue-600" />
                            <span>{match.sport?.name}</span>
                          </span>
                          {match.matchCategory && match.matchCategory !== 'Singles' && (
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 uppercase">
                              {match.matchCategory}
                            </span>
                          )}
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                            {match.sport?.category || 'Team'}
                          </span>
                        </div>

                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${isCompleted
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : isSubmitted
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                        >
                          {isCompleted
                            ? 'Approved & Completed'
                            : isSubmitted
                              ? 'Submitted (Under Review)'
                              : 'Awaiting Result Entry'}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-500 mb-3 font-medium">
                        {match.round} • {match.stageName || 'Championship Stage'}
                      </p>

                      {/* Participating Entries / Squads Box */}
                      <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200 space-y-2.5">
                        {participants.map((p: any, idx: number) => {
                          const players = p.players || [];
                          // Calculate unique clubs represented in this squad
                          const representedClubs = new Set<string>();
                          if (p.club?.name) representedClubs.add(p.club.name);
                          players.forEach((mpp: any) => {
                            if (mpp.club?.name) representedClubs.add(mpp.club.name);
                          });

                          return (
                            <div
                              key={p.id || idx}
                              className="bg-white p-2.5 rounded-lg border border-slate-200/80 shadow-2xs"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  {p.club ? (
                                    <div className="w-6 h-6 rounded bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                                      <ClubBadge code={p.club.code} name={p.club.name} className="w-4 h-4" />
                                    </div>
                                  ) : (
                                    <div className="w-6 h-6 rounded bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center shrink-0 font-bold text-[10px]">
                                      #{idx + 1}
                                    </div>
                                  )}
                                  <div>
                                    <span className="font-bold text-xs text-slate-800 block">
                                      {p.cricketTeam?.name || p.teamName || p.club?.name || p.player?.name || `Entry ${idx + 1}`}
                                    </span>
                                    {p.cricketTeam && (
                                      <span className="text-[10px] text-blue-600 font-semibold block">
                                        Parent House: {p.club?.name}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div className="text-right">
                                  {p.score !== null && p.score !== undefined ? (
                                    <span className="font-mono font-extrabold text-xs text-navy-950 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                      {p.score} pts
                                    </span>
                                  ) : (
                                    <span className="text-[10px] text-slate-400 font-medium">Pending Entry</span>
                                  )}
                                </div>
                              </div>

                              {/* Multi-player roster preview with club badges (e.g. BGMI mixed squads) */}
                              {players.length > 0 && (
                                <div className="mt-2 pt-2 border-t border-slate-100">
                                  <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                                    <span>Squad Roster ({players.length} players):</span>
                                    <span className="font-extrabold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                                      {representedClubs.size} Unique Club{representedClubs.size === 1 ? '' : 's'}
                                    </span>
                                  </div>
                                  <div className="flex flex-wrap gap-1">
                                    {players.map((mpp: any, pIdx: number) => (
                                      <span
                                        key={pIdx}
                                        className="text-[10px] bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded flex items-center gap-1 font-medium text-slate-700"
                                      >
                                        <span>{mpp.player?.name}</span>
                                        <span className="font-bold text-slate-500 text-[9px]">
                                          ({mpp.club?.code || mpp.club?.name?.slice(0, 3)})
                                        </span>
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Date & Venue Footer */}
                      <div className="mt-3 text-[11px] text-slate-500 flex items-center justify-between">
                        <span className="flex items-center gap-1.5 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{match.matchDate} at {match.matchTime}</span>
                        </span>
                        <span className="flex items-center gap-1.5 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{match.venue?.name || 'Olympic Arena'}</span>
                        </span>
                      </div>
                    </div>

                    {/* Bottom Action Bar */}
                    <div className="pt-3.5 mt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        <span>{participants.length} Entry/Entries</span>
                      </span>

                      <Link
                        href={`/referee/matches/${match.matchCode}`}
                        className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg shadow-xs transition ${isCompleted
                          ? 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                          : isSubmitted
                            ? 'bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100'
                            : 'bg-amber-500 hover:bg-amber-400 text-navy-950 font-extrabold shadow-sm'
                          }`}
                      >
                        {isCompleted ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            View Certified Allocation
                          </>
                        ) : isSubmitted ? (
                          <>
                            <FileCheck2 className="w-3.5 h-3.5 text-purple-600" />
                            View Submitted Breakdown
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5 fill-navy-950" />
                            Enter Final Result & Points
                          </>
                        )}
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Rules & Points Distribution Explainer Modal */}
      {showRulesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-extrabold text-navy-950">
                  Unique-Club Points Distribution System
                </h3>
              </div>
              <button
                onClick={() => setShowRulesModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-600 space-y-3 leading-relaxed">
              <p>
                In the <strong>House Championship 2026</strong>, live scoring is managed by a separate platform. The referee records final points or positions earned by participating entries.
              </p>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 space-y-1.5">
                <span className="font-extrabold block text-amber-950">
                  Core Rule: Points Divided by UNIQUE Clubs (Not Players)
                </span>
                <p className="text-[11px]">
                  Points earned by a squad are divided equally among the number of unique clubs represented in that squad, regardless of how many players each club contributed.
                </p>
                <div className="mt-2 text-[11px] font-mono bg-white/80 p-2 rounded border border-amber-300/60">
                  Example: 100 points earned by a BGMI squad with 2 Mavericks, 1 Dominator, 1 Alpha (3 unique clubs):<br />
                  • Mavericks: 33.33 pts<br />
                  • Dominator: 33.33 pts<br />
                  • Alpha: 33.34 pts (remainder allocated fairly)
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="font-bold text-slate-800 block">Cricket Parent Club Rollup:</span>
                <p className="text-[11px]">
                  Each of the 5 clubs has two cricket teams (Team A and Team B, 10 cricket teams total). Points earned by either team credit the parent club directly.
                </p>
              </div>

              <div className="space-y-1.5">
                <span className="font-bold text-slate-800 block">Verification Workflow:</span>
                <p className="text-[11px]">
                  Once submitted by the referee, results are held in <code>SUBMITTED</code> status until reviewed and approved by tournament administrators. Only approved results update the official House Championship Leaderboard.
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowRulesModal(false)}
                className="px-4 py-2 bg-navy-950 hover:bg-navy-900 text-white font-bold text-xs rounded-xl transition"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </RefereeLayout>
  );
}
