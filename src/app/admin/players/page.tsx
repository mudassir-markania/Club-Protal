'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import {
  Users,
  Plus,
  Search,
  Filter,
  Download,
  Edit2,
  Trash2,
  Eye,
  Shield,
  Medal,
  CheckCircle2,
  XCircle,
  X,
  FileSpreadsheet,
} from 'lucide-react';
import { ClubBadge, SportIcon } from '@/components/ui/icons';

export default function PlayersPage() {
  const [players, setPlayers] = useState<any[]>([]);
  const [clubs, setClubs] = useState<any[]>([]);
  const [sports, setSports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedClubFilter, setSelectedClubFilter] = useState('');
  const [selectedSportFilter, setSelectedSportFilter] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    registrationId: '',
    email: '',
    phone: '',
    gender: 'MALE',
    age: 22,
    clubId: '',
    teamName: '',
    status: 'APPROVED',
    paymentStatus: 'PAID',
    sportIds: [] as string[],
  });

  useEffect(() => {
    fetchData();
  }, [selectedClubFilter, selectedSportFilter, selectedStatusFilter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedClubFilter) params.append('clubId', selectedClubFilter);
      if (selectedSportFilter) params.append('sportId', selectedSportFilter);
      if (selectedStatusFilter) params.append('status', selectedStatusFilter);

      const [playersRes, clubsRes, sportsRes] = await Promise.all([
        fetch(`/api/players?${params.toString()}`),
        fetch('/api/clubs'),
        fetch('/api/sports'),
      ]);

      const playersData = await playersRes.json();
      const clubsData = await clubsRes.json();
      const sportsData = await sportsRes.json();

      setPlayers(Array.isArray(playersData) ? playersData : []);
      setClubs(Array.isArray(clubsData) ? clubsData : []);
      setSports(Array.isArray(sportsData) ? sportsData : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setSelectedPlayer(null);
    setFormData({
      name: '',
      registrationId: '',
      email: '',
      phone: '',
      gender: 'MALE',
      age: 22,
      clubId: clubs[0]?.id || '',
      teamName: '',
      status: 'APPROVED',
      paymentStatus: 'PAID',
      sportIds: [],
    });
    setError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (player: any) => {
    setSelectedPlayer(player);
    const assignedSports = player.sports?.map((s: any) => s.sportId || s.sport?.id) || [];
    setFormData({
      name: player.name,
      registrationId: player.registrationId,
      email: player.email,
      phone: player.phone || '',
      gender: player.gender || 'MALE',
      age: player.age || 22,
      clubId: player.clubId,
      teamName: player.teamName || '',
      status: player.status,
      paymentStatus: player.paymentStatus,
      sportIds: assignedSports,
    });
    setError(null);
    setIsModalOpen(true);
  };

  const handleOpenView = (player: any) => {
    setSelectedPlayer(player);
    setIsViewModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const url = selectedPlayer ? `/api/players/${selectedPlayer.id}` : '/api/players';
      const method = selectedPlayer ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save player');
      }

      setSuccess(selectedPlayer ? 'Player profile updated!' : 'Player registered successfully!');
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete participant "${name}"?`)) return;

    try {
      const res = await fetch(`/api/players/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to delete');
        return;
      }
      setSuccess('Participant record removed');
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const toggleSport = (sportId: string) => {
    if (formData.sportIds.includes(sportId)) {
      setFormData({
        ...formData,
        sportIds: formData.sportIds.filter((id) => id !== sportId),
      });
    } else {
      setFormData({
        ...formData,
        sportIds: [...formData.sportIds, sportId],
      });
    }
  };

  const exportCSV = () => {
    window.open('/api/reports/export?type=players&format=csv', '_blank');
  };

  const filteredPlayers = players.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.registrationId.toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase()) ||
      (p.club?.name && p.club.name.toLowerCase().includes(search.toLowerCase()));

    return matchSearch;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold tracking-tight text-navy-950">Player & Participant Roster</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                {players.length} Registered Athletes
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Manage participant records, multi-sport assignments, club affiliations, and eligibility.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportCSV}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg shadow-2xs transition"
            >
              <Download className="w-4 h-4 text-slate-400" />
              Export Roster (CSV)
            </button>
            <button
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-navy-900 hover:bg-navy-800 text-white text-xs font-bold rounded-lg shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              Add Participant
            </button>
          </div>
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

        {/* Filter Controls */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
          <div className="relative flex-1 w-full md:max-w-xs">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, ID, or email..."
              className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
            <select
              value={selectedClubFilter}
              onChange={(e) => setSelectedClubFilter(e.target.value)}
              className="px-3 py-1.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-700 focus:ring-2 focus:ring-blue-600 outline-none"
            >
              <option value="">All Clubs</option>
              {clubs.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <select
              value={selectedSportFilter}
              onChange={(e) => setSelectedSportFilter(e.target.value)}
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
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="px-3 py-1.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-700 focus:ring-2 focus:ring-blue-600 outline-none"
            >
              <option value="">All Statuses</option>
              <option value="APPROVED">APPROVED</option>
              <option value="PENDING">PENDING</option>
              <option value="REJECTED">REJECTED</option>
            </select>
          </div>
        </div>

        {/* Players Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Reg ID</th>
                  <th className="py-3 px-4">Participant Name</th>
                  <th className="py-3 px-4">Assigned Club</th>
                  <th className="py-3 px-4">Participating Sports</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPlayers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      No participants match the selected filters.
                    </td>
                  </tr>
                ) : (
                  filteredPlayers.map((player) => (
                    <tr key={player.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4 font-mono font-bold text-blue-600">
                        {player.registrationId}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 block text-xs">{player.name}</span>
                        <span className="text-[11px] text-slate-400">
                          {player.gender} • Age {player.age || 'N/A'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <ClubBadge code={player.club?.code} name={player.club?.name} className="w-4 h-4 shrink-0" />
                          <span className="font-bold text-slate-800">{player.club?.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {player.sports?.map((s: any) => (
                            <span
                              key={s.id}
                              className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700"
                            >
                              {s.sport?.name}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        <span className="block truncate max-w-xs">{player.email}</span>
                        <span className="text-[10px] text-slate-400">{player.phone || 'No phone'}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            player.status === 'APPROVED'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {player.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenView(player)}
                            title="View Profile"
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(player)}
                            title="Edit Participant"
                            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-md transition"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(player.id, player.name)}
                            title="Delete Participant"
                            className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-md transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: Add / Edit Participant */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-navy-950/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in duration-200">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-navy-900 text-white">
                <h3 className="font-bold text-sm">
                  {selectedPlayer ? `Edit Participant: ${selectedPlayer.name}` : 'Register New Participant'}
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
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Marcus Vance"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Registration ID (Auto if blank)
                    </label>
                    <input
                      type="text"
                      value={formData.registrationId}
                      onChange={(e) => setFormData({ ...formData, registrationId: e.target.value })}
                      placeholder="e.g. REG-APX-01"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono focus:ring-2 focus:ring-blue-600 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="player@example.com"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Contact Phone
                    </label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+1 555-0192"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Club Affiliation *
                    </label>
                    <select
                      required
                      value={formData.clubId}
                      onChange={(e) => setFormData({ ...formData, clubId: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-600 outline-none"
                    >
                      <option value="">Select Club</option>
                      {clubs.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.code})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Gender
                    </label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-600 outline-none"
                    >
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Age
                    </label>
                    <input
                      type="number"
                      min={10}
                      max={70}
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 20 })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                    />
                  </div>
                </div>

                {/* Multiple Sports Assignment */}
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Assign Participating Sports (Can participate in multiple sports)
                  </label>
                  <div className="grid grid-cols-2 gap-2 border border-slate-200 p-2.5 rounded-lg bg-slate-50 max-h-40 overflow-y-auto">
                    {sports.map((s) => {
                      const isSelected = formData.sportIds.includes(s.id);
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => toggleSport(s.id)}
                          className={`p-2 rounded-md border text-left flex items-center justify-between transition ${
                            isSelected
                              ? 'bg-blue-50 border-blue-400 text-blue-900 font-bold'
                              : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-1.5">
                            <SportIcon name={s.name} className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">{s.name}</span>
                          </div>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />}
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
                    {selectedPlayer ? 'Save Changes' : 'Register Player'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View Modal */}
        {isViewModalOpen && selectedPlayer && (
          <div className="fixed inset-0 z-50 bg-navy-950/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in duration-200">
              <div className="p-5 bg-navy-900 text-white flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm">{selectedPlayer.name}</h3>
                  <span className="text-[11px] font-mono text-blue-300">{selectedPlayer.registrationId}</span>
                </div>
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="p-1 text-slate-300 hover:text-white rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4 text-xs">
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 font-medium">Club Affiliation</span>
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <ClubBadge code={selectedPlayer.club?.code} name={selectedPlayer.club?.name} className="w-4 h-4" />
                    <span>{selectedPlayer.club?.name}</span>
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Email</span>
                    <span className="font-semibold text-slate-800 truncate block">{selectedPlayer.email}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Phone</span>
                    <span className="font-semibold text-slate-800">{selectedPlayer.phone || 'N/A'}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                    Participating Sports
                  </span>
                  <div className="space-y-1">
                    {selectedPlayer.sports?.map((s: any) => (
                      <div
                        key={s.id}
                        className="p-2 rounded bg-slate-50 border border-slate-200 flex items-center justify-between"
                      >
                        <span className="font-bold text-slate-800">{s.sport?.name}</span>
                        <span className="text-[10px] text-slate-400">{s.sport?.sportType}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-200 text-right">
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="px-4 py-2 bg-navy-900 text-white font-bold rounded-lg text-xs"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

