'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import {
  Shield,
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  Trophy,
  Users,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  X,
  Medal,
  Sparkles,
} from 'lucide-react';
import { ClubBadge } from '@/components/ui/icons';

export default function ClubsPage() {
  const [clubs, setClubs] = useState<any[]>([]);
  const [cricketTeams, setCricketTeams] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'HOUSES' | 'CRICKET'>('HOUSES');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedClub, setSelectedClub] = useState<any | null>(null);
  const [clubDetails, setClubDetails] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    logoUrl: '',
    captainName: '',
    viceCaptainName: '',
    status: 'ACTIVE',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [clubsRes, crickRes] = await Promise.all([
        fetch('/api/clubs'),
        fetch('/api/cricket-teams'),
      ]);
      const [clubsData, crickData] = await Promise.all([
        clubsRes.json(),
        crickRes.json(),
      ]);
      setClubs(Array.isArray(clubsData) ? clubsData : []);
      setCricketTeams(Array.isArray(crickData) ? crickData : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setSelectedClub(null);
    setFormData({
      name: '',
      code: '',
      logoUrl: '',
      captainName: '',
      viceCaptainName: '',
      status: 'ACTIVE',
    });
    setError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (club: any) => {
    setSelectedClub(club);
    setFormData({
      name: club.name,
      code: club.code,
      logoUrl: club.logoUrl || '',
      captainName: club.captainName || '',
      viceCaptainName: club.viceCaptainName || '',
      status: club.status,
    });
    setError(null);
    setIsModalOpen(true);
  };

  const handleOpenView = async (club: any) => {
    try {
      const res = await fetch(`/api/clubs/${club.id}`);
      const data = await res.json();
      setClubDetails(data);
      setIsViewModalOpen(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const url = selectedClub ? `/api/clubs/${selectedClub.id}` : '/api/clubs';
      const method = selectedClub ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save club');
      }

      setSuccess(selectedClub ? 'Club updated successfully!' : 'New club created successfully!');
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/clubs/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to delete club');
        return;
      }
      setSuccess('Club deleted successfully');
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filteredClubs = clubs.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      (c.captainName && c.captainName.toLowerCase().includes(search.toLowerCase()))
  );

  const filteredCricketTeams = cricketTeams.filter(
    (ct) =>
      ct.name.toLowerCase().includes(search.toLowerCase()) ||
      (ct.club?.name && ct.club.name.toLowerCase().includes(search.toLowerCase())) ||
      (ct.captainName && ct.captainName.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold tracking-tight text-navy-950">Houses & Cricket Teams</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                5 Houses • 10 Cricket Teams
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Manage the 5 participating houses and their respective A & B cricket teams. Points earned by cricket teams roll up directly to their parent house.
            </p>
          </div>

          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2 bg-navy-950 hover:bg-navy-900 text-white text-xs font-bold rounded-xl shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            Add New House
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

        {/* Tab & Search Bar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab('HOUSES')}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                activeTab === 'HOUSES'
                  ? 'bg-navy-950 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              The 5 Houses ({clubs.length})
            </button>
            <button
              onClick={() => setActiveTab('CRICKET')}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                activeTab === 'CRICKET'
                  ? 'bg-navy-950 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Cricket Teams ({cricketTeams.length} Teams)
            </button>
          </div>

          <div className="relative flex-1 max-w-xs w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search house, code, or captain..."
              className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
            />
          </div>
        </div>

        {/* Tab 1: The 5 Houses */}
        {activeTab === 'HOUSES' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Rank</th>
                    <th className="py-3 px-4">House Name</th>
                    <th className="py-3 px-4">Code</th>
                    <th className="py-3 px-4">Captain / Vice</th>
                    <th className="py-3 px-4 text-center">Cricket Teams</th>
                    <th className="py-3 px-4 text-right">Total Points</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredClubs.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400 text-xs">
                        No houses found.
                      </td>
                    </tr>
                  ) : (
                    filteredClubs.map((club, idx) => (
                      <tr key={club.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3.5 px-4 font-bold text-slate-700">
                          <span
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                              idx === 0
                                ? 'bg-amber-400 text-navy-950 font-black'
                                : idx === 1
                                ? 'bg-slate-200 text-slate-800'
                                : idx === 2
                                ? 'bg-amber-100 text-amber-900'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            #{idx + 1}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                              <ClubBadge code={club.code} name={club.name} className="w-5 h-5" />
                            </div>
                            <div>
                              <span className="font-bold text-slate-900 block text-sm">{club.name}</span>
                              <span className="text-[11px] text-slate-400">House Official</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-blue-600">
                          {club.code}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-800">{club.captainName || 'Not assigned'}</div>
                          <div className="text-[11px] text-slate-400">Vice: {club.viceCaptainName || 'None'}</div>
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold text-slate-700">
                          <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[11px] border border-blue-200">
                            {club.name} A & B (2 Teams)
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <span className="text-sm font-black text-navy-950 font-mono bg-slate-100 px-2.5 py-1 rounded-md">
                            {Number(club.totalPoints || 0).toFixed(2)} pts
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {club.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenView(club)}
                              title="View House Profile"
                              className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleOpenEdit(club)}
                              title="Edit House"
                              className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-md transition"
                            >
                              <Edit2 className="w-4 h-4" />
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
        )}

        {/* Tab 2: 10 Cricket Teams */}
        {activeTab === 'CRICKET' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-navy-950 uppercase tracking-wider block">
                  The 10 Official Cricket Teams (2 Per House)
                </span>
                <span className="text-[11px] text-slate-500">
                  Each cricket team participates separately in fixtures, but points earned credit the parent house.
                </span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Cricket Team Name</th>
                    <th className="py-3 px-4">Parent House</th>
                    <th className="py-3 px-4">Captain</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Points Rollup Target</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCricketTeams.map((ct) => (
                    <tr key={ct.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4 font-bold text-slate-900 text-sm">
                        {ct.name}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <ClubBadge code={ct.club?.code} name={ct.club?.name} className="w-4 h-4" />
                          <span className="font-extrabold text-blue-700">{ct.club?.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-medium">
                        {ct.captainName || 'Assigned per fixture'}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {ct.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-[11px] text-slate-500">
                        Credits <strong>{ct.club?.name}</strong> Leaderboard
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* House Creation / Edit Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-navy-950/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in">
              <div className="p-5 bg-navy-900 text-white flex items-center justify-between">
                <h3 className="font-bold text-sm">
                  {selectedClub ? `Edit House: ${selectedClub.name}` : 'Create New House'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-white rounded">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg font-semibold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">House Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Mavericks"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">House Code *</label>
                    <input
                      type="text"
                      required
                      maxLength={4}
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      placeholder="e.g. MAV"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono uppercase outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-600"
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="INACTIVE">Inactive</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">House Captain</label>
                  <input
                    type="text"
                    value={formData.captainName}
                    onChange={(e) => setFormData({ ...formData, captainName: e.target.value })}
                    placeholder="e.g. Alex Rivera"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-navy-950 hover:bg-navy-900 text-white font-bold rounded-lg shadow-sm"
                  >
                    {selectedClub ? 'Save Changes' : 'Create House'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
