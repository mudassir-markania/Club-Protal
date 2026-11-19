'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  Flame,
} from 'lucide-react';
import { ClubBadge, SportIcon } from '@/components/ui/icons';

interface BgmiSquadInput {
  id: string;
  name: string;
  playerIds: [string, string, string, string];
}

export default function MatchesPage() {
  const [mounted, setMounted] = useState(false);
  const [matches, setMatches] = useState<any[]>([]);
  const [sports, setSports] = useState<any[]>([]);
  const [clubs, setClubs] = useState<any[]>([]);
  const [cricketTeams, setCricketTeams] = useState<any[]>([]);
  const [venues, setVenues] = useState<any[]>([]);
  const [referees, setReferees] = useState<any[]>([]);
  const [players, setPlayers] = useState<any[]>([]);
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
    matchCategory: "Men's singles / doubles",
    stageType: 'NORMAL',
    round: 'League Match',
    stageName: 'Championship Round',
    matchDate: '2026-11-26',
    matchTime: '15:00',
    venueId: '',
    notes: '',
    refereeId: '',
  });

  // Dynamic Sport-Specific Participant State
  const [bgmiSquads, setBgmiSquads] = useState<BgmiSquadInput[]>([
    { id: '1', name: 'Squad 1', playerIds: ['', '', '', ''] },
    { id: '2', name: 'Squad 2', playerIds: ['', '', '', ''] },
  ]);

  // Cricket
  const [cricketTeamAId, setCricketTeamAId] = useState('');
  const [cricketTeamBId, setCricketTeamBId] = useState('');

  // Football
  const [footballClubAId, setFootballClubAId] = useState('');
  const [footballClubBId, setFootballClubBId] = useState('');

  // Chess
  const [chessPlayerAId, setChessPlayerAId] = useState('');
  const [chessPlayerBId, setChessPlayerBId] = useState('');

  // Badminton & Carrom
  const [badmintonCarromFormat, setBadmintonCarromFormat] = useState<'SINGLES' | 'DOUBLES'>('SINGLES');
  const [badmintonPlayerAId, setBadmintonPlayerAId] = useState('');
  const [badmintonPlayerBId, setBadmintonPlayerBId] = useState('');
  const [sideAPlayer1Id, setSideAPlayer1Id] = useState('');
  const [sideAPlayer2Id, setSideAPlayer2Id] = useState('');
  const [sideBPlayer1Id, setSideBPlayer1Id] = useState('');
  const [sideBPlayer2Id, setSideBPlayer2Id] = useState('');

  useEffect(() => {
    setMounted(true);
    fetchData();
  }, [selectedSport]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedSport) params.append('sportId', selectedSport);

      const [matchesRes, sportsRes, clubsRes, crickRes, venuesRes, refRes, playersRes] = await Promise.all([
        fetch(`/api/matches?${params.toString()}`),
        fetch('/api/sports'),
        fetch('/api/clubs'),
        fetch('/api/cricket-teams'),
        fetch('/api/venues'),
        fetch('/api/referees'),
        fetch('/api/players'),
      ]);

      const matchesData = await matchesRes.json();
      const sportsData = await sportsRes.json();
      const clubsData = await clubsRes.json();
      const crickData = await crickRes.json();
      const venuesData = await venuesRes.json();
      const refData = await refRes.json();
      const playersData = await playersRes.json();

      setMatches(Array.isArray(matchesData) ? matchesData : []);
      setSports(Array.isArray(sportsData) ? sportsData : []);
      setClubs(Array.isArray(clubsData) ? clubsData : []);
      setCricketTeams(Array.isArray(crickData) ? crickData : []);
      setVenues(Array.isArray(venuesData) ? venuesData : []);
      setReferees(Array.isArray(refData) ? refData : []);
      setPlayers(Array.isArray(playersData) ? playersData : []);
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
    const defaultSport = sports[0]?.id || '';
    const sp = sports[0];
    const spKey = sp?.name ? sp.name.toUpperCase() : '';

    setFormData({
      sportId: defaultSport,
      matchCategory:
        spKey === 'BGMI'
          ? 'Squad'
          : spKey === 'CRICKET'
          ? 'T10'
          : spKey === 'FOOTBALL'
          ? '11v11'
          : spKey === 'CHESS'
          ? 'Classical'
          : "Men's singles / doubles",
      stageType: 'NORMAL',
      round: 'League Match',
      stageName: 'Championship Round',
      matchDate: new Date().toISOString().slice(0, 10),
      matchTime: '15:00',
      venueId: venues[0]?.id || '',
      notes: '',
      refereeId: referees[0]?.id || '',
    });

    if (cricketTeams.length >= 2) {
      setCricketTeamAId(cricketTeams[0].id);
      setCricketTeamBId(cricketTeams[1].id);
    }
    if (clubs.length >= 2) {
      setFootballClubAId(clubs[0].id);
      setFootballClubBId(clubs[1].id);
    }
    if (players.length >= 2) {
      setChessPlayerAId(players[0].id);
      setChessPlayerBId(players[1].id);
      setBadmintonPlayerAId(players[0].id);
      setBadmintonPlayerBId(players[1].id);
    }
    if (players.length >= 4) {
      setSideAPlayer1Id(players[0].id);
      setSideAPlayer2Id(players[1].id);
      setSideBPlayer1Id(players[2].id);
      setSideBPlayer2Id(players[3].id);
    }
    if (players.length >= 8) {
      setBgmiSquads([
        { id: '1', name: 'Squad 1', playerIds: [players[0].id, players[1].id, players[2].id, players[3].id] },
        { id: '2', name: 'Squad 2', playerIds: [players[4].id, players[5].id, players[6].id, players[7].id] },
      ]);
    } else {
      setBgmiSquads([
        { id: '1', name: 'Squad 1', playerIds: ['', '', '', ''] },
        { id: '2', name: 'Squad 2', playerIds: ['', '', '', ''] },
      ]);
    }
    setBadmintonCarromFormat('SINGLES');
    setError(null);
    setIsCreateModalOpen(true);
  };

  const handleSportChange = (newSportId: string) => {
    const sp = sports.find((s) => s.id === newSportId);
    const spName = sp?.name || '';
    const spKey = spName.toUpperCase();

    let cat = "Men's singles / doubles";
    let rnd = 'League Match';

    if (spKey === 'BGMI') {
      cat = 'Squad';
      rnd = 'Squad Battle';
    } else if (spKey === 'CRICKET') {
      cat = 'T10';
      rnd = 'House Derby';
    } else if (spKey === 'FOOTBALL') {
      cat = '11v11';
      rnd = 'Championship Match';
    } else if (spKey === 'CHESS') {
      cat = 'Classical';
      rnd = 'Classical 1v1';
    } else if (spKey === 'BADMINTON' || spKey === 'CARROM') {
      cat = "Men's singles / doubles";
      rnd = "Men's Singles";
      setBadmintonCarromFormat('SINGLES');
    }

    setFormData((prev) => ({
      ...prev,
      sportId: newSportId,
      matchCategory: cat,
      round: rnd,
    }));
  };

  const handleAddBgmiSquad = () => {
    setBgmiSquads((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        name: `Squad ${prev.length + 1}`,
        playerIds: ['', '', '', ''],
      },
    ]);
  };

  const handleRemoveBgmiSquad = (idx: number) => {
    if (bgmiSquads.length <= 2) return;
    setBgmiSquads((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleUpdateBgmiSquadName = (idx: number, name: string) => {
    setBgmiSquads((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], name };
      return copy;
    });
  };

  const handleUpdateBgmiSquadPlayer = (squadIdx: number, slotIdx: number, playerId: string) => {
    setBgmiSquads((prev) => {
      const copy = [...prev];
      const pIds = [...copy[squadIdx].playerIds] as [string, string, string, string];
      pIds[slotIdx] = playerId;
      copy[squadIdx] = { ...copy[squadIdx], playerIds: pIds };
      return copy;
    });
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const sp = sports.find((s) => s.id === formData.sportId);
    const spKey = sp?.name ? sp.name.toUpperCase() : '';

    let participantsPayload: any[] = [];

    if (spKey === 'BGMI') {
      if (bgmiSquads.length < 2) {
        setError('BGMI requires at least 2 participating squads');
        return;
      }
      const allPlayersInMatch = new Set<string>();
      for (let i = 0; i < bgmiSquads.length; i++) {
        const sq = bgmiSquads[i];
        if (!sq.name.trim()) {
          setError(`Please provide a squad name for Squad #${i + 1}`);
          return;
        }
        const validIds = sq.playerIds.filter(Boolean);
        if (validIds.length !== 4) {
          setError(`Squad "${sq.name}" must have exactly 4 registered players selected`);
          return;
        }
        const squadSet = new Set<string>();
        for (const pid of validIds) {
          if (squadSet.has(pid)) {
            setError(`Squad "${sq.name}" contains duplicate player selection (${getPlayer(pid)?.name || pid})`);
            return;
          }
          squadSet.add(pid);
          if (allPlayersInMatch.has(pid)) {
            setError(`Player ${getPlayer(pid)?.name || pid} is selected in multiple squads in this match`);
            return;
          }
          allPlayersInMatch.add(pid);
        }
      }
      participantsPayload = bgmiSquads.map((sq) => ({
        teamName: sq.name.trim(),
        playerIds: sq.playerIds,
      }));
    } else if (spKey === 'CRICKET') {
      if (!cricketTeamAId || !cricketTeamBId) {
        setError('Please select both cricket teams');
        return;
      }
      if (cricketTeamAId === cricketTeamBId) {
        setError('Please select two distinct cricket teams');
        return;
      }
      const tA = getCricketTeam(cricketTeamAId);
      const tB = getCricketTeam(cricketTeamBId);
      participantsPayload = [
        { cricketTeamId: tA?.id, clubId: tA?.clubId, teamName: tA?.name },
        { cricketTeamId: tB?.id, clubId: tB?.clubId, teamName: tB?.name },
      ];
    } else if (spKey === 'FOOTBALL') {
      if (!footballClubAId || !footballClubBId) {
        setError('Please select both competing houses');
        return;
      }
      if (footballClubAId === footballClubBId) {
        setError('Please select two distinct houses');
        return;
      }
      const cA = getClub(footballClubAId);
      const cB = getClub(footballClubBId);
      participantsPayload = [
        { clubId: cA?.id, teamName: cA?.name },
        { clubId: cB?.id, teamName: cB?.name },
      ];
    } else if (spKey === 'CHESS') {
      if (!chessPlayerAId || !chessPlayerBId) {
        setError('Please select both competing players for Chess');
        return;
      }
      if (chessPlayerAId === chessPlayerBId) {
        setError('Please select two distinct players for Chess');
        return;
      }
      const pA = getPlayer(chessPlayerAId);
      const pB = getPlayer(chessPlayerBId);
      participantsPayload = [
        { playerId: pA?.id, clubId: pA?.clubId, teamName: pA?.name, playerIds: [pA?.id] },
        { playerId: pB?.id, clubId: pB?.clubId, teamName: pB?.name, playerIds: [pB?.id] },
      ];
    } else if (spKey === 'BADMINTON' || spKey === 'CARROM') {
      if (badmintonCarromFormat === 'SINGLES') {
        if (!badmintonPlayerAId || !badmintonPlayerBId) {
          setError('Please select both players for Singles');
          return;
        }
        if (badmintonPlayerAId === badmintonPlayerBId) {
          setError('Please select two distinct players');
          return;
        }
        const pA = getPlayer(badmintonPlayerAId);
        const pB = getPlayer(badmintonPlayerBId);
        participantsPayload = [
          { playerId: pA?.id, clubId: pA?.clubId, teamName: pA?.name, playerIds: [pA?.id] },
          { playerId: pB?.id, clubId: pB?.clubId, teamName: pB?.name, playerIds: [pB?.id] },
        ];
      } else {
        if (!sideAPlayer1Id || !sideAPlayer2Id || !sideBPlayer1Id || !sideBPlayer2Id) {
          setError('Please select all 4 players for Doubles (2 on Side A, 2 on Side B)');
          return;
        }
        const allFour = [sideAPlayer1Id, sideAPlayer2Id, sideBPlayer1Id, sideBPlayer2Id];
        if (new Set(allFour).size !== 4) {
          setError('All 4 players in doubles must be distinct — no duplicate player on either side');
          return;
        }
        const pA1 = getPlayer(sideAPlayer1Id);
        const pA2 = getPlayer(sideAPlayer2Id);
        const pB1 = getPlayer(sideBPlayer1Id);
        const pB2 = getPlayer(sideBPlayer2Id);
        participantsPayload = [
          {
            teamName: `${pA1?.name || 'Player 1'} & ${pA2?.name || 'Player 2'}`,
            playerIds: [sideAPlayer1Id, sideAPlayer2Id],
          },
          {
            teamName: `${pB1?.name || 'Player 1'} & ${pB2?.name || 'Player 2'}`,
            playerIds: [sideBPlayer1Id, sideBPlayer2Id],
          },
        ];
      }
    } else {
      participantsPayload = [
        { clubId: clubs[0]?.id },
        { clubId: clubs[1]?.id },
      ];
    }

    const payload = {
      sportId: formData.sportId,
      matchCategory: formData.matchCategory || 'Singles',
      stageType: formData.stageType || 'NORMAL',
      round: formData.round,
      stageName: formData.stageName,
      matchDate: formData.matchDate,
      matchTime: formData.matchTime,
      venueId: formData.venueId || null,
      notes: formData.notes,
      participants: participantsPayload,
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
                                <span className="font-bold text-xs text-slate-900 block truncate max-w-[220px]">
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

      {/* Modal: Schedule New Match (Sport-Specific Participant Configuration) */}
      {mounted && isCreateModalOpen && createPortal(
        <div className="fixed inset-0 z-[9999] bg-navy-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in duration-200">
            {/* Modal Header */}
            <div className="p-5 bg-navy-950 text-white flex items-center justify-between shrink-0 border-b border-navy-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-400">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-white tracking-tight">
                    Schedule Competition Fixture
                  </h3>
                  <span className="text-xs text-blue-300 font-medium">
                    APL Season 9 • Dynamic Sport-Specific Rosters
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-navy-900 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 text-xs">
              {error && (
                <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* SECTION 1: SPORT & STAGE SELECTION */}
              <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Trophy className="w-3.5 h-3.5 text-amber-500" />
                    <span>1. Sport & Stage Selection</span>
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Step 1 of 3
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Sport Dropdown */}
                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5 text-[11px]">
                      Select Sport *
                    </label>
                    <select
                      required
                      value={formData.sportId}
                      onChange={(e) => handleSportChange(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-600 shadow-2xs"
                    >
                      {sports.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.category} • {s.sportType})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Stage Type Picker */}
                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5 text-[11px]">
                      Competition Stage *
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { id: 'NORMAL', label: 'League / Regular' },
                        { id: 'FINAL', label: 'Championship Final' },
                        { id: 'THIRD_PLACE', label: '3rd Place Playoff' },
                      ].map((st) => (
                        <button
                          key={st.id}
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              stageType: st.id,
                              round: st.label,
                            }))
                          }
                          className={`py-2 px-1.5 rounded-lg text-[10px] font-extrabold border transition text-center truncate ${
                            formData.stageType === st.id
                              ? 'bg-navy-950 text-white border-navy-950 shadow-xs'
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {st.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Sport Category Configuration */}
                {(() => {
                  const sp = sports.find((s) => s.id === formData.sportId);
                  const spKey = sp?.name ? sp.name.toUpperCase() : '';

                  if (spKey === 'BADMINTON' || spKey === 'CARROM') {
                    const isDoublesLocked =
                      formData.matchCategory === 'Mixed' ||
                      formData.matchCategory === 'MD' ||
                      formData.matchCategory === 'WD';

                    return (
                      <div className="pt-3 border-t border-slate-200/60 space-y-3">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px] block">
                            Category & Format (PDF Official Rules)
                          </label>
                          <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200">
                            <button
                              type="button"
                              disabled={isDoublesLocked}
                              onClick={() => setBadmintonCarromFormat('SINGLES')}
                              className={`px-2.5 py-1 rounded text-[10px] font-bold transition ${
                                badmintonCarromFormat === 'SINGLES' && !isDoublesLocked
                                  ? 'bg-blue-600 text-white shadow-2xs'
                                  : 'text-slate-600 hover:text-slate-900 disabled:opacity-40'
                              }`}
                            >
                              Singles (1v1)
                            </button>
                            <button
                              type="button"
                              onClick={() => setBadmintonCarromFormat('DOUBLES')}
                              className={`px-2.5 py-1 rounded text-[10px] font-bold transition ${
                                badmintonCarromFormat === 'DOUBLES' || isDoublesLocked
                                  ? 'bg-blue-600 text-white shadow-2xs'
                                  : 'text-slate-600 hover:text-slate-900'
                              }`}
                            >
                              Doubles (2v2)
                            </button>
                          </div>
                        </div>

                        {/* Category selection buttons */}
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                          {[
                            { code: "Men's singles / doubles", label: "Men's S/D", pts: '10/7/5' },
                            { code: "Women's singles / doubles", label: "Women's S/D", pts: '10/7/5' },
                            { code: 'Mixed', label: 'Mixed', pts: '20/14/10' },
                            { code: 'MD', label: 'MD (Men)', pts: '20/14/10' },
                            { code: 'WD', label: 'WD (Women)', pts: '20/14/10' },
                          ].map((cat) => {
                            const isSelected = formData.matchCategory === cat.code;
                            return (
                              <button
                                key={cat.code}
                                type="button"
                                onClick={() => {
                                  const autoDoubles =
                                    cat.code === 'Mixed' || cat.code === 'MD' || cat.code === 'WD';
                                  if (autoDoubles) setBadmintonCarromFormat('DOUBLES');
                                  setFormData((prev) => ({
                                    ...prev,
                                    matchCategory: cat.code,
                                    round: `${cat.label} ${prev.stageType === 'FINAL' ? 'Final' : 'Match'}`,
                                  }));
                                }}
                                className={`p-2 rounded-xl text-left border transition ${
                                  isSelected
                                    ? 'bg-blue-50 border-blue-500 text-blue-900 ring-1 ring-blue-500 shadow-2xs'
                                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                                }`}
                              >
                                <span className="block font-bold text-[11px] truncate">{cat.label}</span>
                                <span className="text-[9px] text-slate-500 font-semibold">{cat.pts} pts</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  }

                  if (spKey === 'BGMI') {
                    return (
                      <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                        <span className="font-bold text-slate-600">Competition Format:</span>
                        <span className="px-2.5 py-0.5 rounded-full font-extrabold bg-blue-100 text-blue-800 border border-blue-200">
                          Squad Battle (4 Players per Squad • Multi-House Allowed)
                        </span>
                      </div>
                    );
                  }

                  if (spKey === 'CRICKET') {
                    return (
                      <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                        <span className="font-bold text-slate-600">Format:</span>
                        <div className="flex gap-1">
                          {['T10', 'T20', 'House Derby'].map((f) => (
                            <button
                              key={f}
                              type="button"
                              onClick={() => setFormData((prev) => ({ ...prev, matchCategory: f }))}
                              className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                                formData.matchCategory === f
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-white border border-slate-200 text-slate-600'
                              }`}
                            >
                              {f}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  }

                  return null;
                })()}
              </div>

              {/* SECTION 2: DYNAMIC PARTICIPANT SELECTION */}
              {(() => {
                const sp = sports.find((s) => s.id === formData.sportId);
                const spKey = sp?.name ? sp.name.toUpperCase() : '';

                // A. BGMI SQUAD-BASED SCHEDULING
                if (spKey === 'BGMI') {
                  return (
                    <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-4 shadow-2xs">
                      <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-100 pb-3">
                        <div>
                          <h4 className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                            <Users className="w-4 h-4 text-blue-600" />
                            <span>Participating BGMI Squads (Multi-Squad Lobby)</span>
                          </h4>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Each squad requires exactly 4 registered players. Players may come from different houses.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={handleAddBgmiSquad}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold transition"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Squad</span>
                        </button>
                      </div>

                      <div className="space-y-4">
                        {bgmiSquads.map((squad, sqIdx) => {
                          const squadUniqueClubs = new Set<string>();
                          squad.playerIds.filter(Boolean).forEach((pid) => {
                            const pl = getPlayer(pid);
                            if (pl?.club?.code) squadUniqueClubs.add(pl.club.code);
                          });

                          return (
                            <div
                              key={squad.id || sqIdx}
                              className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3"
                            >
                              <div className="flex items-center justify-between flex-wrap gap-2">
                                <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                                  <span className="font-mono font-black text-xs px-2 py-0.5 rounded bg-navy-950 text-white">
                                    Squad #{sqIdx + 1}
                                  </span>
                                  <input
                                    type="text"
                                    required
                                    placeholder="Squad Name (e.g. Squad Alpha, Team Soul)"
                                    value={squad.name}
                                    onChange={(e) => handleUpdateBgmiSquadName(sqIdx, e.target.value)}
                                    className="px-2.5 py-1 border border-slate-200 rounded-lg bg-white font-bold text-xs text-navy-950 flex-1 max-w-[260px] outline-none focus:ring-2 focus:ring-blue-600"
                                  />
                                </div>

                                <div className="flex items-center gap-2">
                                  <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-blue-100 text-blue-800 border border-blue-200">
                                    {squadUniqueClubs.size} Unique House{squadUniqueClubs.size !== 1 ? 's' : ''}
                                    {squadUniqueClubs.size > 0 && ` (${Array.from(squadUniqueClubs).join(', ')})`}
                                  </span>
                                  {bgmiSquads.length > 2 && (
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveBgmiSquad(sqIdx)}
                                      className="p-1 text-slate-400 hover:text-red-600 rounded transition"
                                      title="Remove Squad"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              </div>

                              {/* 4 Player Slots */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                                {[0, 1, 2, 3].map((slotIdx) => {
                                  const selectedPlayerId = squad.playerIds[slotIdx] || '';
                                  const selectedPlayer = getPlayer(selectedPlayerId);

                                  return (
                                    <div key={slotIdx} className="bg-white p-2 rounded-lg border border-slate-200">
                                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                                        Player {slotIdx + 1} *
                                      </label>
                                      <select
                                        required
                                        value={selectedPlayerId}
                                        onChange={(e) =>
                                          handleUpdateBgmiSquadPlayer(sqIdx, slotIdx, e.target.value)
                                        }
                                        className="w-full px-2 py-1 text-xs border border-slate-200 rounded-md bg-white font-semibold text-slate-900 outline-none focus:ring-1 focus:ring-blue-600 truncate"
                                      >
                                        <option value="">-- Choose Athlete --</option>
                                        {players.map((p) => (
                                          <option key={p.id} value={p.id}>
                                            {p.name} ({p.club?.name || 'House'} • {p.club?.code})
                                          </option>
                                        ))}
                                      </select>

                                      {/* Auto-retrieved House Badge */}
                                      {selectedPlayer ? (
                                        <div className="mt-1.5 flex items-center justify-between text-[10px] pt-1 border-t border-slate-100">
                                          <div className="flex items-center gap-1 truncate">
                                            <ClubBadge
                                              code={selectedPlayer.club?.code}
                                              name={selectedPlayer.club?.name}
                                              className="w-3 h-3 shrink-0"
                                            />
                                            <span className="font-bold text-slate-800 truncate">
                                              {selectedPlayer.club?.name}
                                            </span>
                                          </div>
                                          <span className="font-mono font-extrabold text-[9px] px-1 rounded bg-slate-100 text-slate-600">
                                            {selectedPlayer.club?.code}
                                          </span>
                                        </div>
                                      ) : (
                                        <div className="mt-1.5 text-[9px] text-slate-400 italic">
                                          Select player
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>

                              {/* Squad Participant Summary Table */}
                              <div className="bg-white p-2 rounded-lg border border-slate-200/80 text-[11px] flex items-center justify-between flex-wrap gap-2">
                                <span className="font-medium text-slate-500">
                                  <strong>Points Split Rule:</strong> Calculated championship points for{' '}
                                  <span className="text-navy-950 font-bold">{squad.name || `Squad ${sqIdx + 1}`}</span>{' '}
                                  will be divided equally among its unique registered houses.
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                }

                // B. CRICKET HOUSE-BASED TEAM SCHEDULING
                if (spKey === 'CRICKET') {
                  const teamA = getCricketTeam(cricketTeamAId);
                  const teamB = getCricketTeam(cricketTeamBId);

                  return (
                    <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-4 shadow-2xs">
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                          <Flame className="w-4 h-4 text-amber-500" />
                          <span>House-Based Cricket Team Matchup</span>
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Select the two competing cricket teams. Match points will automatically roll up to their registered parent house.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Team A */}
                        <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200 space-y-2.5">
                          <label className="block text-[11px] font-extrabold text-slate-700 uppercase">
                            Cricket Team A *
                          </label>
                          <select
                            required
                            value={cricketTeamAId}
                            onChange={(e) => setCricketTeamAId(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white font-bold text-xs text-navy-950 outline-none focus:ring-2 focus:ring-blue-600"
                          >
                            <option value="">-- Select Team A --</option>
                            {cricketTeams.map((ct) => (
                              <option key={ct.id} value={ct.id}>
                                {ct.name} (Parent House: {ct.club?.name} • {ct.club?.code})
                              </option>
                            ))}
                          </select>

                          {teamA && (
                            <div className="p-2.5 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <ClubBadge code={teamA.club?.code} name={teamA.club?.name} className="w-5 h-5" />
                                <div>
                                  <span className="font-extrabold text-xs text-navy-950 block">
                                    {teamA.name}
                                  </span>
                                  <span className="text-[10px] text-slate-500 font-medium">
                                    Parent House: {teamA.club?.name} ({teamA.club?.code})
                                  </span>
                                </div>
                              </div>
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                Team A
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Team B */}
                        <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200 space-y-2.5">
                          <label className="block text-[11px] font-extrabold text-slate-700 uppercase">
                            Cricket Team B *
                          </label>
                          <select
                            required
                            value={cricketTeamBId}
                            onChange={(e) => setCricketTeamBId(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white font-bold text-xs text-navy-950 outline-none focus:ring-2 focus:ring-blue-600"
                          >
                            <option value="">-- Select Team B --</option>
                            {cricketTeams.map((ct) => (
                              <option key={ct.id} value={ct.id}>
                                {ct.name} (Parent House: {ct.club?.name} • {ct.club?.code})
                              </option>
                            ))}
                          </select>

                          {teamB && (
                            <div className="p-2.5 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <ClubBadge code={teamB.club?.code} name={teamB.club?.name} className="w-5 h-5" />
                                <div>
                                  <span className="font-extrabold text-xs text-navy-950 block">
                                    {teamB.name}
                                  </span>
                                  <span className="text-[10px] text-slate-500 font-medium">
                                    Parent House: {teamB.club?.name} ({teamB.club?.code})
                                  </span>
                                </div>
                              </div>
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                                Team B
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                }

                // C. BADMINTON & CARROM CATEGORY-BASED SCHEDULING
                if (spKey === 'BADMINTON' || spKey === 'CARROM') {
                  const isSingles = badmintonCarromFormat === 'SINGLES';

                  return (
                    <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-4 shadow-2xs">
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                          <Shield className="w-4 h-4 text-blue-600" />
                          <span>
                            {sp.name} — {isSingles ? 'Singles (1 vs 1)' : 'Doubles (2 vs 2)'} Matchup
                          </span>
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {isSingles
                            ? 'Select 1 registered player for Side A and 1 for Side B. Houses are retrieved automatically.'
                            : 'Select 2 registered players per side. Pairs may belong to mixed houses; points will split accordingly.'}
                        </p>
                      </div>

                      {isSingles ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Side A Singles */}
                          <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200 space-y-2.5">
                            <label className="block text-[11px] font-extrabold text-slate-700 uppercase">
                              Side A Player *
                            </label>
                            <select
                              required
                              value={badmintonPlayerAId}
                              onChange={(e) => setBadmintonPlayerAId(e.target.value)}
                              className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white font-bold text-xs text-navy-950 outline-none focus:ring-2 focus:ring-blue-600"
                            >
                              <option value="">-- Select Side A Player --</option>
                              {players.map((p) => (
                                <option key={p.id} value={p.id}>
                                  {p.name} ({p.club?.name || 'House'} • {p.club?.code})
                                </option>
                              ))}
                            </select>

                            {getPlayer(badmintonPlayerAId) && (
                              <div className="p-2.5 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <ClubBadge
                                    code={getPlayer(badmintonPlayerAId)?.club?.code}
                                    name={getPlayer(badmintonPlayerAId)?.club?.name}
                                    className="w-5 h-5"
                                  />
                                  <div>
                                    <span className="font-extrabold text-xs text-navy-950 block">
                                      {getPlayer(badmintonPlayerAId)?.name}
                                    </span>
                                    <span className="text-[10px] text-slate-500 font-medium">
                                      House: {getPlayer(badmintonPlayerAId)?.club?.name} (
                                      {getPlayer(badmintonPlayerAId)?.club?.code})
                                    </span>
                                  </div>
                                </div>
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                  Side A
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Side B Singles */}
                          <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200 space-y-2.5">
                            <label className="block text-[11px] font-extrabold text-slate-700 uppercase">
                              Side B Player *
                            </label>
                            <select
                              required
                              value={badmintonPlayerBId}
                              onChange={(e) => setBadmintonPlayerBId(e.target.value)}
                              className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white font-bold text-xs text-navy-950 outline-none focus:ring-2 focus:ring-blue-600"
                            >
                              <option value="">-- Select Side B Player --</option>
                              {players.map((p) => (
                                <option key={p.id} value={p.id}>
                                  {p.name} ({p.club?.name || 'House'} • {p.club?.code})
                                </option>
                              ))}
                            </select>

                            {getPlayer(badmintonPlayerBId) && (
                              <div className="p-2.5 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <ClubBadge
                                    code={getPlayer(badmintonPlayerBId)?.club?.code}
                                    name={getPlayer(badmintonPlayerBId)?.club?.name}
                                    className="w-5 h-5"
                                  />
                                  <div>
                                    <span className="font-extrabold text-xs text-navy-950 block">
                                      {getPlayer(badmintonPlayerBId)?.name}
                                    </span>
                                    <span className="text-[10px] text-slate-500 font-medium">
                                      House: {getPlayer(badmintonPlayerBId)?.club?.name} (
                                      {getPlayer(badmintonPlayerBId)?.club?.code})
                                    </span>
                                  </div>
                                </div>
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                                  Side B
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        /* Doubles / Mixed (2 Players on Side A, 2 on Side B) */
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Side A Pair */}
                          <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200 space-y-3">
                            <div className="flex items-center justify-between">
                              <label className="text-[11px] font-extrabold text-slate-700 uppercase">
                                Side A (Pair 1) *
                              </label>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                                2 Players
                              </span>
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 mb-1">
                                Player 1:
                              </label>
                              <select
                                required
                                value={sideAPlayer1Id}
                                onChange={(e) => setSideAPlayer1Id(e.target.value)}
                                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white font-semibold text-xs"
                              >
                                <option value="">-- Choose Athlete --</option>
                                {players.map((p) => (
                                  <option key={p.id} value={p.id}>
                                    {p.name} ({p.club?.name} • {p.club?.code})
                                  </option>
                                ))}
                              </select>
                              {getPlayer(sideAPlayer1Id) && (
                                <div className="mt-1 flex items-center gap-1.5 text-[10px] text-slate-600 font-medium">
                                  <ClubBadge code={getPlayer(sideAPlayer1Id)?.club?.code} name={getPlayer(sideAPlayer1Id)?.club?.name} className="w-3.5 h-3.5" />
                                  <span>House: {getPlayer(sideAPlayer1Id)?.club?.name} ({getPlayer(sideAPlayer1Id)?.club?.code})</span>
                                </div>
                              )}
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 mb-1">
                                Player 2:
                              </label>
                              <select
                                required
                                value={sideAPlayer2Id}
                                onChange={(e) => setSideAPlayer2Id(e.target.value)}
                                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white font-semibold text-xs"
                              >
                                <option value="">-- Choose Athlete --</option>
                                {players.map((p) => (
                                  <option key={p.id} value={p.id}>
                                    {p.name} ({p.club?.name} • {p.club?.code})
                                  </option>
                                ))}
                              </select>
                              {getPlayer(sideAPlayer2Id) && (
                                <div className="mt-1 flex items-center gap-1.5 text-[10px] text-slate-600 font-medium">
                                  <ClubBadge code={getPlayer(sideAPlayer2Id)?.club?.code} name={getPlayer(sideAPlayer2Id)?.club?.name} className="w-3.5 h-3.5" />
                                  <span>House: {getPlayer(sideAPlayer2Id)?.club?.name} ({getPlayer(sideAPlayer2Id)?.club?.code})</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Side B Pair */}
                          <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200 space-y-3">
                            <div className="flex items-center justify-between">
                              <label className="text-[11px] font-extrabold text-slate-700 uppercase">
                                Side B (Pair 2) *
                              </label>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                                2 Players
                              </span>
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 mb-1">
                                Player 1:
                              </label>
                              <select
                                required
                                value={sideBPlayer1Id}
                                onChange={(e) => setSideBPlayer1Id(e.target.value)}
                                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white font-semibold text-xs"
                              >
                                <option value="">-- Choose Athlete --</option>
                                {players.map((p) => (
                                  <option key={p.id} value={p.id}>
                                    {p.name} ({p.club?.name} • {p.club?.code})
                                  </option>
                                ))}
                              </select>
                              {getPlayer(sideBPlayer1Id) && (
                                <div className="mt-1 flex items-center gap-1.5 text-[10px] text-slate-600 font-medium">
                                  <ClubBadge code={getPlayer(sideBPlayer1Id)?.club?.code} name={getPlayer(sideBPlayer1Id)?.club?.name} className="w-3.5 h-3.5" />
                                  <span>House: {getPlayer(sideBPlayer1Id)?.club?.name} ({getPlayer(sideBPlayer1Id)?.club?.code})</span>
                                </div>
                              )}
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 mb-1">
                                Player 2:
                              </label>
                              <select
                                required
                                value={sideBPlayer2Id}
                                onChange={(e) => setSideBPlayer2Id(e.target.value)}
                                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white font-semibold text-xs"
                              >
                                <option value="">-- Choose Athlete --</option>
                                {players.map((p) => (
                                  <option key={p.id} value={p.id}>
                                    {p.name} ({p.club?.name} • {p.club?.code})
                                  </option>
                                ))}
                              </select>
                              {getPlayer(sideBPlayer2Id) && (
                                <div className="mt-1 flex items-center gap-1.5 text-[10px] text-slate-600 font-medium">
                                  <ClubBadge code={getPlayer(sideBPlayer2Id)?.club?.code} name={getPlayer(sideBPlayer2Id)?.club?.name} className="w-3.5 h-3.5" />
                                  <span>House: {getPlayer(sideBPlayer2Id)?.club?.name} ({getPlayer(sideBPlayer2Id)?.club?.code})</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }

                // D. CHESS INDIVIDUAL SCHEDULING
                if (spKey === 'CHESS') {
                  const pA = getPlayer(chessPlayerAId);
                  const pB = getPlayer(chessPlayerBId);

                  return (
                    <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-4 shadow-2xs">
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                          <Medal className="w-4 h-4 text-amber-500" />
                          <span>Chess Individual Matchup (Player A vs Player B)</span>
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Select the two competing chess athletes. Houses are retrieved automatically from registered player records.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Player A */}
                        <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200 space-y-2.5">
                          <label className="block text-[11px] font-extrabold text-slate-700 uppercase">
                            Player A *
                          </label>
                          <select
                            required
                            value={chessPlayerAId}
                            onChange={(e) => setChessPlayerAId(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white font-bold text-xs text-navy-950 outline-none focus:ring-2 focus:ring-blue-600"
                          >
                            <option value="">-- Select Player A --</option>
                            {players.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name} ({p.club?.name || 'House'} • {p.club?.code})
                              </option>
                            ))}
                          </select>

                          {pA && (
                            <div className="p-2.5 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <ClubBadge code={pA.club?.code} name={pA.club?.name} className="w-5 h-5" />
                                <div>
                                  <span className="font-extrabold text-xs text-navy-950 block">
                                    {pA.name}
                                  </span>
                                  <span className="text-[10px] text-slate-500 font-medium">
                                    House: {pA.club?.name} ({pA.club?.code})
                                  </span>
                                </div>
                              </div>
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                White / A
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Player B */}
                        <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200 space-y-2.5">
                          <label className="block text-[11px] font-extrabold text-slate-700 uppercase">
                            Player B *
                          </label>
                          <select
                            required
                            value={chessPlayerBId}
                            onChange={(e) => setChessPlayerBId(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white font-bold text-xs text-navy-950 outline-none focus:ring-2 focus:ring-blue-600"
                          >
                            <option value="">-- Select Player B --</option>
                            {players.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name} ({p.club?.name || 'House'} • {p.club?.code})
                              </option>
                            ))}
                          </select>

                          {pB && (
                            <div className="p-2.5 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <ClubBadge code={pB.club?.code} name={pB.club?.name} className="w-5 h-5" />
                                <div>
                                  <span className="font-extrabold text-xs text-navy-950 block">
                                    {pB.name}
                                  </span>
                                  <span className="text-[10px] text-slate-500 font-medium">
                                    House: {pB.club?.name} ({pB.club?.code})
                                  </span>
                                </div>
                              </div>
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                                Black / B
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                }

                // E. FOOTBALL TEAM-BASED SCHEDULING
                return (
                  <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-4 shadow-2xs">
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                        <Trophy className="w-4 h-4 text-blue-600" />
                        <span>Football Team-Based Matchup</span>
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Select the two competing houses. Match win and final placement points will be credited automatically.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Team A */}
                      <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200 space-y-2.5">
                        <label className="block text-[11px] font-extrabold text-slate-700 uppercase">
                          House Team A *
                        </label>
                        <select
                          required
                          value={footballClubAId}
                          onChange={(e) => setFootballClubAId(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white font-bold text-xs text-navy-950 outline-none focus:ring-2 focus:ring-blue-600"
                        >
                          <option value="">-- Select House A --</option>
                          {clubs.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name} ({c.code})
                            </option>
                          ))}
                        </select>

                        {getClub(footballClubAId) && (
                          <div className="p-2.5 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <ClubBadge
                                code={getClub(footballClubAId)?.code}
                                name={getClub(footballClubAId)?.name}
                                className="w-5 h-5"
                              />
                              <span className="font-extrabold text-xs text-navy-950">
                                {getClub(footballClubAId)?.name} ({getClub(footballClubAId)?.code})
                              </span>
                            </div>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                              Side A
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Team B */}
                      <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200 space-y-2.5">
                        <label className="block text-[11px] font-extrabold text-slate-700 uppercase">
                          House Team B *
                        </label>
                        <select
                          required
                          value={footballClubBId}
                          onChange={(e) => setFootballClubBId(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white font-bold text-xs text-navy-950 outline-none focus:ring-2 focus:ring-blue-600"
                        >
                          <option value="">-- Select House B --</option>
                          {clubs.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name} ({c.code})
                            </option>
                          ))}
                        </select>

                        {getClub(footballClubBId) && (
                          <div className="p-2.5 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <ClubBadge
                                code={getClub(footballClubBId)?.code}
                                name={getClub(footballClubBId)?.name}
                                className="w-5 h-5"
                              />
                              <span className="font-extrabold text-xs text-navy-950">
                                {getClub(footballClubBId)?.name} ({getClub(footballClubBId)?.code})
                              </span>
                            </div>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                              Side B
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* SECTION 3: DATE, TIME, VENUE & REFEREE */}
              <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 space-y-4">
                <span className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                  <span>3. Match Details & Official Assignment</span>
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[10px]">
                      Match Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.matchDate}
                      onChange={(e) => setFormData({ ...formData, matchDate: e.target.value })}
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white font-semibold text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[10px]">
                      Match Time *
                    </label>
                    <input
                      type="time"
                      required
                      value={formData.matchTime}
                      onChange={(e) => setFormData({ ...formData, matchTime: e.target.value })}
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white font-semibold text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[10px]">
                      Venue *
                    </label>
                    <select
                      value={formData.venueId}
                      onChange={(e) => setFormData({ ...formData, venueId: e.target.value })}
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white font-semibold text-xs truncate"
                    >
                      {venues.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[10px]">
                      Assigned Referee
                    </label>
                    <select
                      value={formData.refereeId}
                      onChange={(e) => setFormData({ ...formData, refereeId: e.target.value })}
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white font-semibold text-xs truncate"
                    >
                      <option value="">-- Choose Referee --</option>
                      {referees.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name} ({r.refereeCode})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[10px]">
                      Round / Match Title
                    </label>
                    <input
                      type="text"
                      value={formData.round}
                      onChange={(e) => setFormData({ ...formData, round: e.target.value })}
                      placeholder="e.g. League Match, Grand Finals"
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white font-semibold text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[10px]">
                      Special Instructions / Notes
                    </label>
                    <input
                      type="text"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Optional referee instructions"
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white font-semibold text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3 shrink-0">
                <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
                  Participants will be locked for the referee to record official scores.
                </span>
                <div className="flex items-center gap-2 ml-auto">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-bold transition text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-navy-950 hover:bg-navy-900 text-white font-extrabold rounded-xl shadow-sm transition text-xs flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>Schedule Competition</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Modal: Result Review & Approval Workflow (Section 6 Compliant) */}
      {mounted && isReviewModalOpen && selectedMatch && createPortal(
        <div className="fixed inset-0 z-[9999] bg-navy-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
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
