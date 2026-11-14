'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import {
  Trophy,
  Medal,
  RefreshCw,
  Award,
  TrendingUp,
  Shield,
  Users,
  ChevronDown,
  Sparkles,
  Download,
  CheckCircle2,
  X,
} from 'lucide-react';
import {
  ClubBadge,
  MedalBadge,
  SportIcon,
  FootballIcon,
  TableTennisIcon,
  BadmintonIcon,
} from '@/components/ui/icons';

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState<'overall' | 'sport' | 'individual' | 'doubles'>('overall');
  const [sports, setSports] = useState<any[]>([]);
  const [selectedSportId, setSelectedSportId] = useState<string>('');
  const [standings, setStandings] = useState<any[]>([]);
  const [sportStandings, setSportStandings] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchSports();
  }, []);

  useEffect(() => {
    fetchLeaderboard();
  }, [activeTab, selectedSportId]);

  const fetchSports = async () => {
    try {
      const res = await fetch('/api/sports');
      const data = await res.json();
      if (Array.isArray(data)) {
        setSports(data);
        if (data.length > 0 && !selectedSportId) {
          setSelectedSportId(data[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      let url = `/api/leaderboard?type=${activeTab}`;
      if (activeTab === 'sport' && selectedSportId) {
        url += `&sportId=${selectedSportId}`;
      }

      const res = await fetch(url);
      const data = await res.json();

      if (activeTab === 'overall') {
        setStandings(data.standings || []);
      } else if (activeTab === 'sport') {
        setSportStandings(data);
        setStandings(data.standings || []);
      } else {
        setStandings(data.standings || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRecalculate = async () => {
    setRecalculating(true);
    setMessage(null);
    try {
      const res = await fetch('/api/leaderboard', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMessage('All tournament leaderboards and club points successfully recalculated from validated match records!');
      fetchLeaderboard();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setRecalculating(false);
    }
  };

  const exportLeaderboard = () => {
    window.open('/api/reports/export?type=overall_leaderboard&format=csv', '_blank');
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold tracking-tight text-navy-950">Championship Leaderboards</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-yellow-50 text-yellow-800 border border-yellow-200 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-yellow-600" />
                Live Standings
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Automated ranking calculations derived from approved match results, tie-breakers, and points history.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportLeaderboard}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg shadow-2xs transition"
            >
              <Download className="w-4 h-4 text-slate-400" />
              Export CSV
            </button>
            <button
              onClick={handleRecalculate}
              disabled={recalculating}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-navy-900 hover:bg-navy-800 text-white text-xs font-bold rounded-lg shadow-sm transition disabled:opacity-70"
            >
              <RefreshCw className={`w-4 h-4 ${recalculating ? 'animate-spin' : ''}`} />
              {recalculating ? 'Recalculating...' : 'Recalculate Standings'}
            </button>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs font-semibold flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{message}</span>
            </span>
            <button onClick={() => setMessage(null)} className="text-emerald-700 hover:text-emerald-900">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs font-bold">
          <button
            onClick={() => setActiveTab('overall')}
            className={`px-4 py-2 rounded-lg transition flex items-center gap-1.5 ${
              activeTab === 'overall'
                ? 'bg-navy-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>Overall Club Leaderboard</span>
          </button>
          <button
            onClick={() => setActiveTab('sport')}
            className={`px-4 py-2 rounded-lg transition flex items-center gap-1.5 ${
              activeTab === 'sport'
                ? 'bg-navy-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FootballIcon className="w-4 h-4" />
            <span>Sport-Wise Standings</span>
          </button>
          <button
            onClick={() => setActiveTab('individual')}
            className={`px-4 py-2 rounded-lg transition flex items-center gap-1.5 ${
              activeTab === 'individual'
                ? 'bg-navy-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <TableTennisIcon className="w-4 h-4" />
            <span>Individual Player Leaderboard</span>
          </button>
          <button
            onClick={() => setActiveTab('doubles')}
            className={`px-4 py-2 rounded-lg transition flex items-center gap-1.5 ${
              activeTab === 'doubles'
                ? 'bg-navy-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <BadmintonIcon className="w-4 h-4" />
            <span>Doubles Pairs Leaderboard</span>
          </button>
        </div>

        {/* Tab 1: Overall Club Leaderboard */}
        {activeTab === 'overall' && (
          <div className="space-y-6">
            {/* Top 3 Podium Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {standings.slice(0, 3).map((entry, idx) => (
                <div
                  key={entry.id}
                  className={`p-6 rounded-2xl border relative overflow-hidden transition ${
                    idx === 0
                      ? 'bg-gradient-to-b from-yellow-50/80 to-white border-yellow-300 shadow-md ring-2 ring-yellow-400/20'
                      : idx === 1
                      ? 'bg-gradient-to-b from-slate-100/70 to-white border-slate-300 shadow-xs'
                      : 'bg-gradient-to-b from-amber-50/70 to-white border-amber-300 shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-extrabold text-sm ${
                        idx === 0
                          ? 'bg-yellow-400 text-yellow-950 shadow-sm'
                          : idx === 1
                          ? 'bg-slate-300 text-slate-800'
                          : 'bg-amber-300 text-amber-950'
                      }`}
                    >
                      #{entry.rank}
                    </span>
                    <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-xs">
                      <ClubBadge code={entry.club.code} name={entry.club.name} className="w-7 h-7" />
                    </div>
                  </div>

                  <h3 className="font-extrabold text-lg text-navy-950 mb-1">{entry.club.name}</h3>
                  <span className="text-xs font-mono font-bold text-blue-600">{entry.club.code}</span>

                  <div className="mt-4 pt-4 border-t border-slate-200/80 grid grid-cols-3 gap-2 text-center text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Medals</span>
                      <span className="font-extrabold text-slate-800 flex items-center justify-center gap-1.5 mt-0.5">
                        <span className="inline-flex items-center gap-0.5"><MedalBadge type="gold" className="w-3.5 h-3.5" />{entry.gold}</span>
                        <span className="inline-flex items-center gap-0.5"><MedalBadge type="silver" className="w-3.5 h-3.5" />{entry.silver}</span>
                        <span className="inline-flex items-center gap-0.5"><MedalBadge type="bronze" className="w-3.5 h-3.5" />{entry.bronze}</span>
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Matches</span>
                      <span className="font-extrabold text-slate-800">{entry.played} (W: {entry.won})</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Total Score</span>
                      <span className="text-base font-black text-navy-950">{entry.points} pts</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Complete Overall Table (Requirement 6.A: Rank | Club | Gold | Silver | Bronze | Wins | Total Points) */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-navy-950 uppercase tracking-wider">
                  Complete Club Championship Standings
                </span>
                <span className="text-xs text-slate-400 font-medium">Rankings determined by Total Points & Medals</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Rank</th>
                      <th className="py-3 px-4">Club</th>
                      <th className="py-3 px-4 text-center">
                        <span className="inline-flex items-center gap-1">Gold <MedalBadge type="gold" className="w-3.5 h-3.5" /></span>
                      </th>
                      <th className="py-3 px-4 text-center">
                        <span className="inline-flex items-center gap-1">Silver <MedalBadge type="silver" className="w-3.5 h-3.5" /></span>
                      </th>
                      <th className="py-3 px-4 text-center">
                        <span className="inline-flex items-center gap-1">Bronze <MedalBadge type="bronze" className="w-3.5 h-3.5" /></span>
                      </th>
                      <th className="py-3 px-4 text-center">Matches Won</th>
                      <th className="py-3 px-4 text-center">Played</th>
                      <th className="py-3 px-4 text-center">Score Diff</th>
                      <th className="py-3 px-4 text-right">Total Points</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {standings.map((entry) => (
                      <tr key={entry.id} className="hover:bg-slate-50 transition">
                        <td className="py-3.5 px-4 font-extrabold text-slate-900">
                          <span
                            className={`w-6 h-6 rounded-full inline-flex items-center justify-center text-xs ${
                              entry.rank === 1
                                ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                                : entry.rank === 2
                                ? 'bg-slate-200 text-slate-800'
                                : entry.rank === 3
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {entry.rank}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                              <ClubBadge code={entry.club.code} name={entry.club.name} className="w-5 h-5" />
                            </div>
                            <div>
                              <span className="font-bold text-slate-900 block text-xs">{entry.club.name}</span>
                              <span className="text-[10px] text-slate-400 font-mono">{entry.club.code}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold text-yellow-700 bg-yellow-50/30">
                          {entry.gold}
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold text-slate-700 bg-slate-50/50">
                          {entry.silver}
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold text-amber-700 bg-amber-50/30">
                          {entry.bronze}
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold text-emerald-700">
                          {entry.won}
                        </td>
                        <td className="py-3.5 px-4 text-center text-slate-600 font-medium">
                          {entry.played}
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono text-slate-600">
                          {entry.scoreDifference > 0 ? `+${entry.scoreDifference}` : entry.scoreDifference}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <span className="text-sm font-black text-navy-950 bg-slate-100 px-3 py-1 rounded-md">
                            {entry.points}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Sport-Wise Leaderboard (Requirement 6.B) */}
        {activeTab === 'sport' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 bg-white p-4 rounded-xl border border-slate-200">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Select Sport:</span>
              <div className="flex items-center gap-2 flex-wrap">
                {sports.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedSportId(s.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                      selectedSportId === s.id
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <SportIcon name={s.name} className="w-4 h-4" />
                    <span>{s.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-navy-950 uppercase tracking-wider">
                  {sportStandings?.sport?.name} Standings
                </span>
                <span className="text-xs text-slate-400">
                  Format: {sportStandings?.sport?.tournamentFormat}
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Rank</th>
                      <th className="py-3 px-4">Club</th>
                      <th className="py-3 px-4 text-center">Played</th>
                      <th className="py-3 px-4 text-center">Won</th>
                      <th className="py-3 px-4 text-center">Drawn</th>
                      <th className="py-3 px-4 text-center">Lost</th>
                      <th className="py-3 px-4 text-center">Score Diff</th>
                      <th className="py-3 px-4 text-right">Points</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {standings.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-slate-400">
                          No standings recorded for this sport yet.
                        </td>
                      </tr>
                    ) : (
                      standings.map((entry) => (
                        <tr key={entry.id} className="hover:bg-slate-50 transition">
                          <td className="py-3 px-4 font-bold text-slate-800">#{entry.rank}</td>
                          <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2">
                            <ClubBadge code={entry.club.code} name={entry.club.name} className="w-4 h-4" />
                            <span>{entry.club.name}</span>
                          </td>
                          <td className="py-3 px-4 text-center font-medium text-slate-700">{entry.played}</td>
                          <td className="py-3 px-4 text-center font-bold text-emerald-700">{entry.won}</td>
                          <td className="py-3 px-4 text-center text-slate-600">{entry.drawn}</td>
                          <td className="py-3 px-4 text-center text-rose-700">{entry.lost}</td>
                          <td className="py-3 px-4 text-center font-mono text-slate-600">
                            {entry.scoreDifference > 0 ? `+${entry.scoreDifference}` : entry.scoreDifference}
                          </td>
                          <td className="py-3 px-4 text-right font-black text-navy-950">{entry.points}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Individual Player Leaderboard (Requirement 6.C) */}
        {activeTab === 'individual' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-navy-950 uppercase tracking-wider">
                Individual Disciplines Player Standings (Singles)
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Rank</th>
                    <th className="py-3 px-4">Player Name</th>
                    <th className="py-3 px-4">Registration ID</th>
                    <th className="py-3 px-4">Club</th>
                    <th className="py-3 px-4 text-center">Matches Played</th>
                    <th className="py-3 px-4 text-center">Wins</th>
                    <th className="py-3 px-4 text-center">Losses</th>
                    <th className="py-3 px-4 text-right">Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {standings.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4 font-bold text-slate-900">#{p.rank}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{p.name}</td>
                      <td className="py-3 px-4 font-mono text-blue-600 font-medium">{p.registrationId}</td>
                      <td className="py-3 px-4 text-slate-700 font-semibold">{p.club?.name}</td>
                      <td className="py-3 px-4 text-center text-slate-700">{p.played}</td>
                      <td className="py-3 px-4 text-center font-bold text-emerald-700">{p.won}</td>
                      <td className="py-3 px-4 text-center text-rose-700">{p.lost}</td>
                      <td className="py-3 px-4 text-right font-black text-navy-950">{p.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Doubles Leaderboard (Requirement 6.D) */}
        {activeTab === 'doubles' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-navy-950 uppercase tracking-wider">
                Doubles Pairs Standings
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Rank</th>
                    <th className="py-3 px-4">Pair / Team Name</th>
                    <th className="py-3 px-4">Sport</th>
                    <th className="py-3 px-4">Club</th>
                    <th className="py-3 px-4 text-center">Matches Played</th>
                    <th className="py-3 px-4 text-center">Wins</th>
                    <th className="py-3 px-4 text-right">Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {standings.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        No doubles matches recorded yet.
                      </td>
                    </tr>
                  ) : (
                    standings.map((pair) => (
                      <tr key={pair.teamName} className="hover:bg-slate-50 transition">
                        <td className="py-3 px-4 font-bold text-slate-900">#{pair.rank}</td>
                        <td className="py-3 px-4 font-bold text-slate-900">{pair.teamName}</td>
                        <td className="py-3 px-4 font-medium text-purple-700">{pair.sportName}</td>
                        <td className="py-3 px-4 text-slate-700 font-semibold">{pair.club?.name}</td>
                        <td className="py-3 px-4 text-center text-slate-700">{pair.played}</td>
                        <td className="py-3 px-4 text-center font-bold text-emerald-700">{pair.won}</td>
                        <td className="py-3 px-4 text-right font-black text-navy-950">{pair.points}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

