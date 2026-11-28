'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminLayout from '@/components/layout/AdminLayout';
import { usePreventScroll } from '@/hooks/usePreventScroll';
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
  Plus,
  RefreshCw,
  ChevronRight,
  Award,
  MapPin,
  Sparkles,
  FileCheck2,
  History,
  Check,
  X,
  Send,
  Eye,
  Lock,
  Unlock,
} from 'lucide-react';
import { ClubBadge, MedalBadge, SportIcon } from '@/components/ui/icons';

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [pointsLocked, setPointsLocked] = useState(false);
  const [togglingLock, setTogglingLock] = useState(false);
  const [clubs, setClubs] = useState<any[]>([]);
  const [sports, setSports] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [championshipStatus, setChampionshipStatus] = useState('ACTIVE');
  const [championClub, setChampionClub] = useState<any | null>(null);

  // Quick Approval Modal State
  const [selectedMatch, setSelectedMatch] = useState<any | null>(null);
  const [reviewResult, setReviewResult] = useState<any | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  usePreventScroll(isReviewModalOpen);
  const [approving, setApproving] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectBox, setShowRejectBox] = useState(false);
  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [clubsRes, sportsRes, matchesRes, leadRes] = await Promise.all([
        fetch('/api/clubs'),
        fetch('/api/sports'),
        fetch('/api/matches'),
        fetch('/api/leaderboard?type=overall'),
      ]);

      const clubsData = await clubsRes.json();
      const sportsData = await sportsRes.json();
      const matchesData = await matchesRes.json();
      const leadData = await leadRes.json();

      setClubs(Array.isArray(clubsData) ? clubsData : []);
      setSports(Array.isArray(sportsData) ? sportsData : []);
      setMatches(Array.isArray(matchesData) ? matchesData : []);
      setLeaderboard(leadData.standings || []);
      setChampionshipStatus(leadData.championshipStatus || 'ACTIVE');
      setChampionClub(leadData.championClub || null);
      setPointsLocked(Boolean(leadData.pointsLocked));
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePointsLock = async () => {
    setTogglingLock(true);
    try {
      const res = await fetch('/api/leaderboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'TOGGLE_LOCK' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPointsLocked(Boolean(data.pointsLocked));
      setAlertMsg({
        type: 'success',
        text: data.message || (data.pointsLocked ? 'Points locked for public.' : 'Points unlocked.'),
      });
      fetchDashboardData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setTogglingLock(false);
    }
  };

  const pendingApprovals = matches.filter((m) => m.status === 'SUBMITTED');
  const upcomingMatches = matches.filter((m) => m.status === 'SCHEDULED' || m.status === 'UPCOMING');
  const completedMatches = matches.filter((m) => m.status === 'COMPLETED');
  const totalPointsDistributed = clubs.reduce((acc, c) => acc + (c.totalPoints || 0), 0);

  const openQuickReview = (match: any) => {
    setSelectedMatch(match);
    const pendingResult = match.results?.find((r: any) => r.status === 'PENDING_APPROVAL') || match.results?.[0];
    setReviewResult(pendingResult);
    setShowRejectBox(false);
    setRejectionReason('');
    setIsReviewModalOpen(true);
  };

  const handleApprove = async () => {
    if (!selectedMatch) return;
    setApproving(true);
    try {
      const res = await fetch(`/api/matches/${selectedMatch.id}/approve-result`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'APPROVE',
          resultId: reviewResult?.id,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setAlertMsg({ type: 'success', text: `Result for ${selectedMatch.matchCode} approved! Points distributed to houses.` });
      setIsReviewModalOpen(false);
      fetchDashboardData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setApproving(false);
    }
  };

  const handleReject = async () => {
    if (!selectedMatch || !rejectionReason.trim()) {
      alert('Please state a reason for rejecting this result');
      return;
    }
    setApproving(true);
    try {
      const res = await fetch(`/api/matches/${selectedMatch.id}/approve-result`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'REJECT',
          resultId: reviewResult?.id,
          rejectionReason,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setAlertMsg({ type: 'success', text: `Result for ${selectedMatch.matchCode} rejected and returned to referee.` });
      setIsReviewModalOpen(false);
      fetchDashboardData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setApproving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Banner Alert Message */}
        {alertMsg && (
          <div
            className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center justify-between ${
              alertMsg.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{alertMsg.text}</span>
            </div>
            <button onClick={() => setAlertMsg(null)} className="p-1 rounded text-slate-400 hover:text-slate-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Hero Header & Operational Status */}
        <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-navy-850 text-white p-6 rounded-2xl border border-navy-700/60 shadow-lg relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 relative z-10">
            <div className="flex items-start gap-4">
              <div className="hidden sm:flex w-16 h-16 rounded-2xl bg-navy-850/90 border border-amber-500/40 p-1.5 items-center justify-center shrink-0 shadow-lg shadow-amber-500/10">
                <img src="/logo.png" alt="APL Season 9" className="w-full h-full object-contain filter drop-shadow" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-500/20 text-blue-300 border border-blue-500/40 uppercase tracking-wider flex items-center gap-1.5">
                    <Shield className="w-3 h-3 text-blue-400" />
                    APL Season 9
                  </span>
                  <span
                    className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 ${
                      championshipStatus === 'CLOSED'
                        ? 'bg-purple-950/80 text-purple-300 border-purple-700/60'
                        : 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${championshipStatus === 'CLOSED' ? 'bg-purple-400' : 'bg-emerald-400 animate-pulse'}`} />
                    {championshipStatus === 'CLOSED' ? 'Tournament Closed' : 'Live Tournament Active'}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                  Tournament Command Center
                </h1>
                <p className="text-xs sm:text-sm text-navy-200 mt-1 max-w-2xl leading-relaxed">
                  Oversee fixtures, review referee result submissions, and monitor house championship standings.
                </p>
              </div>
            </div>

            {/* Quick Primary Actions */}
            <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
              <button
                onClick={fetchDashboardData}
                className="p-2.5 bg-navy-800/80 hover:bg-navy-700 text-navy-300 hover:text-white rounded-xl border border-navy-700 transition"
                title="Refresh Standings"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>

              <button
                onClick={handleTogglePointsLock}
                disabled={togglingLock}
                className={`inline-flex items-center gap-2 px-3.5 py-2.5 font-extrabold text-xs rounded-xl shadow-md transition disabled:opacity-60 cursor-pointer ${
                  pointsLocked
                    ? 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                }`}
                title={pointsLocked ? 'Points are hidden from the public. Click to unlock.' : 'Freeze points for final day grand reveal'}
              >
                {pointsLocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                <span>{pointsLocked ? 'Unlock Public Points' : 'Lock Points (Final Day)'}</span>
              </button>

              <Link
                href="/admin/matches"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-navy-950 font-extrabold text-xs rounded-xl shadow-md transition"
              >
                <Plus className="w-4 h-4" />
                Schedule Competition
              </Link>
            </div>
          </div>
        </div>

        {/* Final Day Freeze Active Status Banner */}
        {pointsLocked && (
          <div className="p-4 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 text-navy-950 rounded-2xl border-2 border-yellow-200 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-navy-950 text-amber-400 flex items-center justify-center shrink-0 shadow-sm">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <div className="font-extrabold text-sm uppercase tracking-wide">
                  Final Day Points Freeze is Active
                </div>
                <div className="text-xs text-navy-900 font-medium">
                  Public scores, house ranks, and points audit logs are masked for the Grand Reveal ceremony. Full calculations remain visible here for tournament officials.
                </div>
              </div>
            </div>
            <button
              onClick={handleTogglePointsLock}
              disabled={togglingLock}
              className="px-4 py-2 bg-navy-950 text-white hover:bg-navy-900 text-xs font-black rounded-xl shrink-0 transition shadow-sm cursor-pointer"
            >
              Unlock Points Now
            </button>
          </div>
        )}

        {/* 4 Essential Quick Workflow Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/admin/matches?status=SUBMITTED"
            className={`p-4 rounded-xl border transition shadow-2xs hover:shadow-xs group ${
              pendingApprovals.length > 0
                ? 'bg-amber-50/60 border-amber-300 hover:border-amber-400'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                <FileCheck2 className="w-4 h-4 text-amber-600" />
                Pending Verification
              </span>
              {pendingApprovals.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-navy-950 animate-pulse">
                  Action Needed
                </span>
              )}
            </div>
            <p className="text-2xl font-black text-navy-950">{pendingApprovals.length}</p>
            <span className="text-xs text-slate-500 group-hover:text-amber-700 transition block mt-1 font-medium">
              Results awaiting admin review →
            </span>
          </Link>

          <Link
            href="/admin/leaderboard"
            className="p-4 bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition shadow-2xs hover:shadow-xs group"
          >
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-yellow-500" />
                Total Points Credited
              </span>
            </div>
            <p className="text-2xl font-black text-navy-950">{totalPointsDistributed.toFixed(2)} pts</p>
            <span className="text-xs text-slate-500 group-hover:text-blue-600 transition block mt-1 font-medium">
              View official House Leaderboard →
            </span>
          </Link>

          <Link
            href="/admin/matches"
            className="p-4 bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition shadow-2xs hover:shadow-xs group"
          >
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-blue-600" />
                Competitions
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-black text-navy-950">{matches.length}</p>
              <span className="text-xs text-emerald-600 font-bold">{completedMatches.length} finished</span>
            </div>
            <span className="text-xs text-slate-500 group-hover:text-blue-600 transition block mt-1 font-medium">
              Manage schedule & results →
            </span>
          </Link>

          <Link
            href="/admin/points-history"
            className="p-4 bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition shadow-2xs hover:shadow-xs group"
          >
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <History className="w-4 h-4 text-purple-600" />
                Points History
              </span>
            </div>
            <p className="text-2xl font-black text-navy-950">Audit Trail</p>
            <span className="text-xs text-slate-500 group-hover:text-purple-600 transition block mt-1 font-medium">
              Inspect unique-club breakdowns →
            </span>
          </Link>
        </div>

        {/* Pending Verification Priority Queue (Shows if any results are waiting!) */}
        {pendingApprovals.length > 0 && (
          <div className="bg-amber-50/70 border-2 border-amber-300/80 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></span>
                <h2 className="text-sm font-extrabold text-amber-950 uppercase tracking-wider">
                  Action Required: {pendingApprovals.length} Result{pendingApprovals.length === 1 ? '' : 's'} Awaiting Admin Verification
                </h2>
              </div>
              <Link href="/admin/matches?status=SUBMITTED" className="text-xs font-bold text-amber-900 hover:underline">
                View All Pending →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {pendingApprovals.slice(0, 2).map((m) => (
                <div
                  key={m.id}
                  className="bg-white p-4 rounded-xl border border-amber-200 shadow-2xs flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-navy-950 text-white">
                        {m.matchCode}
                      </span>
                      <span className="text-xs font-bold text-slate-900 flex items-center gap-1">
                        <SportIcon name={m.sport?.name} className="w-3.5 h-3.5 text-blue-600" />
                        {m.sport?.name}
                      </span>
                    </div>
                    <span className="text-[10px] text-amber-700 bg-amber-100 font-bold px-2 py-0.5 rounded">
                      Submitted by Referee
                    </span>
                  </div>

                  <div className="text-xs text-slate-700 space-y-1 bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                    <div className="font-semibold text-slate-900">
                      {m.participants?.map((p: any) => p.teamName || p.club?.name || p.cricketTeam?.name).join(' vs ')}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Score: {m.participants?.map((p: any) => `${p.score} pts`).join(' - ')}
                    </div>
                  </div>

                  <button
                    onClick={() => openQuickReview(m)}
                    className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-navy-950 font-extrabold text-xs rounded-lg transition shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <FileCheck2 className="w-3.5 h-3.5" />
                    Review & Approve Distribution
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2-Column Core Layout: 5 Houses Standings & 6 Championship Sports */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1: 5 Houses Current Standings (2 cols) */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-navy-950 uppercase tracking-wider flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-500" />
                  <span>The 5 Houses — Current Standings</span>
                </h3>
                <p className="text-xs text-slate-500">Total verified points across all 6 sports</p>
              </div>
              <Link
                href="/admin/leaderboard"
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                Full Matrix <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {leaderboard.map((entry, idx) => (
                <div
                  key={entry.club.id || idx}
                  className="p-4 flex items-center justify-between hover:bg-slate-50/70 transition"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-7 h-7 rounded-full flex items-center justify-center font-extrabold text-xs shrink-0 ${
                        idx === 0
                          ? 'bg-amber-400 text-navy-950 shadow-sm'
                          : idx === 1
                          ? 'bg-slate-300 text-slate-800'
                          : idx === 2
                          ? 'bg-amber-200 text-amber-900'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      #{entry.rank}
                    </span>

                    <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                      <ClubBadge code={entry.club.code} name={entry.club.name} className="w-6 h-6" />
                    </div>

                    <div>
                      <h4 className="text-xs font-extrabold text-slate-900">{entry.club.name}</h4>
                      <span className="text-[10px] text-slate-400 font-mono font-bold">{entry.club.code}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-base font-black text-navy-950 font-mono">
                      {Number(entry.points).toFixed(2)}
                    </span>
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Points</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Column 2: 6 Championship Sports Quick Glance */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between">
            <div>
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-navy-950 uppercase tracking-wider flex items-center gap-2">
                    <Medal className="w-4 h-4 text-blue-600" />
                    <span>6 Championship Sports</span>
                  </h3>
                  <p className="text-xs text-slate-500">Disciplines and competition formats</p>
                </div>
                <Link href="/admin/sports" className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1">
                  Rules <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="divide-y divide-slate-100 p-2">
                {sports.map((sp) => (
                  <div key={sp.id} className="p-2.5 flex items-center justify-between text-xs hover:bg-slate-50 rounded-lg transition">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700">
                        <SportIcon name={sp.name} className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold text-slate-800 block">{sp.name}</span>
                        <span className="text-[10px] text-slate-400">{sp.category} • {sp.sportType}</span>
                      </div>
                    </div>
                    {sp.allowsMixedClubs && (
                      <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                        Mixed Squads
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 text-xs">
              <span className="text-slate-500 block mb-1">House Teams:</span>
              <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                10 teams total (House Team A & B for each house). Points earned by either team roll up to the parent house.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Result Approval Modal */}
      {isReviewModalOpen && selectedMatch && (
        <div
          className="fixed inset-0 !m-0 z-50 bg-navy-950/70 backdrop-blur-xs flex items-center justify-center p-4 overscroll-none touch-none"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsReviewModalOpen(false);
          }}
          onTouchMove={(e) => {
            if (e.target === e.currentTarget) e.preventDefault();
          }}
          onWheel={(e) => {
            if (e.target === e.currentTarget) e.preventDefault();
          }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in duration-200 touch-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 bg-navy-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm">Verify Result: {selectedMatch.matchCode}</h3>
                <span className="text-xs text-amber-300">
                  {selectedMatch.sport?.name} • {selectedMatch.round}
                </span>
              </div>
              <button
                onClick={() => setIsReviewModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                  Referee Summary:
                </span>
                <p className="text-slate-800 font-semibold">{reviewResult?.scoresSummary || 'Score entry pending'}</p>
                {reviewResult?.refereeNotes && (
                  <p className="text-slate-500 italic text-[11px]">Note: &quot;{reviewResult.refereeNotes}&quot;</p>
                )}
              </div>

              {/* Unique-Club Distribution Highlight */}
              <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl space-y-1.5">
                <span className="font-bold text-blue-950 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Automatic Unique-Club Point Allocation:
                </span>
                <p className="text-[11px] text-blue-800 leading-relaxed">
                  Approving this result will immediately divide the team's points equally between its players and credit each player's share to that player's club on to the official House Championship Leaderboard.
                </p>
              </div>

              {showRejectBox && (
                <div className="space-y-1.5 animate-in fade-in">
                  <label className="block font-bold text-red-700">Rejection Reason *</label>
                  <textarea
                    rows={2}
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="State why the result was rejected (e.g. incorrect squad roster or disputed score)..."
                    className="w-full px-3 py-2 border border-red-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-red-500 bg-red-50/20"
                  />
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                {!showRejectBox ? (
                  <button
                    type="button"
                    onClick={() => setShowRejectBox(true)}
                    className="px-3.5 py-2 text-red-600 hover:bg-red-50 rounded-lg font-bold transition"
                  >
                    Reject with Reason
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleReject}
                    disabled={approving}
                    className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition"
                  >
                    Confirm Rejection
                  </button>
                )}

                <div className="flex items-center gap-2 ml-auto">
                  <button
                    type="button"
                    onClick={() => setIsReviewModalOpen(false)}
                    className="px-3.5 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleApprove}
                    disabled={approving}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-lg transition shadow-sm flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    {approving ? 'Crediting Points...' : 'Approve & Credit Points'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
