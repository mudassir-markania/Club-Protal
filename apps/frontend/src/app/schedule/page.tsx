'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import PublicNavbar from '@/components/public/PublicNavbar';
import PublicFooter from '@/components/public/PublicFooter';
import { FeaturedMatch, MatchCard } from '@/components/public/MatchCards';
import {
  PublicMatch,
  houseColor,
  isDone,
  isLive,
  isPending,
  matchTitle,
  whenLabel,
  countdownLabel,
  pickNext,
  startsAt,
  useHouseStandings,
  useNow,
  usePublicSchedule,
} from '@/components/public/matchView';

type StatusTab = 'ALL' | 'UPCOMING' | 'LIVE' | 'RESULTS';

const TABS: { id: StatusTab; label: string }[] = [
  { id: 'ALL', label: 'All matches' },
  { id: 'UPCOMING', label: 'Upcoming' },
  { id: 'LIVE', label: 'Live' },
  { id: 'RESULTS', label: 'Results' },
];

const matchesTab = (m: PublicMatch, tab: StatusTab) => {
  if (tab === 'UPCOMING') return m.status === 'SCHEDULED' || m.status === 'AWAITING_RESULT';
  if (tab === 'LIVE') return isLive(m);
  if (tab === 'RESULTS') return isDone(m) || isPending(m);
  return true;
};

const dayHeading = (date?: string, now?: Date) => {
  if (!date) return 'TBA';
  try {
    const parts = date.split('-').map(Number);
    if (parts.length < 3 || isNaN(parts[0]) || isNaN(parts[1]) || isNaN(parts[2])) {
      return date;
    }
    const [y, mo, d] = parts;
    const day = new Date(y, mo - 1, d);
    if (isNaN(day.getTime())) return date;
    const n = now || new Date();
    const diff = Math.round((day.getTime() - new Date(n.getFullYear(), n.getMonth(), n.getDate()).getTime()) / 86400000);
    const label = day.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    return diff === 0 ? `Today • ${label}` : diff === 1 ? `Tomorrow • ${label}` : label;
  } catch {
    return date || 'TBA';
  }
};

