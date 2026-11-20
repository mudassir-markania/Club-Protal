'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import PublicNavbar from '@/components/public/PublicNavbar';
import PublicFooter from '@/components/public/PublicFooter';
import {
  Trophy,
  Crown,
  Medal,
  Shield,
  ArrowRight,
  Sparkles,
  Info,
  CheckCircle2,
  Calendar,
  Award,
  History,
  FileText,
  Search,
  Filter,
  Users,
} from 'lucide-react';
import { ClubBadge, SportIcon } from '@/components/ui/icons';

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState<'OVERALL' | 'SPORTS' | 'AWARDS' | 'RESULTS' | 'HISTORY'>('OVERALL');
  const [selectedSportFilter, setSelectedSportFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Data states
  const [loading, setLoading] = useState(true);
  const [standings, setStandings] = useState<any[]>([]);
  const [sports, setSports] = useState<any[]>([]);
  const [championClub, setChampionClub] = useState<any | null>(null);
  const [awards, setAwards] = useState<any[]>([]);
  const [completedMatches, setCompletedMatches] = useState<any[]>([]);
  const [pointsHistory, setPointsHistory] = useState<any[]>([]);

  useEffect(() => {
    fetchAllPublicData();
  }, []);

  const fetchAllPublicData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Leaderboard
      const lbRes = await fetch('/api/leaderboard?type=overall');
      if (lbRes.ok) {
        const lbData = await lbRes.json();
        setStandings(lbData.standings || []);
        setSports(lbData.sports || []);
        setChampionClub(lbData.championClub || null);
      }

      // 2. Fetch Approved Awards
      const awRes = await fetch('/api/awards?status=APPROVED');
      if (awRes.ok) {
        const awData = await awRes.json();
        setAwards(awData.awards || []);
      }

      // 3. Fetch Completed & Approved Matches
      const mRes = await fetch('/api/matches?status=COMPLETED');
      if (mRes.ok) {
        const mData = await mRes.json();
        setCompletedMatches(Array.isArray(mData) ? mData : []);
      }

      // 4. Fetch Points History
      const hRes = await fetch('/api/points-history');
      if (hRes.ok) {
        const hData = await hRes.json();
        setPointsHistory(Array.isArray(hData) ? hData : []);
      }
    } catch (e) {
      console.error('Failed to load public leaderboard data:', e);
    } finally {
      setLoading(false);
    }
  };

  const leadingClub = standings[0]?.club || null;

  // Filtered awards
  const filteredAwards = awards.filter((aw) => {
    if (selectedSportFilter !== 'ALL' && !aw.sportName?.toLowerCase().includes(selectedSportFilter.toLowerCase())) {
      return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        aw.playerName?.toLowerCase().includes(q) ||
        aw.awardTitle?.toLowerCase().includes(q) ||
        aw.clubName?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Filtered matches
  const filteredMatches = completedMatches.filter((m) => {
    if (selectedSportFilter !== 'ALL' && m.sport?.name?.toLowerCase() !== selectedSportFilter.toLowerCase()) {
      return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        m.matchCode?.toLowerCase().includes(q) ||
        m.sport?.name?.toLowerCase().includes(q) ||
        m.participants?.some((p: any) =>
          (p.teamName || p.club?.name || '').toLowerCase().includes(q)
        )
      );
    }
    return true;
  });

  // Filtered points history
  const filteredHistory = pointsHistory.filter((h) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        h.club?.name?.toLowerCase().includes(q) ||
        h.reason?.toLowerCase().includes(q) ||
        h.sport?.name?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalPointsCount = (standings || []).reduce(
    (acc: number, s: any) => acc + (s.totalPoints || s.points || 0),
    0
  );

  const trueHousesCount =
    (standings || []).filter(
      (s: any) => s.club?.code !== 'OT1' && s.club?.name?.toUpperCase() !== 'OTHER'
    ).length || 5;

  return (
    <div className="bg-[#faf8ff] text-[#131b2e] font-inter text-[15px] antialiased selection:bg-[#0051d5] selection:text-white min-h-screen">
      <PublicNavbar activeOverride="leaderboard" />

      <main className="w-full pb-20">
        {/* ======================================================== */}
        {/* HERO HEADER: STADIUM LEADERBOARD & TELEMETRY            */}
        {/* ======================================================== */}
        <header className="relative w-full pt-24 sm:pt-28 lg:pt-32 pb-10 sm:pb-14 bg-gradient-to-br from-[#000f3f] via-[#071952] to-[#010922] text-white overflow-hidden border-b border-[#3b82f6]/20 shadow-xl">
          {/* Decorative Ambient Radial Glows */}
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-[#eb6905]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-[#0051d5]/25 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] opacity-5 pointer-events-none" />

          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Left Column: Heading & Telemetry Metrics */}
              <div className="lg:col-span-7 flex flex-col items-start">
                {/* Season Pill Badge */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[11px] font-extrabold uppercase tracking-widest text-amber-300 font-manrope mb-4 shadow-inner">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>APL Season 9 • Official Championship Telemetry</span>
                </div>

                {/* Main Headline */}
                <h1 className="font-manrope text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white leading-none">
                  LEADERBOARD &amp;{' '}
                  <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-300 bg-clip-text text-transparent">
                    RESULTS
                  </span>
                </h1>

                <p className="text-sm sm:text-base text-[#dce1ff] max-w-2xl mt-4 leading-relaxed font-normal">
                  Official certified point tallies across all 6 championship sports, verified awards, completed match results, and administrative points audit trail.
                </p>

                {/* Telemetry KPI Metric Chips */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 w-full max-w-2xl mt-7">
                  <div className="p-3 sm:p-3.5 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md">
                    <span className="text-[10px] sm:text-[11px] uppercase tracking-wider font-extrabold text-[#93c5fd] font-manrope block">
                      Houses
                    </span>
                    <span className="block font-manrope text-2xl sm:text-3xl font-black text-white">
                      {trueHousesCount}
                    </span>
                    <span className="text-[10px] text-white/60 font-medium">Contenders</span>
                  </div>

                  <div className="p-3 sm:p-3.5 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md">
                    <span className="text-[10px] sm:text-[11px] uppercase tracking-wider font-extrabold text-amber-300 font-manrope block">
                      Approved PTS
                    </span>
                    <span className="block font-manrope text-2xl sm:text-3xl font-black text-amber-400">
                      {Number.isInteger(totalPointsCount) ? totalPointsCount : totalPointsCount.toFixed(1)}
                    </span>
                    <span className="text-[10px] text-amber-200/70 font-medium">Verified Engine</span>
                  </div>

                  <div className="p-3 sm:p-3.5 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md">
                    <span className="text-[10px] sm:text-[11px] uppercase tracking-wider font-extrabold text-[#93c5fd] font-manrope block">
                      Sports
                    </span>
                    <span className="block font-manrope text-2xl sm:text-3xl font-black text-white">
                      {sports.length > 0 ? sports.length : 6}
                    </span>
                    <span className="text-[10px] text-white/60 font-medium">Disciplines</span>
                  </div>

                  <div className="p-3 sm:p-3.5 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md">
                    <span className="text-[10px] sm:text-[11px] uppercase tracking-wider font-extrabold text-emerald-300 font-manrope block">
                      Completed
                    </span>
                    <span className="block font-manrope text-2xl sm:text-3xl font-black text-emerald-400">
                      {completedMatches.length}
                    </span>
                    <span className="text-[10px] text-emerald-200/70 font-medium">Official Results</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Crown Leader Spotlight Console */}
              <div className="lg:col-span-5">
                <div className="relative rounded-2xl bg-white/[0.08] backdrop-blur-xl border border-white/15 p-5 sm:p-6 shadow-2xl overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

                  {/* Header */}
                  <div className="flex items-center justify-between gap-3 pb-4 border-b border-white/10">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400/20 to-transparent border border-amber-400/30 p-1 flex items-center justify-center shrink-0"
                        style={{ width: '40px', height: '40px' }}
                      >
                        <img
                          src="/logo.png"
                          alt="APL Trophy"
                          className="w-full h-full object-contain"
                          style={{ width: '100%', height: '100%', maxWidth: '32px', maxHeight: '32px', objectFit: 'contain' }}
                        />
                      </div>
                      <div>
                        <span className="block font-manrope text-xs font-black uppercase tracking-wider text-white">
                          Championship Telemetry Desk
                        </span>
                        <span className="text-[10px] text-[#93c5fd] font-medium font-manrope">
                          NexCore Directorate of Sports
                        </span>
                      </div>
                    </div>

                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-[10px] font-bold text-emerald-300 uppercase tracking-wider font-manrope">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Live Verified
                    </span>
                  </div>

                  {/* Leading House Highlight */}
                  <div className="pt-4 space-y-3.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-300 font-manrope flex items-center gap-1.5">
                        <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        Championship Crown Leader
                      </span>
                      <span className="text-[10px] font-mono text-[#93c5fd] bg-white/10 px-2 py-0.5 rounded">
                        Rank #1
                      </span>
                    </div>

                    <div className="bg-black/25 rounded-xl p-3.5 border border-white/10 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-[#0051d5] flex items-center justify-center text-white font-manrope font-black text-base shadow-sm shrink-0">
                          {leadingClub?.code?.charAt(0) || 'B'}
                        </div>
                        <div className="min-w-0">
                          <span className="block font-manrope text-sm font-black uppercase text-white truncate">
                            {leadingClub?.name || 'Blue Club'}
                          </span>
                          <span className="text-[11px] text-[#93c5fd] truncate block">
                            Captain: {leadingClub?.captainName || 'Roheen'}
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="block font-manrope text-xl font-black text-amber-400">
                          {standings[0]?.totalPoints ? standings[0].totalPoints.toFixed(0) : 31} PTS
                        </span>
                        <span className="text-[9px] uppercase font-bold text-emerald-400">
                          Leading Table
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 text-xs">
                      <Link
                        href="/houses"
                        className="text-amber-300 hover:text-amber-200 font-extrabold uppercase tracking-wider font-manrope flex items-center gap-1 text-[11px]"
                      >
                        <span>Explore House Dynasties</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                      <Link
                        href="/schedule"
                        className="text-[#93c5fd] hover:text-white font-bold uppercase tracking-wider font-manrope text-[11px]"
                      >
                        Match Fixtures
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Public Tab Navigation Command Bar */}
            <div className="mt-8 pt-6 border-t border-white/10 flex items-center gap-2 overflow-x-auto no-scrollbar">
              {[
                { id: 'OVERALL', label: 'Overall Standings', icon: Trophy, count: null },
                { id: 'SPORTS', label: 'By Sport', icon: Medal, count: sports.length || 6 },
                { id: 'AWARDS', label: 'Approved Awards', icon: Award, count: awards.length },
                { id: 'RESULTS', label: 'Match Results', icon: Calendar, count: completedMatches.length },
                { id: 'HISTORY', label: 'Points Audit Trail', icon: History, count: pointsHistory.length },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 text-xs font-extrabold font-manrope uppercase tracking-wider shrink-0 cursor-pointer ${
                      isActive
                        ? 'bg-white text-[#000f3f] shadow-lg shadow-black/20 scale-[1.02]'
                        : 'bg-white/10 hover:bg-white/15 text-[#dbe1ff] hover:text-white border border-white/10'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#0051d5]' : 'text-amber-300'}`} />
                    <span>{tab.label}</span>
                    {typeof tab.count === 'number' && (
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold font-mono ${
                          isActive ? 'bg-[#dae2fd] text-[#000f3f]' : 'bg-white/15 text-white'
                        }`}
                      >
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </header>

        {/* CONTENT CONTAINER */}
        <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 py-10 space-y-10">
          {/* 1. OVERALL STANDINGS TAB */}
          {activeTab === 'OVERALL' && (
            <div className="space-y-10">
              {/* Podium View */}
              {standings.length >= 3 && (
                <div className="bg-[#f2f3ff] rounded-2xl p-6 sm:p-10 shadow-xs border border-[#e2e7ff] relative overflow-hidden">
                  <div className="flex items-center justify-between pb-6 border-b border-[#e2e7ff]">
                    <div>
                      <span className="text-xs uppercase tracking-widest text-[#0051d5] font-extrabold font-manrope block">
                        THE CHAMPIONSHIP RACE
                      </span>
                      <h2 className="font-manrope text-2xl font-black uppercase text-[#000f3f]">
                        Official House Podium
                      </h2>
                    </div>
                    <span className="text-xs text-slate-500 font-bold bg-white px-3 py-1.5 rounded-lg border border-[#e2e7ff]">
                      Verified by Tournament Director
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pt-8">
                    {/* #2 Rank */}
                    {standings[1] && (
                      <div className="order-2 md:order-1 bg-white rounded-2xl p-6 border border-[#e2e7ff] shadow-xs hover:-translate-y-1 transition text-center space-y-3">
                        <span className="w-9 h-9 rounded-full bg-slate-200 text-slate-800 font-black text-sm mx-auto flex items-center justify-center font-mono">
                          #2
                        </span>
                        <div className="w-14 h-14 mx-auto bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-center">
                          <ClubBadge code={standings[1].club.code} name={standings[1].club.name} className="w-10 h-10" />
                        </div>
                        <div>
                          <h3 className="font-extrabold text-base text-[#000f3f]">{standings[1].club.name}</h3>
                          <span className="text-xs text-slate-400">Captain: {standings[1].club.captainName || 'Leader'}</span>
                        </div>
                        <div className="pt-3 border-t border-slate-100">
                          <span className="font-mono text-2xl font-black text-[#000f3f]">
                            {standings[1].totalPoints.toFixed(2)}
                          </span>
                          <span className="text-[10px] text-slate-400 block font-bold uppercase">Points</span>
                        </div>
                      </div>
                    )}

                    {/* #1 Leader (Gold) */}
                    {standings[0] && (
                      <div className="order-1 md:order-2 bg-gradient-to-b from-amber-500/10 via-white to-white rounded-2xl p-8 border-2 border-amber-400 shadow-md relative hover:-translate-y-1.5 transition text-center space-y-3">
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-amber-400 text-navy-950 font-black text-[10px] uppercase tracking-wider flex items-center gap-1 shadow-xs">
                          <Crown className="w-3.5 h-3.5 fill-navy-950" />
                          <span>Championship Leader</span>
                        </div>
                        <span className="w-10 h-10 rounded-full bg-amber-400 text-navy-950 font-black text-base mx-auto flex items-center justify-center font-mono shadow-sm">
                          #1
                        </span>
                        <div className="w-16 h-16 mx-auto bg-slate-50 rounded-2xl border border-amber-300 flex items-center justify-center shadow-xs">
                          <ClubBadge code={standings[0].club.code} name={standings[0].club.name} className="w-12 h-12" />
                        </div>
                        <div>
                          <h3 className="font-black text-xl text-[#000f3f]">{standings[0].club.name}</h3>
                          <span className="text-xs text-slate-500 font-semibold">
                            Captain: {standings[0].club.captainName || 'Leader'}
                          </span>
                        </div>
                        <div className="pt-3 border-t border-amber-200">
                          <span className="font-mono text-3xl font-black text-[#000f3f]">
                            {standings[0].totalPoints.toFixed(2)}
                          </span>
                          <span className="text-[11px] text-amber-700 block font-bold uppercase">Approved Points</span>
                        </div>
                      </div>
                    )}

                    {/* #3 Rank (Bronze) */}
                    {standings[2] && (
                      <div className="order-3 bg-white rounded-2xl p-6 border border-[#e2e7ff] shadow-xs hover:-translate-y-1 transition text-center space-y-3">
                        <span className="w-9 h-9 rounded-full bg-amber-200 text-amber-900 font-black text-sm mx-auto flex items-center justify-center font-mono">
                          #3
                        </span>
                        <div className="w-14 h-14 mx-auto bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-center">
                          <ClubBadge code={standings[2].club.code} name={standings[2].club.name} className="w-10 h-10" />
                        </div>
                        <div>
                          <h3 className="font-extrabold text-base text-[#000f3f]">{standings[2].club.name}</h3>
                          <span className="text-xs text-slate-400">Captain: {standings[2].club.captainName || 'Leader'}</span>
                        </div>
                        <div className="pt-3 border-t border-slate-100">
                          <span className="font-mono text-2xl font-black text-[#000f3f]">
                            {standings[2].totalPoints.toFixed(2)}
                          </span>
                          <span className="text-[10px] text-slate-400 block font-bold uppercase">Points</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Comprehensive Standings & 6-Sport Matrix Table */}
              <div className="bg-white rounded-2xl border border-[#e2e7ff] shadow-xs overflow-hidden">
                <div className="p-6 border-b border-[#e2e7ff] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="font-manrope text-xl font-bold uppercase tracking-tight text-[#000f3f]">
                      House Championship 6-Sport Standings Table
                    </h2>
                    <p className="text-xs text-slate-500">
                      Breakdown of approved points across all 6 sanctioned tournament disciplines.
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                      <tr>
                        <th className="py-3.5 px-4">Rank</th>
                        <th className="py-3.5 px-4">House</th>
                        <th className="py-3.5 px-4">Leadership</th>
                        {sports.map((sp) => (
                          <th key={sp.id} className="py-3.5 px-3 text-right">
                            <span className="truncate max-w-[70px] inline-block">{sp.name}</span>
                          </th>
                        ))}
                        <th className="py-3.5 px-4 text-right">Total Points</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-sans">
                      {standings.map((st) => (
                        <tr key={st.id} className="hover:bg-slate-50/70 transition">
                          <td className="py-3.5 px-4 font-mono font-black text-sm">
                            <span
                              className={`w-7 h-7 rounded-full inline-flex items-center justify-center ${
                                st.rank === 1
                                  ? 'bg-amber-400 text-navy-950 font-extrabold'
                                  : st.rank === 2
                                  ? 'bg-slate-200 text-slate-800'
                                  : st.rank === 3
                                  ? 'bg-amber-200 text-amber-900'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              #{st.rank}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                                <ClubBadge code={st.club.code} name={st.club.name} className="w-5 h-5" />
                              </div>
                              <div>
                                <span className="font-extrabold text-sm text-[#000f3f] block">{st.club.name}</span>
                                <span className="text-[10px] font-mono text-slate-400">{st.club.code}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-slate-600">
                            <span className="font-bold text-slate-800 block">{st.club.captainName || '—'}</span>
                            <span className="text-[10px] text-slate-400">Vice: {st.club.viceCaptainName || '—'}</span>
                          </td>
                          {sports.map((sp) => {
                            const pts = st.sportBreakdown?.[sp.id] || 0;
                            return (
                              <td key={sp.id} className="py-3.5 px-3 text-right font-mono font-bold text-slate-700">
                                {pts > 0 ? (
                                  <span className="text-navy-950 font-black">{pts.toFixed(2)}</span>
                                ) : (
                                  <span className="text-slate-300">0.00</span>
                                )}
                              </td>
                            );
                          })}
                          <td className="py-3.5 px-4 text-right">
                            <span className="font-mono text-base font-black text-[#000f3f]">
                              {st.totalPoints.toFixed(2)}
                            </span>
                            <span className="text-[10px] text-slate-400 font-bold block">pts</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 2. SPORT-WISE STANDINGS TAB */}
          {activeTab === 'SPORTS' && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                {sports.map((sp) => (
                  <button
                    key={sp.id}
                    onClick={() => setSelectedSportFilter(sp.name)}
                    className={`px-4 py-2 rounded-xl font-bold transition flex items-center gap-2 whitespace-nowrap ${
                      selectedSportFilter === sp.name
                        ? 'bg-navy-950 text-white shadow-xs'
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    <SportIcon name={sp.name} className="w-3.5 h-3.5" />
                    <span>{sp.name}</span>
                  </button>
                ))}
              </div>

              {sports
                .filter((sp) => selectedSportFilter === 'ALL' || sp.name === selectedSportFilter)
                .map((sp) => {
                  const sortedBySport = [...standings].sort((a, b) => {
                    const bPts = b.sportBreakdown?.[sp.id] || 0;
                    const aPts = a.sportBreakdown?.[sp.id] || 0;
                    return bPts - aPts;
                  });

                  return (
                    <div key={sp.id} className="bg-white rounded-2xl border border-[#e2e7ff] p-6 shadow-xs space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center">
                            <SportIcon name={sp.name} className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-extrabold text-base text-[#000f3f]">{sp.name} Standings</h3>
                            <span className="text-xs text-slate-400">Category: {sp.category} • Format: {sp.sportType}</span>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                          Official PDF Rules Applied
                        </span>
                      </div>

                      <div className="divide-y divide-slate-100">
                        {sortedBySport.map((st, idx) => {
                          const pts = st.sportBreakdown?.[sp.id] || 0;
                          return (
                            <div key={st.id} className="py-3 flex items-center justify-between text-xs">
                              <div className="flex items-center gap-3">
                                <span className="font-mono font-black text-xs text-slate-400 w-5">#{idx + 1}</span>
                                <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                                  <ClubBadge code={st.club.code} name={st.club.name} className="w-4 h-4" />
                                </div>
                                <span className="font-bold text-sm text-[#000f3f]">{st.club.name}</span>
                              </div>
                              <div className="text-right">
                                <span className="font-mono font-black text-base text-navy-950">{pts.toFixed(2)}</span>
                                <span className="text-[10px] text-slate-400 block font-bold">pts</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}

          {/* 3. AWARDS TAB */}
          {activeTab === 'AWARDS' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-manrope text-xl font-bold uppercase tracking-tight text-[#000f3f]">
                    Official Tournament Award Winners
                  </h2>
                  <p className="text-xs text-slate-500">
                    Approved individual and tournament honors from sports_points_distribution.pdf. Points credited directly to the athlete&apos;s house.
                  </p>
                </div>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search player, award, house..."
                    className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl bg-white outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              {filteredAwards.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-xs">
                  No approved award recipients match the search criteria yet. Awards will display automatically once approved by the Tournament Director.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredAwards.map((aw) => (
                    <div
                      key={aw.id}
                      className="bg-white rounded-2xl border border-[#e2e7ff] p-5 shadow-xs hover:border-amber-300 transition space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                          {aw.sportName}
                        </span>
                        <span className="font-mono text-sm font-black text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-lg">
                          +{aw.points} pts
                        </span>
                      </div>

                      <div>
                        <h4 className="font-extrabold text-sm text-navy-950 flex items-center gap-1.5">
                          <Award className="w-4 h-4 text-amber-500 shrink-0" />
                          <span>{aw.awardTitle}</span>
                        </h4>
                        <span className="font-bold text-sm text-slate-800 block mt-1">{aw.playerName}</span>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <span>
                          House: <strong className="text-navy-900">{aw.clubName || aw.club?.name}</strong>
                        </span>
                        <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Approved
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 4. MATCH RESULTS TAB */}
          {activeTab === 'RESULTS' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-manrope text-xl font-bold uppercase tracking-tight text-[#000f3f]">
                    Approved Match Results &amp; Scorecards
                  </h2>
                  <p className="text-xs text-slate-500">
                    Official scores and automatic point distributions for completed tournament fixtures.
                  </p>
                </div>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search fixture, team, house..."
                    className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl bg-white outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              {filteredMatches.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-xs">
                  No completed matches recorded yet. Once match results are officiated and approved, full scorecards appear here.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredMatches.map((m) => {
                    const result = m.results?.[0];
                    return (
                      <div
                        key={m.id}
                        className="bg-white rounded-2xl border border-[#e2e7ff] p-5 shadow-xs space-y-4 hover:border-slate-300 transition"
                      >
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[11px] font-extrabold px-2 py-0.5 rounded bg-navy-950 text-white">
                              {m.matchCode}
                            </span>
                            <span className="font-extrabold text-xs text-navy-950 flex items-center gap-1">
                              <SportIcon name={m.sport?.name} className="w-3.5 h-3.5 text-blue-600" />
                              <span>{m.sport?.name}</span>
                            </span>
                          </div>
                          <span className="text-[10px] font-bold text-slate-400">
                            {m.matchDate} • {m.round}
                          </span>
                        </div>

                        {/* Scores Summary */}
                        {result && (
                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                              Final Result:
                            </span>
                            <span className="font-extrabold text-navy-950 text-sm">{result.scoresSummary}</span>
                          </div>
                        )}

                        {/* Participants & Points */}
                        <div className="space-y-2 text-xs">
                          {m.participants?.map((p: any) => (
                            <div
                              key={p.id}
                              className={`p-2.5 rounded-xl border flex items-center justify-between ${
                                p.isWinner
                                  ? 'bg-amber-50/50 border-amber-200 font-bold'
                                  : 'bg-white border-slate-100'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                {p.isWinner && <Trophy className="w-3.5 h-3.5 text-amber-500" />}
                                <span>{p.teamName || p.cricketTeam?.name || p.club?.name}</span>
                              </div>
                              <span style={{ whiteSpace: 'nowrap', display: 'inline-flex', flexShrink: 0 }} className="inline-flex items-center font-mono font-black text-navy-950 whitespace-nowrap shrink-0">{p.score || 0}&nbsp;pts</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* 5. POINTS HISTORY AUDIT TAB */}
          {activeTab === 'HISTORY' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-manrope text-xl font-bold uppercase tracking-tight text-[#000f3f]">
                    Verifiable Points Ledger &amp; Audit Trail
                  </h2>
                  <p className="text-xs text-slate-500">
                    Complete verifiable record of all approved points credited to each house across the championship.
                  </p>
                </div>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search ledger..."
                    className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl bg-white outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-4">House</th>
                        <th className="py-3 px-4">Sport</th>
                        <th className="py-3 px-4">Audit Reason</th>
                        <th className="py-3 px-4 text-right">Points</th>
                        <th className="py-3 px-4 text-right">Approved Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredHistory.map((h) => (
                        <tr key={h.id} className="hover:bg-slate-50/70 transition">
                          <td className="py-3 px-4 font-bold text-navy-950 flex items-center gap-2">
                            <ClubBadge code={h.club?.code} name={h.club?.name} className="w-4 h-4" />
                            <span>{h.club?.name}</span>
                          </td>
                          <td className="py-3 px-4 text-slate-600">{h.sport?.name || 'General'}</td>
                          <td className="py-3 px-4 text-slate-700 font-medium">{h.reason}</td>
                          <td className="py-3 px-4 text-right font-mono font-black text-navy-950">
                            +{parseFloat(h.points).toFixed(2)} pts
                          </td>
                          <td className="py-3 px-4 text-right text-slate-400 font-mono text-[11px]">
                            {new Date(h.recordedAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
