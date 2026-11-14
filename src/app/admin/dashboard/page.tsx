'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/layout/AppLayout';
import {
  Shield,
  Medal,
  Users,
  UserCheck,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Trophy,
  ArrowUpRight,
  TrendingUp,
  FileSpreadsheet,
  Plus,
  RefreshCw,
  ChevronRight,
  Award,
  MapPin,
} from 'lucide-react';
import { ClubBadge, MedalBadge, SportIcon } from '@/components/ui/icons';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>({
    totalClubs: 0,
    totalSports: 0,
    totalPlayers: 0,
    totalReferees: 0,
    totalMatches: 0,
    completedMatches: 0,
    upcomingMatches: 0,
    pendingResults: 0,
    totalPoints: 0,
  });

  const [clubs, setClubs] = useState<any[]>([]);
  const [sports, setSports] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [clubsRes, sportsRes, matchesRes, regRes, leadRes] = await Promise.all([
        fetch('/api/clubs'),
        fetch('/api/sports'),
        fetch('/api/matches'),
        fetch('/api/registrations'),
        fetch('/api/leaderboard?type=overall'),
      ]);

      const clubsData = await clubsRes.json();
      const sportsData = await sportsRes.json();
      const matchesData = await matchesRes.json();
      const regData = await regRes.json();
      const leadData = await leadRes.json();

      setClubs(Array.isArray(clubsData) ? clubsData : []);
      setSports(Array.isArray(sportsData) ? sportsData : []);
      setMatches(Array.isArray(matchesData) ? matchesData : []);
      setRegistrations(regData.registrations || []);
      setLeaderboard(leadData.standings || []);

      // Calculate aggregated metrics
      const completed = Array.isArray(matchesData)
        ? matchesData.filter((m: any) => m.status === 'COMPLETED').length
        : 0;

      const upcoming = Array.isArray(matchesData)
        ? matchesData.filter((m: any) => m.status === 'SCHEDULED' || m.status === 'UPCOMING').length
        : 0;

      const pending = Array.isArray(matchesData)
        ? matchesData.filter((m: any) => m.status === 'SUBMITTED' || m.status === 'AWAITING_RESULT').length
        : 0;

      let totalPointsAwarded = 0;
      if (Array.isArray(clubsData)) {
        totalPointsAwarded = clubsData.reduce((acc: number, c: any) => acc + (c.totalPoints || 0), 0);
      }

      setStats({
        totalClubs: clubsData.length || 0,
        totalSports: sportsData.length || 0,
        totalPlayers: clubsData.reduce((acc: number, c: any) => acc + (c._count?.players || 0), 0),
        totalReferees: 3,
        totalMatches: matchesData.length || 0,
        completedMatches: completed,
        upcomingMatches: upcoming,
        pendingResults: pending,
        totalPoints: totalPointsAwarded,
      });
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  // Visualizations Data
  const clubPointsChartData = clubs.map((c) => ({
    name: c.code || c.name,
    fullName: c.name,
    points: c.totalPoints,
  }));

  const sportParticipationData = sports.map((s) => ({
    name: s.name,
    players: s._count?.players || 0,
    matches: s._count?.matches || 0,
  }));

  const matchStatusData = [
    { name: 'Completed', value: stats.completedMatches || 1, color: '#10B981' },
    { name: 'Pending Review', value: stats.pendingResults || 1, color: '#F59E0B' },
    { name: 'Upcoming', value: stats.upcomingMatches || 2, color: '#3B82F6' },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold tracking-tight text-navy-950">Tournament Operations Center</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Active
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Inter-Club Sports Championship • Operational Window: 25th - 28th November 2026
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={fetchDashboardData}
              disabled={loading}
              className="p-2 text-slate-600 hover:text-navy-900 border border-slate-200 rounded-lg hover:bg-slate-50 transition"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <Link
              href="/admin/matches"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-navy-900 hover:bg-navy-800 text-white text-xs font-semibold rounded-lg shadow-sm transition"
            >
              <Plus className="w-3.5 h-3.5" />
              Schedule Match
            </Link>
            <Link
              href="/admin/registrations"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Sync Forms
            </Link>
          </div>
        </div>

        {/* 9 Statistical Metric Cards (Requirement 3.A) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Clubs</span>
              <Shield className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-2xl font-extrabold text-navy-950">{stats.totalClubs}</p>
            <span className="text-[11px] text-slate-400 mt-1 block">Active competing clubs</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sports</span>
              <Medal className="w-4 h-4 text-indigo-600" />
            </div>
            <p className="text-2xl font-extrabold text-navy-950">{stats.totalSports}</p>
            <span className="text-[11px] text-slate-400 mt-1 block">Tournaments & disciplines</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Players</span>
              <Users className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-extrabold text-navy-950">{stats.totalPlayers}</p>
            <span className="text-[11px] text-slate-400 mt-1 block">Verified participants</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Referees</span>
              <UserCheck className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-2xl font-extrabold text-navy-950">{stats.totalReferees}</p>
            <span className="text-[11px] text-slate-400 mt-1 block">Field match officials</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Points Awarded</span>
              <Trophy className="w-4 h-4 text-yellow-500" />
            </div>
            <p className="text-2xl font-extrabold text-navy-950">{stats.totalPoints}</p>
            <span className="text-[11px] text-emerald-600 font-medium mt-1 block">Across all sports</span>
          </div>
        </div>

        {/* Match Progress Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Total Matches</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-navy-950">{stats.totalMatches}</span>
              <span className="text-xs text-slate-400 font-medium">fixtures</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-emerald-200/80 bg-emerald-50/20 shadow-2xs">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block mb-1">Completed</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-emerald-700">{stats.completedMatches}</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-blue-200/80 bg-blue-50/20 shadow-2xs">
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider block mb-1">Upcoming</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-blue-700">{stats.upcomingMatches}</span>
              <Clock className="w-4 h-4 text-blue-500" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-amber-200/80 bg-amber-50/20 shadow-2xs">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider block mb-1">Pending Results</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-amber-700">{stats.pendingResults}</span>
              <AlertCircle className="w-4 h-4 text-amber-500" />
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Club Points Bar Chart */}
          <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-navy-950 uppercase tracking-wider">Club Points Comparison</h3>
                <p className="text-xs text-slate-500">Live accumulated tournament standings</p>
              </div>
              <Link href="/admin/leaderboard" className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1">
                Full Standings <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={clubPointsChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0B192C', color: '#fff', borderRadius: '8px', border: 'none', fontSize: '12px' }}
                    formatter={(val: any) => [`${val} Points`, 'Score']}
                  />
                  <Bar dataKey="points" fill="#1E3E62" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Match Progress Donut */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-navy-950 uppercase tracking-wider mb-1">Match Completion</h3>
              <p className="text-xs text-slate-500">Tournament execution rate</p>
            </div>
            <div className="h-48 my-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={matchStatusData}
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {matchStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0B192C', color: '#fff', borderRadius: '8px', border: 'none', fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Completed
                </span>
                <span className="font-bold text-slate-800">{stats.completedMatches}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Pending Review
                </span>
                <span className="font-bold text-slate-800">{stats.pendingResults}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Scheduled
                </span>
                <span className="font-bold text-slate-800">{stats.upcomingMatches}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Split Grid: Top Clubs & Recent Match Results */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top-performing Clubs */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-navy-950 uppercase tracking-wider">Top Performing Clubs</h3>
                <p className="text-xs text-slate-500">Overall championship podium</p>
              </div>
              <Link href="/admin/leaderboard" className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1">
                View All <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="divide-y divide-slate-100">
              {leaderboard.slice(0, 4).map((entry, idx) => (
                <div key={entry.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition">
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                        idx === 0
                          ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                          : idx === 1
                          ? 'bg-slate-200 text-slate-800'
                          : idx === 2
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {entry.rank}
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center">
                      <ClubBadge code={entry.club.code} name={entry.club.name} className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{entry.club.name}</h4>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                        <span>P: {entry.played}</span>
                        <span>•</span>
                        <span>W: {entry.won}</span>
                        <span>•</span>
                        <span className="text-amber-600 font-medium inline-flex items-center gap-1">
                          <MedalBadge type="gold" className="w-3 h-3" /> {entry.gold}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-extrabold text-navy-900">{entry.points}</span>
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase">Points</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Match Results & Fixtures */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-navy-950 uppercase tracking-wider">Tournament Fixtures & Status</h3>
                <p className="text-xs text-slate-500">Live, pending, and scheduled encounters</p>
              </div>
              <Link href="/admin/matches" className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1">
                All Matches <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
              {matches.slice(0, 5).map((match) => {
                const p1 = match.participants?.[0];
                const p2 = match.participants?.[1];

                return (
                  <div key={match.id} className="p-3.5 hover:bg-slate-50 transition flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {match.matchCode}
                        </span>
                        <span className="text-xs font-semibold text-slate-700">{match.sport?.name}</span>
                        <span className="text-[11px] text-slate-400">• {match.round}</span>
                      </div>
                      <div className="text-xs font-bold text-slate-900">
                        {p1?.club?.name || p1?.player?.name || 'TBD'}
                        <span className="mx-1 text-slate-400">vs</span>
                        {p2?.club?.name || p2?.player?.name || 'TBD'}
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                        <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{match.matchDate} at {match.matchTime}</span>
                        <span>•</span>
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{match.venue?.name || 'Main Arena'}</span>
                      </div>
                    </div>

                    <div>
                      {match.status === 'COMPLETED' ? (
                        <div className="text-right">
                          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            {p1?.score} - {p2?.score}
                          </span>
                          <span className="block text-[10px] text-emerald-600 mt-0.5 font-medium">Completed</span>
                        </div>
                      ) : match.status === 'SUBMITTED' ? (
                        <div className="text-right">
                          <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            Awaiting Review
                          </span>
                          <Link href={`/admin/matches`} className="block text-[10px] text-blue-600 hover:underline mt-0.5 font-semibold">
                            Review Now
                          </Link>
                        </div>
                      ) : match.status === 'IN_PROGRESS' ? (
                        <div className="text-right">
                          <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 animate-pulse">
                            Live Score
                          </span>
                          <span className="block text-[10px] text-slate-500 mt-0.5">
                            {p1?.score} - {p2?.score}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded">
                          Scheduled
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Recent Registrations Table snippet (Requirement 3.A) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-navy-950 uppercase tracking-wider">Recent Registrations (Google Forms & CSV)</h3>
              <p className="text-xs text-slate-500">Real-time incoming participant entries</p>
            </div>
            <Link href="/admin/registrations" className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1">
              Manage Registrations <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Submission ID</th>
                  <th className="py-3 px-4">Participant Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Club Preference</th>
                  <th className="py-3 px-4">Sport(s)</th>
                  <th className="py-3 px-4">Source</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {registrations.slice(0, 4).map((reg) => (
                  <tr key={reg.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-medium text-slate-700">{reg.submissionId}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{reg.fullName}</td>
                    <td className="py-3 px-4 text-slate-500">{reg.email}</td>
                    <td className="py-3 px-4 font-medium text-slate-800">{reg.clubPreference}</td>
                    <td className="py-3 px-4 text-slate-600 truncate max-w-xs">{reg.sportsSelected}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600">
                        {reg.source}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          reg.status === 'APPROVED'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : reg.status === 'DUPLICATE'
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {reg.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

