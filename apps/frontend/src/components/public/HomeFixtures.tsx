'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { FeaturedMatch, MatchCard } from './MatchCards';
import { isDone, isLive, isPending, pickNext, startsAt, useNow, usePublicSchedule, PublicMatch } from './matchView';

/** Home page "Fixtures": the next match in detail, the matches after it, and the latest results. All live data. */
export default function HomeFixtures({ onLiveStream }: { onLiveStream?: () => void }) {
  const { data, loading, error } = usePublicSchedule();
  const now = useNow();
  const [sport, setSport] = useState('All');

  const matches = data || [];
  const sports = useMemo(() => {
    const names = Array.from(new Set(matches.map((m) => m.sport?.name).filter(Boolean) as string[])).sort();
    return ['All', ...names];
  }, [matches]);
  const countFor = (name: string) => (name === 'All' ? matches.length : matches.filter((m) => m.sport?.name === name).length);

  const visible = matches.filter((m) => sport === 'All' || m.sport?.name === sport);
  const next = pickNext(visible, now);
  const upcoming = visible
    .filter((m) => m.id !== next?.id && (m.status === 'SCHEDULED' || m.status === 'AWAITING_RESULT' || isLive(m)))
    .sort((a, b) => startsAt(a).getTime() - startsAt(b).getTime())
    .slice(0, 3);
  const recent: PublicMatch[] = visible
    .filter((m) => isDone(m) || isPending(m))
    .sort((a, b) => startsAt(b).getTime() - startsAt(a).getTime())
    .slice(0, 3);

  return (
    <section className="w-full py-16 lg:py-20 bg-[#faf8ff]" id="fixtures">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-8 h-1 bg-[#0051d5] rounded-full" />
              <span className="text-xs text-[#0051d5] uppercase tracking-widest font-extrabold font-manrope">FIXTURES &amp; LIVE UPDATES</span>
            </div>
            <h2 className="font-manrope text-3xl sm:text-5xl font-extrabold text-[#000f3f] uppercase tracking-tight">THE ROAD TO GLORY</h2>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 no-scrollbar">
            {sports.map((tab) => (
              <button
                key={tab}
                onClick={() => setSport(tab)}
                className={`px-4 py-2 rounded-lg text-xs uppercase tracking-wider font-extrabold font-manrope transition-all cursor-pointer whitespace-nowrap ${
                  sport === tab ? 'bg-[#000f3f] text-white shadow-sm' : 'bg-[#e2e7ff] hover:bg-[#dae2fd] text-[#45464f]'
                }`}
              >
                {tab} ({countFor(tab)})
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <p className="py-16 text-center text-sm text-[#45464f]">Loading the schedule…</p>
        ) : error && !data ? (
          <p className="py-16 text-center text-sm text-[#ba1a1a]">Could not load the schedule right now. Please try again shortly.</p>
        ) : visible.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-xl border border-[#e2e7ff]">
            <span className="material-symbols-outlined text-4xl text-[#c5c6d0]">event_busy</span>
            <p className="mt-2 text-sm font-semibold text-[#000f3f]">No matches scheduled yet</p>
            <p className="text-xs text-[#45464f]">Fixtures will appear here as soon as they are scheduled.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              <div className="lg:col-span-7">
                {next ? (
                  <FeaturedMatch match={next} now={now} onLiveStream={onLiveStream} />
                ) : (
                  <div className="h-full bg-white rounded-xl border border-[#e2e7ff] p-8 flex flex-col items-center justify-center text-center">
                    <span className="material-symbols-outlined text-4xl text-[#c5c6d0]">sports_score</span>
                    <p className="mt-2 text-sm font-semibold text-[#000f3f]">No upcoming match</p>
                    <p className="text-xs text-[#45464f]">All scheduled matches have been played. See the results below.</p>
                  </div>
                )}
              </div>

              <div className="lg:col-span-5 flex flex-col gap-4 sm:gap-5">
                <span className="text-[11px] text-[#45464f] uppercase tracking-widest font-extrabold font-manrope">Coming up next</span>
                {upcoming.length === 0 ? (
                  <p className="text-sm text-[#45464f] bg-white rounded-xl border border-[#e2e7ff] p-5">No further matches are scheduled.</p>
                ) : (
                  upcoming.map((m) => <MatchCard key={m.id} match={m} now={now} />)
                )}
              </div>
            </div>

            {recent.length > 0 && (
              <div className="mt-10">
                <span className="text-[11px] text-[#45464f] uppercase tracking-widest font-extrabold font-manrope">Latest results</span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                  {recent.map((m) => (
                    <MatchCard key={m.id} match={m} now={now} />
                  ))}
                </div>
              </div>
            )}

            <div className="mt-8 text-center">
              <Link
                href="/schedule"
                className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-[#0051d5] hover:text-[#000f3f] font-bold font-manrope transition-colors"
              >
                <span>View the full schedule</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
