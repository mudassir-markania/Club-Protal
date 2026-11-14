'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/layout/AppLayout';
import {
  Swords,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Play,
  Trophy,
  ArrowRight,
  Shield,
  Medal,
  MapPin,
} from 'lucide-react';
import { ClubBadge, SportIcon } from '@/components/ui/icons';

export default function RefereeDashboardPage() {
  const [user, setUser] = useState<any | null>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRefereeData();
  }, []);

  const fetchRefereeData = async () => {
    setLoading(true);
    try {
      const meRes = await fetch('/api/auth/me');
      const meData = await meRes.json();
      setUser(meData.user);

      // Fetch matches assigned to referee
      const refId = meData.user?.refereeId;
      const url = refId ? `/api/matches?refereeId=${refId}` : '/api/matches';
      const matchesRes = await fetch(url);
      const matchesData = await matchesRes.json();

      setMatches(Array.isArray(matchesData) ? matchesData : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const assignedSports = user?.referee?.sports || [];
  const inProgressMatches = matches.filter((m) => m.status === 'IN_PROGRESS');
  const upcomingMatches = matches.filter((m) => m.status === 'SCHEDULED' || m.status === 'UPCOMING');
  const pendingSubmissions = matches.filter((m) => m.status === 'SUBMITTED' || m.status === 'AWAITING_RESULT');
  const completedMatches = matches.filter((m) => m.status === 'COMPLETED');

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Referee Banner */}
        <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-navy-800 text-white p-6 rounded-2xl shadow-md border border-navy-800 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider">
                  Field Official Control Center
                </span>
                <span className="text-xs text-navy-300 font-mono">
                  ID: {user?.referee?.refereeCode || 'REF-OFFICIAL'}
                </span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight">
                Welcome back, Referee {user?.name || 'Official'}
              </h1>
              <p className="text-xs text-navy-300 mt-1">
                Authorized for live match scoring, set tracking, and result submissions.
              </p>
            </div>

            <Link
              href="/referee/matches"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-navy-950 font-bold text-xs rounded-lg shadow-sm transition"
            >
              <Swords className="w-4 h-4" />
              Open My Matches
            </Link>
          </div>
        </div>

        {/* Referee Dashboard Statistics (Requirement 5.A) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Assigned Sports
            </span>
            <p className="text-2xl font-extrabold text-navy-950">
              {assignedSports.length > 0 ? assignedSports.length : 2}
            </p>
            <div className="flex items-center gap-1 mt-1 text-[11px] text-slate-400 truncate">
              {assignedSports.map((s: any) => s.sport?.name).join(', ') || 'Football, Cricket'}
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-rose-200/80 bg-rose-50/20 shadow-2xs">
            <span className="text-xs font-bold text-rose-700 uppercase tracking-wider block mb-1">
              In Progress
            </span>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-extrabold text-rose-700">{inProgressMatches.length}</p>
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
            </div>
            <span className="text-[11px] text-rose-600 mt-1 block font-medium">Live score entry</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-amber-200/80 bg-amber-50/20 shadow-2xs">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider block mb-1">
              Awaiting Approval
            </span>
            <p className="text-2xl font-extrabold text-amber-700">{pendingSubmissions.length}</p>
            <span className="text-[11px] text-amber-600 mt-1 block font-medium">Pending admin verification</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-blue-200/80 bg-blue-50/20 shadow-2xs">
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider block mb-1">
              Upcoming
            </span>
            <p className="text-2xl font-extrabold text-blue-700">{upcomingMatches.length}</p>
            <span className="text-[11px] text-blue-600 mt-1 block font-medium">Scheduled fixtures</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-emerald-200/80 bg-emerald-50/20 shadow-2xs">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block mb-1">
              Completed
            </span>
            <p className="text-2xl font-extrabold text-emerald-700">{completedMatches.length}</p>
            <span className="text-[11px] text-emerald-600 mt-1 block font-medium">Official outcomes</span>
          </div>
        </div>

        {/* Live / Immediate Matches Queue */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-navy-950 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
              Live & Upcoming Officiating Assignments
            </h2>
            <Link href="/referee/matches" className="text-xs text-blue-600 font-semibold hover:underline">
              View All Assigned Matches →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {matches.slice(0, 4).map((match) => {
              const p1 = match.participants?.[0];
              const p2 = match.participants?.[1];

              return (
                <div
                  key={match.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                          {match.matchCode}
                        </span>
                        <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                          {match.sport?.icon} {match.sport?.name}
                        </span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          match.status === 'IN_PROGRESS'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200 animate-pulse'
                            : match.status === 'SUBMITTED'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : match.status === 'COMPLETED'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}
                      >
                        {match.status}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 mb-3">{match.round}</p>

                    {/* Scoreboard display */}
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0">
                          <ClubBadge code={p1?.club?.code} name={p1?.club?.name} className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-xs text-slate-800 truncate max-w-[120px]">
                          {p1?.club?.name || p1?.teamName || 'TBD'}
                        </span>
                      </div>

                      <div className="font-mono font-extrabold text-base text-navy-950 px-2 py-0.5 rounded bg-white border border-slate-200 shadow-2xs">
                        {p1?.score ?? 0} : {p2?.score ?? 0}
                      </div>

                      <div className="flex items-center gap-2 text-right">
                        <span className="font-bold text-xs text-slate-800 truncate max-w-[120px]">
                          {p2?.club?.name || p2?.teamName || 'TBD'}
                        </span>
                        <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0">
                          <ClubBadge code={p2?.club?.code} name={p2?.club?.name} className="w-4 h-4" />
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 text-[11px] text-slate-500 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{match.matchDate} at {match.matchTime}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{match.venue?.name || 'Main Field'}</span>
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-end">
                    <Link
                      href={`/referee/matches/${match.matchCode}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-navy-900 hover:bg-navy-800 text-white text-xs font-bold rounded-lg shadow-xs transition"
                    >
                      <Play className="w-3.5 h-3.5" />
                      Manage Match Sheet
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

