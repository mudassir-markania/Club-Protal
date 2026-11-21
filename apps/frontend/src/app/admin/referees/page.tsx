'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { usePreventScroll } from '@/hooks/usePreventScroll';
import {
  UserCheck,
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Lock,
  Medal,
  Calendar,
  CheckCircle2,
  XCircle,
  X,
  Shield,
  KeyRound,
} from 'lucide-react';
import { SportIcon } from '@/components/ui/icons';

export default function RefereesPage() {
  const [referees, setReferees] = useState<any[]>([]);
  const [sports, setSports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReferee, setSelectedReferee] = useState<any | null>(null);

  usePreventScroll(isModalOpen);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    refereeCode: '',
    email: '',
    phone: '',
    password: '',
    availability: 'AVAILABLE',
    status: 'ACTIVE',
    sportIds: [] as string[],
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [refRes, sportsRes] = await Promise.all([
        fetch('/api/referees'),
        fetch('/api/sports'),
      ]);
      const refData = await refRes.json();
      const sportsData = await sportsRes.json();

      setReferees(Array.isArray(refData) ? refData : []);
      setSports(Array.isArray(sportsData) ? sportsData : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setSelectedReferee(null);
    setShowPassword(false);
    setFormData({
      name: '',
      refereeCode: `REF-${Math.floor(100 + Math.random() * 900)}`,
      email: '',
      phone: '',
      password: 'marcus123',
      availability: 'AVAILABLE',
      status: 'ACTIVE',
      sportIds: [],
    });
    setError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (ref: any) => {
    setSelectedReferee(ref);
    setShowPassword(false);
    const assigned = ref.sports?.map((s: any) => s.sportId || s.sport?.id) || [];
    setFormData({
      name: ref.name,
      refereeCode: ref.refereeCode,
      email: ref.email,
      phone: ref.phone || '',
      password: '',
      availability: ref.availability,
      status: ref.status,
      sportIds: assigned,
    });
    setError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const url = selectedReferee ? `/api/referees/${selectedReferee.id}` : '/api/referees';
      const method = selectedReferee ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save referee');
      }

      setSuccess(selectedReferee ? 'Referee updated successfully!' : 'Referee registered with login access!');
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete referee "${name}" and revoke login credentials?`)) return;

    try {
      const res = await fetch(`/api/referees/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to delete referee');
        return;
      }
      setSuccess('Referee deleted successfully');
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

  const filteredReferees = referees.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.refereeCode.toLowerCase().includes(search.toLowerCase()) ||
      r.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold tracking-tight text-navy-950">Referee Management</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                {referees.length} Certified Officials
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Manage field officials, assigned sports, match oversight, and secure login credentials.
            </p>
          </div>

          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-navy-900 hover:bg-navy-800 text-white text-xs font-bold rounded-lg shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            Add New Referee
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

        {/* Filter */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search referee by name, code, or email..."
              className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
            />
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Showing {filteredReferees.length} of {referees.length} referees
          </span>
        </div>

        {/* Referee Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredReferees.map((ref) => (
            <div
              key={ref.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between hover:shadow-md transition"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-navy-900 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                      {ref.name[0]}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-navy-950">{ref.name}</h3>
                      <span className="text-[11px] font-mono text-blue-600 font-semibold">{ref.refereeCode}</span>
                    </div>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      ref.availability === 'AVAILABLE'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {ref.availability}
                  </span>
                </div>

                {/* Contact info */}
                <div className="space-y-1 my-3 text-xs text-slate-600">
                  <p className="flex items-center gap-2">
                    <span className="text-slate-400 font-medium">Email:</span> {ref.email}
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-slate-400 font-medium">Phone:</span> {ref.phone || 'N/A'}
                  </p>
                </div>

                {/* Assigned Sports */}
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                    Authorized Disciplines ({ref.sports?.length || 0})
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {ref.sports?.length === 0 ? (
                      <span className="text-xs text-slate-400 italic">None assigned</span>
                    ) : (
                      ref.sports?.map((s: any) => (
                        <span
                          key={s.id}
                          className="inline-flex items-center gap-1 text-[11px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded"
                        >
                          <SportIcon name={s.sport?.name} className="w-3 h-3 text-slate-500" />
                          <span>{s.sport?.name}</span>
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">
                  Matches Assigned: <strong className="text-navy-900">{ref._count?.matches || 0}</strong>
                  <span className="mx-1.5 text-slate-300">•</span>
                  Officiated: <strong className="text-navy-900">{ref._count?.officiated || 0}</strong>
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(ref)}
                    title="Edit Referee & Credentials"
                    className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-md transition"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(ref.id, ref.name)}
                    title="Delete Referee"
                    className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-md transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div
            className="fixed inset-0 !m-0 z-50 bg-navy-950/60 backdrop-blur-xs flex items-center justify-center p-4 overscroll-none touch-none"
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsModalOpen(false);
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
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-navy-900 text-white">
                <h3 className="font-bold text-sm">
                  {selectedReferee ? `Edit Official: ${selectedReferee.name}` : 'Register Referee & Login Account'}
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
                      Referee Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Marcus Sterling"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Referee Code *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.refereeCode}
                      onChange={(e) => setFormData({ ...formData, refereeCode: e.target.value })}
                      placeholder="e.g. REF-001"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono focus:ring-2 focus:ring-blue-600 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Email Address (Login) *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="referee@sportsportal.com"
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                      {selectedReferee ? 'Reset Password (Leave blank to keep)' : 'Portal Password *'}
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required={!selectedReferee}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="••••••••"
                        autoComplete="new-password"
                        className="w-full pl-3 pr-10 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        title={showPassword ? 'Hide password' : 'Show password'}
                        className="absolute inset-y-0 right-0 px-3 text-slate-400 hover:text-slate-700"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Availability
                    </label>
                    <select
                      value={formData.availability}
                      onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-600 outline-none"
                    >
                      <option value="AVAILABLE">AVAILABLE</option>
                      <option value="BUSY">BUSY</option>
                      <option value="UNAVAILABLE">UNAVAILABLE</option>
                    </select>
                  </div>
                </div>

                {/* Assigned Sports */}
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Authorized Sports (Referee can only officiate assigned sports)
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
                            <SportIcon name={s.name} className="w-3.5 h-3.5 text-slate-500 shrink-0" />
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
                    {selectedReferee ? 'Save Changes' : 'Create Referee Account'}
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

