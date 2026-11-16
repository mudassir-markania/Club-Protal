'use client';

import React, { useState, useEffect } from 'react';
import PublicNavbar from '@/components/public/PublicNavbar';
import PublicFooter from '@/components/public/PublicFooter';
import {
  Trophy,
  Star,
  Medal,
  Crown,
  Search,
  Shield,
  Calendar,
  Sparkles,
  ChevronRight,
  X,
  History,
  Users,
  Award,
} from 'lucide-react';
import { ClubBadge, SportIcon } from '@/components/ui/icons';

export default function PlayerLeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [sports, setSports] = useState<any[]>([]);
  const [selectedSport, setSelectedSport] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState('');

  // Selected player for history modal
  const [selectedPlayer, setSelectedPlayer] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchLeaderboard();
    setLastRefreshed(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  }, [selectedSport]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedSport) params.append('sportId', selectedSport);

      const res = await fetch(`/api/players/leaderboard?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setLeaderboard(data.leaderboard || []);
        if (data.sports && data.sports.length > 0) {
          setSports(data.sports);
        }
      }
    } catch (err) {
      console.error('Failed to load player leaderboard:', err);
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

  const handleOpenPlayerHistory = (player: any) => {
    setSelectedPlayer(player);
    setIsModalOpen(true);
  };

  const filteredLeaderboard = leaderboard.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const pName = p.name?.toLowerCase() || '';
    const cName = p.club?.name?.toLowerCase() || '';
    const cCode = p.club?.code?.toLowerCase() || '';
    const tName = p.teamName?.toLowerCase() || '';
    return pName.includes(q) || cName.includes(q) || cCode.includes(q) || tName.includes(q);
  });

  const top3 = filteredLeaderboard.slice(0, 3);
  const remainingPlayers = filteredLeaderboard.slice(3);

  return (
    <div className="min-h-screen bg-[#0A0D14] text-[#EDEDED] flex flex-col selection:bg-[#C6A04A] selection:text-[#0A0D14] antialiased">
      <PublicNavbar
        onRefresh={handleRefresh}
        refreshing={refreshing}
        lastUpdated={lastRefreshed}
        activeOverride="star-players"
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8 space-y-8">
        {/* Header Banner */}
        <div className="border-b border-white/[0.08] pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C6A04A]/10 border border-[#C6A04A]/30 text-xs text-[#C6A04A] mb-3">
              <Star className="w-3.5 h-3.5 fill-[#C6A04A]" />
              <span className="font-bold uppercase tracking-wider">APL Season 9 • Individual Player Honors</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-3">
              <span>Star Player & Performance Leaderboard</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-3xl leading-relaxed">
              Official individual athletic rankings across approved championship matches. Every match awards exactly ONE Star Player with performance points credited exclusively to their individual season record.
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search athlete or house..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#141822] border border-white/[0.1] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#C6A04A] shadow-xs"
            />
          </div>
        </div>

        {/* Two Separate Point Systems Callout Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-[#141822] via-[#0D1017] to-[#141822] border border-[#C6A04A]/30 text-xs text-slate-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#C6A04A]/10 border border-[#C6A04A]/40 flex items-center justify-center text-[#C6A04A] shrink-0">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-white block">Official Two-Point Separation Rule</span>
              <span className="text-[11px] text-slate-400">
                Individual performance points belong exclusively to each athlete. They are strictly isolated and never added again to House Championship points.
              </span>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-white/[0.04] text-[#C6A04A] border border-[#C6A04A]/30 shrink-0">
            Verified by Tournament Director
          </span>
        </div>

        {/* 8 Sports Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedSport('')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap shrink-0 flex items-center gap-2 ${
              selectedSport === ''
                ? 'bg-[#C6A04A] text-[#0A0D14] shadow-md shadow-[#C6A04A]/20'
                : 'bg-[#141822] text-slate-300 hover:text-white border border-white/[0.08]'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>All Sports (Overall Season)</span>
          </button>

          {sports.map((sp) => {
            const active = selectedSport === sp.id;
            return (
              <button
                key={sp.id}
                onClick={() => setSelectedSport(sp.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap shrink-0 flex items-center gap-2 ${
                  active
                    ? 'bg-[#C6A04A] text-[#0A0D14] shadow-md shadow-[#C6A04A]/20'
                    : 'bg-[#141822] text-slate-300 hover:text-white border border-white/[0.08]'
                }`}
              >
                <SportIcon name={sp.name} className="w-3.5 h-3.5 text-[#C6A04A]" />
                <span>{sp.name}</span>
              </button>
            );
          })}
        </div>

        {/* Top 3 Athletes Podium Spotlight */}
        {!loading && top3.length > 0 && !searchQuery && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {/* Rank 2 - Silver */}
            {top3[1] && (
              <div
                onClick={() => handleOpenPlayerHistory(top3[1])}
                className="cursor-pointer group p-6 rounded-2xl bg-[#141822] border border-slate-400/30 hover:border-slate-300 transition-all flex flex-col justify-between relative order-2 md:order-1 shadow-md"
              >
                <div className="flex items-center justify-between">
                  <span className="w-8 h-8 rounded-full bg-slate-300/10 text-slate-300 border border-slate-400/40 font-mono font-black text-sm flex items-center justify-center">
                    #2
                  </span>
                  <Medal className="w-5 h-5 text-slate-300" />
                </div>
                <div className="my-4 space-y-1">
                  <h3 className="font-serif text-lg font-bold text-white group-hover:text-[#F3D787] transition">
                    {top3[1].name}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="font-bold text-slate-200">{top3[1].club?.name || 'House'}</span>
                    <span>•</span>
                    <span>{top3[1].teamName}</span>
                  </div>
                </div>
                <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-[#C6A04A] text-[#C6A04A]" />
                    {top3[1].starPlayerCount}x Star Player
                  </span>
                  <span className="font-mono font-black text-lg text-white">
                    {top3[1].totalPerformancePoints} <span className="text-xs font-normal text-slate-400">pts</span>
                  </span>
                </div>
              </div>
            )}

            {/* Rank 1 - Gold Champion */}
            {top3[0] && (
              <div
                onClick={() => handleOpenPlayerHistory(top3[0])}
                className="cursor-pointer group p-6 rounded-2xl bg-gradient-to-b from-[#1C2331] to-[#141822] border-2 border-[#C6A04A] hover:border-[#F3D787] transition-all flex flex-col justify-between relative order-1 md:order-2 shadow-xl shadow-[#C6A04A]/10 scale-100 md:-translate-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="w-9 h-9 rounded-full bg-[#C6A04A] text-[#0A0D14] font-mono font-black text-sm flex items-center justify-center shadow-md">
                    #1
                  </span>
                  <div className="flex items-center gap-1 text-[#F3D787] font-bold text-xs uppercase tracking-wider bg-[#C6A04A]/20 px-2.5 py-1 rounded-full border border-[#C6A04A]/40">
                    <Crown className="w-3.5 h-3.5 fill-[#C6A04A]" />
                    <span>Season MVP Leader</span>
                  </div>
                </div>
                <div className="my-5 space-y-1">
                  <h3 className="font-serif text-xl sm:text-2xl font-black text-white group-hover:text-[#F3D787] transition">
                    {top3[0].name}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <span className="font-bold text-[#F3D787]">{top3[0].club?.name || 'House'}</span>
                    <span>•</span>
                    <span>{top3[0].teamName}</span>
                  </div>
                </div>
                <div className="pt-3 border-t border-white/[0.1] flex items-center justify-between text-xs">
                  <span className="text-amber-300 font-bold flex items-center gap-1.5">
                    <Star className="w-4 h-4 fill-[#C6A04A] text-[#C6A04A]" />
                    {top3[0].starPlayerCount}x Star Player Award
                  </span>
                  <span className="font-mono font-black text-2xl text-[#F3D787]">
                    {top3[0].totalPerformancePoints} <span className="text-xs font-normal text-slate-400">pts</span>
                  </span>
                </div>
              </div>
            )}

            {/* Rank 3 - Bronze */}
            {top3[2] && (
              <div
                onClick={() => handleOpenPlayerHistory(top3[2])}
                className="cursor-pointer group p-6 rounded-2xl bg-[#141822] border border-amber-700/40 hover:border-amber-600 transition-all flex flex-col justify-between relative order-3 shadow-md"
              >
                <div className="flex items-center justify-between">
                  <span className="w-8 h-8 rounded-full bg-amber-700/20 text-amber-500 border border-amber-700/40 font-mono font-black text-sm flex items-center justify-center">
                    #3
                  </span>
                  <Medal className="w-5 h-5 text-amber-600" />
                </div>
                <div className="my-4 space-y-1">
                  <h3 className="font-serif text-lg font-bold text-white group-hover:text-[#F3D787] transition">
                    {top3[2].name}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="font-bold text-slate-200">{top3[2].club?.name || 'House'}</span>
                    <span>•</span>
                    <span>{top3[2].teamName}</span>
                  </div>
                </div>
                <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-[#C6A04A] text-[#C6A04A]" />
                    {top3[2].starPlayerCount}x Star Player
                  </span>
                  <span className="font-mono font-black text-lg text-white">
                    {top3[2].totalPerformancePoints} <span className="text-xs font-normal text-slate-400">pts</span>
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Full Player Leaderboard Table */}
        <div className="bg-[#141822] rounded-2xl border border-white/[0.08] overflow-hidden shadow-lg">
          <div className="p-5 border-b border-white/[0.08] flex items-center justify-between flex-wrap gap-3">
            <h2 className="font-serif text-lg font-bold text-white flex items-center gap-2">
              <Trophy className="w-4 h-4 text-[#C6A04A]" />
              <span>Athletes Standings</span>
            </h2>
            <span className="text-xs text-slate-400">
              Showing {filteredLeaderboard.length} ranked athlete{filteredLeaderboard.length === 1 ? '' : 's'}
            </span>
          </div>

          {loading ? (
            <div className="py-20 text-center text-slate-400 text-xs">
              Loading official player leaderboard...
            </div>
          ) : filteredLeaderboard.length === 0 ? (
            <div className="py-20 text-center text-slate-400 text-xs">
              No athlete records found matching your active filter.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#0D1017] text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-white/[0.08]">
                  <tr>
                    <th className="py-3 px-4 text-center">Rank</th>
                    <th className="py-3 px-4">Athlete</th>
                    <th className="py-3 px-4">House</th>
                    <th className="py-3 px-4">Squad / Team</th>
                    <th className="py-3 px-4 text-center">Star Player Awards</th>
                    <th className="py-3 px-4 text-right">Individual Points</th>
                    <th className="py-3 px-4 text-center">History</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {filteredLeaderboard.map((player) => (
                    <tr
                      key={player.id}
                      onClick={() => handleOpenPlayerHistory(player)}
                      className="hover:bg-white/[0.02] cursor-pointer transition group"
                    >
                      {/* Rank */}
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center justify-center font-mono font-black text-xs px-2 py-0.5 rounded ${
                            player.rank === 1
                              ? 'bg-[#C6A04A] text-[#0A0D14]'
                              : player.rank === 2
                              ? 'bg-slate-300 text-slate-900'
                              : player.rank === 3
                              ? 'bg-amber-700 text-white'
                              : 'text-slate-400'
                          }`}
                        >
                          #{player.rank}
                        </span>
                      </td>

                      {/* Name */}
                      <td className="py-3 px-4 font-bold text-white group-hover:text-[#F3D787] transition">
                        <div className="flex items-center gap-2">
                          <span>{player.name}</span>
                          {player.starPlayerCount > 0 && (
                            <Star className="w-3.5 h-3.5 fill-[#C6A04A] text-[#C6A04A] shrink-0" />
                          )}
                        </div>
                      </td>

                      {/* House */}
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-300">
                          {player.club?.name || 'House'}
                        </span>
                      </td>

                      {/* Team */}
                      <td className="py-3 px-4 text-slate-400 font-medium">
                        {player.teamName || 'House Athlete'}
                      </td>

                      {/* Star Player Awards */}
                      <td className="py-3 px-4 text-center font-mono font-bold text-amber-300">
                        {player.starPlayerCount > 0 ? (
                          <span className="inline-flex items-center gap-1 bg-[#C6A04A]/10 border border-[#C6A04A]/30 px-2 py-0.5 rounded-full text-[11px]">
                            <Star className="w-3 h-3 fill-[#C6A04A] text-[#C6A04A]" />
                            <span>{player.starPlayerCount}x</span>
                          </span>
                        ) : (
                          <span className="text-slate-500 font-normal">—</span>
                        )}
                      </td>

                      {/* Points */}
                      <td className="py-3 px-4 text-right font-mono font-black text-base text-white">
                        {player.totalPerformancePoints.toFixed(2)}
                      </td>

                      {/* History Action */}
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenPlayerHistory(player);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-[#C6A04A]/20 text-[#C6A04A] font-bold text-[11px] border border-[#C6A04A]/30 transition inline-flex items-center gap-1"
                        >
                          <span>Log</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Athlete Performance History Modal (Section 7 Compliant) */}
      {isModalOpen && selectedPlayer && (
        <div className="fixed inset-0 z-50 bg-[#080A0E]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141822] text-white rounded-2xl shadow-2xl border border-[#C6A04A]/40 w-full max-w-2xl overflow-hidden animate-in fade-in duration-200">
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-r from-[#1C2331] to-[#141822] border-b border-white/[0.08] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#C6A04A]/20 border border-[#C6A04A]/50 flex items-center justify-center text-[#C6A04A]">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-black text-white">{selectedPlayer.name}</h3>
                  <span className="text-xs text-slate-300">
                    House {selectedPlayer.club?.name} ({selectedPlayer.club?.code}) • {selectedPlayer.teamName}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Summary Stats */}
            <div className="p-6 space-y-5 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-[#0A0D14] rounded-xl border border-white/[0.06] text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Total Points</span>
                  <span className="font-mono font-black text-lg text-[#F3D787]">
                    {selectedPlayer.totalPerformancePoints}
                  </span>
                </div>
                <div className="p-3 bg-[#0A0D14] rounded-xl border border-white/[0.06] text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Star Player Awards</span>
                  <span className="font-mono font-black text-lg text-amber-400">
                    {selectedPlayer.starPlayerCount}x
                  </span>
                </div>
                <div className="p-3 bg-[#0A0D14] rounded-xl border border-white/[0.06] text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Rank</span>
                  <span className="font-mono font-black text-lg text-white">
                    #{selectedPlayer.rank}
                  </span>
                </div>
              </div>

              {/* Match Logs Table */}
              <div>
                <h4 className="font-bold text-xs text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 text-[#C6A04A]" />
                  <span>Approved Match Performance History</span>
                </h4>

                {(!selectedPlayer.matchHistory || selectedPlayer.matchHistory.length === 0) ? (
                  <div className="p-6 bg-[#0A0D14] rounded-xl border border-white/[0.06] text-center text-slate-400 text-xs">
                    No approved match performances recorded for this athlete yet.
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-white/[0.08]">
                    <table className="w-full text-xs text-left bg-[#0A0D14]">
                      <thead className="text-[10px] font-bold text-slate-400 uppercase border-b border-white/[0.08] bg-[#141822]">
                        <tr>
                          <th className="py-2.5 px-3">Fixture</th>
                          <th className="py-2.5 px-3">Sport</th>
                          <th className="py-2.5 px-3">Date</th>
                          <th className="py-2.5 px-3">Team</th>
                          <th className="py-2.5 px-3 text-center">Star Player</th>
                          <th className="py-2.5 px-3 text-right">Points Earned</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.04]">
                        {selectedPlayer.matchHistory.map((m: any) => (
                          <tr key={m.id} className="hover:bg-white/[0.02]">
                            <td className="py-2.5 px-3 font-mono font-bold text-[#F3D787]">
                              {m.matchCode}
                            </td>
                            <td className="py-2.5 px-3 font-semibold text-slate-200">
                              {m.sportName}
                            </td>
                            <td className="py-2.5 px-3 text-slate-400">
                              {m.matchDate || 'Championship Day'}
                            </td>
                            <td className="py-2.5 px-3 text-slate-300">
                              {m.teamName}
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              {m.isStarPlayer ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full">
                                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                  <span>YES</span>
                                </span>
                              ) : (
                                <span className="text-slate-500">—</span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-black text-white">
                              +{m.pointsEarned.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-[#0D1017] border-t border-white/[0.08] flex items-center justify-between text-[11px] text-slate-400">
              <span>Only certified results approved by the Tournament Director contribute to this record.</span>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-1.5 rounded-lg bg-white/[0.08] hover:bg-white/[0.12] text-white font-bold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <PublicFooter />
    </div>
  );
}