export default function SchedulePage() {
  const { data, loading, error } = usePublicSchedule();
  const standings = useHouseStandings();
  const now = useNow();

  const [tab, setTab] = useState<StatusTab>('ALL');
  const [sport, setSport] = useState('All');
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const matches = data || [];
  const sports = useMemo(() => ['All', ...Array.from(new Set(matches.map((m) => m.sport?.name).filter(Boolean) as string[])).sort()], [matches]);

  const q = search.trim().toLowerCase();
  const filtered = matches
    .filter((m) => (sport === 'All' || m.sport?.name === sport) && matchesTab(m, tab))
    .filter((m) => {
      if (!q) return true;
      const hay = [
        m.matchCode,
        m.sport?.name,
        m.categoryLabel,
        m.round,
        ...(m.sides || []).flatMap((s) => [s.name, ...(s.players || []), ...(s.clubs || []).map((c) => c.name)]),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    })
    .sort((a, b) => {
      // results newest first, everything else soonest first
      const t = startsAt(a).getTime() - startsAt(b).getTime();
      return tab === 'RESULTS' ? -t : t;
    });

  const byDay = useMemo(() => {
    const groups = new Map<string, PublicMatch[]>();
    filtered.forEach((m) => {
      const d = m.date || 'TBA';
      groups.set(d, [...(groups.get(d) || []), m]);
    });
    return Array.from(groups.entries());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered.map((m) => m.id + m.status).join(',')]);

  const next = pickNext(matches, now);
  const counts = {
    upcoming: matches.filter((m) => matchesTab(m, 'UPCOMING')).length,
    live: matches.filter(isLive).length,
    results: matches.filter((m) => isDone(m) || isPending(m)).length,
  };
  const top = (standings.data?.standings || []).slice(0, 5);

  return (
    <div className="min-h-screen bg-[#faf8ff] text-[#131b2e]">
      <PublicNavbar activeOverride="schedule" />

      {/* ======================================================== */}
      {/* 1. HERO HEADER: STADIUM MATCH CENTER                     */}
      {/* ======================================================== */}
      <header className="relative w-full pt-24 sm:pt-28 lg:pt-32 pb-12 sm:pb-16 bg-gradient-to-br from-[#000f3f] via-[#071952] to-[#010922] text-white overflow-hidden border-b border-[#3b82f6]/20 shadow-xl">
        {/* Decorative Ambient Radial Glows */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-[#eb6905]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-[#0051d5]/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] opacity-5 pointer-events-none" />

        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Heading & Telemetry Metrics */}
            <div className="lg:col-span-7 flex flex-col items-start">
              {/* Season Pill Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[11px] font-extrabold uppercase tracking-widest text-amber-300 font-manrope mb-4 shadow-inner">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>APL Season 9 • Tournament Match Center</span>
              </div>

              {/* Main Headline */}
              <h1 className="font-manrope text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white leading-none">
                MATCH{' '}
                <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-300 bg-clip-text text-transparent">
                  SCHEDULE
                </span>
              </h1>

              <p className="text-sm sm:text-base text-[#dce1ff] max-w-2xl mt-4 leading-relaxed font-normal">
                Official collegiate fixtures, live courtside scores, and approved results across all sports. Follow your house athletes as they compete for collegiate supremacy.
              </p>

              {/* Interactive Telemetry Chips */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 w-full max-w-2xl mt-7">
                <button
                  type="button"
                  onClick={() => setTab('ALL')}
                  className={`text-left p-3 sm:p-3.5 rounded-xl border backdrop-blur-md transition-all cursor-pointer ${
                    tab === 'ALL'
                      ? 'bg-white/20 border-amber-400/80 shadow-lg shadow-amber-500/10 scale-[1.02]'
                      : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] sm:text-[11px] uppercase tracking-wider font-extrabold text-[#93c5fd] font-manrope">
                      All Matches
                    </span>
                    <span className="material-symbols-outlined text-[16px] text-[#93c5fd]">calendar_view_week</span>
                  </div>
                  <span className="block font-manrope text-2xl sm:text-3xl font-black text-white">{matches.length}</span>
                  <span className="text-[10px] text-white/60 font-medium">Full Schedule</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTab('UPCOMING')}
                  className={`text-left p-3 sm:p-3.5 rounded-xl border backdrop-blur-md transition-all cursor-pointer ${
                    tab === 'UPCOMING'
                      ? 'bg-white/20 border-amber-400/80 shadow-lg shadow-amber-500/10 scale-[1.02]'
                      : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] sm:text-[11px] uppercase tracking-wider font-extrabold text-amber-300 font-manrope">
                      Upcoming
                    </span>
                    <span className="material-symbols-outlined text-[16px] text-amber-300">event_upcoming</span>
                  </div>
                  <span className="block font-manrope text-2xl sm:text-3xl font-black text-amber-400">{counts.upcoming}</span>
                  <span className="text-[10px] text-amber-200/70 font-medium">To Be Played</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTab('LIVE')}
                  className={`text-left p-3 sm:p-3.5 rounded-xl border backdrop-blur-md transition-all cursor-pointer ${
                    tab === 'LIVE'
                      ? 'bg-rose-500/20 border-rose-400 shadow-lg shadow-rose-500/20 scale-[1.02]'
                      : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] sm:text-[11px] uppercase tracking-wider font-extrabold text-rose-300 font-manrope flex items-center gap-1">
                      {counts.live > 0 && <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />}
                      Live Now
                    </span>
                    <span className="material-symbols-outlined text-[16px] text-rose-300">sensors</span>
                  </div>
                  <span className={`block font-manrope text-2xl sm:text-3xl font-black ${counts.live > 0 ? 'text-rose-400' : 'text-white/80'}`}>
                    {counts.live}
                  </span>
                  <span className="text-[10px] text-rose-200/70 font-medium">In Progress</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTab('RESULTS')}
                  className={`text-left p-3 sm:p-3.5 rounded-xl border backdrop-blur-md transition-all cursor-pointer ${
                    tab === 'RESULTS'
                      ? 'bg-white/20 border-emerald-400/80 shadow-lg shadow-emerald-500/10 scale-[1.02]'
                      : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] sm:text-[11px] uppercase tracking-wider font-extrabold text-emerald-300 font-manrope">
                      Completed
                    </span>
                    <span className="material-symbols-outlined text-[16px] text-emerald-300">verified</span>
                  </div>
                  <span className="block font-manrope text-2xl sm:text-3xl font-black text-emerald-400">{counts.results}</span>
                  <span className="text-[10px] text-emerald-200/70 font-medium">Points Logged</span>
                </button>
              </div>
            </div>

            {/* Right Column: Broadcast Spotlight Console */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl bg-white/[0.08] backdrop-blur-xl border border-white/15 p-5 sm:p-6 shadow-2xl overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

                {/* Console Top Header */}
                <div className="flex items-center justify-between gap-3 pb-4 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400/20 to-transparent border border-amber-400/30 p-1 flex items-center justify-center shrink-0"
                      style={{ width: '40px', height: '40px' }}
                    >
                      <img
                        src="/logo.png"
                        alt="APL"
                        className="w-full h-full object-contain"
                        style={{ width: '100%', height: '100%', maxWidth: '32px', maxHeight: '32px', objectFit: 'contain' }}
                      />
                    </div>
                    <div>
                      <span className="block font-manrope text-xs font-black uppercase tracking-wider text-white">
                        APL Broadcast Hub
                      </span>
                      <span className="text-[10px] text-[#93c5fd] font-medium font-manrope">NexCore Sports Complex</span>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-[10px] font-bold text-emerald-300 uppercase tracking-wider font-manrope">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Live Telemetry
                  </span>
                </div>

                {/* Spotlight Match Preview or Standings Overview */}
                {next ? (
                  <div className="pt-4 space-y-3.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-300 font-manrope">
                        Next Up on Court
                      </span>
                      <span className="text-[11px] font-mono text-[#93c5fd] bg-white/10 px-2 py-0.5 rounded">
                        {next.matchCode}
                      </span>
                    </div>

                    <div className="bg-black/25 rounded-xl p-3 border border-white/10">
                      <div className="text-xs font-black uppercase text-white font-manrope truncate mb-2">
                        {matchTitle(next)}
                      </div>

                      {next.sides.length === 2 ? (
                        <div className="grid grid-cols-5 items-center gap-2 py-1 text-center">
                          <div className="col-span-2 min-w-0">
                            <span className="block text-xs sm:text-sm font-bold text-white uppercase font-manrope truncate">
                              {next.sides[0]?.name || 'Side 1'}
                            </span>
                            <span className="block text-[10px] text-[#93c5fd] uppercase font-semibold truncate">
                              {next.sides[0]?.clubs?.[0]?.name || 'House'}
                            </span>
                          </div>
                          <span className="col-span-1 font-manrope text-xs font-black text-amber-400">VS</span>
                          <div className="col-span-2 min-w-0">
                            <span className="block text-xs sm:text-sm font-bold text-white uppercase font-manrope truncate">
                              {next.sides[1]?.name || 'Side 2'}
                            </span>
                            <span className="block text-[10px] text-[#93c5fd] uppercase font-semibold truncate">
                              {next.sides[1]?.clubs?.[0]?.name || 'House'}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-[#dce1ff] font-medium">
                          {next.sides.length} teams competing: {next.sides.map((s) => s.name).join(', ')}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <div className="flex items-center gap-1.5 text-[#dce1ff]">
                        <span className="material-symbols-outlined text-[16px] text-amber-400">schedule</span>
                        <span className="font-bold">{whenLabel(next, now)}</span>
                      </div>
                      <span className="text-[11px] text-amber-300 font-semibold">{countdownLabel(next, now)}</span>
                    </div>
                  </div>
                ) : (
                  <div className="pt-4 space-y-3">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-300 font-manrope">
                      Championship Leaderboard
                    </span>
                    <div className="bg-black/25 rounded-xl p-3 border border-white/10 flex items-center justify-between">
                      <div>
                        <span className="text-[11px] text-[#93c5fd] uppercase font-bold block">Current Leader</span>
                        <span className="text-sm font-black uppercase text-white font-manrope">
                          {top[0]?.club?.name || 'Blue Club'}
                        </span>
                      </div>
                      <span className="text-lg font-black font-manrope text-amber-400">
                        {top[0]?.points ?? 31} PTS
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <Link
                        href="/leaderboard"
                        className="text-xs font-extrabold text-amber-300 hover:text-amber-200 uppercase tracking-wider font-manrope flex items-center gap-1"
                      >
                        <span>View Overall Leaderboard</span>
                        <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                      </Link>
                      <Link
                        href="/houses"
                        className="text-xs font-bold text-[#93c5fd] hover:text-white uppercase tracking-wider font-manrope"
                      >
                        5 Houses
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-xl border border-[#e2e7ff] shadow-sm p-4 space-y-3">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex flex-wrap gap-1.5">
                  {TABS.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTab(t.id)}
                      className={`px-3.5 py-1.5 rounded-lg text-xs uppercase tracking-wider font-extrabold font-manrope transition cursor-pointer ${
                        tab === t.id ? 'bg-[#000f3f] text-white' : 'bg-[#e2e7ff] text-[#45464f] hover:bg-[#dae2fd]'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
                <div className="relative md:w-64">
                  <span className="material-symbols-outlined text-[18px] text-[#757682] absolute left-3 top-1/2 -translate-y-1/2">search</span>
                  <input
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search team, player or house"
                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#f2f3ff] border border-[#e2e7ff] text-xs outline-none focus:ring-2 focus:ring-[#0051d5] focus:bg-white"
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-3 border-t border-[#e2e7ff]">
                {sports.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSport(s)}
                    className={`px-3 py-1 rounded-md text-[11px] font-bold transition cursor-pointer ${
                      sport === s ? 'bg-[#0051d5] text-white' : 'bg-[#f2f3ff] text-[#45464f] hover:bg-[#e2e7ff] border border-[#e2e7ff]'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Matches by day */}
            {loading ? (
              <p className="py-16 text-center text-sm text-[#45464f]">Loading the schedule…</p>
            ) : error && !data ? (
              <p className="py-16 text-center text-sm text-[#ba1a1a]">Could not load the schedule right now. Please try again shortly.</p>
            ) : byDay.length === 0 ? (
              <div className="py-16 text-center bg-white rounded-xl border border-[#e2e7ff]">
                <span className="material-symbols-outlined text-4xl text-[#c5c6d0]">event_busy</span>
                <p className="mt-2 text-sm font-semibold text-[#000f3f]">{matches.length === 0 ? 'No matches scheduled yet' : 'No matches match your filters'}</p>
                {matches.length > 0 && <p className="text-xs text-[#45464f]">Try another sport, status or search.</p>}
              </div>
            ) : (
              byDay.map(([date, list]) => (
                <section key={date}>
                  <h2 className="font-manrope text-sm font-extrabold uppercase tracking-wider text-[#000f3f] mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#0051d5] text-[20px]">calendar_month</span>
                    {dayHeading(date, now)}
                    <span className="text-xs text-[#757682] font-semibold normal-case">({list.length})</span>
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {list.map((m) => (
                      <MatchCard
                        key={m.id}
                        match={m}
                        now={now}
                        expanded={!!expanded[m.id]}
                        onToggle={() => setExpanded((prev) => ({ ...prev, [m.id]: !prev[m.id] }))}
                      />
                    ))}
                  </div>
                </section>
              ))
            )}
          </div>

          {/* Sidebar: next match + points table */}
          <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            <div>
              <span className="text-[11px] text-[#45464f] uppercase tracking-widest font-extrabold font-manrope block mb-2">Next match</span>
              {next ? (
                <FeaturedMatch match={next} now={now} />
              ) : (
                <p className="text-sm text-[#45464f] bg-white rounded-xl border border-[#e2e7ff] p-5">No upcoming match.</p>
              )}
            </div>

            <div className="bg-white rounded-xl border border-[#e2e7ff] shadow-sm overflow-hidden">
              <div className="p-3.5 bg-[#000f3f] text-white flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider font-bold font-manrope">Points table</span>
                <Link href="/leaderboard" className="text-[11px] text-[#ffdbca] font-bold uppercase hover:underline">
                  Full table
                </Link>
              </div>
              {top.length === 0 ? (
                <p className="p-4 text-xs text-[#45464f]">{standings.loading ? 'Loading…' : 'No standings yet.'}</p>
              ) : (
                <ul>
                  {top.map((h) => (
                    <li key={h.id} className="flex items-center justify-between gap-3 px-4 py-3 border-b last:border-0 border-[#e2e7ff]/70">
                      <span className="flex items-center gap-2.5 min-w-0">
                        <span className="font-manrope font-extrabold text-sm w-6" style={{ color: houseColor(h?.club?.code, h?.club?.name) }}>
                          {h.rank}
                        </span>
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: houseColor(h?.club?.code, h?.club?.name) }} />
                        <span className="font-manrope text-sm font-bold uppercase text-[#000f3f] truncate">{h?.club?.name || 'House'}</span>
                      </span>
                      <span className="font-manrope text-base font-extrabold text-[#000f3f]">
                        {typeof h?.points === 'number' ? (Number.isInteger(h.points) ? h.points : h.points.toFixed(2)) : 0}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </aside>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
