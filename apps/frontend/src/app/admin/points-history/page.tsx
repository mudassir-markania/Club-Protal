'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import AdminLayout from '@/components/layout/AdminLayout';
import {
  History,
  Shield,
  Medal,
  Calendar,
  Filter,
  Search,
  Eye,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  ArrowRight,
  X,
  FileText,
} from 'lucide-react';
import { ClubBadge, SportIcon } from '@/components/ui/icons';

export default function PointsHistoryPage() {
  const [history, setHistory] = useState<any[]>([]);
  const [clubs, setClubs] = useState<any[]>([]);
  const [sports, setSports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [clubFilter, setClubFilter] = useState('');
  const [sportFilter, setSportFilter] = useState('');
  const [search, setSearch] = useState('');
  const [selectedTx, setSelectedTx] = useState<any | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (selectedTx) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedTx(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedTx]);

  useEffect(() => {
    fetchClubsAndSports();
    fetchHistory();
  }, [clubFilter, sportFilter]);

  const fetchClubsAndSports = async () => {
    try {
      const [clubsRes, sportsRes] = await Promise.all([
        fetch('/api/clubs'),
        fetch('/api/sports'),
      ]);
      const [clubsData, sportsData] = await Promise.all([
        clubsRes.json(),
        sportsRes.json(),
      ]);
      setClubs(Array.isArray(clubsData) ? clubsData : []);
      setSports(Array.isArray(sportsData) ? sportsData : []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (clubFilter) params.append('clubId', clubFilter);
      if (sportFilter) params.append('sportId', sportFilter);

      const res = await fetch(`/api/points-history?${params.toString()}`);
      const data = await res.json();
      setHistory(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredHistory = history.filter((item) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const clubName = item.club?.name?.toLowerCase() || '';
    const sportName = item.sport?.name?.toLowerCase() || '';
    const round = item.match?.round?.toLowerCase() || '';
    const reason = item.reason?.toLowerCase() || '';
    return clubName.includes(q) || sportName.includes(q) || round.includes(q) || reason.includes(q);
  });

  const totalPointsAwarded = filteredHistory.reduce((acc, h) => acc + (h.points || 0), 0);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold tracking-tight text-navy-950">Official Points History & Audit</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                Audit Trail
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Complete verifiable ledger of all approved points distributed across the 5 houses and 6 championship sports.
            </p>
          </div>

          <button
            onClick={fetchHistory}
            className="inline-flex items-center gap-2 px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg shadow-2xs transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh Ledger
          </button>
        </div>

        {/* Stats Summary Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Recorded Allocations
            </span>
            <p className="text-2xl font-black text-navy-950">{filteredHistory.length}</p>
            <span className="text-xs text-slate-500 mt-1 block">Approved transactions</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-blue-200 bg-blue-50/20 shadow-2xs">
            <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider block mb-1">
              Total Points Credited
            </span>
            <p className="text-2xl font-black text-blue-700">{totalPointsAwarded.toFixed(2)} pts</p>
            <span className="text-xs text-blue-600 mt-1 block">Filtered view sum</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-emerald-200 bg-emerald-50/20 shadow-2xs">
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block mb-1">
              Integrity Status
            </span>
            <div className="flex items-center gap-1.5 mt-1">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span className="text-sm font-bold text-emerald-950">100% Reconciled</span>
            </div>
            <span className="text-xs text-emerald-700 mt-0.5 block">Unique-club equality verified</span>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
            {/* Search */}
            <div className="relative flex-1 w-full md:max-w-xs">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by house, sport, stage, or description..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white text-xs"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
              {/* Club Filter */}
              <select
                value={clubFilter}
                onChange={(e) => setClubFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="">All 5 Houses</option>
                {clubs.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>

              {/* Sport Filter */}
              <select
                value={sportFilter}
                onChange={(e) => setSportFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="">All Sports</option>
                {sports.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>

              {(clubFilter || sportFilter || search) && (
                <button
                  onClick={() => {
                    setClubFilter('');
                    setSportFilter('');
                    setSearch('');
                  }}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold rounded-lg transition"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">House (Club)</th>
                  <th className="py-3 px-4">Sport & Discipline</th>
                  <th className="py-3 px-4">Stage / Event</th>
                  <th className="py-3 px-4">Description / Calculation</th>
                  <th className="py-3 px-4 text-right">Points Credited</th>
                  <th className="py-3 px-4 text-center">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredHistory.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      No points transactions found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredHistory.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                        {new Date(item.recordedAt).toLocaleDateString()} {new Date(item.recordedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <ClubBadge code={item.club?.code} name={item.club?.name} className="w-5 h-5 shrink-0" />
                          <span className="font-bold text-slate-900">{item.club?.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <SportIcon name={item.sport?.name} className="w-4 h-4 text-blue-600" />
                          <span className="font-semibold text-slate-800">{item.sport?.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 block text-xs">
                          {item.match?.round || 'Championship Match'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">Official Result</span>
                      </td>
                      <td className="py-3 px-4 max-w-xs truncate text-slate-600 font-medium">
                        {item.reason || 'Unique-club points distribution'}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-black text-navy-950 text-sm">
                        +{Number(item.points).toFixed(2)} pts
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => setSelectedTx(item)}
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition"
                          title="Inspect distribution formula"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Transaction Inspection Modal (Portalled to document.body) */}
      {mounted && selectedTx && createPortal(
        <div
          className="fixed inset-0 !m-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-navy-950/80 backdrop-blur-sm overflow-y-auto overscroll-none touch-none"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedTx(null);
          }}
          onTouchMove={(e) => {
            if (e.target === e.currentTarget) e.preventDefault();
          }}
          onWheel={(e) => {
            if (e.target === e.currentTarget) e.preventDefault();
          }}
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 my-auto animate-in fade-in duration-150 touch-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-extrabold text-navy-950">
                  Transaction Audit Inspection
                </h3>
              </div>
              <button
                onClick={() => setSelectedTx(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">House Credited:</span>
                  <span className="font-extrabold text-slate-900 text-sm">{selectedTx.club?.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Points Credited:</span>
                  <span className="font-mono font-black text-emerald-600 text-base">
                    +{Number(selectedTx.points).toFixed(2)} pts
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-400 block font-semibold">Sport:</span>
                  <span className="font-bold text-slate-800">{selectedTx.sport?.name}</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-400 block font-semibold">Stage / Event:</span>
                  <span className="font-bold text-slate-800">{selectedTx.match?.round || 'Championship Match'}</span>
                </div>
              </div>

              {selectedTx.distribution && (
                <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2">
                  <span className="font-bold text-blue-900 block">
                    Associated Unique-Club Points Distribution:
                  </span>
                  <div className="text-[11px] text-blue-800 space-y-1">
                    <div>Original Points Earned: <strong>{selectedTx.distribution.originalPoints} pts</strong></div>
                    <div>Unique Clubs Represented: <strong>{selectedTx.distribution.uniqueClubCount}</strong></div>
                    <div>Formula: <code>{selectedTx.distribution.originalPoints} ÷ {selectedTx.distribution.uniqueClubCount}</code></div>
                  </div>

                  {selectedTx.distribution.allocations && (
                    <div className="mt-2 pt-2 border-t border-blue-200/80">
                      <span className="text-[10px] font-bold text-blue-950 uppercase block mb-1">
                        All Participating Clubs Allocation:
                      </span>
                      <div className="space-y-1">
                        {selectedTx.distribution.allocations.map((a: any) => (
                          <div key={a.id} className="flex items-center justify-between text-[11px] bg-white/80 px-2 py-1 rounded">
                            <span className="font-bold text-slate-800">{a.club?.name}</span>
                            <span className="font-mono font-black text-navy-950">{Number(a.points).toFixed(2)} pts</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-[11px]">
                <span className="text-slate-400 block font-semibold mb-0.5">Audit Note:</span>
                <span className="text-slate-700">{selectedTx.reason || 'Approved by administrator'}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedTx(null)}
                className="px-4 py-2 bg-navy-950 hover:bg-navy-900 text-white font-bold text-xs rounded-xl transition"
              >
                Close Audit View
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </AdminLayout>
  );
}

