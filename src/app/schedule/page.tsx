'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import PublicNavbar from '@/components/public/PublicNavbar';
import {
  Calendar,
  Clock,
  MapPin,
  Search,
  Filter,
  X,
  ChevronRight,
  Shield,
  Trophy,
  Tv,
  CheckCircle2,
  Users,
  ExternalLink,
} from 'lucide-react';

interface Fixture {
  id: string;
  discipline: string;
  disciplineIcon: string;
  round: string;
  day: string;
  dateStr: string;
  timeStr: string;
  venue: string;
  status: 'LIVE' | 'UPCOMING' | 'FINISHED';
  teamA: {
    name: string;
    code: string;
    crestBg: string;
    textColor: string;
    score?: string;
    subScore?: string;
    isBatting?: boolean;
    isWinner?: boolean;
  };
  teamB: {
    name: string;
    code: string;
    crestBg: string;
    textColor: string;
    score?: string;
    subScore?: string;
    isBatting?: boolean;
    isWinner?: boolean;
  };
  summary: string;
  referee: string;
}

const SCHEDULE_FIXTURES: Fixture[] = [
  {
    id: 'fix-1',
    discipline: 'Cricket T10',
    disciplineIcon: 'sports_cricket',
    round: 'Qualifier 1 • Inning 2',
    day: 'Day 04 (Oct 27)',
    dateStr: 'Today • Oct 27',
    timeStr: 'LIVE NOW',
    venue: 'Main University Floodlit Arena (Pitch 01)',
    status: 'LIVE',
    teamA: {
      name: 'Mavericks',
      code: 'MAV',
      crestBg: 'bg-[#dbe1ff]',
      textColor: 'text-[#0051d5]',
      score: '102/3',
      subScore: '7.2 / 10.0 Overs',
      isBatting: true,
    },
    teamB: {
      name: 'Dominators',
      code: 'DOM',
      crestBg: 'bg-[#ffdad6]',
      textColor: 'text-[#ba1a1a]',
      score: '144/5',
      subScore: '10.0 Overs (Innings Complete)',
    },
    summary: 'Target 145. 43 needed from 16 balls. High intensity death overs battle.',
    referee: 'Prof. Suresh Nair (Certified BCCI Level 2 Umpire)',
  },
  {
    id: 'fix-2',
    discipline: 'Football',
    disciplineIcon: 'sports_soccer',
    round: 'Football Semi-Final 1',
    day: 'Day 04 (Oct 27)',
    dateStr: 'Today • Oct 27',
    timeStr: '15:30 IST',
    venue: 'West Astroturf Championship Stadium',
    status: 'UPCOMING',
    teamA: {
      name: 'Alphas',
      code: 'ALP',
      crestBg: 'bg-[#ffdbca]',
      textColor: 'text-[#eb6905]',
      subScore: '3-0 Group Record',
    },
    teamB: {
      name: 'Spartans',
      code: 'SPA',
      crestBg: 'bg-[#dae2fd]',
      textColor: 'text-[#000f3f]',
      subScore: '2-1 Group Record',
    },
    summary: 'Golden goal rules apply. Alphas lead possession stats at 64% throughout group stage.',
    referee: 'Dr. Rajeshwar Rao (AIFF National Panel)',
  },
  {
    id: 'fix-3',
    discipline: 'Badminton',
    disciplineIcon: 'sports_tennis',
    round: 'Mixed Doubles Round 2',
    day: 'Day 04 (Oct 27)',
    dateStr: 'Today • Oct 27',
    timeStr: '16:45 IST',
    venue: 'Indoor Sports Complex (Court 02)',
    status: 'UPCOMING',
    teamA: {
      name: 'Dominators',
      code: 'DOM',
      crestBg: 'bg-[#ffdad6]',
      textColor: 'text-[#ba1a1a]',
      subScore: 'Seed #1',
    },
    teamB: {
      name: 'Phoenix',
      code: 'PHX',
      crestBg: 'bg-[#ffdbca]',
      textColor: 'text-[#783200]',
      subScore: 'Seed #4',
    },
    summary: 'Best of 3 sets to 21 points. Defending champions Dominators field varsity duo.',
    referee: 'Sunita Pillai (BAI State Referee)',
  },
  {
    id: 'fix-4',
    discipline: 'Basketball',
    disciplineIcon: 'sports_basketball',
    round: 'Men’s League Match 04',
    day: 'Day 04 (Oct 27)',
    dateStr: 'Today • Oct 27',
    timeStr: '18:15 IST',
    venue: 'Apex Main Arena (Hardwood Court A)',
    status: 'UPCOMING',
    teamA: {
      name: 'Mavericks',
      code: 'MAV',
      crestBg: 'bg-[#dbe1ff]',
      textColor: 'text-[#0051d5]',
      subScore: 'Streak: 5W',
    },
    teamB: {
      name: 'Phoenix',
      code: 'PHX',
      crestBg: 'bg-[#ffdbca]',
      textColor: 'text-[#783200]',
      subScore: 'Streak: 4W',
    },
    summary: 'Marquee clash. Both teams undefeated on indoor courts this championship season.',
    referee: 'Arjun Das (BFI Certified Referee)',
  },
  {
    id: 'fix-5',
    discipline: 'Blitz Chess',
    disciplineIcon: 'chess',
    round: 'Quarter-Final Board 01',
    day: 'Day 04 (Oct 27)',
    dateStr: 'Today • Oct 27',
    timeStr: '19:00 IST',
    venue: 'Mind Sports Auditorium (Table 01)',
    status: 'UPCOMING',
    teamA: {
      name: 'Alphas',
      code: 'ALP',
      crestBg: 'bg-[#ffdbca]',
      textColor: 'text-[#eb6905]',
      subScore: 'FIDE 2045',
    },
    teamB: {
      name: 'Dominators',
      code: 'DOM',
      crestBg: 'bg-[#ffdad6]',
      textColor: 'text-[#ba1a1a]',
      subScore: 'FIDE 2110',
    },
    summary: '5 min + 3s increment rapid chess. Sensor digital board streaming moves live.',
    referee: 'K. Balakrishnan (International Arbiter)',
  },
  {
    id: 'fix-6',
    discipline: 'BGMI Esports',
    disciplineIcon: 'sports_esports',
    round: 'Grand Finals Lobby Match 3',
    day: 'Day 04 (Oct 27)',
    dateStr: 'Today • Oct 27',
    timeStr: '20:30 IST',
    venue: 'Student Esports Arena (Main Stage)',
    status: 'UPCOMING',
    teamA: {
      name: 'Mavericks',
      code: 'MAV',
      crestBg: 'bg-[#dbe1ff]',
      textColor: 'text-[#0051d5]',
      subScore: '32 WWCD Pts',
    },
    teamB: {
      name: 'Dominators',
      code: 'DOM',
      crestBg: 'bg-[#ffdad6]',
      textColor: 'text-[#ba1a1a]',
      subScore: '28 WWCD Pts',
    },
    summary: 'Erangel Map 3. All 5 houses drop together with live casters in student hub.',
    referee: 'Esports League Commissioner',
  },
  {
    id: 'fix-7',
    discipline: 'Football',
    disciplineIcon: 'sports_soccer',
    round: 'Quarter-Final 02',
    day: 'Day 03 (Oct 26)',
    dateStr: 'Yesterday • Oct 26',
    timeStr: 'COMPLETED',
    venue: 'West Astroturf Championship Stadium',
    status: 'FINISHED',
    teamA: {
      name: 'Dominators',
      code: 'DOM',
      crestBg: 'bg-[#ffdad6]',
      textColor: 'text-[#ba1a1a]',
      score: '3',
      subScore: 'FT',
      isWinner: true,
    },
    teamB: {
      name: 'Mavericks',
      code: 'MAV',
      crestBg: 'bg-[#dbe1ff]',
      textColor: 'text-[#0051d5]',
      score: '1',
      subScore: 'FT',
    },
    summary: 'Dominators advance to semi-finals behind a brace from Rohit Deshmukh.',
    referee: 'Dr. Rajeshwar Rao (AIFF National Panel)',
  },
  {
    id: 'fix-8',
    discipline: 'Table Tennis',
    disciplineIcon: 'sports_kabaddi',
    round: 'Men’s Singles Semi-Final',
    day: 'Day 03 (Oct 26)',
    dateStr: 'Yesterday • Oct 26',
    timeStr: 'COMPLETED',
    venue: 'Indoor Sports Complex (Table 04)',
    status: 'FINISHED',
    teamA: {
      name: 'Spartans',
      code: 'SPA',
      crestBg: 'bg-[#dae2fd]',
      textColor: 'text-[#000f3f]',
      score: '3',
      subScore: 'Sets (11-9, 11-8, 11-7)',
      isWinner: true,
    },
    teamB: {
      name: 'Phoenix',
      code: 'PHX',
      crestBg: 'bg-[#ffdbca]',
      textColor: 'text-[#783200]',
      score: '0',
      subScore: 'Sets',
    },
    summary: 'Spartans clinch silver medal berth with swift 3-0 clean sweep.',
    referee: 'M. Saxena (TTFI Arbiter)',
  },
];

