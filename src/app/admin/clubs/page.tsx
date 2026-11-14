'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
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
} from 'lucide-react';
import { ClubBadge } from '@/components/ui/icons';

export default function ClubsPage() {
  const [clubs, setClubs] = useState<any[]>([]);
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
    fetchClubs();
  }, []);

  const fetchClubs = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/clubs');
      const data = await res.json();
      setClubs(Array.isArray(data) ? data : []);
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
      fetchClubs();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This action requires dependency checks.`)) {
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
      fetchClubs();
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

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold tracking-tight text-navy-950">Club Management</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                {clubs.length} Registered Clubs
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Manage participating clubs, team captains, member rosters, and cumulative point histories.
            </p>
          </div>

          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-navy-900 hover:bg-navy-800 text-white text-xs font-bold rounded-lg shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            Add New Club
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

        {/* Filters & Search */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search club name, code, or captain..."
              className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
            />
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Showing {filteredClubs.length} of {clubs.length} clubs
          </span>
        </div>

        {/* Clubs Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Rank</th>
                  <th className="py-3 px-4">Club</th>
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Captain / Vice</th>
                  <th className="py-3 px-4 text-center">Players</th>
                  <th className="py-3 px-4 text-center">Total Points</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredClubs.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400 text-xs">
                      No clubs found. Click "Add New Club" to register one.
                    </td>
                  </tr>
                ) : (
                  filteredClubs.map((club) => (
                    <tr key={club.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4 font-bold text-slate-700">
                        <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs">
                          {club.currentRank}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                            <ClubBadge code={club.code} name={club.name} className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block text-sm">{club.name}</span>
                            <span className="text-[11px] text-slate-400">Created {new Date(club.createdAt).toLocaleDateString()}</span>
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
                        {club._count?.players || 0}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="text-sm font-extrabold text-navy-950 bg-slate-100 px-2.5 py-1 rounded-md">
                          {club.totalPoints}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            club.status === 'ACTIVE'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          {club.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenView(club)}
                            title="View Club Profile & Roster"
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(club)}
                            title="Edit Club"
                            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-md transition"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(club.id, club.name)}
                            title="Delete Club"
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

        {/* Add/Edit Club Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-navy-950/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in duration-200">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-navy-900 text-white">
                <h3 className="font-bold text-sm">
                  {selectedClub ? `Edit Club: ${selectedClub.name}` : 'Register New Club'}
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

              <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Club Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Apex Predators"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-600 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Club Code (Unique) *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={5}
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      placeholder="e.g. APX"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono uppercase focus:ring-2 focus:ring-blue-600 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Club Crest Icon / Logo
                    </label>
                    <input
                      type="text"
                      value={formData.logoUrl}
                      onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                      placeholder="Icon identifier or image URL"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-600 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-600 outline-none bg-white"
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="INACTIVE">INACTIVE</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Captain Name
                    </label>
                    <input
                      type="text"
                      value={formData.captainName}
                      onChange={(e) => setFormData({ ...formData, captainName: e.target.value })}
                      placeholder="e.g. Alex Rivera"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-600 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Vice Captain Name
                    </label>
                    <input
                      type="text"
                      value={formData.viceCaptainName}
                      onChange={(e) => setFormData({ ...formData, viceCaptainName: e.target.value })}
                      placeholder="e.g. David Miller"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-600 outline-none"
                    />
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
                    {selectedClub ? 'Save Changes' : 'Create Club'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View Club Profile Modal */}
        {isViewModalOpen && clubDetails && (
          <div className="fixed inset-0 z-50 bg-navy-950/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in duration-200">
              {/* Header */}
              <div className="p-6 bg-navy-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center">
                    <ClubBadge code={clubDetails.code} name={clubDetails.name} className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold">{clubDetails.name}</h2>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-600 text-white">
                        {clubDetails.code}
                      </span>
                    </div>
                    <p className="text-xs text-blue-300">
                      Captain: {clubDetails.captainName || 'N/A'} • Vice: {clubDetails.viceCaptainName || 'N/A'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="p-1.5 text-slate-300 hover:text-white rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 overflow-y-auto space-y-6 text-xs flex-1">
                {/* Stats row */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Current Rank</span>
                    <span className="text-2xl font-extrabold text-navy-900">#{clubDetails.currentRank}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Total Points</span>
                    <span className="text-2xl font-extrabold text-blue-600">{clubDetails.totalPoints}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Registered Players</span>
                    <span className="text-2xl font-extrabold text-emerald-600">{clubDetails.players?.length || 0}</span>
                  </div>
                </div>

                {/* Player Roster */}
                <div>
                  <h4 className="font-bold text-navy-950 uppercase tracking-wider text-xs mb-3 flex items-center justify-between">
                    <span>Registered Player Roster ({clubDetails.players?.length || 0})</span>
                  </h4>
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                        <tr>
                          <th className="py-2 px-3">Reg ID</th>
                          <th className="py-2 px-3">Name</th>
                          <th className="py-2 px-3">Email</th>
                          <th className="py-2 px-3">Assigned Sports</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {clubDetails.players?.map((p: any) => (
                          <tr key={p.id} className="hover:bg-slate-50">
                            <td className="py-2 px-3 font-mono font-medium">{p.registrationId}</td>
                            <td className="py-2 px-3 font-bold text-slate-800">{p.name}</td>
                            <td className="py-2 px-3 text-slate-500">{p.email}</td>
                            <td className="py-2 px-3 text-blue-600">
                              {p.sports?.map((s: any) => s.sport.name).join(', ') || 'None'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Points Awarded History */}
                <div>
                  <h4 className="font-bold text-navy-950 uppercase tracking-wider text-xs mb-3">
                    Points Allocation Trail ({clubDetails.pointsHistory?.length || 0})
                  </h4>
                  <div className="space-y-2">
                    {clubDetails.pointsHistory?.length === 0 ? (
                      <p className="text-slate-400 italic">No points history recorded yet.</p>
                    ) : (
                      clubDetails.pointsHistory?.map((ph: any) => (
                        <div key={ph.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                          <div>
                            <span className="font-bold text-slate-800">{ph.reason}</span>
                            <span className="text-[10px] text-slate-400 block mt-0.5">
                              {new Date(ph.recordedAt).toLocaleString()} • {ph.sport?.name}
                            </span>
                          </div>
                          <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            +{ph.points} pts
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 text-right">
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="px-4 py-2 bg-navy-900 text-white font-bold rounded-lg hover:bg-navy-800 text-xs"
                >
                  Close Profile
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

