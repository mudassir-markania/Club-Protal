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

      <header className="bg-[#000f3f] text-white">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 py-12 lg:py-16">
          <span className="text-xs text-[#ffdbca] uppercase tracking-widest font-extrabold font-manrope">Fixtures &amp; results</span>
          <h1 className="font-manrope text-4xl sm:text-6xl font-extrabold uppercase tracking-tight mt-2">Match Schedule</h1>
          <p className="text-sm sm:text-base text-[#dce1ff] max-w-2xl mt-3">
            Every scheduled match across all sports, with the teams, players and houses taking part. Results and the points table update as matches are played.
          </p>
          <div className="flex flex-wrap gap-3 mt-6">
            {[
              { label: 'Upcoming', value: counts.upcoming },
              { label: 'Live now', value: counts.live },
              { label: 'Completed', value: counts.results },
            ].map((c) => (
              <div key={c.label} className="px-4 py-2.5 rounded-lg bg-white/10 border border-white/15 text-center min-w-[96px]">
                <span className="block font-manrope text-2xl font-black text-[#ffdbca]">{c.value}</span>
                <span className="text-[10px] uppercase tracking-wider font-bold text-[#dce1ff]">{c.label}</span>
              </div>
            ))}
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