export default function SchedulePage() {
  const [selectedDiscipline, setSelectedDiscipline] = useState('All');
  const [selectedHouse, setSelectedHouse] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState<'All' | 'LIVE' | 'UPCOMING' | 'FINISHED'>('All');
  const [activeDay, setActiveDay] = useState('Day 04 (Oct 27)');
  const [activeFixture, setActiveFixture] = useState<Fixture | null>(null);
  const [showLiveModal, setShowLiveModal] = useState(false);

  // Filter fixtures
  const filteredFixtures = SCHEDULE_FIXTURES.filter((fix) => {
    if (selectedDiscipline !== 'All' && !fix.discipline.toLowerCase().includes(selectedDiscipline.toLowerCase())) {
      return false;
    }
    if (selectedHouse !== 'All') {
      if (fix.teamA.name !== selectedHouse && fix.teamB.name !== selectedHouse) {
        return false;
      }
    }
    if (selectedStatus !== 'All' && fix.status !== selectedStatus) {
      return false;
    }
    return true;
  });

  return (
    <div className="bg-[#faf8ff] text-[#131b2e] font-inter text-[15px] antialiased selection:bg-[#0051d5] selection:text-white min-h-screen">
      <PublicNavbar activeOverride="schedule" />

      <main className="w-full pt-20 pb-20">
        {/* ======================================================== */}
        {/* TOP HERO HEADER & TOURNAMENT TELEMETRY BAR                */}
        {/* ======================================================== */}
        <section className="w-full bg-[#000f3f] text-white py-12 lg:py-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#000f3f] via-[#172554] to-[#000f3f] opacity-90" />
          <div className="absolute -right-24 -top-24 w-96 h-96 bg-[#0051d5]/20 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 relative z-10 flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <span className="text-xs uppercase tracking-widest text-[#dbe1ff] font-extrabold font-manrope">
                FIXTURES TELEMETRY &amp; MATCH PROTOCOL • APL S9
              </span>
              <h1 className="font-manrope text-4xl sm:text-6xl font-black uppercase tracking-tight text-white leading-none">
                TOURNAMENT SCHEDULE &amp; FIXTURES
              </h1>
              <p className="text-sm sm:text-base text-[#b7c4fd] max-w-3xl leading-relaxed mt-1">
                Forty-two sanctioned championship fixtures across eight collegiate disciplines. Real-time scores, referee verification, and dynamic venue tracking.
              </p>
            </div>

            {/* Quick KPIs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-white/10 border border-white/15 text-xs font-bold font-manrope">
                <span className="text-[#eb6905] text-base font-black">42</span>
                <span className="text-[#dce1ff]">Total Fixtures</span>
              </div>
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-white/10 border border-white/15 text-xs font-bold font-manrope">
                <span className="text-white text-base font-black">08</span>
                <span className="text-[#dce1ff]">Disciplines</span>
              </div>
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-white/10 border border-white/15 text-xs font-bold font-manrope">
                <span className="text-[#dbe1ff] text-base font-black">05</span>
                <span className="text-[#dce1ff]">Houses</span>
              </div>
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#eb6905]/20 border border-[#eb6905]/40 text-xs font-bold font-manrope">
                <span className="w-2 h-2 rounded-full bg-[#eb6905] animate-ping" />
                <span className="text-[#ffdbca]">1 Live Match Right Now</span>
              </div>
            </div>

            {/* Prominent Broadcast Live Match Card */}
            <div className="mt-4 relative w-full rounded-2xl overflow-hidden bg-[#172554] text-white shadow-2xl border border-white/15">
              <div className="absolute top-0 left-0 w-2 h-full bg-[#eb6905]" />
              <div className="p-6 sm:p-8 relative z-10 flex flex-col gap-6">
                {/* Top bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/15">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ba1a1a] text-white text-[10px] uppercase tracking-wider font-black font-manrope animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-white" />
                      LIVE • Cricket T10
                    </span>
                    <span className="text-xs text-[#dbe1ff] font-bold uppercase font-manrope">
                      Qualifier 1 • Inning 2
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-[#dce1ff] font-medium">
                    <MapPin className="w-4 h-4 text-[#eb6905]" />
                    <span>Main University Floodlit Arena (Pitch 01)</span>
                  </div>
                </div>

                {/* Scoreboard Duel */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                  {/* Team A */}
                  <div className="lg:col-span-5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="w-14 h-14 rounded-xl bg-[#0051d5] text-white flex items-center justify-center font-manrope text-2xl font-black shrink-0 shadow-md">
                        M
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-manrope text-xl sm:text-2xl font-extrabold uppercase text-white">
                            Mavericks
                          </span>
                          <span className="px-2 py-0.5 rounded bg-[#eb6905] text-white text-[10px] uppercase font-black font-manrope">
                            BAT
                          </span>
                        </div>
                        <span className="text-xs text-[#dbe1ff]">Crimson House • CRR: 13.90</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-manrope text-3xl sm:text-4xl font-black text-white tabular-nums">
                        102/3
                      </span>
                      <span className="text-xs text-[#ffdbca] block font-mono font-semibold">
                        7.2 / 10.0 Overs
                      </span>
                    </div>
                  </div>

                  {/* VS Equation */}
                  <div className="lg:col-span-2 flex flex-col items-center justify-center text-center p-3 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10">
                    <span className="text-[10px] uppercase text-[#808dc2] font-bold font-manrope">
                      Target 145
                    </span>
                    <span className="font-manrope text-lg font-black text-white my-0.5">
                      43 needed
                    </span>
                    <span className="text-[11px] text-[#eb6905] uppercase font-bold font-manrope">
                      from 16 balls
                    </span>
                  </div>

                  {/* Team B */}
                  <div className="lg:col-span-5 flex items-center justify-between gap-4">
                    <div className="text-left lg:text-right order-2 lg:order-1">
                      <span className="font-manrope text-3xl sm:text-4xl font-black text-white tabular-nums">
                        144/5
                      </span>
                      <span className="text-xs text-[#808dc2] block font-mono font-semibold">
                        10.0 Overs (Innings 1)
                      </span>
                    </div>
                    <div className="flex items-center gap-3 sm:gap-4 order-1 lg:order-2">
                      <div className="flex flex-col text-right hidden sm:flex">
                        <span className="font-manrope text-xl sm:text-2xl font-extrabold uppercase text-white">
                          Dominators
                        </span>
                        <span className="text-xs text-[#dbe1ff]">Cobalt House • Defending</span>
                      </div>
                      <div className="w-14 h-14 rounded-xl bg-[#ba1a1a] text-white flex items-center justify-center font-manrope text-2xl font-black shrink-0 shadow-md">
                        D
                      </div>
                    </div>
                  </div>
                </div>

                {/* Over Strip & Commentary */}
                <div className="pt-4 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-xs text-[#dce1ff] w-full md:w-auto">
                    <span className="px-2 py-0.5 rounded bg-[#eb6905] text-white font-mono font-bold uppercase shrink-0">
                      Over 7.2
                    </span>
                    <p className="truncate">
                      R. Sharma drives through extra cover for a thumping FOUR! High pressure bowling by Dominators&apos; lead paceman.
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 self-end md:self-auto">
                    <div className="flex items-center gap-1 text-xs">
                      <span className="text-[#808dc2] uppercase font-manrope text-[10px] mr-1">
                        Current Over:
                      </span>
                      <span className="w-6 h-6 rounded-full bg-white text-[#000f3f] flex items-center justify-center font-bold text-xs">
                        1
                      </span>
                      <span className="w-6 h-6 rounded-full bg-[#ba1a1a] text-white flex items-center justify-center font-bold text-xs">
                        4
                      </span>
                      <span className="w-6 h-6 rounded-full bg-white/20 text-white flex items-center justify-center font-bold text-xs">
                        W
                      </span>
                      <span className="w-6 h-6 rounded-full bg-[#eb6905] text-white flex items-center justify-center font-bold text-xs">
                        6
                      </span>
                      <span className="w-6 h-6 rounded-full bg-white text-[#000f3f] flex items-center justify-center font-bold text-xs">
                        2
                      </span>
                      <span className="w-6 h-6 rounded-full bg-[#ba1a1a] text-white flex items-center justify-center font-bold text-xs">
                        4
                      </span>
                    </div>
                    <button
                      onClick={() => setShowLiveLiveStream(true)}
                      className="px-4 py-1.5 rounded-lg bg-[#eb6905] hover:bg-[#783200] text-white text-xs uppercase font-bold font-manrope transition-colors cursor-pointer"
                    >
                      Watch Stream
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* INTERACTIVE DAY TABS & FILTER BAR                         */}
        {/* ======================================================== */}
        <section className="w-full bg-white py-4 shadow-sm border-b border-[#e2e7ff] sticky top-20 z-40">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 space-y-3">
            {/* Day selector tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              {[
                'Day 01 (Oct 24)',
                'Day 02 (Oct 25)',
                'Day 03 (Oct 26)',
                'Day 04 (Oct 27)',
                'Day 05 (Oct 28)',
                'Day 06 (Oct 29)',
                'Day 07 (Oct 30)',
                'Day 08 (Oct 31)',
                'Day 09 (Nov 01)',
                'Day 10 (Nov 02)',
                'Day 11 (Nov 03)',
                'Day 12 • Finals (Nov 04)',
              ].map((dayStr) => (
                <button
                  key={dayStr}
                  onClick={() => setActiveDay(dayStr)}
                  className={`px-4 py-1.5 rounded-lg text-xs uppercase tracking-wider font-bold font-manrope shrink-0 transition-all cursor-pointer ${
                    activeDay === dayStr
                      ? 'bg-[#000f3f] text-white shadow-sm'
                      : 'bg-[#f2f3ff] text-[#45464f] hover:bg-[#e2e7ff] hover:text-[#000f3f]'
                  }`}
                >
                  {dayStr}
                </button>
              ))}
            </div>

            {/* Discipline & House filter bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-[#e2e7ff]">
              {/* Discipline buttons */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                <span className="text-xs text-[#45464f] uppercase font-bold font-manrope mr-1 shrink-0">
                  Discipline:
                </span>
                {[
                  'All',
                  'Cricket',
                  'Football',
                  'Badminton',
                  'Basketball',
                  'Table Tennis',
                  'Chess',
                  'Athletics',
                  'BGMI',
                ].map((disc) => (
                  <button
                    key={disc}
                    onClick={() => setSelectedDiscipline(disc)}
                    className={`px-3 py-1 rounded text-xs uppercase font-bold font-manrope shrink-0 transition-colors cursor-pointer ${
                      selectedDiscipline === disc
                        ? 'bg-[#0051d5] text-white'
                        : 'bg-[#f2f3ff] hover:bg-[#e2e7ff] text-[#131b2e]'
                    }`}
                  >
                    {disc}
                  </button>
                ))}
              </div>

              {/* Status & House Selectors */}
              <div className="flex items-center gap-3 ml-auto">
                <div className="flex items-center gap-1.5 bg-[#f2f3ff] px-3 py-1.5 rounded-lg text-xs font-bold font-manrope border border-[#e2e7ff]">
                  <span className="text-[#45464f]">House:</span>
                  <select
                    value={selectedHouse}
                    onChange={(e) => setSelectedHouse(e.target.value)}
                    className="bg-transparent text-[#000f3f] uppercase focus:outline-none cursor-pointer"
                  >
                    <option value="All">All Houses</option>
                    <option value="Mavericks">Mavericks (Crimson)</option>
                    <option value="Dominators">Dominators (Cobalt)</option>
                    <option value="Alphas">Alphas (Emerald)</option>
                    <option value="Spartans">Spartans (Amber)</option>
                    <option value="Phoenix">Phoenix (Solar)</option>
                  </select>
                </div>

                {/* Status Toggle Buttons */}
                <div className="flex items-center gap-1 bg-[#f2f3ff] p-1 rounded-lg border border-[#e2e7ff]">
                  {(['All', 'LIVE', 'UPCOMING', 'FINISHED'] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => setSelectedStatus(st)}
                      className={`px-3 py-1 rounded text-[11px] uppercase font-bold font-manrope transition-all cursor-pointer ${
                        selectedStatus === st
                          ? 'bg-white text-[#000f3f] shadow-xs'
                          : 'text-[#45464f] hover:text-[#000f3f]'
                      }`}
                    >
                      {st === 'LIVE' ? 'Live (1)' : st}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* COMPREHENSIVE FIXTURES BENTO GRID                         */}
        {/* ======================================================== */}
        <section className="w-full py-12">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-3 h-8 bg-[#0051d5] rounded-full" />
                <h2 className="font-manrope text-2xl sm:text-3xl font-extrabold uppercase text-[#000f3f] tracking-tight">
                  Scheduled Matches ({filteredFixtures.length})
                </h2>
              </div>
              <span className="text-xs text-[#45464f] font-mono font-medium">
                Timezone: IST (UTC+5:30) • Refereed by NIT Sports Council
              </span>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredFixtures.map((fixture) => (
                <div
                  key={fixture.id}
                  onClick={() => setActiveFixture(fixture)}
                  className="bg-white rounded-2xl p-6 flex flex-col justify-between shadow-sm hover:shadow-xl transition-all duration-200 border border-[#e2e7ff] relative overflow-hidden group cursor-pointer"
                >
                  <div
                    className={`absolute top-0 left-0 w-1.5 h-full ${
                      fixture.status === 'LIVE'
                        ? 'bg-[#ba1a1a]'
                        : fixture.status === 'FINISHED'
                        ? 'bg-[#767680]'
                        : 'bg-[#0051d5]'
                    }`}
                  />

                  <div>
                    {/* Header line */}
                    <div className="flex items-center justify-between pb-3 mb-4 bg-[#f2f3ff] p-2.5 rounded-xl border border-[#e2e7ff]/70">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-lg text-[#000f3f]">
                          {fixture.disciplineIcon}
                        </span>
                        <span className="text-xs font-bold text-[#000f3f] uppercase font-manrope">
                          {fixture.round}
                        </span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase font-manrope ${
                          fixture.status === 'LIVE'
                            ? 'bg-[#ba1a1a] text-white animate-pulse'
                            : fixture.status === 'FINISHED'
                            ? 'bg-[#e2e7ff] text-[#45464f]'
                            : 'bg-[#dbe1ff] text-[#0051d5]'
                        }`}
                      >
                        {fixture.status === 'LIVE' ? 'LIVE NOW' : fixture.timeStr}
                      </span>
                    </div>

                    {/* Teams Faceoff */}
                    <div className="space-y-3 py-2">
                      {/* Team A */}
                      <div className="flex items-center justify-between p-3 rounded-xl bg-[#faf8ff] border border-[#e2e7ff]/60 group-hover:border-[#0051d5]/40 transition-colors">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-lg ${fixture.teamA.crestBg} ${fixture.teamA.textColor} flex items-center justify-center font-manrope font-extrabold text-sm`}
                          >
                            {fixture.teamA.code}
                          </div>
                          <div>
                            <span className="font-manrope text-base font-bold text-[#000f3f] uppercase block leading-tight">
                              {fixture.teamA.name}
                            </span>
                            <span className="text-[11px] text-[#45464f] font-mono">
                              {fixture.teamA.subScore}
                            </span>
                          </div>
                        </div>
                        {fixture.teamA.score && (
                          <span
                            className={`font-manrope text-xl font-black ${
                              fixture.teamA.isWinner ? 'text-[#0051d5]' : 'text-[#000f3f]'
                            }`}
                          >
                            {fixture.teamA.score}
                          </span>
                        )}
                      </div>

                      {/* Team B */}
                      <div className="flex items-center justify-between p-3 rounded-xl bg-[#faf8ff] border border-[#e2e7ff]/60 group-hover:border-[#0051d5]/40 transition-colors">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-lg ${fixture.teamB.crestBg} ${fixture.teamB.textColor} flex items-center justify-center font-manrope font-extrabold text-sm`}
                          >
                            {fixture.teamB.code}
                          </div>
                          <div>
                            <span className="font-manrope text-base font-bold text-[#000f3f] uppercase block leading-tight">
                              {fixture.teamB.name}
                            </span>
                            <span className="text-[11px] text-[#45464f] font-mono">
                              {fixture.teamB.subScore}
                            </span>
                          </div>
                        </div>
                        {fixture.teamB.score && (
                          <span
                            className={`font-manrope text-xl font-black ${
                              fixture.teamB.isWinner ? 'text-[#0051d5]' : 'text-[#000f3f]'
                            }`}
                          >
                            {fixture.teamB.score}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="pt-4 mt-2 border-t border-[#e2e7ff] flex items-center justify-between text-xs text-[#45464f]">
                    <div className="flex items-center gap-1.5 truncate max-w-[240px]">
                      <MapPin className="w-3.5 h-3.5 text-[#0051d5] shrink-0" />
                      <span className="truncate">{fixture.venue}</span>
                    </div>
                    <span className="text-[11px] font-bold text-[#0051d5] uppercase font-manrope group-hover:translate-x-1 transition-transform inline-flex items-center gap-0.5 shrink-0">
                      Match Center →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* VENUE DIRECTORY BENTO                                     */}
        {/* ======================================================== */}
        <section className="w-full py-12 bg-[#f2f3ff] border-t border-[#e2e7ff]">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 space-y-6">
            <div className="flex flex-col gap-1">
              <span className="text-xs uppercase tracking-widest text-[#0051d5] font-extrabold font-manrope">
                CAMPUS INFRASTRUCTURE
              </span>
              <h3 className="font-manrope text-2xl sm:text-3xl font-extrabold text-[#000f3f] uppercase">
                Championship Venues &amp; Facilities
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6">
              {[
                {
                  name: 'Main Oval Ground',
                  code: 'ARENA 01',
                  sports: 'Cricket T10 & 400m Track',
                  capacity: '5,000 Seats',
                  status: 'Active (Floodlights On)',
                },
                {
                  name: 'Indoor Sports Complex',
                  code: 'ARENA 02',
                  sports: 'Badminton & Table Tennis',
                  capacity: '1,800 Seats',
                  status: 'Active',
                },
                {
                  name: 'West Astroturf Stadium',
                  code: 'ARENA 03',
                  sports: 'Football Knockouts',
                  capacity: '3,200 Seats',
                  status: 'Next Match: 15:30',
                },
                {
                  name: 'Student Esports Stage',
                  code: 'ARENA 04',
                  sports: 'BGMI Squad Finals & LAN',
                  capacity: '800 Seats',
                  status: 'Setup Ready',
                },
              ].map((venue, idx) => (
                <div
                  key={idx}
                  className="bg-white p-5 rounded-xl border border-[#e2e7ff] shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <span className="text-[10px] text-[#0051d5] uppercase font-black font-manrope">
                      {venue.code}
                    </span>
                    <h4 className="font-manrope text-lg font-bold text-[#000f3f] uppercase mt-0.5">
                      {venue.name}
                    </h4>
                    <span className="text-xs text-[#45464f] block mt-1">{venue.sports}</span>
                  </div>
                  <div className="pt-3 mt-4 border-t border-[#e2e7ff] flex items-center justify-between text-xs">
                    <span className="text-[#45464f] font-mono">{venue.capacity}</span>
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold font-manrope">
                      {venue.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* MATCH CENTER MODAL */}
      {activeFixture && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative border border-[#e2e7ff]">
            <button
              onClick={() => setActiveFixture(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-[#f2f3ff] hover:bg-[#e2e7ff] text-[#45464f] hover:text-[#000f3f] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <span className="px-2.5 py-0.5 rounded bg-[#000f3f] text-white text-[10px] font-black uppercase font-manrope">
                {activeFixture.discipline}
              </span>
              <span className="text-xs font-bold text-[#45464f] uppercase font-manrope">
                {activeFixture.round}
              </span>
            </div>

            {/* Duel Presentation */}
            <div className="grid grid-cols-5 items-center text-center py-6 bg-[#f2f3ff] rounded-xl my-4 border border-[#e2e7ff]">
              <div className="col-span-2 flex flex-col items-center">
                <span className="w-12 h-12 rounded-xl bg-white text-[#000f3f] flex items-center justify-center font-manrope text-lg font-black shadow-sm mb-1">
                  {activeFixture.teamA.code}
                </span>
                <span className="font-manrope text-base font-bold text-[#000f3f] uppercase">
                  {activeFixture.teamA.name}
                </span>
                {activeFixture.teamA.score && (
                  <span className="font-manrope text-2xl font-black text-[#0051d5]">
                    {activeFixture.teamA.score}
                  </span>
                )}
              </div>

              <div className="col-span-1 text-center font-black text-sm text-[#45464f] font-manrope">
                VS
              </div>

              <div className="col-span-2 flex flex-col items-center">
                <span className="w-12 h-12 rounded-xl bg-white text-[#000f3f] flex items-center justify-center font-manrope text-lg font-black shadow-sm mb-1">
                  {activeFixture.teamB.code}
                </span>
                <span className="font-manrope text-base font-bold text-[#000f3f] uppercase">
                  {activeFixture.teamB.name}
                </span>
                {activeFixture.teamB.score && (
                  <span className="font-manrope text-2xl font-black text-[#ba1a1a]">
                    {activeFixture.teamB.score}
                  </span>
                )}
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[#45464f] leading-relaxed mb-4">
              {activeFixture.summary}
            </p>

            <div className="space-y-2 text-xs text-[#45464f] bg-[#faf8ff] p-4 rounded-xl border border-[#e2e7ff] mb-6">
              <div className="flex justify-between">
                <span className="font-medium">Scheduled Time:</span>
                <span className="font-bold text-[#000f3f]">{activeFixture.dateStr} • {activeFixture.timeStr}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Venue:</span>
                <span className="font-bold text-[#000f3f]">{activeFixture.venue}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Certified Referee:</span>
                <span className="font-bold text-[#0051d5]">{activeFixture.referee}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/leaderboard"
                onClick={() => setActiveFixture(null)}
                className="flex-1 py-3 rounded-xl bg-[#000f3f] hover:bg-[#0051d5] text-white text-xs font-bold uppercase tracking-wider text-center transition-colors font-manrope"
              >
                View House Standings Impact
              </Link>
              <button
                onClick={() => setActiveFixture(null)}
                className="px-5 py-3 rounded-xl bg-[#f2f3ff] hover:bg-[#e2e7ff] text-[#000f3f] text-xs font-bold uppercase tracking-wider transition-colors font-manrope cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
