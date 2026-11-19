'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
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
  MapPin,
  Sparkles,
  FileCheck2,
  Send,
  HelpCircle,
  Users,
  Star,
} from 'lucide-react';
import { ClubBadge, SportIcon } from '@/components/ui/icons';

export default function MatchesPage() {
  const [matches, setMatches] = useState<any[]>([]);
  const [sports, setSports] = useState<any[]>([]);
  const [clubs, setClubs] = useState<any[]>([]);
  const [cricketTeams, setCricketTeams] = useState<any[]>([]);
  const [venues, setVenues] = useState<any[]>([]);
  const [referees, setReferees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedSport, setSelectedSport] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'SUBMITTED' | 'SCHEDULED' | 'COMPLETED'>('ALL');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<any | null>(null);
  const [reviewResult, setReviewResult] = useState<any | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectBox, setShowRejectBox] = useState(false);
  const [approving, setApproving] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // New Match Form State
  const [formData, setFormData] = useState({
    sportId: '',
    matchCategory: 'Singles',
    round: 'Final Stage',
    stageName: 'Grand Finals',
    matchDate: '2026-11-26',
    matchTime: '15:00',
    venueId: '',
    notes: '',
    participantType: 'CLUB', // 'CLUB' | 'CRICKET_TEAM'
    entry1ClubId: '',
    entry2ClubId: '',
    entry1CricketTeamId: '',
    entry2CricketTeamId: '',
    refereeId: '',
  });

  useEffect(() => {
    fetchData();
  }, [selectedSport]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedSport) params.append('sportId', selectedSport);

      const [matchesRes, sportsRes, clubsRes, crickRes, venuesRes, refRes] = await Promise.all([
        fetch(`/api/matches?${params.toString()}`),
        fetch('/api/sports'),
        fetch('/api/clubs'),
        fetch('/api/cricket-teams'),
        fetch('/api/venues'),
        fetch('/api/referees'),
      ]);

      const matchesData = await matchesRes.json();
      const sportsData = await sportsRes.json();
      const clubsData = await clubsRes.json();
      const crickData = await crickRes.json();
      const venuesData = await venuesRes.json();
      const refData = await refRes.json();

      setMatches(Array.isArray(matchesData) ? matchesData : []);
      setSports(Array.isArray(sportsData) ? sportsData : []);
      setClubs(Array.isArray(clubsData) ? clubsData : []);
      setCricketTeams(Array.isArray(crickData) ? crickData : []);
      setVenues(Array.isArray(venuesData) ? venuesData : []);
      setReferees(Array.isArray(refData) ? refData : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    const defaultSport = sports[0]?.id || '';
    const isCricket = sports[0]?.name === 'Cricket';
    setFormData({
      sportId: defaultSport,
      matchCategory: 'Singles',
      round: 'Grand Finals',
      stageName: 'Championship Round',
      matchDate: '2026-11-26',
      matchTime: '14:00',
      venueId: venues[0]?.id || '',
      notes: '',
      participantType: isCricket ? 'CRICKET_TEAM' : 'CLUB',
      entry1ClubId: clubs[0]?.id || '',
      entry2ClubId: clubs[1]?.id || '',
      entry1CricketTeamId: cricketTeams[0]?.id || '',
      entry2CricketTeamId: cricketTeams[1]?.id || '',
      refereeId: referees[0]?.id || '',
    });
    setError(null);
    setIsCreateModalOpen(true);
  };

  const handleSportSelectInForm = (compoundValue: string) => {
    const [sportId, category] = compoundValue.includes('__')
      ? compoundValue.split('__')
      : [compoundValue, 'Singles'];

    const sp = sports.find((s) => s.id === sportId);
    const isCricket = sp?.name === 'Cricket';
    const isDoublesOrMixed = category === 'Doubles' || category === 'Mixed Doubles';

    setFormData((prev) => ({
      ...prev,
      sportId,
      matchCategory: category,
      participantType: isCricket ? 'CRICKET_TEAM' : 'CLUB',
      round: isDoublesOrMixed ? `${category} Finals` : (prev.round || 'Grand Finals'),
      stageName: isDoublesOrMixed ? `${category} Stage` : (prev.stageName || 'Championship Round'),
    }));
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const isCricket = formData.participantType === 'CRICKET_TEAM';

    if (isCricket) {
      if (formData.entry1CricketTeamId === formData.entry2CricketTeamId) {
        setError('Please select two distinct house teams');
        return;
      }
    } else {
      if (formData.entry1ClubId === formData.entry2ClubId) {
        setError('Please select two distinct houses');
        return;
      }
    }

    const participants = isCricket
      ? [
          { cricketTeamId: formData.entry1CricketTeamId, clubId: cricketTeams.find((ct) => ct.id === formData.entry1CricketTeamId)?.clubId },
          { cricketTeamId: formData.entry2CricketTeamId, clubId: cricketTeams.find((ct) => ct.id === formData.entry2CricketTeamId)?.clubId },
        ]
      : [
          { clubId: formData.entry1ClubId },
          { clubId: formData.entry2ClubId },
        ];

    const payload = {
      sportId: formData.sportId,
      matchCategory: formData.matchCategory || 'Singles',
      round: formData.round,
      stageName: formData.stageName,
      matchDate: formData.matchDate,
      matchTime: formData.matchTime,
      venueId: formData.venueId || null,
      notes: formData.notes,
      participants,
      refereeIds: formData.refereeId ? [formData.refereeId] : [],
    };

    try {
      const res = await fetch('/api/matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create fixture');

      setSuccess(`Fixture ${data.matchCode} scheduled successfully!`);
      setIsCreateModalOpen(false);
      fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleOpenReview = async (match: any) => {
    setSelectedMatch(match);
    const pendingResult = match.results?.find((r: any) => r.status === 'PENDING_APPROVAL') || match.results?.[0];
    setReviewResult(pendingResult);
    setShowRejectBox(false);
    setRejectionReason('');
    setIsReviewModalOpen(true);

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

  const handleDeleteMatch = async (id: string, code: string) => {
    if (!confirm(`Are you sure you want to cancel and delete match fixture ${code}?`)) return;

    try {
      const res = await fetch(`/api/matches/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSuccess(`Fixture ${code} deleted.`);
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filteredMatches = matches.filter((m) => {
    // Tab filter
    if (activeTab === 'SUBMITTED' && m.status !== 'SUBMITTED') return false;
    if (activeTab === 'SCHEDULED' && m.status !== 'SCHEDULED' && m.status !== 'IN_PROGRESS') return false;
    if (activeTab === 'COMPLETED' && m.status !== 'COMPLETED') return false;

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      const code = m.matchCode?.toLowerCase() || '';
      const sName = m.sport?.name?.toLowerCase() || '';
      const vName = m.venue?.name?.toLowerCase() || '';
      const pStr = (m.participants || [])
        .map((p: any) => `${p.teamName} ${p.club?.name} ${p.cricketTeam?.name}`)
        .join(' ')
        .toLowerCase();

      if (!code.includes(q) && !sName.includes(q) && !vName.includes(q) && !pStr.includes(q)) {
        return false;
      }
    }

    return true;
  });

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
              className="p-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg transition"
              title="Refresh Fixtures"
            >
              <Check className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
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
                placeholder="Search match code, house, venue..."
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
              onClick={() => setSelectedSport('')}
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
                onClick={() => setSelectedSport(sp.id)}
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
            filteredMatches.map((match) => {
              const participants = match.participants || [];
              const isSubmitted = match.status === 'SUBMITTED';
              const isCompleted = match.status === 'COMPLETED';

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
                            {match.matchCategory}
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
                            className="bg-white p-2.5 rounded-lg border border-slate-200/80 flex items-center justify-between gap-2 shadow-2xs"
                          >
                            <div className="flex items-center gap-2">
                              {p.club ? (
                                <div className="w-7 h-7 rounded bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                                  <ClubBadge code={p.club.code} name={p.club.name} className="w-4 h-4" />
                                </div>
                              ) : (
                                <div className="w-7 h-7 rounded bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center shrink-0 font-bold text-xs">
                                  #{idx + 1}
                                </div>
                              )}
                              <div>
                                <span className="font-bold text-xs text-slate-900 block truncate max-w-[170px]">
                                  {p.cricketTeam?.name || p.teamName || p.club?.name || `Entry ${idx + 1}`}
                                </span>
                                {p.cricketTeam ? (
                                  <span className="text-[10px] text-blue-600 font-semibold block">
                                    Parent House: {p.club?.name}
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-slate-400 block">
                                    {players.length > 0 ? `${players.length} players (${uniqueClubs.size} unique houses)` : p.club?.code || 'Participant'}
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
                      <span className="flex items-center gap-1 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{match.venue?.name || 'Grand Arena'}</span>
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3.5 mt-3 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => handleDeleteMatch(match.id, match.matchCode)}
                      className="text-slate-400 hover:text-red-600 p-1 rounded transition"
                      title="Cancel / Delete Fixture"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

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
                        <button
                          onClick={() => handleOpenReview(match)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-500" />
                          View Approved Points
                        </button>
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
      </div>

      {/* Modal: Schedule New Match */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-navy-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in duration-200">
            <div className="p-5 bg-navy-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm">Schedule Competition Fixture</h3>
                <span className="text-xs text-blue-300">ApexArena House Championship 2026</span>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4 text-xs">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Sport Picker */}
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Championship Sport & Category *
                </label>
                <select
                  required
                  value={`${formData.sportId}__${formData.matchCategory || 'Singles'}`}
                  onChange={(e) => handleSportSelectInForm(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-blue-600"
                >
                  {sports.flatMap((s) => {
                    if (s.name === 'Badminton' || s.name === 'Carrom') {
                      return [
                        <option key={`${s.id}__Singles`} value={`${s.id}__Singles`}>
                          {s.name} - Singles ({s.category} • INDIVIDUAL)
                        </option>,
                        <option key={`${s.id}__Doubles`} value={`${s.id}__Doubles`}>
                          {s.name} - Doubles ({s.category} • DOUBLES)
                        </option>,
                        <option key={`${s.id}__Mixed Doubles`} value={`${s.id}__Mixed Doubles`}>
                          {s.name} - Mixed Doubles ({s.category} • MIXED DOUBLES)
                        </option>,
                      ];
                    }
                    return (
                      <option key={`${s.id}__Singles`} value={`${s.id}__Singles`}>
                        {s.name} ({s.category} • {s.sportType})
                      </option>
                    );
                  })}
                </select>

                {/* Quick Category Buttons for Badminton & Carrom */}
                {sports.find((s) => s.id === formData.sportId)?.name &&
                  (sports.find((s) => s.id === formData.sportId)?.name === 'Badminton' ||
                    sports.find((s) => s.id === formData.sportId)?.name === 'Carrom') && (
                    <div className="mt-2.5 p-2.5 bg-blue-50/70 border border-blue-200/80 rounded-xl space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-blue-950 uppercase tracking-wider">
                          {sports.find((s) => s.id === formData.sportId)?.name} Category:
                        </span>
                        <span className="text-[10px] font-semibold text-blue-700">
                          Selected: {formData.matchCategory || 'Singles'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {(['Singles', 'Doubles', 'Mixed Doubles'] as const).map((cat) => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => {
                              setFormData((prev) => ({
                                ...prev,
                                matchCategory: cat,
                                round: cat !== 'Singles' ? `${cat} Championship` : 'Grand Finals',
                                stageName: cat !== 'Singles' ? `${cat} Stage` : 'Championship Round',
                              }));
                            }}
                            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                              formData.matchCategory === cat
                                ? 'bg-blue-600 text-white shadow-xs'
                                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                            }`}
                          >
                            {cat === 'Singles' && '👤'}
                            {cat === 'Doubles' && '👥'}
                            {cat === 'Mixed Doubles' && '👫'}
                            <span>{cat}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
              </div>

              {/* Participants Selection: House Teams or Houses */}
              {formData.participantType === 'CRICKET_TEAM' ? (
                <div className="p-3.5 bg-blue-50/70 rounded-xl border border-blue-200 space-y-3">
                  <span className="text-[11px] font-bold text-blue-950 uppercase tracking-wider block">
                    Select 2 House Teams (from the 10 House Teams):
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">House Team 1</label>
                      <select
                        value={formData.entry1CricketTeamId}
                        onChange={(e) => setFormData({ ...formData, entry1CricketTeamId: e.target.value })}
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white font-semibold"
                      >
                        {cricketTeams.map((ct) => (
                          <option key={ct.id} value={ct.id}>
                            {ct.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">House Team 2</label>
                      <select
                        value={formData.entry2CricketTeamId}
                        onChange={(e) => setFormData({ ...formData, entry2CricketTeamId: e.target.value })}
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white font-semibold"
                      >
                        {cricketTeams.map((ct) => (
                          <option key={ct.id} value={ct.id}>
                            {ct.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <span className="text-[10px] text-blue-700 italic block">
                    Points earned by either team will automatically roll up to their parent house.
                  </span>
                </div>
              ) : (
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                    Participating Houses:
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">House 1</label>
                      <select
                        value={formData.entry1ClubId}
                        onChange={(e) => setFormData({ ...formData, entry1ClubId: e.target.value })}
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white font-semibold"
                      >
                        {clubs.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name} ({c.code})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">House 2</label>
                      <select
                        value={formData.entry2ClubId}
                        onChange={(e) => setFormData({ ...formData, entry2ClubId: e.target.value })}
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white font-semibold"
                      >
                        {clubs.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name} ({c.code})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={formData.matchDate}
                    onChange={(e) => setFormData({ ...formData, matchDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Time</label>
                  <input
                    type="time"
                    required
                    value={formData.matchTime}
                    onChange={(e) => setFormData({ ...formData, matchTime: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                  />
                </div>
              </div>

              {/* Venue & Referee */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Venue</label>
                  <select
                    value={formData.venueId}
                    onChange={(e) => setFormData({ ...formData, venueId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white font-semibold"
                  >
                    {venues.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Assign Referee</label>
                  <select
                    value={formData.refereeId}
                    onChange={(e) => setFormData({ ...formData, refereeId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white font-semibold"
                  >
                    {referees.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} ({r.refereeCode})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-navy-950 hover:bg-navy-900 text-white font-bold rounded-lg shadow-sm"
                >
                  Schedule Competition
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Result Review & Approval Workflow (Section 6 Compliant) */}
      {isReviewModalOpen && selectedMatch && (
        <div className="fixed inset-0 z-50 bg-navy-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in duration-200">
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
                        <div className="text-right">
                          <span className="font-mono font-black text-blue-700 text-base">
                            {p.score ?? 0} pts
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
                              {dist.calculationNote || `${p.score} pts ÷ ${dist.uniqueClubCount} unique clubs`}
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
        </div>
      )}
    </AdminLayout>
  );
}
