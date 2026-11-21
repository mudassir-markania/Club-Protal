'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import AdminLayout from '@/components/layout/AdminLayout';
import {
  Users,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Edit2,
  Trash2,
  Eye,
  Shield,
  Medal,
  CheckCircle2,
  XCircle,
  X,
  FileSpreadsheet,
  FileUp,
  Sliders,
  Check,
  AlertCircle,
} from 'lucide-react';
import { ClubBadge, SportIcon } from '@/components/ui/icons';

export default function PlayersPage() {
  const [mounted, setMounted] = useState(false);
  const [players, setPlayers] = useState<any[]>([]);
  const [clubs, setClubs] = useState<any[]>([]);
  const [sports, setSports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedClubFilter, setSelectedClubFilter] = useState('');
  const [selectedSportFilter, setSelectedSportFilter] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [isDeleteAllModalOpen, setIsDeleteAllModalOpen] = useState(false);
  const [clearingRoster, setClearingRoster] = useState(false);

  // Selected Player
  const [selectedPlayer, setSelectedPlayer] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // CSV Import State
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [importing, setImporting] = useState(false);
  const [csvError, setCsvError] = useState<string | null>(null);

  // Form State (No Reg ID or Email required from admin)
  const [formData, setFormData] = useState({
    name: '',
    gender: 'MALE',
    age: 22,
    clubId: '',
    status: 'APPROVED',
    sportIds: [] as string[],
  });

  useEffect(() => {
    setMounted(true);
    fetchData();
  }, [selectedClubFilter, selectedSportFilter, selectedStatusFilter]);

  // Lock background scrolling and handle Escape key
  useEffect(() => {
    if (isModalOpen || isViewModalOpen || isCsvModalOpen || isDeleteAllModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsModalOpen(false);
        setIsViewModalOpen(false);
        setIsCsvModalOpen(false);
        setIsDeleteAllModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isModalOpen, isViewModalOpen, isCsvModalOpen, isDeleteAllModalOpen]);

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
      gender: 'MALE',
      age: 22,
      clubId: clubs[0]?.id || '',
      status: 'APPROVED',
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
      gender: player.gender || 'MALE',
      age: player.age || 22,
      clubId: player.clubId,
      status: player.status,
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

    if (!formData.clubId) {
      setError('Select the house / club this athlete belongs to.');
      return;
    }
    if (formData.sportIds.length === 0) {
      setError('Select at least one participating sport.');
      return;
    }

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
        throw new Error(data.error || 'Failed to save athlete');
      }

      setSuccess(selectedPlayer ? 'Athlete profile updated!' : 'Athlete registered successfully!');
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove athlete "${name}"?`)) return;

    try {
      const res = await fetch(`/api/players/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to delete');
        return;
      }
      setSuccess('Athlete record removed');
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

  // CSV Upload Handlers
  const handleCsvFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvFile(file);
    setCsvError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const rawText = event.target?.result as string;
        if (!rawText) return;

        // Strip UTF-8 BOM if present from Excel exports
        const text = rawText.replace(/^\uFEFF/, '');
        const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
        if (lines.length <= 1) {
          setCsvError('CSV file has no data rows.');
          return;
        }

        const headers = lines[0].split(',').map((h) => h.replace(/^["'\s\uFEFF]+|["'\s\uFEFF]+$/g, '').trim());
        const rows: any[] = [];

        for (let i = 1; i < lines.length; i++) {
          const line = lines[i];
          // Handle quoted commas
          const values: string[] = [];
          let current = '';
          let inQuotes = false;

          for (let c = 0; c < line.length; c++) {
            const char = line[c];
            if (char === '"' || char === "'") {
              inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
              values.push(current.trim());
              current = '';
            } else {
              current += char;
            }
          }
          values.push(current.trim());

          const rowObj: any = {};
          headers.forEach((h, idx) => {
            rowObj[h] = (values[idx] || '').replace(/^["'\s]+|["'\s]+$/g, '').trim();
          });

          // Only keep rows that have a name
          const nameVal = rowObj['Participant Name'] || rowObj['Name'] || rowObj['Player Name'] || rowObj[headers[0]];
          if (nameVal) {
            rows.push(rowObj);
          }
        }

        setParsedRows(rows);
      } catch (err: any) {
        setCsvError('Error reading CSV: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  const handleImportCsv = async () => {
    if (parsedRows.length === 0) return;
    setImporting(true);
    setCsvError(null);

    try {
      const res = await fetch('/api/players/import-csv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ records: parsedRows }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to import athletes');

      setSuccess(data.message || `Successfully imported ${data.summary?.importedCount || parsedRows.length} athletes!`);
      setIsCsvModalOpen(false);
      setCsvFile(null);
      setParsedRows([]);
      fetchData();
    } catch (err: any) {
      setCsvError(err.message);
    } finally {
      setImporting(false);
    }
  };

  const handleClearAllRoster = async () => {
    setClearingRoster(true);
    setError(null);
    try {
      const res = await fetch('/api/players', { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to clear athlete roster');

      setSuccess(data.message || 'All athletes have been removed from roster.');
      setIsDeleteAllModalOpen(false);
      fetchData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setClearingRoster(false);
    }
  };

  const downloadSampleCsv = () => {
    const csvContent =
      'Participant Name,Assigned House,Gender,Participating Sports\n' +
      'Taha Choudhary,Yellow,Male,"Badminton, Cricket"\n' +
      'Affan,Blue,Male,BGMI\n' +
      'Aquib Hingwala,Red,Male,"Football, Carrom"\n' +
      'Piyush Pandey,Green,Male,Chess\n' +
      'Pravin,Purple,Male,"Badminton, Football"';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'APL_Athlete_Import_Template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredPlayers = players.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.club?.name && p.club.name.toLowerCase().includes(search.toLowerCase())) ||
      (p.club?.code && p.club.code.toLowerCase().includes(search.toLowerCase())) ||
      (p.sports && p.sports.some((s: any) => (s.sport?.name || '').toLowerCase().includes(search.toLowerCase())));

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
              Official athletes directory: add athletes manually or import via CSV file with automatic house affiliation.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => {
                setCsvFile(null);
                setParsedRows([]);
                setCsvError(null);
                setIsCsvModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-lg border border-blue-200 shadow-2xs transition"
            >
              <FileUp className="w-4 h-4 text-blue-600" />
              Import CSV
            </button>
            <button
              onClick={exportCSV}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg shadow-2xs transition"
            >
              <Download className="w-4 h-4 text-slate-400" />
              Export Roster (CSV)
            </button>
            {players.length > 0 && (
              <button
                type="button"
                onClick={() => setIsDeleteAllModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-lg border border-rose-200 shadow-2xs transition"
              >
                <Trash2 className="w-4 h-4 text-rose-600" />
                Clear All Roster
              </button>
            )}
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
              placeholder="Search athletes by name, house, or sport..."
              className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
            <select
              value={selectedClubFilter}
              onChange={(e) => setSelectedClubFilter(e.target.value)}
              className="px-3 py-1.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-700 focus:ring-2 focus:ring-blue-600 outline-none"
            >
              <option value="">All Houses</option>
              {clubs.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.code})
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

        {/* Players Table (Reg ID and Contact Columns Removed) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-5">Participant Name</th>
                  <th className="py-3.5 px-5">Assigned House</th>
                  <th className="py-3.5 px-5">Participating Sports</th>
                  <th className="py-3.5 px-5">Status</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPlayers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-slate-400">
                      No participants match the selected filters.
                    </td>
                  </tr>
                ) : (
                  filteredPlayers.map((player) => (
                    <tr key={player.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-5">
                        <span className="font-bold text-slate-900 block text-xs">{player.name}</span>
                        <span className="text-[11px] text-slate-400 font-medium">
                          {player.gender || 'MALE'}
                        </span>
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-2">
                          <ClubBadge code={player.club?.code} name={player.club?.name} className="w-5 h-5 shrink-0" />
                          <span className="font-bold text-slate-800">{player.club?.name}</span>
                          {player.club?.code && (
                            <span className="text-[10px] text-slate-400 font-mono">({player.club.code})</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="flex flex-wrap gap-1.5 max-w-sm">
                          {player.sports && player.sports.length > 0 ? (
                            player.sports.map((s: any) => (
                              <span
                                key={s.id}
                                className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 flex items-center gap-1 border border-slate-200"
                              >
                                <SportIcon name={s.sport?.name} className="w-3 h-3 text-slate-500" />
                                <span>{s.sport?.name}</span>
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-400 italic text-[11px]">All Sports Eligible</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-5">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            player.status === 'APPROVED'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {player.status || 'APPROVED'}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenView(player)}
                            title="View Athlete Details"
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(player)}
                            title="Edit Athlete"
                            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-md transition"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(player.id, player.name)}
                            title="Delete Athlete"
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

        {/* Modal: Add / Edit Athlete (Portalled to document.body) */}
        {mounted && isModalOpen && createPortal(
          <div
            className="fixed inset-0 !m-0 z-[9999] bg-navy-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto overscroll-none touch-none"
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
              className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg max-h-[88vh] flex flex-col overflow-hidden my-auto animate-in fade-in duration-150 touch-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 py-4 border-b border-navy-800 flex items-center justify-between bg-navy-900 text-white shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-400 shrink-0">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">
                      {selectedPlayer ? `Edit Athlete: ${selectedPlayer.name}` : 'Register New Athlete'}
                    </h3>
                    <p className="text-[11px] text-slate-300">
                      APL Season 9 • Official Participant Roster Entry
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-navy-800 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {error && (
                <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg font-medium shrink-0">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
                <div className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Participant Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Marcus Vance"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Assigned House / Club *
                      </label>
                      <select
                        required
                        value={formData.clubId}
                        onChange={(e) => setFormData({ ...formData, clubId: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-600 outline-none text-xs font-semibold"
                      >
                        <option value="">Select House</option>
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
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-600 outline-none text-xs"
                      >
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>
                  </div>

                  {/* Multiple Sports Assignment */}
                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Participating Sports * <span className="normal-case font-medium text-slate-400">(select one or more)</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2 border border-slate-200 p-2.5 rounded-lg bg-slate-50 max-h-48 overflow-y-auto">
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
                </div>

                {/* Modal Footer (Pinned at bottom) */}
                <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
                  <span className="text-[11px] text-slate-500 font-medium">
                    Athlete will be eligible for fixture scheduling
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 border border-slate-200 text-slate-600 font-semibold rounded-lg hover:bg-slate-100 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition"
                    >
                      <Check className="w-4 h-4" />
                      <span>{selectedPlayer ? 'Save Changes' : 'Register Athlete'}</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

        {/* View Modal (Portalled to document.body) */}
        {mounted && isViewModalOpen && selectedPlayer && createPortal(
          <div
            className="fixed inset-0 !m-0 z-[9999] bg-navy-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto overscroll-none touch-none"
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsViewModalOpen(false);
            }}
            onTouchMove={(e) => {
              if (e.target === e.currentTarget) e.preventDefault();
            }}
            onWheel={(e) => {
              if (e.target === e.currentTarget) e.preventDefault();
            }}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden my-auto animate-in fade-in duration-150 touch-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 py-4 bg-navy-900 text-white flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-white">{selectedPlayer.name}</h3>
                  <span className="text-xs text-blue-300 font-medium">
                    {selectedPlayer.gender || 'MALE'}
                  </span>
                </div>
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-navy-800 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4 text-xs">
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 font-medium">Assigned House / Club</span>
                  <span className="font-bold text-slate-900 flex items-center gap-2">
                    <ClubBadge code={selectedPlayer.club?.code} name={selectedPlayer.club?.name} className="w-5 h-5" />
                    <span>{selectedPlayer.club?.name}</span>
                    {selectedPlayer.club?.code && (
                      <span className="text-xs text-slate-400 font-mono">({selectedPlayer.club.code})</span>
                    )}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-2">
                    Registered Tournament Sports
                  </span>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {selectedPlayer.sports && selectedPlayer.sports.length > 0 ? (
                      selectedPlayer.sports.map((s: any) => (
                        <div
                          key={s.id}
                          className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <SportIcon name={s.sport?.name} className="w-4 h-4 text-slate-600" />
                            <span className="font-bold text-slate-800">{s.sport?.name}</span>
                          </div>
                          <span className="text-[10px] font-semibold text-slate-500 bg-slate-200/70 px-2 py-0.5 rounded">
                            {s.sport?.sportType || 'Standard'}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-400 italic text-center">
                        Eligible across all tournament disciplines
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="px-5 py-2 bg-navy-900 text-white font-bold rounded-lg text-xs hover:bg-navy-800 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

        {/* Modal: CSV Import (Portalled to document.body) */}
        {mounted && isCsvModalOpen && createPortal(
          <div
            className="fixed inset-0 !m-0 z-[9999] bg-navy-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto overscroll-none touch-none"
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsCsvModalOpen(false);
            }}
            onTouchMove={(e) => {
              if (e.target === e.currentTarget) e.preventDefault();
            }}
            onWheel={(e) => {
              if (e.target === e.currentTarget) e.preventDefault();
            }}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl max-h-[88vh] flex flex-col overflow-hidden my-auto animate-in fade-in duration-150 touch-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 py-4 border-b border-navy-800 flex items-center justify-between bg-navy-900 text-white shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-400 shrink-0">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">Import Athlete Roster from CSV</h3>
                    <p className="text-[11px] text-slate-300">
                      Upload athlete records with names, assigned house, and sports
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCsvModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-navy-800 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {csvError && (
                <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg font-medium shrink-0 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{csvError}</span>
                </div>
              )}

              <div className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
                {/* Download Template helper */}
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="font-bold text-blue-900 block text-xs">Need a CSV format sample?</span>
                    <span className="text-[11px] text-blue-700">Columns: Participant Name, Assigned House, Gender, Sports</span>
                  </div>
                  <button
                    type="button"
                    onClick={downloadSampleCsv}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition shadow-2xs flex items-center gap-1.5 shrink-0"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download Template
                  </button>
                </div>

                {/* Upload Area */}
                <div className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-6 text-center bg-slate-50/50 hover:bg-blue-50/20 transition cursor-pointer relative">
                  <input
                    type="file"
                    accept=".csv,.txt"
                    onChange={handleCsvFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center pointer-events-none">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mb-2">
                      <FileUp className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-slate-800 text-xs">
                      {csvFile ? csvFile.name : 'Click to select or drag & drop CSV file'}
                    </span>
                    <span className="text-[11px] text-slate-400 mt-0.5">
                      {csvFile
                        ? `${(csvFile.size / 1024).toFixed(1)} KB • ${parsedRows.length} athletes detected`
                        : 'Supports .csv files with participant names and house affiliations'}
                    </span>
                  </div>
                </div>

                {/* Preview Table */}
                {parsedRows.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                        Preview Athletes ({parsedRows.length} found)
                      </span>
                      <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Ready for Import
                      </span>
                    </div>

                    <div className="border border-slate-200 rounded-lg max-h-48 overflow-y-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-100 border-b border-slate-200 text-slate-600 font-bold sticky top-0">
                          <tr>
                            <th className="py-2 px-3">Athlete Name</th>
                            <th className="py-2 px-3">Assigned House</th>
                            <th className="py-2 px-3">Gender</th>
                            <th className="py-2 px-3">Sports</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {parsedRows.slice(0, 10).map((row, idx) => (
                            <tr key={idx} className="hover:bg-slate-50">
                              <td className="py-2 px-3 font-semibold text-slate-800">
                                {row['Participant Name'] || row['Name'] || row['Player Name'] || Object.values(row)[0] || 'Unknown'}
                              </td>
                              <td className="py-2 px-3 text-slate-600">
                                {row['Assigned House'] || row['House'] || row['Club'] || 'Auto'}
                              </td>
                              <td className="py-2 px-3 text-slate-500">
                                {row['Gender'] || 'Male'}
                              </td>
                              <td className="py-2 px-3 text-slate-500 truncate max-w-xs">
                                {row['Participating Sports'] || row['Sports'] || 'All'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {parsedRows.length > 10 && (
                      <p className="text-[11px] text-slate-400 mt-1.5 text-center">
                        ...and {parsedRows.length - 10} more athletes will be imported
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* CSV Modal Footer */}
              <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
                <span className="text-[11px] text-slate-500 font-medium">
                  {parsedRows.length > 0 ? `${parsedRows.length} records ready` : 'Select a CSV file to proceed'}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCsvModalOpen(false)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 font-semibold rounded-lg hover:bg-slate-100 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleImportCsv}
                    disabled={importing || parsedRows.length === 0}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition disabled:opacity-50"
                  >
                    {importing ? (
                      <span>Importing Athletes...</span>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        <span>Import {parsedRows.length > 0 ? `${parsedRows.length} Athletes` : 'Athletes'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}

        {/* Modal: Confirm Clear All Roster */}
        {mounted && isDeleteAllModalOpen && createPortal(
          <div
            className="fixed inset-0 !m-0 z-50 bg-navy-950/60 backdrop-blur-xs flex items-center justify-center p-4 overscroll-none touch-none"
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsDeleteAllModalOpen(false);
            }}
            onTouchMove={(e) => {
              if (e.target === e.currentTarget) e.preventDefault();
            }}
            onWheel={(e) => {
              if (e.target === e.currentTarget) e.preventDefault();
            }}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in duration-200 touch-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-5 bg-rose-600 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-rose-100" />
                  <h3 className="font-bold text-sm">Clear All Athletes from Roster?</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsDeleteAllModalOpen(false)}
                  className="p-1 text-rose-100 hover:text-white rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-3 text-xs">
                <p className="text-slate-700 font-semibold">
                  Are you sure you want to remove all <strong>{players.length} registered athletes</strong> from the championship roster?
                </p>
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 text-[11px] space-y-1">
                  <p className="font-bold">⚠️ Warning: Irreversible Action</p>
                  <p>
                    This will permanently delete all athlete records and their sport assignments from the database.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsDeleteAllModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-100 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleClearAllRoster}
                  disabled={clearingRoster}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs shadow-sm flex items-center gap-1.5 transition disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{clearingRoster ? 'Clearing Roster...' : `Yes, Delete All ${players.length} Athletes`}</span>
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
      </div>
    </AdminLayout>
  );
}
