'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import {
  FileSpreadsheet,
  RefreshCw,
  Upload,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Search,
  Filter,
  Check,
  X,
  Clock,
  ArrowRight,
  Database,
  Link as LinkIcon,
  Eye,
  FileCheck,
  ClipboardList,
  BarChart2,
  Crown,
  Trophy,
} from 'lucide-react';

export default function RegistrationsPage() {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [clubs, setClubs] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
    duplicate: 0,
  });
  const [integration, setIntegration] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // CSV Import State
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [detectedHeaders, setDetectedHeaders] = useState<string[]>([]);
  const [fieldMapping, setFieldMapping] = useState<any>({
    fullName: '',
    email: '',
    phone: '',
    gender: '',
    age: '',
    clubPreference: '',
    sportsSelected: '',
  });
  const [importSummary, setImportSummary] = useState<any | null>(null);

  // Approve Modal
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [selectedReg, setSelectedReg] = useState<any | null>(null);
  const [selectedClubId, setSelectedClubId] = useState('');

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);

      const [regRes, clubsRes] = await Promise.all([
        fetch(`/api/registrations?${params.toString()}`),
        fetch('/api/clubs'),
      ]);

      const regData = await regRes.json();
      const clubsData = await clubsRes.json();

      setRegistrations(regData.registrations || []);
      setStats(regData.stats || {});
      setIntegration(regData.integration || null);
      setClubs(Array.isArray(clubsData) ? clubsData : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Method 1: Google Sheets Sync
  const handleSyncGoogleSheets = async () => {
    setSyncing(true);
    setMessage(null);
    try {
      const res = await fetch('/api/registrations/sync-sheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to sync');

      setMessage({ type: 'success', text: data.message });
      fetchData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSyncing(false);
    }
  };

  // Method 2: CSV File Upload and Mapping
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.split('\n').filter((l) => l.trim().length > 0);
      if (lines.length > 0) {
        const headers = lines[0].split(',').map((h) => h.replace(/^"|"$/g, '').trim());
        setDetectedHeaders(headers);

        // Auto suggest field mappings
        const mapping: any = { ...fieldMapping };
        headers.forEach((h) => {
          const lower = h.toLowerCase();
          if (lower.includes('name') && !lower.includes('club')) mapping.fullName = h;
          if (lower.includes('mail')) mapping.email = h;
          if (lower.includes('phone') || lower.includes('contact') || lower.includes('number')) mapping.phone = h;
          if (lower.includes('gender')) mapping.gender = h;
          if (lower.includes('age')) mapping.age = h;
          if (lower.includes('club')) mapping.clubPreference = h;
          if (lower.includes('sport') || lower.includes('game')) mapping.sportsSelected = h;
        });
        setFieldMapping(mapping);

        // Parse rows
        const rows: any[] = [];
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map((v) => v.replace(/^"|"$/g, '').trim());
          const obj: any = {};
          headers.forEach((h, idx) => {
            obj[h] = values[idx] || '';
          });
          rows.push(obj);
        }
        setParsedRows(rows);
      }
    };
    reader.readAsText(file);
  };

  const handleImportCsv = async () => {
    if (parsedRows.length === 0) return;
    setLoading(true);
    try {
      const res = await fetch('/api/registrations/import-csv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          records: parsedRows,
          fieldMapping,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setImportSummary(data.summary);
      setMessage({ type: 'success', text: data.message });
      setIsCsvModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Workflow Approval
  const handleOpenApprove = (reg: any) => {
    setSelectedReg(reg);
    // Find matching club or default to first
    const matched = clubs.find(
      (c) =>
        c.name.toLowerCase().includes(reg.clubPreference.toLowerCase()) ||
        c.code.toLowerCase() === reg.clubPreference.toLowerCase()
    );
    setSelectedClubId(matched?.id || clubs[0]?.id || '');
    setIsApproveModalOpen(true);
  };

  const handleConfirmApprove = async () => {
    if (!selectedReg) return;
    try {
      const res = await fetch(`/api/registrations/${selectedReg.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clubId: selectedClubId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMessage({ type: 'success', text: data.message });
      setIsApproveModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm('Reject this registration entry?')) return;
    try {
      const res = await fetch(`/api/registrations/${id}/reject`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessage({ type: 'success', text: 'Registration rejected.' });
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filteredRegistrations = registrations.filter((r) => {
    return (
      r.fullName.toLowerCase().includes(search.toLowerCase()) ||
      r.email.toLowerCase().includes(search.toLowerCase()) ||
      r.submissionId.toLowerCase().includes(search.toLowerCase()) ||
      r.clubPreference.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold tracking-tight text-navy-950">Registration Management</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                <LinkIcon className="w-3 h-3" />
                Google Forms Automated Sync
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Automated ingestion from Google Forms via Google Sheets, CSV/Excel batch upload, duplicate detection, and player approval.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setIsCsvModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg shadow-2xs transition"
            >
              <Upload className="w-4 h-4 text-slate-400" />
              Upload CSV / Excel
            </button>

            <button
              onClick={handleSyncGoogleSheets}
              disabled={syncing}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition disabled:opacity-70"
            >
              <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Syncing Responses...' : 'Sync Google Sheets Now'}
            </button>
          </div>
        </div>

        {/* Status Message */}
        {message && (
          <div
            className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center justify-between ${
              message.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            <div className="flex items-center gap-2">
              {message.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-red-600" />
              )}
              <span>{message.text}</span>
            </div>
            <button onClick={() => setMessage(null)} className="opacity-70 hover:opacity-100">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Registration Management Dashboard (6 Statistical Cards from Prompt 4) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Total Submissions</span>
            <p className="text-2xl font-extrabold text-navy-950">{stats.total}</p>
            <span className="text-[11px] text-slate-400 mt-1 block">All incoming forms</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-emerald-200/80 bg-emerald-50/20 shadow-2xs">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block mb-1">Approved Players</span>
            <p className="text-2xl font-extrabold text-emerald-700">{stats.approved}</p>
            <span className="text-[11px] text-emerald-600 mt-1 block font-medium">Added to tournament</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-amber-200/80 bg-amber-50/20 shadow-2xs">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider block mb-1">Pending Review</span>
            <p className="text-2xl font-extrabold text-amber-700">{stats.pending}</p>
            <span className="text-[11px] text-amber-600 mt-1 block font-medium">Action required</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-red-200/80 bg-red-50/20 shadow-2xs">
            <span className="text-xs font-bold text-red-700 uppercase tracking-wider block mb-1">Duplicate Entries</span>
            <p className="text-2xl font-extrabold text-red-700">{stats.duplicate}</p>
            <span className="text-[11px] text-red-600 mt-1 block font-medium">Automated detection</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Rejected</span>
            <p className="text-2xl font-extrabold text-slate-700">{stats.rejected}</p>
            <span className="text-[11px] text-slate-400 mt-1 block">Ineligible</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-blue-200/80 bg-blue-50/20 shadow-2xs">
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider block mb-1">Sync Status</span>
            <p className="text-sm font-bold text-blue-700 truncate">
              {integration?.lastSyncAt ? new Date(integration.lastSyncAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Ready'}
            </p>
            <span className="text-[11px] text-slate-500 mt-1 block truncate">
              {integration ? `ID: ${integration.sheetId.slice(0, 10)}...` : 'Connected'}
            </span>
          </div>
        </div>

        {/* Workflow Diagram Banner (Prompt 4 Workflow) */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-3">
            Automated Registration Pipeline
          </span>
          <div className="flex items-center justify-between text-xs font-medium text-slate-700 overflow-x-auto pb-2 gap-2">
            <div className="flex items-center gap-2 p-2 rounded-lg bg-blue-50 border border-blue-200 shrink-0">
              <ClipboardList className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Google Form Submission</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
            <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-50 border border-emerald-200 shrink-0">
              <BarChart2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Google Sheets Sync</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
            <div className="flex items-center gap-2 p-2 rounded-lg bg-indigo-50 border border-indigo-200 shrink-0">
              <Search className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>Validation & Duplicate Check</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
            <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-50 border border-amber-200 shrink-0">
              <Crown className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Admin Review</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
            <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-100 border border-emerald-300 text-emerald-900 font-bold shrink-0">
              <Trophy className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>Approved Player Added</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
          <div className="relative flex-1 w-full md:max-w-xs">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, or submission ID..."
              className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-700 focus:ring-2 focus:ring-blue-600 outline-none"
            >
              <option value="">All Registration Statuses</option>
              <option value="PENDING">Pending Admin Review</option>
              <option value="APPROVED">Approved Registrations</option>
              <option value="DUPLICATE">Flagged as Duplicate</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>

        {/* Registrations Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Submission ID</th>
                  <th className="py-3 px-4">Participant Details</th>
                  <th className="py-3 px-4">Club Preference</th>
                  <th className="py-3 px-4">Sport(s) Selected</th>
                  <th className="py-3 px-4">Source</th>
                  <th className="py-3 px-4">Status & Flags</th>
                  <th className="py-3 px-4 text-right">Review Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRegistrations.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      No registrations found. Click "Sync Google Sheets Now" or "Upload CSV".
                    </td>
                  </tr>
                ) : (
                  filteredRegistrations.map((reg) => (
                    <tr key={reg.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4 font-mono font-bold text-blue-600">
                        {reg.submissionId}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 block text-xs">{reg.fullName}</span>
                        <span className="text-[11px] text-slate-500 block truncate max-w-xs">{reg.email}</span>
                        <span className="text-[10px] text-slate-400">
                          {reg.gender || 'N/A'} • Age {reg.age || 'N/A'} • {reg.phone || 'No phone'}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-800">
                        {reg.clubPreference}
                      </td>
                      <td className="py-3 px-4 text-slate-700 font-medium max-w-xs truncate">
                        {reg.sportsSelected}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600">
                          {reg.source}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              reg.status === 'APPROVED'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : reg.status === 'DUPLICATE'
                                ? 'bg-red-50 text-red-700 border border-red-200'
                                : reg.status === 'REJECTED'
                                ? 'bg-slate-100 text-slate-600 border border-slate-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200 animate-pulse'
                            }`}
                          >
                            {reg.status}
                          </span>
                          {reg.status === 'DUPLICATE' && (
                            <span className="block text-[10px] text-red-600 font-medium">
                              Duplicate of {reg.duplicateOfId || 'existing record'}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {reg.status !== 'APPROVED' && (
                            <button
                              onClick={() => handleOpenApprove(reg)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded shadow-xs flex items-center gap-1 transition"
                            >
                              <Check className="w-3.5 h-3.5" />
                              Approve
                            </button>
                          )}
                          {reg.status !== 'REJECTED' && (
                            <button
                              onClick={() => handleReject(reg.id)}
                              title="Reject Registration"
                              className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-md transition"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: Approve Registration -> Player Account Creation */}
        {isApproveModalOpen && selectedReg && (
          <div className="fixed inset-0 z-50 bg-navy-950/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in duration-200">
              <div className="p-5 bg-navy-900 text-white flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm">Approve Participant Registration</h3>
                  <span className="text-[11px] text-blue-300 font-mono">{selectedReg.submissionId}</span>
                </div>
                <button
                  onClick={() => setIsApproveModalOpen(false)}
                  className="p-1 text-slate-300 hover:text-white rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4 text-xs">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                  <p className="font-bold text-sm text-slate-900">{selectedReg.fullName}</p>
                  <p className="text-slate-500">{selectedReg.email} • {selectedReg.phone || 'No phone'}</p>
                  <p className="text-slate-600">Selected Sports: <strong>{selectedReg.sportsSelected}</strong></p>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Assign Final Club *
                  </label>
                  <select
                    value={selectedClubId}
                    onChange={(e) => setSelectedClubId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-600 outline-none text-xs"
                  >
                    {clubs.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.code}) {c.name.toLowerCase().includes(selectedReg.clubPreference.toLowerCase()) ? '— [Preferred]' : ''}
                      </option>
                    ))}
                  </select>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Participant's stated club preference: <strong>{selectedReg.clubPreference}</strong>
                  </span>
                </div>

                <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-emerald-800 text-[11px] flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 shrink-0" />
                  <span>System will automatically generate official Registration ID and assign player to all chosen sports disciplines.</span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsApproveModalOpen(false)}
                  className="px-3.5 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-100 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmApprove}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs shadow-sm flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  Confirm & Create Player
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: CSV / Excel Import & Field Mapping (Method 2) */}
        {isCsvModalOpen && (
          <div className="fixed inset-0 z-50 bg-navy-950/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in duration-200">
              <div className="p-5 bg-navy-900 text-white flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm">Upload Google Forms CSV / Excel Export</h3>
                  <span className="text-xs text-blue-300">Method 2: Batch import with field mapping</span>
                </div>
                <button
                  onClick={() => setIsCsvModalOpen(false)}
                  className="p-1 text-slate-300 hover:text-white rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
                {/* File Dropzone */}
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-blue-500 transition bg-slate-50/50">
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <label className="cursor-pointer">
                    <span className="text-blue-600 font-bold hover:underline">Select CSV file</span>
                    <span className="text-slate-500"> or drag and drop</span>
                    <input
                      type="file"
                      accept=".csv,.txt"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  {csvFile && (
                    <p className="mt-2 text-xs font-semibold text-slate-800">
                      Selected: {csvFile.name} ({parsedRows.length} rows found)
                    </p>
                  )}
                </div>

                {/* Column Mapping Section */}
                {detectedHeaders.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                        Review Field Mapping
                      </span>
                      <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        <span>Auto-detected {detectedHeaders.length} columns</span>
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-1">Full Name *</label>
                        <select
                          value={fieldMapping.fullName}
                          onChange={(e) => setFieldMapping({ ...fieldMapping, fullName: e.target.value })}
                          className="w-full px-2 py-1.5 border border-slate-200 rounded bg-white text-xs"
                        >
                          <option value="">Select column</option>
                          {detectedHeaders.map((h) => (
                            <option key={h} value={h}>
                              {h}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-1">Email Address *</label>
                        <select
                          value={fieldMapping.email}
                          onChange={(e) => setFieldMapping({ ...fieldMapping, email: e.target.value })}
                          className="w-full px-2 py-1.5 border border-slate-200 rounded bg-white text-xs"
                        >
                          <option value="">Select column</option>
                          {detectedHeaders.map((h) => (
                            <option key={h} value={h}>
                              {h}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-1">Club Preference</label>
                        <select
                          value={fieldMapping.clubPreference}
                          onChange={(e) => setFieldMapping({ ...fieldMapping, clubPreference: e.target.value })}
                          className="w-full px-2 py-1.5 border border-slate-200 rounded bg-white text-xs"
                        >
                          <option value="">Select column</option>
                          {detectedHeaders.map((h) => (
                            <option key={h} value={h}>
                              {h}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-1">Sport(s) Selected</label>
                        <select
                          value={fieldMapping.sportsSelected}
                          onChange={(e) => setFieldMapping({ ...fieldMapping, sportsSelected: e.target.value })}
                          className="w-full px-2 py-1.5 border border-slate-200 rounded bg-white text-xs"
                        >
                          <option value="">Select column</option>
                          {detectedHeaders.map((h) => (
                            <option key={h} value={h}>
                              {h}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCsvModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-100 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={parsedRows.length === 0}
                  onClick={handleImportCsv}
                  className="px-4 py-2 bg-navy-900 hover:bg-navy-800 text-white font-bold rounded-lg text-xs shadow-sm disabled:opacity-50"
                >
                  Import {parsedRows.length} Records
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

