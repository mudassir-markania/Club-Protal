'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import {
  Medal,
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  UserCheck,
  Settings,
  Users,
  Calendar,
  X,
  CheckCircle2,
} from 'lucide-react';
import { SportIcon, MedalBadge } from '@/components/ui/icons';

export default function SportsPage() {
  const [sports, setSports] = useState<any[]>([]);
  const [referees, setReferees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSport, setSelectedSport] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    category: 'OutDoor',
    icon: '',
    sportType: 'TEAM', // INDIVIDUAL, TEAM, DOUBLES
    genderCategory: 'OPEN',
    maxParticipants: 11,
    tournamentFormat: 'LEAGUE', // KNOCKOUT, LEAGUE, ROUND_ROBIN, GROUP_STAGE
    numRounds: 3,
    winPoints: 3,
    drawPoints: 1,
    lossPoints: 0,
    firstPlacePoints: 30,
    secondPlacePoints: 20,
    thirdPlacePoints: 10,
    assignedRefereeIds: [] as string[],
    status: 'ACTIVE',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sportsRes, refRes] = await Promise.all([
        fetch('/api/sports'),
        fetch('/api/referees'),
      ]);
      const sportsData = await sportsRes.json();
      const refData = await refRes.json();

      setSports(Array.isArray(sportsData) ? sportsData : []);
      setReferees(Array.isArray(refData) ? refData : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setSelectedSport(null);
    setFormData({
      name: '',
      category: 'OutDoor',
      icon: 'football',
      sportType: 'TEAM',
      genderCategory: 'OPEN',
      maxParticipants: 11,
      tournamentFormat: 'LEAGUE',
      numRounds: 3,
      winPoints: 3,
      drawPoints: 1,
      lossPoints: 0,
      firstPlacePoints: 30,
      secondPlacePoints: 20,
      thirdPlacePoints: 10,
      assignedRefereeIds: [],
      status: 'ACTIVE',
    });
    setError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (sport: any) => {
    setSelectedSport(sport);
    let win = 3, draw = 1, loss = 0;
    try {
      if (sport.scoringConfig) {
        const sc = JSON.parse(sport.scoringConfig);
        win = sc.win ?? 3;
        draw = sc.draw ?? 1;
        loss = sc.loss ?? 0;
      }
    } catch (e) {}

    let first = 30, second = 20, third = 10;
    try {
      if (sport.pointsDistribution) {
        const pd = JSON.parse(sport.pointsDistribution);
        first = pd.first ?? 30;
        second = pd.second ?? 20;
        third = pd.third ?? 10;
      }
    } catch (e) {}

    const assignedRefIds = sport.referees?.map((r: any) => r.refereeId || r.referee?.id) || [];

    setFormData({
      name: sport.name,
      category: sport.category,
      icon: sport.icon || 'football',
      sportType: sport.sportType,
      genderCategory: sport.genderCategory,
      maxParticipants: sport.maxParticipants,
      tournamentFormat: sport.tournamentFormat,
      numRounds: sport.numRounds,
      winPoints: win,
      drawPoints: draw,
      lossPoints: loss,
      firstPlacePoints: first,
      secondPlacePoints: second,
      thirdPlacePoints: third,
      assignedRefereeIds: assignedRefIds,
      status: sport.status,
    });
    setError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const payload = {
      name: formData.name,
      category: formData.category,
      icon: formData.icon,
      sportType: formData.sportType,
      genderCategory: formData.genderCategory,
      maxParticipants: formData.maxParticipants,
      tournamentFormat: formData.tournamentFormat,
      numRounds: formData.numRounds,
      status: formData.status,
      scoringConfig: {
        win: Number(formData.winPoints),
        draw: Number(formData.drawPoints),
        loss: Number(formData.lossPoints),
      },
      pointsDistribution: {
        first: Number(formData.firstPlacePoints),
        second: Number(formData.secondPlacePoints),
        third: Number(formData.thirdPlacePoints),
      },
      assignedRefereeIds: formData.assignedRefereeIds,
    };

    try {
      const url = selectedSport ? `/api/sports/${selectedSport.id}` : '/api/sports';
      const method = selectedSport ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save sport');
      }

      setSuccess(selectedSport ? 'Sport updated successfully!' : 'Sport created successfully!');
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      const res = await fetch(`/api/sports/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to delete sport');
        return;
      }
      setSuccess('Sport deleted successfully');
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const toggleRefereeAssignment = (refId: string) => {
    if (formData.assignedRefereeIds.includes(refId)) {
      setFormData({
        ...formData,
        assignedRefereeIds: formData.assignedRefereeIds.filter((id) => id !== refId),
      });
    } else {
      setFormData({
        ...formData,
        assignedRefereeIds: [...formData.assignedRefereeIds, refId],
      });
    }
  };

  const filteredSports = sports.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.category.toLowerCase().includes(search.toLowerCase()) ||
      s.sportType.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold tracking-tight text-navy-950">Sports & Game Disciplines</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                {sports.length} Active Sports
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Configure tournament formats (Knockout, League, Doubles), points distribution, scoring rules, and assigned referees.
            </p>
          </div>

          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-navy-900 hover:bg-navy-800 text-white text-xs font-bold rounded-lg shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            Add New Sport
          </button>
        </div>

        {/* Notifications */}
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

        {/* Filters */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by sport name, category, or type..."
              className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
            />
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Showing {filteredSports.length} of {sports.length} disciplines
          </span>
        </div>

        {/* Sports Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSports.map((sport) => {
            let sc = { win: 3, draw: 1, loss: 0 };
            try {
              if (sport.scoringConfig) sc = JSON.parse(sport.scoringConfig);
            } catch (e) {}

            let pd = { first: 30, second: 20, third: 10 };
            try {
              if (sport.pointsDistribution) pd = JSON.parse(sport.pointsDistribution);
            } catch (e) {}

            return (
              <div
                key={sport.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between hover:shadow-md transition"
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-navy-800 flex items-center justify-center">
                        <SportIcon name={sport.name} className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-navy-950">{sport.name}</h3>
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                          {sport.category} • {sport.genderCategory}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        sport.sportType === 'TEAM'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : sport.sportType === 'DOUBLES'
                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {sport.sportType}
                    </span>
                  </div>

                  {/* Sport Details Grid */}
                  <div className="grid grid-cols-2 gap-2 my-3 p-3 bg-slate-50 rounded-xl text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Format</span>
                      <span className="font-bold text-slate-800">{sport.tournamentFormat}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Max Participants</span>
                      <span className="font-bold text-slate-800">{sport.maxParticipants} per side</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Match Scoring</span>
                      <span className="font-bold text-blue-700">W:{sc.win} / D:{sc.draw} / L:{sc.loss}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Podium Points</span>
                      <span className="font-bold text-amber-700 flex items-center gap-1.5 mt-0.5">
                        <span className="inline-flex items-center gap-0.5"><MedalBadge type="gold" className="w-3 h-3" />{pd.first}</span>
                        <span className="inline-flex items-center gap-0.5"><MedalBadge type="silver" className="w-3 h-3" />{pd.second}</span>
                        <span className="inline-flex items-center gap-0.5"><MedalBadge type="bronze" className="w-3 h-3" />{pd.third}</span>
                      </span>
                    </div>
                  </div>

                  {/* Assigned Referees */}
                  <div className="mt-3">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                      Assigned Officials ({sport.referees?.length || 0})
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {sport.referees?.length === 0 ? (
                        <span className="text-xs text-slate-400 italic">No referees assigned</span>
                      ) : (
                        sport.referees?.map((r: any) => (
                          <span
                            key={r.id}
                            className="inline-flex items-center gap-1 text-[11px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md"
                          >
                            <UserCheck className="w-3 h-3 text-slate-400" />
                            {r.referee?.name}
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1 font-semibold text-slate-700">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      {sport._count?.players || 0} players
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-slate-700">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {sport._count?.matches || 0} fixtures
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(sport)}
                      title="Edit Rules & Officials"
                      className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-md transition"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(sport.id, sport.name)}
                      title="Delete Sport"
                      className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-md transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal: Add / Edit Sport */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-navy-950/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in duration-200">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-navy-900 text-white">
                <h3 className="font-bold text-sm">
                  {selectedSport ? `Configure Sport: ${selectedSport.name}` : 'Register New Sport'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
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

              <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Sport Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Football, Cricket, Badminton"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-600 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-600 outline-none bg-white"
                    >
                      <option value="OutDoor">OutDoor</option>
                      <option value="Indoor">Indoor</option>
                      <option value="Racquet">Racquet</option>
                      <option value="Athletics">Athletics</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Sport Type *
                    </label>
                    <select
                      value={formData.sportType}
                      onChange={(e) => setFormData({ ...formData, sportType: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-600 outline-none bg-white"
                    >
                      <option value="TEAM">TEAM</option>
                      <option value="INDIVIDUAL">INDIVIDUAL</option>
                      <option value="DOUBLES">DOUBLES</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Gender Category
                    </label>
                    <select
                      value={formData.genderCategory}
                      onChange={(e) => setFormData({ ...formData, genderCategory: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-600 outline-none bg-white"
                    >
                      <option value="OPEN">OPEN</option>
                      <option value="MALE">MALE</option>
                      <option value="FEMALE">FEMALE</option>
                      <option value="MIXED">MIXED</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Icon Name / Code
                    </label>
                    <input
                      type="text"
                      value={formData.icon}
                      onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                      placeholder="football, cricket, badminton, etc."
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-600 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Tournament Format *
                    </label>
                    <select
                      value={formData.tournamentFormat}
                      onChange={(e) => setFormData({ ...formData, tournamentFormat: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-600 outline-none bg-white"
                    >
                      <option value="KNOCKOUT">KNOCKOUT</option>
                      <option value="LEAGUE">LEAGUE</option>
                      <option value="ROUND_ROBIN">ROUND ROBIN</option>
                      <option value="GROUP_STAGE">GROUP STAGE</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Max Participants
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={30}
                      value={formData.maxParticipants}
                      onChange={(e) => setFormData({ ...formData, maxParticipants: parseInt(e.target.value) || 1 })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-600 outline-none"
                    />
                  </div>
                </div>

                {/* Match Scoring Configuration */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <span className="font-bold text-slate-800 uppercase tracking-wider block text-[11px]">
                    Match Scoring Rules (Points awarded per match outcome)
                  </span>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] text-slate-500 font-semibold mb-1">Win Points</label>
                      <input
                        type="number"
                        value={formData.winPoints}
                        onChange={(e) => setFormData({ ...formData, winPoints: parseInt(e.target.value) || 0 })}
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded bg-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 font-semibold mb-1">Draw Points</label>
                      <input
                        type="number"
                        value={formData.drawPoints}
                        onChange={(e) => setFormData({ ...formData, drawPoints: parseInt(e.target.value) || 0 })}
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded bg-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 font-semibold mb-1">Loss Points</label>
                      <input
                        type="number"
                        value={formData.lossPoints}
                        onChange={(e) => setFormData({ ...formData, lossPoints: parseInt(e.target.value) || 0 })}
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded bg-white text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Tournament Placement Points */}
                <div className="p-3 bg-amber-50/50 border border-amber-200 rounded-xl space-y-2">
                  <span className="font-bold text-amber-900 uppercase tracking-wider block text-[11px]">
                    Overall Championship Points (Medal distribution)
                  </span>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-[10px] text-amber-800 font-semibold mb-1 flex items-center gap-1">
                        <MedalBadge type="gold" className="w-3 h-3" /> 1st (Gold)
                      </label>
                      <input
                        type="number"
                        value={formData.firstPlacePoints}
                        onChange={(e) => setFormData({ ...formData, firstPlacePoints: parseInt(e.target.value) || 0 })}
                        className="w-full px-2.5 py-1.5 border border-amber-200 rounded bg-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-amber-800 font-semibold mb-1 flex items-center gap-1">
                        <MedalBadge type="silver" className="w-3 h-3" /> 2nd (Silver)
                      </label>
                      <input
                        type="number"
                        value={formData.secondPlacePoints}
                        onChange={(e) => setFormData({ ...formData, secondPlacePoints: parseInt(e.target.value) || 0 })}
                        className="w-full px-2.5 py-1.5 border border-amber-200 rounded bg-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-amber-800 font-semibold mb-1 flex items-center gap-1">
                        <MedalBadge type="bronze" className="w-3 h-3" /> 3rd (Bronze)
                      </label>
                      <input
                        type="number"
                        value={formData.thirdPlacePoints}
                        onChange={(e) => setFormData({ ...formData, thirdPlacePoints: parseInt(e.target.value) || 0 })}
                        className="w-full px-2.5 py-1.5 border border-amber-200 rounded bg-white text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Assign Referees */}
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Authorized Referees
                  </label>
                  <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto border border-slate-200 p-2.5 rounded-lg bg-slate-50">
                    {referees.map((r) => {
                      const isAssigned = formData.assignedRefereeIds.includes(r.id);
                      return (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => toggleRefereeAssignment(r.id)}
                          className={`p-2 rounded-md border text-left flex items-center justify-between text-xs transition ${
                            isAssigned
                              ? 'bg-blue-50 border-blue-400 text-blue-900 font-bold'
                              : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                          }`}
                        >
                          <div>
                            <span className="block leading-tight">{r.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{r.refereeCode}</span>
                          </div>
                          {isAssigned && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-navy-900 text-white font-bold rounded-lg hover:bg-navy-800 shadow-sm"
                  >
                    {selectedSport ? 'Save Configuration' : 'Create Sport'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

