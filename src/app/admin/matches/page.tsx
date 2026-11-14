'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
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
  Edit2,
  Trash2,
  Check,
  X,
  UserCheck,
  Medal,
  Shield,
  Trophy,
  MapPin,
} from 'lucide-react';
import { ClubBadge, SportIcon } from '@/components/ui/icons';

export default function MatchesPage() {
  const [matches, setMatches] = useState<any[]>([]);
  const [sports, setSports] = useState<any[]>([]);
  const [clubs, setClubs] = useState<any[]>([]);
  const [venues, setVenues] = useState<any[]>([]);
  const [referees, setReferees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedSport, setSelectedSport] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<any | null>(null);
  const [reviewResult, setReviewResult] = useState<any | null>(null);
  const [overridePoints, setOverridePoints] = useState<number>(3);
  const [rejectionReason, setRejectionReason] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // New Match Form State
  const [formData, setFormData] = useState({
    sportId: '',
    round: 'League Match 1',
    stageName: 'Group Stage',
    matchDate: '2026-11-25',
    matchTime: '10:00',
    venueId: '',
    notes: '',
    club1Id: '',
    club2Id: '',
    refereeId: '',
  });

  useEffect(() => {
    fetchData();
  }, [selectedSport, selectedStatus, selectedDate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedSport) params.append('sportId', selectedSport);
      if (selectedStatus) params.append('status', selectedStatus);
      if (selectedDate) params.append('date', selectedDate);

      const [matchesRes, sportsRes, clubsRes, venuesRes, refRes] = await Promise.all([
        fetch(`/api/matches?${params.toString()}`),
        fetch('/api/sports'),
        fetch('/api/clubs'),
        fetch('/api/venues'),
        fetch('/api/referees'),
      ]);

      const matchesData = await matchesRes.json();
      const sportsData = await sportsRes.json();
      const clubsData = await clubsRes.json();
      const venuesData = await venuesRes.json();
      const refData = await refRes.json();

      setMatches(Array.isArray(matchesData) ? matchesData : []);
      setSports(Array.isArray(sportsData) ? sportsData : []);
      setClubs(Array.isArray(clubsData) ? clubsData : []);
      setVenues(Array.isArray(venuesData) ? venuesData : []);
      setReferees(Array.isArray(refData) ? refData : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setFormData({
      sportId: sports[0]?.id || '',
      round: 'League Match 1',
      stageName: 'Group Stage',
      matchDate: '2026-11-25',
      matchTime: '10:00',
      venueId: venues[0]?.id || '',
      notes: '',
      club1Id: clubs[0]?.id || '',
      club2Id: clubs[1]?.id || '',
      refereeId: referees[0]?.id || '',
    });
    setError(null);
    setIsCreateModalOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (formData.club1Id === formData.club2Id) {
      setError('Please select two distinct clubs for the match');
      return;
    }

    const payload = {
      sportId: formData.sportId,
      round: formData.round,
      stageName: formData.stageName,
      matchDate: formData.matchDate,
      matchTime: formData.matchTime,
      venueId: formData.venueId || null,
      notes: formData.notes,
      participants: [
        { clubId: formData.club1Id },
        { clubId: formData.club2Id },
      ],
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

  const handleOpenReview = (match: any) => {
    setSelectedMatch(match);
    const pendingResult = match.results?.find((r: any) => r.status === 'PENDING_APPROVAL') || match.results?.[0];
    setReviewResult(pendingResult);

    let defaultPoints = 3;
    try {
      if (match.sport?.scoringConfig) {
        defaultPoints = JSON.parse(match.sport.scoringConfig).win || 3;
      }
    } catch (e) {}
    setOverridePoints(defaultPoints);
    setRejectionReason('');
    setIsReviewModalOpen(true);
  };

  const handleApproveResult = async () => {
    if (!selectedMatch) return;
    try {
      const res = await fetch(`/api/matches/${selectedMatch.id}/approve-result`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'APPROVE',
          resultId: reviewResult?.id,
          overridePoints,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSuccess('Match result approved, points awarded, and leaderboards updated!');
      setIsReviewModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleRejectResult = async () => {
    if (!selectedMatch) return;
    if (!rejectionReason) {
      alert('Please provide a reason for rejecting the result');
      return;
    }

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

      setSuccess('Result returned to referee for revision.');
      setIsReviewModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.message);
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
    const p1 = m.participants?.[0]?.club?.name || '';
    const p2 = m.participants?.[1]?.club?.name || '';
    return (
      m.matchCode.toLowerCase().includes(search.toLowerCase()) ||
      p1.toLowerCase().includes(search.toLowerCase()) ||
      p2.toLowerCase().includes(search.toLowerCase()) ||
      m.sport?.name.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold tracking-tight text-navy-950">Match & Fixture Management</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                {matches.length} Total Fixtures
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Schedule matches, assign venues & field referees, track live scores, and approve submitted outcomes.
            </p>
          </div>

          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-navy-900 hover:bg-navy-800 text-white text-xs font-bold rounded-lg shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            Schedule New Fixture
          </button>
        </div>

        {/* Alerts */}
        {success && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs font-semibold flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{success}</span>
            </span>
            <button onClick={() => setSuccess(null)} className="text-emerald-700 hover:text-emerald-900">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Filter Bar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
          <div className="relative flex-1 w-full md:max-w-xs">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by match code or clubs..."
              className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-1.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-700 focus:ring-2 focus:ring-blue-600 outline-none"
            >
              <option value="">All Tournament Dates</option>
              <option value="2026-11-25">Day 1: Nov 25, 2026</option>
              <option value="2026-11-26">Day 2: Nov 26, 2026</option>
              <option value="2026-11-27">Day 3: Nov 27, 2026</option>
              <option value="2026-11-28">Day 4: Nov 28, 2026</option>
            </select>

            <select
              value={selectedSport}
              onChange={(e) => setSelectedSport(e.target.value)}
              className="px-3 py-1.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-700 focus:ring-2 focus:ring-blue-600 outline-none"
            >
              <option value="">All Sports</option>
              {sports.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-1.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-700 focus:ring-2 focus:ring-blue-600 outline-none"
            >
              <option value="">All Statuses</option>
              <option value="SUBMITTED">AWAITING APPROVAL</option>
              <option value="IN_PROGRESS">IN PROGRESS</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="SCHEDULED">SCHEDULED</option>
              <option value="UPCOMING">UPCOMING</option>
              <option value="DISPUTED">DISPUTED</option>
            </select>
          </div>
        </div>

        {/* Fixtures Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Match Code</th>
                  <th className="py-3 px-4">Sport & Stage</th>
                  <th className="py-3 px-4">Participating Clubs</th>
                  <th className="py-3 px-4">Date & Venue</th>
                  <th className="py-3 px-4">Referees</th>
                  <th className="py-3 px-4 text-center">Score / Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMatches.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      No matches found for the selected criteria.
                    </td>
                  </tr>
                ) : (
                  filteredMatches.map((m) => {
                    const p1 = m.participants?.[0];
                    const p2 = m.participants?.[1];

                    return (
                      <tr key={m.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3.5 px-4 font-mono font-bold text-blue-600">
                          {m.matchCode}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5">
                            <SportIcon name={m.sport?.name} className="w-4 h-4 text-navy-800" />
                            <span className="font-bold text-slate-900">{m.sport?.name}</span>
                          </div>
                          <span className="text-[11px] text-slate-400 block mt-0.5">{m.round}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="space-y-1">
                            <div className="flex items-center justify-between gap-4 font-bold text-slate-800">
                              <span className="flex items-center gap-1.5">
                                <ClubBadge code={p1?.club?.code} name={p1?.club?.name} className="w-4 h-4" />
                                <span>{p1?.club?.name || p1?.teamName || 'TBD'}</span>
                              </span>
                              <span className="font-mono text-sm px-1.5 py-0.5 rounded bg-slate-100">
                                {p1?.score ?? 0}
                              </span>
                            </div>
                            <div className="flex items-center justify-between gap-4 font-bold text-slate-800">
                              <span className="flex items-center gap-1.5">
                                <ClubBadge code={p2?.club?.code} name={p2?.club?.name} className="w-4 h-4" />
                                <span>{p2?.club?.name || p2?.teamName || 'TBD'}</span>
                              </span>
                              <span className="font-mono text-sm px-1.5 py-0.5 rounded bg-slate-100">
                                {p2?.score ?? 0}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-slate-800 flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>{m.matchDate} at {m.matchTime}</span>
                          </span>
                          <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            <span>{m.venue?.name || 'Main Grounds'}</span>
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="space-y-0.5">
                            {m.referees?.map((r: any) => (
                              <span
                                key={r.id}
                                className="inline-block text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded"
                              >
                                {r.referee?.name}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {m.status === 'COMPLETED' ? (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              COMPLETED
                            </span>
                          ) : m.status === 'SUBMITTED' ? (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
                              AWAITING REVIEW
                            </span>
                          ) : m.status === 'IN_PROGRESS' ? (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              LIVE IN PROGRESS
                            </span>
                          ) : m.status === 'DISPUTED' ? (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-100 text-red-800 border border-red-300">
                              DISPUTED
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600">
                              {m.status}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {m.status === 'SUBMITTED' && (
                              <button
                                onClick={() => handleOpenReview(m)}
                                className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] rounded shadow-xs flex items-center gap-1 transition"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Review Result
                              </button>
                            )}

                            {m.status === 'COMPLETED' && (
                              <button
                                onClick={() => handleOpenReview(m)}
                                title="View Result History"
                                className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            )}

                            <button
                              onClick={() => handleDeleteMatch(m.id, m.matchCode)}
                              title="Delete Fixture"
                              className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-md transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: Schedule Fixture */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 bg-navy-950/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in duration-200">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-navy-900 text-white">
                <h3 className="font-bold text-sm">Schedule Tournament Match Fixture</h3>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="p-1 text-slate-300 hover:text-white rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {error && (
                <div className="m-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg font-medium">
                  {error}
                </div>
              )}

              <form onSubmit={handleCreateSubmit} className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Sport Discipline *
                  </label>
                  <select
                    required
                    value={formData.sportId}
                    onChange={(e) => setFormData({ ...formData, sportId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-600 outline-none"
                  >
                    {sports.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.sportType})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Tournament Round *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.round}
                      onChange={(e) => setFormData({ ...formData, round: e.target.value })}
                      placeholder="e.g. Quarterfinal 1, League Match 3"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Stage / Group
                    </label>
                    <input
                      type="text"
                      value={formData.stageName}
                      onChange={(e) => setFormData({ ...formData, stageName: e.target.value })}
                      placeholder="Group A, Knockout"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                    />
                  </div>
                </div>

                {/* Participating Clubs */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <span className="font-bold text-slate-800 uppercase tracking-wider block text-[11px]">
                    Participating Competitors / Clubs *
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] text-slate-500 font-semibold mb-1">Club 1</label>
                      <select
                        required
                        value={formData.club1Id}
                        onChange={(e) => setFormData({ ...formData, club1Id: e.target.value })}
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded bg-white"
                      >
                        {clubs.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 font-semibold mb-1">Club 2</label>
                      <select
                        required
                        value={formData.club2Id}
                        onChange={(e) => setFormData({ ...formData, club2Id: e.target.value })}
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded bg-white"
                      >
                        {clubs.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Match Date (Nov 25 - 28) *
                    </label>
                    <select
                      value={formData.matchDate}
                      onChange={(e) => setFormData({ ...formData, matchDate: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-600 outline-none"
                    >
                      <option value="2026-11-25">2026-11-25 (Day 1)</option>
                      <option value="2026-11-26">2026-11-26 (Day 2)</option>
                      <option value="2026-11-27">2026-11-27 (Day 3)</option>
                      <option value="2026-11-28">2026-11-28 (Finals Day 4)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Match Time *
                    </label>
                    <input
                      type="time"
                      required
                      value={formData.matchTime}
                      onChange={(e) => setFormData({ ...formData, matchTime: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Venue
                    </label>
                    <select
                      value={formData.venueId}
                      onChange={(e) => setFormData({ ...formData, venueId: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-600 outline-none"
                    >
                      {venues.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Assign Referee
                    </label>
                    <select
                      value={formData.refereeId}
                      onChange={(e) => setFormData({ ...formData, refereeId: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-600 outline-none"
                    >
                      <option value="">Select Field Official</option>
                      {referees.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name} ({r.refereeCode})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-navy-900 text-white font-bold rounded-lg hover:bg-navy-800 shadow-sm"
                  >
                    Generate Fixture
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Result Review & Approval Workflow */}
        {isReviewModalOpen && selectedMatch && (
          <div className="fixed inset-0 z-50 bg-navy-950/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in duration-200">
              <div className="p-5 bg-navy-900 text-white flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm">Review Match Outcome: {selectedMatch.matchCode}</h3>
                  <span className="text-xs text-blue-300">
                    {selectedMatch.sport?.name} • {selectedMatch.round}
                  </span>
                </div>
                <button
                  onClick={() => setIsReviewModalOpen(false)}
                  className="p-1 text-slate-300 hover:text-white rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4 text-xs">
                {/* Score Summary Box */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                    Submitted Scores
                  </span>
                  <div className="flex items-center justify-center gap-6 my-2">
                    <div className="text-center">
                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center mx-auto mb-1">
                        <ClubBadge code={selectedMatch.participants?.[0]?.club?.code} name={selectedMatch.participants?.[0]?.club?.name} className="w-6 h-6" />
                      </div>
                      <span className="font-bold text-xs text-slate-800 block">
                        {selectedMatch.participants?.[0]?.club?.name}
                      </span>
                      <span className="text-2xl font-extrabold text-navy-950">
                        {selectedMatch.participants?.[0]?.score}
                      </span>
                    </div>

                    <span className="text-slate-300 font-bold text-xl">VS</span>

                    <div className="text-center">
                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center mx-auto mb-1">
                        <ClubBadge code={selectedMatch.participants?.[1]?.club?.code} name={selectedMatch.participants?.[1]?.club?.name} className="w-6 h-6" />
                      </div>
                      <span className="font-bold text-xs text-slate-800 block">
                        {selectedMatch.participants?.[1]?.club?.name}
                      </span>
                      <span className="text-2xl font-extrabold text-navy-950">
                        {selectedMatch.participants?.[1]?.score}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs font-semibold text-slate-700 mt-2">
                    {reviewResult?.scoresSummary}
                  </p>
                </div>

                {/* Referee Observations */}
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                    Referee Observations & Notes
                  </span>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-700 italic">
                    "{reviewResult?.refereeNotes || selectedMatch.notes || 'No match incident notes recorded.'}"
                  </div>
                </div>

                {/* Points to allocate */}
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="font-bold text-emerald-900 block">Championship Points Allocation</span>
                    <span className="text-[11px] text-emerald-700">Points will be awarded to winner & standings updated</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      value={overridePoints}
                      onChange={(e) => setOverridePoints(parseInt(e.target.value) || 0)}
                      className="w-16 px-2 py-1 bg-white border border-emerald-300 rounded text-center font-bold text-xs text-emerald-900"
                    />
                    <span className="font-bold text-emerald-800">pts</span>
                  </div>
                </div>

                {/* Rejection input if needed */}
                <div>
                  <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">
                    Rejection / Dispute Reason (Required only if rejecting)
                  </label>
                  <input
                    type="text"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="e.g. Score discrepancy on set 2, please re-verify"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleRejectResult}
                  className="px-3.5 py-2 border border-red-200 text-red-700 hover:bg-red-50 font-bold rounded-lg text-xs"
                >
                  Reject & Request Revision
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsReviewModalOpen(false)}
                    className="px-3 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-100 text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleApproveResult}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs shadow-sm flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    Verify & Award Points
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

