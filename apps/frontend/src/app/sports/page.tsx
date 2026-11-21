'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import PublicNavbar from '@/components/public/PublicNavbar';
import PublicFooter from '@/components/public/PublicFooter';
import { usePreventScroll } from '@/hooks/usePreventScroll';
import { SportIcon } from '@/components/ui/icons';
import {
  Trophy,
  Calendar,
  ChevronRight,
  X,
  ArrowRight,
  BookOpen,
  ShieldCheck,
  MapPin,
  Clock,
  Award,
  Users,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

interface ScoringRuleItem {
  id?: string;
  ruleCode?: string;
  ruleName: string;
  category?: string | null;
  awardType: string;
  points: number;
  description: string;
}

interface SportDetail {
  id: string;
  name: string;
  category: string;
  filterCategory: string;
  tournamentFormat: string;
  venue: string;
  timing: string;
  maxPoints: string;
  rulesSummary: string;
  description: string;
  heroImage: string;
  scoringRules: ScoringRuleItem[];
  playerCount?: number;
  matchCount?: number;
}

const CANONICAL_SPORTS: SportDetail[] = [
  {
    id: 'sport-cricket',
    name: 'Cricket',
    category: 'Field Sport',
    filterCategory: 'Field Sports',
    tournamentFormat: '10 Teams • 2 Pools • Super 4 • T10',
    venue: 'Main Sports Complex Oval',
    timing: 'Day & Floodlight Fixtures',
    maxPoints: '50 PTS Champion',
    rulesSummary:
      'Official T10 collegiate regulations. 10 overs per side, maximum 2 overs per bowler, powerplay in overs 1-3. Tied knockout matches decide progression via a Super Over.',
    description:
      'The flagship outdoor league featuring 10 franchise squads competing across intensive round-robin pools, semifinals, and the collegiate championship grand final.',
    heroImage: '/cricket.jpg',
    scoringRules: [
      { ruleName: 'Championship Final Winner', awardType: 'Team', points: 50, description: 'Awarded to the tournament champion' },
      { ruleName: 'Final Runner-Up', awardType: 'Team', points: 25, description: 'Awarded to the tournament runner-up' },
      { ruleName: '3rd Place Playoff Winner', awardType: 'Team', points: 20, description: 'Awarded to the 3rd place playoff winner' },
      { ruleName: 'Man of the Tournament (Men)', awardType: 'Individual', points: 15, description: 'MVP Men, credited directly to player house' },
      { ruleName: 'Man of the Tournament (Women)', awardType: 'Individual', points: 10, description: 'MVP Women, credited directly to player house' },
      { ruleName: 'Most Sixes of Tournament', awardType: 'Individual', points: 5, description: 'Power hitting leader award' },
    ],
  },
  {
    id: 'sport-football',
    name: 'Football',
    category: 'Team Sport',
    filterCategory: 'Field Sports',
    tournamentFormat: '5-a-side Turf League',
    venue: 'Synthetic Football Turf Arena',
    timing: 'Afternoon & Evening Sessions',
    maxPoints: '50 PTS Champion',
    rulesSummary:
      '5 active outfield players plus rolling substitutes. Two halves of 15 minutes each. Direct free kicks and sudden-death penalty deciders in knockout rounds.',
    description:
      'High-tempo turf football characterized by intense pressing, strategic set-pieces, and sudden-death penalty deciders under stadium perimeter lighting.',
    heroImage: '/football.jpg',
    scoringRules: [
      { ruleName: 'Championship Final Winner', awardType: 'Team', points: 50, description: 'Awarded to tournament champion team' },
      { ruleName: 'Final Runner-Up', awardType: 'Team', points: 25, description: 'Awarded to tournament runner-up team' },
      { ruleName: 'Per Match Win (Pool Stage)', awardType: 'Team', points: 10, description: 'Awarded for every pool stage match win' },
      { ruleName: 'Top Goalscorer (Golden Boot)', awardType: 'Individual', points: 15, description: 'Credited to player house' },
    ],
  },
  {
    id: 'sport-badminton',
    name: 'Badminton',
    category: 'Racquet',
    filterCategory: 'Racquet Sports',
    tournamentFormat: 'Men’s & Women’s Singles / Doubles',
    venue: 'Indoor Sprung Wooden Arena',
    timing: 'All-Day Knockout Brackets',
    maxPoints: '20 PTS Gold',
    rulesSummary:
      'BWF standard rally scoring. Best of 3 sets to 21 points with sudden death at 29-all. Men’s Singles, Men’s Doubles, Women’s Singles, and Women’s Doubles.',
    description:
      'Fast-paced 21-point rally format on Olympic sprung wooden courts, demanding lightning reflex defense, smash precision, and tactical court positioning.',
    heroImage: '/badminton.jpg',
    scoringRules: [
      { ruleName: '1st Place Champion (Singles/Doubles)', awardType: 'Team', points: 10, description: 'Awarded to bracket gold winner' },
      { ruleName: '2nd Place Runner-Up', awardType: 'Team', points: 7, description: 'Awarded to bracket silver winner' },
      { ruleName: '3rd Place Bronze', awardType: 'Team', points: 5, description: 'Awarded to 3rd place playoff winner' },
      { ruleName: 'Player of the Tournament', awardType: 'Individual', points: 5, description: 'MVP award credited to player house' },
    ],
  },
  {
    id: 'sport-chess',
    name: 'Chess',
    category: 'Mind Sport',
    filterCategory: 'Mind Sports',
    tournamentFormat: 'Rapid 15+10 Digital Boards',
    venue: 'Mind Sports Auditorium',
    timing: 'Timed Swiss System Rounds',
    maxPoints: '15 PTS Gold',
    rulesSummary:
      'FIDE Swiss Pairing system. 15 minutes baseline + 10-second increment per move on DGT digital sensor boards. Touch-move rule strictly enforced by referees.',
    description:
      'Strategic intellectual warfare on digital sensory boards where calculation, opening theory, and endgame composure directly score house points.',
    heroImage: '/chess.jpg',
    scoringRules: [
      { ruleName: '1st Place Champion', awardType: 'Team', points: 15, description: 'Swiss system tournament winner' },
      { ruleName: '2nd Place Runner-Up', awardType: 'Team', points: 10, description: 'Tournament silver medalist' },
      { ruleName: '3rd Place Bronze', awardType: 'Team', points: 7, description: 'Tournament bronze medalist' },
      { ruleName: 'Best Board 1 Master', awardType: 'Individual', points: 5, description: 'Highest performance rating on Board 1' },
    ],
  },
  {
    id: 'sport-carrom',
    name: 'Carrom',
    category: 'Indoor',
    filterCategory: 'Indoor Sports',
    tournamentFormat: 'Singles & Doubles Brackets',
    venue: 'Indoor Recreation Pavilion',
    timing: 'Morning & Afternoon Brackets',
    maxPoints: '15 PTS Gold',
    rulesSummary:
      'Points limit 25 or 8 boards. White 1 pt, Black 2 pts, Queen 3 pts. Immediate confirmation cover required on queen pocketing within the same turn.',
    description:
      'Classic precision board championship featuring singles and doubles brackets with surgical rebound angles and queen cover point systems.',
    heroImage: '/carrom.jpg',
    scoringRules: [
      { ruleName: '1st Place Champion', awardType: 'Team', points: 15, description: 'Tournament bracket champion' },
      { ruleName: '2nd Place Runner-Up', awardType: 'Team', points: 10, description: 'Tournament runner-up' },
      { ruleName: '3rd Place Bronze', awardType: 'Team', points: 7, description: '3rd place playoff winner' },
      { ruleName: 'White Slam / Special Feat', awardType: 'Individual', points: 3, description: 'Pocketing all carrom men in opening turn' },
    ],
  },
  {
    id: 'sport-bgmi',
    name: 'BGMI',
    category: 'Esports',
    filterCategory: 'E-Sports',
    tournamentFormat: 'Battle Royale 4-Man Squads',
    venue: 'Campus Esports LAN Dome',
    timing: 'LAN Broadcast Stage',
    maxPoints: '20 PTS Champion',
    rulesSummary:
      'Official esports points matrix. 8 pts for Winner Winner Chicken Dinner (WWCD) per match, 1 pt per verified kill. 20 pts for overall tournament champion squad.',
    description:
      'High-stakes mobile esports battle royale played across ultra-low-latency campus LAN servers with live casting, spectator cameras, and point telemetry.',
    heroImage: '/bgmi.jpg',
    scoringRules: [
      { ruleName: 'Overall Tournament Champion', awardType: 'Team', points: 20, description: 'Awarded to 1st place overall squad' },
      { ruleName: 'Overall Runner-Up', awardType: 'Team', points: 12, description: 'Awarded to 2nd place overall squad' },
      { ruleName: 'Per Match Win (WWCD)', awardType: 'Team', points: 8, description: 'Awarded per map chicken dinner' },
      { ruleName: 'Tournament MVP (Top Fragger)', awardType: 'Individual', points: 5, description: 'Credited directly to player house' },
    ],
  },
];

export default function SportsPage() {
  const [sports, setSports] = useState<SportDetail[]>(CANONICAL_SPORTS);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedSport, setSelectedSport] = useState<SportDetail | null>(null);
  usePreventScroll(!!selectedSport);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDynamicSports = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/sports');
        if (res.ok) {
          const apiSports = await res.json();
          if (Array.isArray(apiSports) && apiSports.length > 0) {
            // Merge dynamic counts and rules from backend
            const merged = CANONICAL_SPORTS.map((canon) => {
              const matched = apiSports.find(
                (as: any) =>
                  as.name?.toLowerCase() === canon.name.toLowerCase() ||
                  as.sportKey?.toLowerCase() === canon.name.toLowerCase()
              );

              if (matched) {
                const apiRules = Array.isArray(matched.scoringRules)
                  ? matched.scoringRules.map((r: any) => ({
                      ruleName: r.ruleName,
                      awardType: r.awardType || 'Team',
                      points: r.points,
                      description: r.description || '',
                    }))
                  : canon.scoringRules;

                return {
                  ...canon,
                  playerCount: matched._count?.players ?? canon.playerCount,
                  matchCount: matched._count?.matches ?? canon.matchCount,
                  scoringRules: apiRules.length > 0 ? apiRules : canon.scoringRules,
                };
              }
              return canon;
            });
            setSports(merged);
          }
        }
      } catch (err) {
        console.error('Failed to load sports from API:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDynamicSports();
  }, []);

  const categories = [
    { id: 'ALL', label: 'All Disciplines' },
    { id: 'Field Sports', label: 'Field Sports' },
    { id: 'Racquet Sports', label: 'Racquet' },
    { id: 'Mind Sports', label: 'Mind Sports' },
    { id: 'Indoor Sports', label: 'Indoor Board' },
    { id: 'E-Sports', label: 'E-Sports' },
  ];

  const filteredSports = useMemo(() => {
    if (selectedCategory === 'ALL') return sports;
    return sports.filter(
      (s) =>
        s.filterCategory.toLowerCase() === selectedCategory.toLowerCase() ||
        s.category.toLowerCase().includes(selectedCategory.toLowerCase())
    );
  }, [sports, selectedCategory]);

  return (
    <div className="min-h-screen bg-[#faf8ff] text-[#131b2e] font-inter text-[15px] antialiased selection:bg-[#0051d5] selection:text-white flex flex-col justify-between">
      <div>
        <PublicNavbar activeOverride="sports" />

        {/* ======================================================== */}
        {/* 1. HERO HEADER: STADIUM SPORTS ARENA                     */}
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
                  <span>APL Season 9 • Sanctioned Athletic Disciplines</span>
                </div>

                {/* Main Headline */}
                <h1 className="font-manrope text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white leading-none">
                  6 CHAMPIONSHIP{' '}
                  <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-300 bg-clip-text text-transparent">
                    SPORTS
                  </span>
                </h1>

                <p className="text-sm sm:text-base text-[#dce1ff] max-w-2xl mt-4 leading-relaxed font-normal">
                  Five collegiate houses contend across 6 officially sanctioned sporting disciplines. Every match victory, podium placement, and individual MVP honor channels points directly into the overall championship crown.
                </p>

                {/* Telemetry KPI Metric Chips */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 w-full max-w-2xl mt-7">
                  <div className="p-3 sm:p-3.5 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md">
                    <span className="text-[10px] sm:text-[11px] uppercase tracking-wider font-extrabold text-[#93c5fd] font-manrope block">
                      Disciplines
                    </span>
                    <span className="block font-manrope text-2xl sm:text-3xl font-black text-white">6</span>
                    <span className="text-[10px] text-white/60 font-medium">Official Sports</span>
                  </div>

                  <div className="p-3 sm:p-3.5 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md">
                    <span className="text-[10px] sm:text-[11px] uppercase tracking-wider font-extrabold text-amber-300 font-manrope block">
                      Houses
                    </span>
                    <span className="block font-manrope text-2xl sm:text-3xl font-black text-amber-400">5</span>
                    <span className="text-[10px] text-amber-200/70 font-medium">Full Roster Filed</span>
                  </div>

                  <div className="p-3 sm:p-3.5 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md">
                    <span className="text-[10px] sm:text-[11px] uppercase tracking-wider font-extrabold text-[#93c5fd] font-manrope block">
                      Contenders
                    </span>
                    <span className="block font-manrope text-2xl sm:text-3xl font-black text-white">94+</span>
                    <span className="text-[10px] text-white/60 font-medium">Varsity Athletes</span>
                  </div>

                  <div className="p-3 sm:p-3.5 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md">
                    <span className="text-[10px] sm:text-[11px] uppercase tracking-wider font-extrabold text-emerald-300 font-manrope block">
                      Rulebook
                    </span>
                    <span className="block font-manrope text-2xl sm:text-3xl font-black text-emerald-400">CERT</span>
                    <span className="text-[10px] text-emerald-200/70 font-medium">Admin Governed</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Arena Regulation Console */}
              <div className="lg:col-span-5">
                <div className="relative rounded-2xl bg-white/[0.08] backdrop-blur-xl border border-white/15 p-5 sm:p-6 shadow-2xl overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

                  <div className="flex items-center justify-between gap-3 pb-4 border-b border-white/10">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400/20 to-transparent border border-amber-400/30 p-1 flex items-center justify-center shrink-0"
                        style={{ width: '40px', height: '40px' }}
                      >
                        <img
                          src="/logo.png"
                          alt="APL Trophy"
                          className="w-full h-full object-contain"
                          style={{ width: '100%', height: '100%', maxWidth: '32px', maxHeight: '32px', objectFit: 'contain' }}
                        />
                      </div>
                      <div>
                        <span className="block font-manrope text-xs font-black uppercase tracking-wider text-white">
                          Arena Regulation Console
                        </span>
                        <span className="text-[10px] text-[#93c5fd] font-medium font-manrope">
                          NexCore Directorate of Physical Education
                        </span>
                      </div>
                    </div>

                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-[10px] font-bold text-emerald-300 uppercase tracking-wider font-manrope">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Certified Rules
                    </span>
                  </div>

                  <div className="pt-4 space-y-3">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-300 font-manrope block">
                      Championship Sports Desk
                    </span>

                    <div className="bg-black/25 rounded-xl p-3 border border-white/10 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#93c5fd] font-bold">Points System Authority:</span>
                        <span className="text-white font-mono font-bold">Standardized Matrix</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#93c5fd] font-bold">Knockout Tiebreaker:</span>
                        <span className="text-amber-300 font-semibold">Sudden-Death &amp; Super Over</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#93c5fd] font-bold">Live Referees:</span>
                        <span className="text-emerald-300 font-semibold">Certified Faculty Umpires</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 text-xs">
                      <Link
                        href="/schedule"
                        className="text-amber-300 hover:text-amber-200 font-extrabold uppercase tracking-wider font-manrope flex items-center gap-1 text-[11px]"
                      >
                        <span>View Sports Schedule</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                      <Link
                        href="/points-rules"
                        className="text-[#93c5fd] hover:text-white font-bold uppercase tracking-wider font-manrope text-[11px]"
                      >
                        Scoring By-Laws
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Category Filter Command Bar */}
            <div className="mt-8 pt-6 border-t border-white/10 flex items-center gap-2 overflow-x-auto no-scrollbar">
              {categories.map((cat) => {
                const isActive = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider font-manrope transition-all shrink-0 cursor-pointer ${
                      isActive
                        ? 'bg-white text-[#000f3f] shadow-lg shadow-black/20 scale-[1.02]'
                        : 'bg-white/10 hover:bg-white/15 text-[#dbe1ff] hover:text-white border border-white/10'
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>
        </header>

        {/* ======================================================== */}
        {/* 2. SPORTS CARDS GRID                                     */}
        {/* ======================================================== */}
        <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredSports.map((sp) => (
              <article
                key={sp.id}
                onClick={() => setSelectedSport(sp)}
                className="group rounded-2xl bg-white border border-[#e2e7ff] overflow-hidden shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between cursor-pointer"
              >
                {/* Card Top: Hero Image with Overlay */}
                <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-[#000f3f]">
                  <img
                    src={sp.heroImage}
                    alt={sp.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-60"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#000f3f] via-[#000f3f]/40 to-transparent" />

                  {/* Top Category Badge */}
                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-[10px] font-extrabold uppercase tracking-widest text-white font-manrope">
                      {sp.category}
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-amber-400 text-navy-950 font-black text-[10px] uppercase font-manrope shadow-sm">
                      {sp.maxPoints}
                    </span>
                  </div>

                  {/* Bottom Image Title */}
                  <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                    <div>
                      <h2 className="font-manrope text-2xl font-black uppercase text-white tracking-tight leading-none group-hover:text-amber-300 transition-colors">
                        {sp.name}
                      </h2>
                      <span className="text-[11px] font-semibold text-amber-200 mt-1 block font-manrope">
                        {sp.tournamentFormat}
                      </span>
                    </div>

                    <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform">
                      <SportIcon name={sp.name} className="w-5 h-5" />
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs text-[#45464f]">
                      <MapPin className="w-3.5 h-3.5 text-[#0051d5] shrink-0" />
                      <span className="font-medium truncate">{sp.venue}</span>
                    </div>

                    <p className="text-xs sm:text-sm text-[#45464f] leading-relaxed line-clamp-3">
                      {sp.description}
                    </p>
                  </div>

                  {/* Card Bottom Actions */}
                  <div className="pt-4 border-t border-[#e2e7ff] flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 font-manrope">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      Certified Rulebook
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedSport(sp);
                      }}
                      className="text-[#0051d5] hover:text-[#000f3f] font-extrabold uppercase tracking-wider text-[11px] font-manrope flex items-center gap-1 group-hover:translate-x-0.5 transition-transform cursor-pointer"
                    >
                      <span>View Scoring</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </main>
      </div>

      {/* ======================================================== */}
      {/* 3. SPORT DETAILS & SCORING MODAL                         */}
      {/* ======================================================== */}
      {selectedSport && (
        <div
          className="fixed inset-0 !m-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 overscroll-none touch-none"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedSport(null);
          }}
          onTouchMove={(e) => {
            if (e.target === e.currentTarget) e.preventDefault();
          }}
          onWheel={(e) => {
            if (e.target === e.currentTarget) e.preventDefault();
          }}
        >
          <div
            className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-[#e2e7ff] relative overflow-hidden flex flex-col max-h-[90vh] touch-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Hero Banner */}
            <div className="relative h-44 w-full bg-[#000f3f] overflow-hidden shrink-0">
              <img
                src={selectedSport.heroImage}
                alt={selectedSport.name}
                className="w-full h-full object-cover opacity-50"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#000f3f] via-[#000f3f]/50 to-transparent" />

              <button
                type="button"
                onClick={() => setSelectedSport(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/40 hover:bg-black/70 text-white transition cursor-pointer z-10"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="absolute bottom-4 left-6 right-6">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-400 text-navy-950 font-manrope shadow-xs">
                  {selectedSport.category}
                </span>
                <h3 className="font-manrope text-3xl font-black text-white uppercase mt-1 leading-none">
                  {selectedSport.name}
                </h3>
                <span className="text-xs text-[#dce1ff] font-medium mt-1 block">
                  {selectedSport.venue}
                </span>
              </div>
            </div>

            {/* Modal Content Scrollable Area */}
            <div className="p-6 overflow-y-auto space-y-4">
              {/* Format & Rules Summary */}
              <div className="p-3.5 rounded-xl bg-[#f2f3ff] border border-[#e2e7ff] space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#45464f] font-manrope block">
                  Tournament Format
                </span>
                <p className="text-xs font-bold text-[#000f3f] font-manrope">{selectedSport.tournamentFormat}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#faf8ff] border border-[#e2e7ff] space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#0051d5] font-manrope block">
                  Rules &amp; Regulations Summary
                </span>
                <p className="text-xs text-[#45464f] leading-relaxed">{selectedSport.rulesSummary}</p>
              </div>

              {/* Certified Points Distribution Table */}
              <div className="space-y-2">
                <span className="text-xs uppercase font-extrabold text-[#000f3f] font-manrope block">
                  Official Points Distribution Matrix
                </span>
                <div className="border border-[#e2e7ff] rounded-xl overflow-hidden divide-y divide-[#e2e7ff]">
                  {selectedSport.scoringRules.map((rule, idx) => (
                    <div key={idx} className="p-3 flex items-center justify-between text-xs bg-white">
                      <div>
                        <strong className="font-manrope text-xs font-bold text-[#000f3f] block">
                          {rule.ruleName}
                        </strong>
                        <span className="text-[10px] text-[#45464f] block">{rule.description}</span>
                      </div>
                      <span className="px-2.5 py-1 rounded bg-[#dae2fd] text-[#000f3f] font-mono font-black text-xs shrink-0">
                        +{rule.points} PTS
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Bottom Buttons */}
            <div className="p-4 bg-[#f8f9ff] border-t border-[#e2e7ff] flex gap-3 shrink-0">
              <Link
                href="/schedule"
                onClick={() => setSelectedSport(null)}
                className="flex-1 py-3 rounded-xl bg-[#000f3f] hover:bg-[#0051d5] text-white text-center font-extrabold uppercase tracking-wider text-xs transition font-manrope flex items-center justify-center gap-2 shadow-xs"
              >
                <span>View {selectedSport.name} Fixtures</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                type="button"
                onClick={() => setSelectedSport(null)}
                className="px-5 py-3 rounded-xl bg-white hover:bg-[#e2e7ff] text-[#000f3f] border border-[#e2e7ff] font-bold uppercase text-xs transition font-manrope cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. PUBLIC FOOTER                                         */}
      {/* ======================================================== */}
      <PublicFooter />
    </div>
  );
}
