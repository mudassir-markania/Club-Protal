'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import RefereeLayout from '@/components/layout/RefereeLayout';
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
  Radio,
  FileCheck2,
  Users,
  Check,
  Trophy,
} from 'lucide-react';
import { ClubBadge, SportIcon } from '@/components/ui/icons';
import DeclareWinnerModal from '@/components/admin/DeclareWinnerModal';
import MatchFormatFilter from '@/components/admin/MatchFormatFilter';
import { matchFormatKey, MatchFormatKey } from '@club-portal/shared';

export default function RefereeMatchesPage() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [sportFilter, setSportFilter] = useState('');
  const [formatFilter, setFormatFilter] = useState<MatchFormatKey | ''>('');
  const [search, setSearch] = useState('');
  const [user, setUser] = useState<any | null>(null);
  const [winTarget, setWinTarget] = useState<{ match: any; participant: any } | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchMatches();
  }, []); // status and sport tabs filter the loaded list locally

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const meRes = await fetch('/api/auth/me');
      const meData = await meRes.json();
      setUser(meData.user);

      const res = await fetch('/api/matches');
      const data = await res.json();
      setMatches(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const sportsList = [
    { label: 'All Sports', value: '' },
    { label: 'BGMI', value: 'BGMI' },
    { label: 'Carrom', value: 'Carrom' },
    { label: 'Badminton', value: 'Badminton' },
    { label: 'Chess', value: 'Chess' },
    { label: 'Cricket', value: 'Cricket' },
    { label: 'Football', value: 'Football' },
  ];

  // matches narrowed by the sport tab only (used for the format tab counts)
  const sportMatches = matches.filter((m) => !sportFilter || m.sport?.name?.toLowerCase() === sportFilter.toLowerCase());

  const filteredMatches = matches.filter((m) => {
    // Sport filter
    if (sportFilter && m.sport?.name.toLowerCase() !== sportFilter.toLowerCase()) {
      return false;
    }

    // Format filter: Singles / Men's Doubles / Women's Doubles / Mixed Doubles
    if (formatFilter && matchFormatKey(m.matchCategory) !== formatFilter) {
      return false;
    }

    // Status filter
    if (statusFilter === 'AWAITING' && m.status !== 'SCHEDULED' && m.status !== 'IN_PROGRESS') {
      return false;
    }
    if (statusFilter === 'SUBMITTED' && m.status !== 'SUBMITTED') {
      return false;
    }
    if (statusFilter === 'COMPLETED' && m.status !== 'COMPLETED') {
      return false;
    }

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      const code = m.matchCode?.toLowerCase() || '';
      const sName = m.sport?.name?.toLowerCase() || '';
      const pStr = (m.participants || [])
        .map((p: any) => `${p.teamName} ${p.club?.name} ${p.cricketTeam?.name}`)
        .join(' ')
        .toLowerCase();

      if (!code.includes(q) && !sName.includes(q) && !pStr.includes(q)) {
        return false;
      }
    }

    return true;
  });

  return (
    <RefereeLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold tracking-tight text-navy-950">Assigned Matches & Results</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                Official Duties
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Select an assigned fixture to record final points, preview automatic unique-club distribution, and submit for admin verification.
            </p>
          </div>

          <button
            onClick={fetchMatches}
            className="inline-flex items-center gap-2 px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg shadow-2xs transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh Fixtures
          </button>
        </div>

        {success && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              {success}
            </span>
            <button onClick={() => setSuccess(null)} className="text-slate-400 hover:text-slate-700" aria-label="Dismiss">
              ×
            </button>
          </div>
        )}

        {/* Filter Bar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3 text-xs">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative flex-1 w-full md:max-w-xs">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by code, club, sport..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white text-xs"
              />
            </div>

            <div className="flex items-center gap-1.5 w-full md:w-auto flex-wrap">
              <button
                onClick={() => setStatusFilter('')}
                className={`px-3 py-1.5 rounded-lg font-bold transition ${
                  statusFilter === '' ? 'bg-navy-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                All Statuses
              </button>
              <button
                onClick={() => setStatusFilter('AWAITING')}
                className={`px-3 py-1.5 rounded-lg font-bold transition ${
                  statusFilter === 'AWAITING' ? 'bg-amber-600 text-white' : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                }`}
              >
                Awaiting Submission
              </button>
              <button
                onClick={() => setStatusFilter('SUBMITTED')}
                className={`px-3 py-1.5 rounded-lg font-bold transition ${
                  statusFilter === 'SUBMITTED' ? 'bg-purple-600 text-white' : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                }`}
              >
                Under Admin Review
              </button>
              <button
                onClick={() => setStatusFilter('COMPLETED')}
                className={`px-3 py-1.5 rounded-lg font-bold transition ${
                  statusFilter === 'COMPLETED' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                }`}
              >
                Completed & Approved
              </button>
            </div>
          </div>

          {/* Sport Sub-filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-slate-100">
            <span className="text-[11px] text-slate-400 font-semibold mr-1 shrink-0">Sport:</span>
            {sportsList.map((s) => (
              <button
                key={s.value}
                onClick={() => {
                  setSportFilter(s.value);
                  setFormatFilter('');
                }}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition shrink-0 flex items-center gap-1 ${
                  sportFilter === s.value
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200/60'
                }`}
              >
                {s.value && <SportIcon name={s.value} className="w-3 h-3" />}
                <span>{s.label}</span>
              </button>
            ))}
          </div>

          {sportMatches.some((m) => matchFormatKey(m.matchCategory)) && (
            <MatchFormatFilter value={formatFilter} onChange={setFormatFilter} matches={sportMatches} />
          )}
        </div>

        {/* Matches Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredMatches.length === 0 ? (
            <div className="col-span-2 bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-xs">
              <Swords className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="font-semibold text-slate-600">No assigned matches found matching your filters.</p>
              <p className="mt-1">Try resetting filters or search terms.</p>
            </div>
          ) : (
            filteredMatches.map((m) => {
              const participants = m.participants || [];
              const isSubmitted = m.status === 'SUBMITTED';
              const isCompleted = m.status === 'COMPLETED';
              const canDeclare = !isSubmitted && !isCompleted; // scheduled / in progress / returned for correction

              return (
                <div
                  key={m.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between hover:shadow-md transition"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-900 text-white">
                          {m.matchCode}
                        </span>
                        <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          <SportIcon name={m.sport?.name} className="w-4 h-4 text-blue-600" />
                          <span>{m.sport?.name}</span>
                        </span>
                        <span className="text-[11px] text-slate-400">• {m.round}</span>
                      </div>

                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          isCompleted
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : isSubmitted
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {isCompleted
                          ? 'Approved & Completed'
                          : isSubmitted
                          ? 'Under Admin Review'
                          : 'Awaiting Result'}
                      </span>
                    </div>

                    {/* Participant Entries Display */}
                    <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200 my-3 space-y-2">
                      {participants.map((p: any, idx: number) => {
                        const players = p.players || [];
                        const uniqueClubs = new Set<string>();
                        if (p.club?.name) uniqueClubs.add(p.club.name);
                        players.forEach((mpp: any) => {
                          if (mpp.club?.name) uniqueClubs.add(mpp.club.name);
                        });

                        return (
                          <div
                            key={p.id || idx}
                            className="bg-white p-2.5 rounded-lg border border-slate-200/80 flex items-center justify-between gap-2 shadow-2xs"
                          >
                            <div className="flex items-center gap-2.5">
                              {p.club ? (
                                <div className="w-7 h-7 rounded bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                                  <ClubBadge code={p.club.code} name={p.club.name} className="w-4 h-4" />
                                </div>
                              ) : (
                                <div className="w-7 h-7 rounded bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center shrink-0 font-bold text-xs">
                                  #{idx + 1}
                                </div>
                              )}
                              <div>
                                <span className="font-bold text-xs text-slate-900 block truncate max-w-[170px]">
                                  {p.cricketTeam?.name || p.teamName || p.club?.name || p.player?.name || `Entry ${idx + 1}`}
                                </span>
                                {p.cricketTeam ? (
                                  <span className="text-[10px] text-blue-600 font-semibold block">
                                    Parent House: {p.club?.name}
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-slate-400 block">
                                    {players.length > 0 ? `${players.length} players (${uniqueClubs.size} unique clubs)` : p.club?.code || 'Participant'}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="text-right shrink-0" style={{ flexShrink: 0, minWidth: 'max-content' }}>
                              {canDeclare ? (
                                <button
                                  onClick={() => setWinTarget({ match: m, participant: p })}
                                  title="Declare this side the winner"
                                  style={{ whiteSpace: 'nowrap', display: 'inline-flex', flexShrink: 0 }}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-[11px] font-extrabold transition whitespace-nowrap"
                                >
                                  <Trophy className="w-3.5 h-3.5 shrink-0" />
                                  Win
                                </button>
                              ) : p.isWinner ? (
                                <span
                                  style={{ whiteSpace: 'nowrap', display: 'inline-flex', flexShrink: 0 }}
                                  className="inline-flex items-center gap-1 font-mono font-extrabold text-xs text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 whitespace-nowrap shrink-0"
                                >
                                  <Trophy className="w-3 h-3 shrink-0" />
                                  {p.score}&nbsp;pts
                                </span>
                              ) : p.score !== null && p.score !== undefined ? (
                                <span
                                  style={{ whiteSpace: 'nowrap', display: 'inline-flex', flexShrink: 0 }}
                                  className="inline-flex items-center font-mono font-extrabold text-xs text-navy-950 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 whitespace-nowrap shrink-0"
                                >
                                  {p.score}&nbsp;pts
                                </span>
                              ) : (
                                <span style={{ whiteSpace: 'nowrap' }} className="text-[10px] text-slate-400 font-medium whitespace-nowrap">Pending</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="text-xs text-slate-500 flex items-center justify-between pt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{m.matchDate} at {m.matchTime}</span>
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-medium">
                      {isCompleted
                        ? 'Official Points Distributed'
                        : isSubmitted
                        ? 'Submitted by Referee'
                        : 'Ready for result submission'}
                    </span>

                    <Link
                      href={`/referee/matches/${m.matchCode}`}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg shadow-xs transition ${
                        isCompleted
                          ? 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                          : isSubmitted
                          ? 'bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100'
                          : 'bg-amber-500 hover:bg-amber-400 text-navy-950 font-extrabold shadow-sm'
                      }`}
                    >
                      {isCompleted ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          View Certified Record
                        </>
                      ) : isSubmitted ? (
                        <>
                          <FileCheck2 className="w-3.5 h-3.5 text-purple-600" />
                          View Submitted Breakdown
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 fill-navy-950" />
                          Enter Final Result & Points
                        </>
                      )}
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
      <DeclareWinnerModal
        forReferee
        match={winTarget?.match || null}
        participant={winTarget?.participant || null}
        onClose={() => setWinTarget(null)}
        onDone={(message) => {
          setSuccess(message);
          fetchMatches();
        }}
      />
    </RefereeLayout>
  );
}
