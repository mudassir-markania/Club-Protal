'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/layout/AppLayout';
import {
  Swords,
  Play,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Search,
  Filter,
  Eye,
  RefreshCw,
  MapPin,
} from 'lucide-react';
import { ClubBadge, SportIcon } from '@/components/ui/icons';

export default function RefereeMatchesPage() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchMatches();
  }, [statusFilter]);

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const meRes = await fetch('/api/auth/me');
      const meData = await meRes.json();

      const refId = meData.user?.refereeId;
      const params = new URLSearchParams();
      if (refId) params.append('refereeId', refId);
      if (statusFilter) params.append('status', statusFilter);

      const res = await fetch(`/api/matches?${params.toString()}`);
      const data = await res.json();
      setMatches(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
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
              <h1 className="text-2xl font-bold tracking-tight text-navy-950">My Assigned Matches</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                Official Duties
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Select an assigned fixture to begin match officiating, track live scores, and submit final certified results.
            </p>
          </div>

          <button
            onClick={fetchMatches}
            className="inline-flex items-center gap-2 px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg shadow-2xs transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh Assignments
          </button>
        </div>

        {/* Filter Bar (Requirement 5.B: Upcoming, In Progress, Completed, Pending Result) */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
          <div className="relative flex-1 w-full md:max-w-xs">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by code, club, or sport..."
              className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
            <button
              onClick={() => setStatusFilter('')}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                statusFilter === '' ? 'bg-navy-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              All Matches
            </button>
            <button
              onClick={() => setStatusFilter('IN_PROGRESS')}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                statusFilter === 'IN_PROGRESS' ? 'bg-rose-600 text-white' : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
              }`}
            >
              In Progress
            </button>
            <button
              onClick={() => setStatusFilter('UPCOMING')}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                statusFilter === 'UPCOMING' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setStatusFilter('SUBMITTED')}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                statusFilter === 'SUBMITTED' ? 'bg-amber-600 text-white' : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
              }`}
            >
              Pending Approval
            </button>
            <button
              onClick={() => setStatusFilter('COMPLETED')}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                statusFilter === 'COMPLETED' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              Completed
            </button>
          </div>
        </div>

        {/* Matches Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredMatches.length === 0 ? (
            <div className="col-span-2 bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-xs">
              No assigned matches found matching your filters.
            </div>
          ) : (
            filteredMatches.map((m) => {
              const p1 = m.participants?.[0];
              const p2 = m.participants?.[1];

              return (
                <div
                  key={m.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between hover:shadow-md transition"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                          {m.matchCode}
                        </span>
                        <span className="text-xs font-bold text-slate-900 flex items-center gap-1">
                          {m.sport?.icon} {m.sport?.name}
                        </span>
                        <span className="text-[11px] text-slate-400">• {m.round}</span>
                      </div>

                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          m.status === 'IN_PROGRESS'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200 animate-pulse'
                            : m.status === 'SUBMITTED'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : m.status === 'COMPLETED'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}
                      >
                        {m.status}
                      </span>
                    </div>

                    {/* Participant Score Board */}
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 my-3 flex items-center justify-between">
                      <div className="flex items-center gap-2.5 flex-1">
                        <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0">
                          <ClubBadge code={p1?.club?.code} name={p1?.club?.name} className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="font-bold text-xs text-slate-900 block truncate max-w-[140px]">
                            {p1?.club?.name || p1?.teamName || 'TBD'}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">{p1?.club?.code}</span>
                        </div>
                      </div>

                      <div className="px-3 py-1 bg-white border border-slate-200 rounded-lg shadow-2xs font-mono font-extrabold text-lg text-navy-950">
                        {p1?.score ?? 0} - {p2?.score ?? 0}
                      </div>

                      <div className="flex items-center gap-2.5 flex-1 justify-end text-right">
                        <div>
                          <span className="font-bold text-xs text-slate-900 block truncate max-w-[140px]">
                            {p2?.club?.name || p2?.teamName || 'TBD'}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">{p2?.club?.code}</span>
                        </div>
                        <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0">
                          <ClubBadge code={p2?.club?.code} name={p2?.club?.name} className="w-5 h-5" />
                        </div>
                      </div>
                    </div>

                    <div className="text-xs text-slate-500 flex items-center justify-between pt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{m.matchDate} at {m.matchTime}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{m.venue?.name || 'Main Grounds'}</span>
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      {m.results?.length > 0 ? 'Results submitted' : 'Ready for officiating'}
                    </span>

                    <Link
                      href={`/referee/matches/${m.matchCode}`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-navy-900 hover:bg-navy-800 text-white text-xs font-bold rounded-lg shadow-xs transition"
                    >
                      <Play className="w-3.5 h-3.5" />
                      {m.status === 'COMPLETED' ? 'View Official Record' : 'Open Score Sheet'}
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </AppLayout>
  );
}

