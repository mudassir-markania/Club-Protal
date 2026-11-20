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

  return (
    <div className="bg-[#faf8ff] text-[#131b2e] font-inter text-[15px] antialiased selection:bg-[#0051d5] selection:text-white min-h-screen">
      <PublicNavbar activeOverride="leaderboard" />

      <main className="w-full pt-20 pb-20">
        {/* HERO HEADER */}
        <section className="w-full bg-[#000f3f] text-white py-12 lg:py-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#000f3f] via-[#172554] to-[#000f3f] opacity-90" />
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <span className="text-xs uppercase tracking-widest text-[#dbe1ff] font-extrabold font-manrope">
                APL SEASON 9 • OFFICIAL CHAMPIONSHIP TELEMETRY
              </span>
              <h1 className="font-manrope text-3xl sm:text-5xl font-black uppercase tracking-tight text-white leading-tight">
                LEADERBOARD &amp; TOURNAMENT RESULTS
              </h1>
              <p className="text-sm text-[#b7c4fd] max-w-2xl leading-relaxed">
                Official approved point tallies across all 6 championship sports calculated strictly via the official sports points distribution rules.
              </p>
            </div>

            {/* Public Tab Navigation */}
            <div className="flex items-center gap-1.5 bg-white/10 p-1.5 rounded-xl border border-white/15 backdrop-blur-md self-start md:self-auto shrink-0 flex-wrap text-xs font-bold font-manrope">
              {[
                { id: 'OVERALL', label: 'Overall Standings', icon: Trophy },
                { id: 'SPORTS', label: 'By Sport', icon: Medal },
                { id: 'AWARDS', label: `Awards (${awards.length})`, icon: Award },
                { id: 'RESULTS', label: `Match Results (${completedMatches.length})`, icon: Calendar },
                { id: 'HISTORY', label: 'Points Audit', icon: History },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-3.5 py-2 rounded-lg transition flex items-center gap-1.5 ${
                      activeTab === tab.id
                        ? 'bg-white text-[#000f3f] shadow-sm font-extrabold'
                        : 'text-[#dbe1ff] hover:text-white'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

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
