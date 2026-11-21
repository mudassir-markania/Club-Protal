'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import AdminLayout from '@/components/layout/AdminLayout';
import { usePreventScroll } from '@/hooks/usePreventScroll';
import {
  Calendar,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Eye,
  Trash2,
  Check,
  X,
  UserCheck,
  Medal,
  Shield,
  Trophy,
  Pencil,
  RefreshCw,
  MapPin,
  Sparkles,
  FileCheck2,
  Send,
  HelpCircle,
  Users,
  Star,
  Flame,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { ClubBadge, SportIcon } from '@/components/ui/icons';
import ScheduleMatchModal from '@/components/admin/ScheduleMatchModal';
import { categoryDisplayName, matchFormatKey, MatchFormatKey } from '@club-portal/shared';
import MatchFormatFilter from '@/components/admin/MatchFormatFilter';
import EditMatchModal from '@/components/admin/EditMatchModal';
import DeclareWinnerModal, { participantName } from '@/components/admin/DeclareWinnerModal';

export default function MatchesPage() {
  const [mounted, setMounted] = useState(false);
  const [matches, setMatches] = useState<any[]>([]);
  const [sports, setSports] = useState<any[]>([]);
  const [clubs, setClubs] = useState<any[]>([]);
  const [cricketTeams, setCricketTeams] = useState<any[]>([]);
  const [bgmiTeams, setBgmiTeams] = useState<any[]>([]);
  const [referees, setReferees] = useState<any[]>([]);
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedSport, setSelectedSport] = useState('');
  const [formatFilter, setFormatFilter] = useState<MatchFormatKey | ''>('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'SUBMITTED' | 'SCHEDULED' | 'COMPLETED'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedSport, formatFilter, activeTab, pageSize]);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<any | null>(null);
  const [reviewResult, setReviewResult] = useState<any | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectBox, setShowRejectBox] = useState(false);
  const [approving, setApproving] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [editMatch, setEditMatch] = useState<any | null>(null);
  const [winTarget, setWinTarget] = useState<{ match: any; participant: any } | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  usePreventScroll(isCreateModalOpen || isReviewModalOpen || !!editMatch || !!winTarget);

  useEffect(() => {
    setMounted(true);
    fetchData();
  }, []); // everything is loaded once; the sport tabs filter locally

  const fetchData = async () => {
    setLoading(true);
    try {
      const [matchesRes, sportsRes, clubsRes, crickRes, refRes, playersRes, bgmiRes] = await Promise.all([
        fetch('/api/matches'),
        fetch('/api/sports'),
        fetch('/api/clubs'),
        fetch('/api/cricket-teams'),
        fetch('/api/referees'),
        fetch('/api/players'),
        fetch('/api/bgmi-teams'),
      ]);

      const matchesData = await matchesRes.json();
      const sportsData = await sportsRes.json();
      const clubsData = await clubsRes.json();
      const crickData = await crickRes.json();
      const refData = await refRes.json();
      const playersData = await playersRes.json();
      const bgmiData = await bgmiRes.json();

      setMatches(Array.isArray(matchesData) ? matchesData : []);
      setSports(Array.isArray(sportsData) ? sportsData : []);
      setClubs(Array.isArray(clubsData) ? clubsData : []);
      setCricketTeams(Array.isArray(crickData) ? crickData : []);
      setReferees(Array.isArray(refData) ? refData : []);
      setPlayers(Array.isArray(playersData) ? playersData : []);
      setBgmiTeams(Array.isArray(bgmiData) ? bgmiData : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getPlayer = (id: string) => players.find((p) => p.id === id);
  const getClub = (id: string) => clubs.find((c) => c.id === id);
  const getCricketTeam = (id: string) => cricketTeams.find((ct) => ct.id === id);

  const handleOpenCreate = () => {
    setSuccess(null);
    setIsCreateModalOpen(true);
  };

  const handleOpenReview = async (match: any) => {
    setSelectedMatch(match);
    const pendingResult = match.results?.find((r: any) => r.status === 'PENDING_APPROVAL') || match.results?.[0];
    setReviewResult(pendingResult);
    setShowRejectBox(false);
    setRejectionReason('');
    setIsReviewModalOpen(true);

    try {
      const res = await fetch(`/api/matches/${match.id}`);
      if (res.ok) {
        const fullMatch = await res.json();
        setSelectedMatch(fullMatch);
        const fullPending = fullMatch.results?.find((r: any) => r.status === 'PENDING_APPROVAL') || fullMatch.results?.[0];
        setReviewResult(fullPending);
      }
    } catch (e) {
      console.error('Failed to load full match details:', e);
    }

    const spId = match.starPlayerId || pendingResult?.starPlayerId;
    if (spId && !match.starPlayer) {
      try {
        const res = await fetch(`/api/players/${spId}`);
        if (res.ok) {
          const spData = await res.json();
          setSelectedMatch((prev: any) => ({ ...prev, starPlayer: spData }));
        }
      } catch (e) {
        console.error('Failed to load star player details:', e);
      }
    }
  };

  const handleApproveResult = async () => {
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

      setSuccess(`Match ${selectedMatch.matchCode} approved! Points distributed to houses.`);
      setIsReviewModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setApproving(false);
    }
  };

  const handleRejectResult = async () => {
    if (!selectedMatch || !rejectionReason.trim()) {
      alert('Please specify a rejection reason for the referee');
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

      setSuccess(`Result for ${selectedMatch.matchCode} rejected and returned to referee.`);
      setIsReviewModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setApproving(false);
    }
  };

  const handleUndoResult = async (match: any) => {
    if (!confirm(`Undo the result of ${match.matchCode}?

The awarded points will be removed from the clubs and the match returns to Scheduled.`)) return;
    try {
      const res = await fetch(`/api/matches/${match.id}/declare-winner`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess(data.message);
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteMatch = async (id: string, code: string, status?: string) => {
    const warning =
      status === 'COMPLETED'
        ? `

This match has awarded points. They will be removed from the clubs and the leaderboard will be updated.`
        : status === 'SUBMITTED'
        ? `

A referee result is awaiting approval and will be discarded.`
        : '';
    if (!confirm(`Delete match ${code}? This cannot be undone.${warning}`)) return;

    try {
      const res = await fetch(`/api/matches/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSuccess(data.message || `Fixture ${code} deleted.`);
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filteredMatches = matches.filter((m) => {
    // Sport filter (instant, no reload)
    if (selectedSport && m.sportId !== selectedSport) return false;
    // Format filter: Singles / Men's Doubles / Women's Doubles / Mixed Doubles
    if (formatFilter && matchFormatKey(m.matchCategory) !== formatFilter) return false;

    // Tab filter
    if (activeTab === 'SUBMITTED' && m.status !== 'SUBMITTED') return false;
    if (activeTab === 'SCHEDULED' && m.status !== 'SCHEDULED' && m.status !== 'IN_PROGRESS') return false;
    if (activeTab === 'COMPLETED' && m.status !== 'COMPLETED') return false;

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      const code = m.matchCode?.toLowerCase() || '';
      const sName = m.sport?.name?.toLowerCase() || '';
      const pStr = (m.participants || [])
        .map((p: any) => `${p.teamName} ${p.club?.name} ${p.cricketTeam?.name}`)
        .join(' ')
        .toLowerCase();

      if (!code.includes(q) && !sName.includes(q) && !pStr.includes(q)) {
        return false;
      }
    }

    return true;
  });

  // Pagination calculations
  const totalMatches = filteredMatches.length;
  const totalPages = Math.max(1, Math.ceil(totalMatches / pageSize));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalMatches);
  const paginatedMatches = filteredMatches.slice(startIndex, endIndex);

  const getPageNumbers = (current: number, total: number): (number | string)[] => {
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    if (current <= 4) {
      return [1, 2, 3, 4, 5, '...', total];
    }
    if (current >= total - 3) {
      return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
    }
    return [1, '...', current - 1, current, current + 1, '...', total];
  };

  // matches narrowed by the sport tab only (used for the format tab counts)
  const sportMatches = matches.filter((m) => !selectedSport || m.sportId === selectedSport);

  const pendingCount = matches.filter((m) => m.status === 'SUBMITTED').length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Alerts */}
        {success && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center justify-between">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              {success}
            </span>
            <button onClick={() => setSuccess(null)} className="text-slate-400 hover:text-slate-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold tracking-tight text-navy-950">Competition Management</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                House Championship 2026
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Schedule competitions, assign certified referees, and verify incoming points distributions across the 6 sports.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={fetchData}
              disabled={loading}
              className="p-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg transition disabled:opacity-60"
              title="Reload fixtures"
              aria-label="Reload fixtures"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-navy-950 hover:bg-navy-900 text-white text-xs font-extrabold rounded-xl shadow-sm transition"
            >
              <Plus className="w-3.5 h-3.5" />
              Schedule New Match
            </button>
          </div>
        </div>

        {/* Tab & Filter Bar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
            {/* Search */}
            <div className="relative flex-1 w-full md:max-w-xs">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search match code, house, sport..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white text-xs"
              />
            </div>

            {/* Status Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('ALL')}
                className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap ${
                  activeTab === 'ALL'
                    ? 'bg-navy-900 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All ({matches.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('SUBMITTED')}
                className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'SUBMITTED'
                    ? 'bg-amber-600 text-white shadow-2xs'
                    : pendingCount > 0
                    ? 'bg-amber-50 text-amber-700 border border-amber-300 font-extrabold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>Awaiting Approval</span>
                {pendingCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] flex items-center justify-center font-black">
                    {pendingCount}
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('SCHEDULED')}
                className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap ${
                  activeTab === 'SCHEDULED'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Upcoming
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('COMPLETED')}
                className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap ${
                  activeTab === 'COMPLETED'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Approved & Completed
              </button>
            </div>
          </div>

          {/* 6 Sports Pills */}
          <div className="flex flex-wrap items-center gap-1.5 pt-3 border-t border-slate-100 text-xs">
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mr-1 shrink-0">Sport:</span>
            <button
              onClick={() => {
                setSelectedSport('');
                setFormatFilter('');
              }}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition shrink-0 ${
                selectedSport === ''
                  ? 'bg-navy-950 text-white shadow-2xs'
                  : 'text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200/60'
              }`}
            >
              All Sports
            </button>
            {sports.map((sp) => (
              <button
                key={sp.id}
                onClick={() => {
                  setSelectedSport(sp.id);
                  setFormatFilter('');
                }}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition shrink-0 flex items-center gap-1.5 ${
                  selectedSport === sp.id
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200/60'
                }`}
              >
                <SportIcon name={sp.name} className="w-3 h-3" />
                <span>{sp.name}</span>
              </button>
            ))}
          </div>

          {/* Format tabs (Singles / Doubles / Mixed) for sports that have these formats */}
          {sportMatches.some((m) => matchFormatKey(m.matchCategory)) && (
            <MatchFormatFilter value={formatFilter} onChange={setFormatFilter} matches={sportMatches} />
          )}
        </div>

        {/* Matches Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMatches.length === 0 ? (
            <div className="col-span-2 bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-xs">
              <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="font-semibold text-slate-600">No competition fixtures found.</p>
              <p className="mt-1">Try resetting the filter or schedule a new match above.</p>
            </div>
          ) : (
            paginatedMatches.map((match) => {
              const participants = match.participants || [];
              const isSubmitted = match.status === 'SUBMITTED';
              const isCompleted = match.status === 'COMPLETED';
              const isScheduled = match.status === 'SCHEDULED' || match.status === 'IN_PROGRESS';

              return (
                <div
                  key={match.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 hover:shadow-sm transition"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-navy-950 text-white">
                          {match.matchCode}
                        </span>
                        <span className="text-xs font-bold text-slate-900 flex items-center gap-1">
                          <SportIcon name={match.sport?.name} className="w-3.5 h-3.5 text-blue-600" />
                          <span>{match.sport?.name}</span>
                        </span>
                        {match.matchCategory && match.matchCategory !== 'Singles' && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200">
                            {categoryDisplayName(match.matchCategory)}
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400 font-medium">• {match.round}</span>
                      </div>

                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          isCompleted
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : isSubmitted
                            ? 'bg-amber-100 text-amber-800 border border-amber-300 animate-pulse'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}
                      >
                        {isCompleted
                          ? 'Approved'
                          : isSubmitted
                          ? 'Awaiting Approval'
                          : 'Scheduled'}
                      </span>
                    </div>

                    {/* Participating Entries */}
                    <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-200/80 my-3 space-y-2">
                      {participants.map((p: any, idx: number) => {
                        const players = p.players || [];
                        const uniqueClubs = new Set<string>();
                        if (p.club?.name) uniqueClubs.add(p.club.name);
                        players.forEach((mpp: any) => {
                          if (mpp.club?.name) uniqueClubs.add(mpp.club.name);
                        });

                        return (
                          <div
                            key={p.id || idx}
                            className="bg-white p-2.5 rounded-lg border border-slate-200/80 flex items-center justify-between gap-3 shadow-2xs"
                          >
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              {p.club ? (
                                <div className="w-7 h-7 rounded bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                                  <ClubBadge code={p.club.code} name={p.club.name} className="w-4 h-4" />
                                </div>
                              ) : (
                                <div className="w-7 h-7 rounded bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center shrink-0 font-bold text-xs">
                                  #{idx + 1}
                                </div>
                              )}
                              <div className="min-w-0 flex-1">
                                <span className="font-bold text-xs text-slate-900 block truncate">
                                  {p.cricketTeam?.name || p.player?.name || p.teamName || p.club?.name || `Entry ${idx + 1}`}
                                </span>
                                {p.cricketTeam ? (
                                  <span className="text-[10px] text-blue-600 font-semibold block">
                                    Parent House: {p.club?.name} ({p.club?.code})
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-slate-500 block font-medium">
                                    {players.length > 0
                                      ? `${players.length} athlete${players.length > 1 ? 's' : ''} (${uniqueClubs.size} unique house${uniqueClubs.size > 1 ? 's' : ''})`
                                      : p.player?.club?.name
                                      ? `House: ${p.player.club.name} (${p.player.club.code})`
                                      : p.club?.name
                                      ? `House: ${p.club.name} (${p.club.code})`
                                      : 'Participant'}
                                  </span>
                                )}
                                {players.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {players.map((mpp: any, pIdx: number) => (
                                      <span
                                        key={mpp.id || pIdx}
                                        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-semibold bg-slate-100 text-slate-700 border border-slate-200"
                                      >
                                        <ClubBadge code={mpp.club?.code} name={mpp.club?.name} className="w-2.5 h-2.5" />
                                        <span className="truncate max-w-[90px]">{mpp.player?.name || 'Athlete'}</span>
                                        <span className="text-[8px] font-bold text-slate-500">({mpp.club?.code})</span>
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="text-right shrink-0" style={{ flexShrink: 0, minWidth: 'max-content' }}>
                              {isScheduled ? (
                                <button
                                  onClick={() => setWinTarget({ match, participant: p })}
                                  title={`Declare ${participantName(p, idx)} the winner`}
                                  style={{ whiteSpace: 'nowrap', display: 'inline-flex', flexShrink: 0 }}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-[11px] font-extrabold transition whitespace-nowrap"
                                >
                                  <Trophy className="w-3.5 h-3.5 shrink-0" />
                                  Win
                                </button>
                              ) : p.isWinner ? (
                                <span
                                  style={{ whiteSpace: 'nowrap', display: 'inline-flex', flexShrink: 0 }}
                                  className="inline-flex items-center gap-1 font-mono font-extrabold text-xs text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 whitespace-nowrap shrink-0"
                                >
                                  <Trophy className="w-3 h-3 shrink-0" />
                                  {p.score}&nbsp;pts
                                </span>
                              ) : p.score !== null && p.score !== undefined ? (
                                <span
                                  style={{ whiteSpace: 'nowrap', display: 'inline-flex', flexShrink: 0 }}
                                  className="inline-flex items-center font-mono font-extrabold text-xs text-navy-950 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 whitespace-nowrap shrink-0"
                                >
                                  {p.score}&nbsp;pts
                                </span>
                              ) : (
                                <span style={{ whiteSpace: 'nowrap' }} className="text-[10px] text-slate-400 font-medium whitespace-nowrap">Pending Entry</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Star Player Badge */}
                    {(match.starPlayer || match.starPlayerId) && (
                      <div className="mb-2.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-50 to-amber-100/50 border border-amber-200/80 flex items-center justify-between text-xs">
                        <span className="font-extrabold text-amber-950 flex items-center gap-1.5 text-[11px]">
                          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500 shrink-0" />
                          <span>Star Player: {match.starPlayer?.name || 'Nominated Athlete'}</span>
                          {match.starPlayer?.club && (
                            <span className="text-[10px] text-amber-800 font-semibold">
                              ({match.starPlayer.club.name})
                            </span>
                          )}
                        </span>
                        <span className="font-mono font-black text-amber-900 bg-white/80 px-2 py-0.5 rounded text-[11px] border border-amber-200 shrink-0">
                          {match.starPlayerPoints || 0} pts
                        </span>
                      </div>
                    )}

                    <div className="text-xs text-slate-500 flex items-center justify-between pt-1">
                      <span className="flex items-center gap-1 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{match.matchDate} at {match.matchTime}</span>
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3.5 mt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {isScheduled && (
                        <button
                          onClick={() => setEditMatch(match)}
                          className="text-slate-400 hover:text-amber-600 p-1 rounded transition"
                          title="Edit match details"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteMatch(match.id, match.matchCode, match.status)}
                        className="text-slate-400 hover:text-red-600 p-1 rounded transition"
                        title="Delete match"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      {isSubmitted ? (
                        <button
                          onClick={() => handleOpenReview(match)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg bg-amber-500 hover:bg-amber-400 text-navy-950 shadow-xs transition"
                        >
                          <FileCheck2 className="w-3.5 h-3.5" />
                          Review & Approve Result
                        </button>
                      ) : isCompleted ? (
                        <>
                        <button
                          onClick={() => handleOpenReview(match)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-500" />
                          View Approved Points
                        </button>
                        <button
                          onClick={() => handleUndoResult(match)}
                          title="Undo result and remove the awarded points"
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold rounded-lg border border-red-200 text-red-700 hover:bg-red-50 transition"
                        >
                          Undo result
                        </button>
                        </>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-medium">
                          Assigned to {match.referees?.[0]?.referee?.name || 'Official'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination Bar */}
        {totalMatches > 0 && (
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="font-medium text-slate-500">
                Showing <strong className="text-navy-950 font-bold">{startIndex + 1}</strong>–
                <strong className="text-navy-950 font-bold">{endIndex}</strong> of{' '}
                <strong className="text-navy-950 font-bold">{totalMatches}</strong> fixtures
              </span>

              <div className="flex items-center gap-1.5 pl-3 border-l border-slate-200">
                <span className="text-[11px] text-slate-400 font-medium">Per page:</span>
                {[6, 10, 20].map((size) => (
                  <button
                    key={size}
                    onClick={() => setPageSize(size)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition cursor-pointer ${
                      pageSize === size
                        ? 'bg-navy-950 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition flex items-center gap-1 font-semibold cursor-pointer"
                  title="Previous page"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Prev</span>
                </button>

                <div className="flex items-center gap-1 px-1">
                  {getPageNumbers(safePage, totalPages).map((p, idx) =>
                    typeof p === 'number' ? (
                      <button
                        key={idx}
                        onClick={() => setCurrentPage(p)}
                        className={`w-7 h-7 rounded-lg text-xs font-bold transition flex items-center justify-center cursor-pointer ${
                          safePage === p
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'text-slate-600 hover:bg-slate-100 border border-slate-200/60'
                        }`}
                      >
                        {p}
                      </button>
                    ) : (
                      <span key={idx} className="px-1 text-slate-400 text-xs">
                        ...
                      </span>
                    )
                  )}
                </div>

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage === totalPages}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition flex items-center gap-1 font-semibold cursor-pointer"
                  title="Next page"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <EditMatchModal
        match={editMatch}
        referees={referees}
        onClose={() => setEditMatch(null)}
        onSaved={(message) => {
          setSuccess(message);
          fetchData();
        }}
      />

      <DeclareWinnerModal
        match={winTarget?.match || null}
        participant={winTarget?.participant || null}
        onClose={() => setWinTarget(null)}
        onDone={(message) => {
          setSuccess(message);
          fetchData();
        }}
      />

      <ScheduleMatchModal
        open={mounted && isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onScheduled={(m) => {
          setSuccess(`Fixture ${m.matchCode} scheduled successfully!`);
          fetchData();
        }}
        sports={sports}
        clubs={clubs}
        cricketTeams={cricketTeams}
        bgmiTeams={bgmiTeams}
        onTeamCreated={(t) => setBgmiTeams((prev) => [...prev.filter((x) => x.id !== t.id), t])}
        referees={referees}
        players={players}
      />

      {/* Modal: Result Review & Approval Workflow (Section 6 Compliant) */}
      {mounted && isReviewModalOpen && selectedMatch && createPortal(
        <div
          className="fixed inset-0 !m-0 z-[9999] bg-navy-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto overscroll-none touch-none"
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
              {/* Referee & Submission Info Header */}
              {selectedMatch.results && selectedMatch.results.length > 0 && (
                <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-blue-600" />
                    <div>
                      <span className="font-bold text-slate-800">
                        Submitted by Referee {selectedMatch.results[0]?.referee?.name || 'Assigned Official'}
                      </span>
                      {selectedMatch.results[0]?.referee?.refereeCode && (
                        <span className="text-[10px] text-slate-400 block">
                          Official Code: {selectedMatch.results[0]?.referee?.refereeCode}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {new Date(selectedMatch.results[0]?.createdAt).toLocaleString()}
                  </span>
                </div>
              )}

              {/* Star Player Nomination Card (Section 4 Compliant) */}
              {(selectedMatch.starPlayer || reviewResult?.starPlayerId || selectedMatch.starPlayerId) && (
                <div className="bg-gradient-to-r from-navy-950 via-[#141822] to-navy-950 text-white p-4 rounded-xl border border-amber-500/50 shadow-md space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-black text-amber-300 block tracking-wider">
                          Nominated Star Player of the Match
                        </span>
                        <span className="font-extrabold text-sm text-white">
                          {selectedMatch.starPlayer?.name || 'Nominated Athlete'}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Individual Points</span>
                      <span className="font-mono font-black text-amber-300 text-base">
                        {reviewResult?.starPlayerPoints ?? selectedMatch.starPlayerPoints ?? 0} pts
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-300">
                    <span>
                      Representing House: <strong className="text-white">{selectedMatch.starPlayer?.club?.name || 'Participating House'}</strong>
                    </span>
                    <span className="text-[10px] text-amber-300 font-semibold flex items-center gap-1">
                      <Shield className="w-3 h-3 text-amber-400" />
                      <span>Separate Points System (Never added to House Points)</span>
                    </span>
                  </div>
                </div>
              )}

              {/* Participating Entries & Scores Submitted */}
              <div className="space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Participating Squads & Automatic Unique-Club Points Distribution:
                </span>

                {selectedMatch.participants?.map((p: any) => {
                  const dist = (selectedMatch.distributions || []).find((d: any) => d.participantId === p.id);
                  return (
                    <div key={p.id} className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-extrabold text-sm text-navy-950 block">
                            {p.cricketTeam?.name || p.teamName || p.club?.name}
                          </span>
                          {p.players && p.players.length > 0 && (
                            <span className="text-[11px] text-slate-500">
                              {p.players.length} players • {dist?.uniqueClubCount || 1} unique house{(dist?.uniqueClubCount || 1) === 1 ? '' : 's'}
                            </span>
                          )}
                        </div>
                        <div className="text-right shrink-0" style={{ flexShrink: 0, minWidth: 'max-content' }}>
                          <span style={{ whiteSpace: 'nowrap', display: 'inline-flex' }} className="font-mono font-black text-blue-700 text-base whitespace-nowrap shrink-0">
                            {p.score ?? 0}&nbsp;pts
                          </span>
                          {p.rank && (
                            <span className="text-[10px] text-slate-400 block font-bold">
                              Rank #{p.rank} {p.isWinner ? '🏆 Winner' : ''}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Player Affiliations List if Multi-Player */}
                      {p.players && p.players.length > 0 && (
                        <div className="grid grid-cols-2 gap-1.5 pt-1">
                          {p.players.map((mpp: any) => (
                            <div key={mpp.id} className="bg-white px-2 py-1 rounded border border-slate-200 flex items-center justify-between text-[11px]">
                              <span className="text-slate-800 font-medium truncate mr-1">{mpp.player?.name}</span>
                              <span className="text-[10px] font-bold text-blue-700">{mpp.club?.name}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Distribution Breakdown Table */}
                      {dist && dist.allocations && dist.allocations.length > 0 && (
                        <div className="bg-white rounded-lg border border-slate-200 p-2.5 mt-2 space-y-1.5">
                          <div className="flex items-center justify-between text-[11px] text-slate-600 font-semibold border-b border-slate-100 pb-1">
                            <span>Points Distribution Formula:</span>
                            <span className="font-mono text-blue-700 font-bold">
                              {dist.calculationNote || `${p.score} pts split equally between the players, credited to their clubs`}
                            </span>
                          </div>
                          <div className="space-y-1">
                            {dist.allocations.map((alloc: any) => (
                              <div key={alloc.id || alloc.clubId} className="flex items-center justify-between text-[11px]">
                                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                  {alloc.club?.name || 'Club'}
                                  {alloc.playersContributed && (
                                    <span className="text-[10px] text-slate-400 font-normal">
                                      ({alloc.playersContributed} player{alloc.playersContributed === 1 ? '' : 's'})
                                    </span>
                                  )}
                                </span>
                                <span className="font-mono font-extrabold text-navy-950 flex items-center gap-1">
                                  {parseFloat(alloc.points).toFixed(2)} pts
                                  {alloc.isRemainderWinner && (
                                    <span className="text-[9px] bg-amber-100 text-amber-800 px-1 rounded font-bold" title="Received fair remainder rounding cent">
                                      +0.01 rot
                                    </span>
                                  )}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Individual Award Allocations (PDF Rules) */}
              {selectedMatch.awardAllocations && selectedMatch.awardAllocations.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block">
                    Individual Award Allocations (Credited directly to House):
                  </span>
                  <div className="space-y-1.5">
                    {selectedMatch.awardAllocations.map((aw: any) => (
                      <div
                        key={aw.id}
                        className="p-2.5 bg-amber-50/60 rounded-xl border border-amber-200/80 flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-extrabold text-navy-950 block">{aw.awardTitle}</span>
                          <span className="text-[11px] text-slate-600">
                            {aw.playerName} • <strong className="text-navy-900">House {aw.clubName || aw.club?.name}</strong>
                          </span>
                        </div>
                        <span className="font-mono text-xs font-black text-amber-900 bg-amber-100 px-2 py-0.5 rounded-lg">
                          +{aw.points} pts
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {reviewResult?.refereeNotes && (
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-slate-600 text-[11px]">
                  <strong>Referee Note:</strong> &quot;{reviewResult.refereeNotes}&quot;
                </div>
              )}

              {showRejectBox && (
                <div className="space-y-1.5 animate-in fade-in">
                  <label className="block font-bold text-red-700">Rejection Reason *</label>
                  <textarea
                    rows={2}
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="State reason for rejecting result..."
                    className="w-full px-3 py-2 border border-red-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-red-500 bg-red-50/20"
                  />
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                {selectedMatch.status === 'SUBMITTED' && (
                  !showRejectBox ? (
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
                      onClick={handleRejectResult}
                      disabled={approving}
                      className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition"
                    >
                      Confirm Rejection
                    </button>
                  )
                )}

                <div className="flex items-center gap-2 ml-auto">
                  <button
                    type="button"
                    onClick={() => setIsReviewModalOpen(false)}
                    className="px-3.5 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 font-bold"
                  >
                    Close
                  </button>
                  {selectedMatch.status === 'SUBMITTED' && (
                    <button
                      type="button"
                      onClick={handleApproveResult}
                      disabled={approving}
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-lg transition shadow-sm flex items-center gap-1.5"
                    >
                      <Check className="w-4 h-4" />
                      {approving ? 'Crediting Points...' : 'Approve & Credit to Houses'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </AdminLayout>
  );
}
