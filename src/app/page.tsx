'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import PublicNavbar from '@/components/public/PublicNavbar';
import PublicFooter from '@/components/public/PublicFooter';
import {
  Trophy,
  Medal,
  Calendar,
  MapPin,
  Clock,
  Crown,
  Shield,
  ArrowRight,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Users,
  Gamepad2,
  Target,
  Megaphone,
  CheckCircle2,
  Search,
  BarChart3,
  X,
  ExternalLink,
} from 'lucide-react';
import { SportIcon } from '@/components/ui/icons';
import HeroChampionshipTrophy from '@/components/public/HeroChampionshipTrophy';
import HeroStadiumBackground from '@/components/public/HeroStadiumBackground';

// Mockup Accurate House Standings Data
const MOCKUP_HOUSES = [
  {
    id: 'house-mav',
    rank: 1,
    name: 'Mavericks',
    code: 'MAV',
    wins: 21,
    gold: 8,
    silver: 4,
    bronze: 3,
    points: 420,
    captain: 'Alex Rivera',
    motto: 'Unyielding Speed, Unbroken Pride',
    accentColor: '#DC2626',
    gradient: 'from-[#991B1B] via-[#DC2626] to-[#7F1D1D]',
  },
  {
    id: 'house-dom',
    rank: 2,
    name: 'Dominators',
    code: 'DOM',
    wins: 18,
    gold: 6,
    silver: 5,
    bronze: 4,
    points: 380,
    captain: 'Leo Vance',
    motto: 'Command the Arena, Rule the Field',
    accentColor: '#1E3A8A',
    gradient: 'from-[#0C2D57] via-[#1E3A8A] to-[#144272]',
  },
  {
    id: 'house-alp',
    rank: 3,
    name: 'Alphas',
    code: 'ALP',
    wins: 17,
    gold: 5,
    silver: 4,
    bronze: 5,
    points: 355,
    captain: 'Ethan Hunt',
    motto: 'First to Strike, Last to Fall',
    accentColor: '#7C3AED',
    gradient: 'from-[#3B185F] via-[#591A75] to-[#4C1D95]',
  },
  {
    id: 'house-spa',
    rank: 4,
    name: 'Spartans',
    code: 'SPA',
    wins: 14,
    gold: 4,
    silver: 3,
    bronze: 4,
    points: 310,
    captain: 'Marcus Cole',
    motto: 'Discipline in Battle, Honor in Triumph',
    accentColor: '#D97706',
    gradient: 'from-[#78350F] via-[#B45309] to-[#92400E]',
  },
  {
    id: 'house-phx',
    rank: 5,
    name: 'Phoenix',
    code: 'PHX',
    wins: 12,
    gold: 3,
    silver: 4,
    bronze: 3,
    points: 275,
    captain: 'Aiden Drake',
    motto: 'From the Ashes, Infinite Radiance',
    accentColor: '#EA580C',
    gradient: 'from-[#9A3412] via-[#EA580C] to-[#C2410C]',
  },
];

// 8 Participating Sports from the Mockup
const MOCKUP_SPORTS = [
  {
    id: 'cricket',
    name: 'Cricket',
    category: 'Field Sport',
    format: '10 Teams • 2 Pools • Super 4',
    iconBg: 'bg-sky-50 text-sky-600 border-sky-100',
    hoverBorder: 'hover:border-sky-300',
    tag: 'Outdoor Turf',
    rules: 'T10 Fast Overs • 11 Players • 2 Sub Fielders • Super Over Decider',
  },
  {
    id: 'football',
    name: 'Football',
    category: 'Field Sport',
    format: '5-a-side Turf League',
    iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    hoverBorder: 'hover:border-emerald-300',
    tag: 'Main Arena',
    rules: '20 Min Halves • 5 Players • Penalty Shootout on Draw',
  },
  {
    id: 'badminton',
    name: 'Badminton',
    category: 'Racquet',
    format: 'Singles • Doubles • Mixed',
    iconBg: 'bg-cyan-50 text-cyan-600 border-cyan-100',
    hoverBorder: 'hover:border-cyan-300',
    tag: 'Indoor Court A',
    rules: 'Best of 3 Sets • 21 Rally Points • BWF Official Shuttle',
  },
  {
    id: 'table-tennis',
    name: 'Table Tennis',
    category: 'Racquet',
    format: '11-Point Fast Table',
    iconBg: 'bg-rose-50 text-rose-600 border-rose-100',
    hoverBorder: 'hover:border-rose-300',
    tag: 'Indoor Court B',
    rules: 'Best of 5 Games • 11 Points • Deuce 2-Point Lead Required',
  },
  {
    id: 'chess',
    name: 'Chess',
    category: 'Mind Sport',
    format: 'Rapid & Classical FIDE',
    iconBg: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    hoverBorder: 'hover:border-indigo-300',
    tag: 'Quiet Hall 3',
    rules: '15+10 Rapid Clock • FIDE Swiss System • Touch Move Enforced',
  },
  {
    id: 'carrom',
    name: 'Carrom',
    category: 'Indoor',
    format: 'Singles • Doubles • Mixed',
    iconBg: 'bg-amber-50 text-amber-600 border-amber-100',
    hoverBorder: 'hover:border-amber-300',
    tag: 'Club Hall 1',
    rules: '29 Board Points • Queen Cover Required • 8 Boards Max',
  },
  {
    id: 'bgmi',
    name: 'BGMI',
    category: 'E-Sports',
    format: 'Battle Royale 4-Man Squads',
    iconBg: 'bg-purple-50 text-purple-600 border-purple-100',
    hoverBorder: 'hover:border-purple-300',
    tag: 'LAN Arena',
    rules: 'Erangel & Miramar • 4 Matches • Esports Points Matrix',
  },
  {
    id: 'mystery',
    name: 'Mystery Game',
    category: 'Secret Quest',
    format: 'Revealed on Nov 27th',
    iconBg: 'bg-orange-50 text-orange-600 border-orange-100',
    hoverBorder: 'hover:border-orange-300',
    tag: 'Surprise Arena',
    rules: 'Mystery team challenge unlocked on tournament Day 3!',
  },
];

// Announcements List for Carousel
const ANNOUNCEMENTS = [
  {
    id: 1,
    title: 'Registrations Closed',
    description: 'Player registrations are now closed. Final lists are under review.',
    tag: 'Important',
    date: 'Nov 20, 2026',
  },
  {
    id: 2,
    title: 'Official Schedule & Pool Draws Out',
    description: 'Tournament brackets for Cricket, Football, and BGMI are now locked.',
    tag: 'Fixtures',
    date: 'Nov 22, 2026',
  },
  {
    id: 3,
    title: 'Referee Technical Briefing',
    description: 'Mandatory technical rules coordination meeting scheduled on Nov 24, 4:00 PM.',
    tag: 'Officials',
    date: 'Nov 24, 2026',
  },
];

// Upcoming Matches
const UPCOMING_MATCHES = [
  {
    id: 'm1',
    sport: 'CRICKET',
    stage: 'League',
    color: 'from-[#0284C7] to-[#0369A1]',
    team1: { name: 'Mavericks', code: 'MAV' },
    team2: { name: 'Alphas', code: 'ALP' },
    time: 'Nov 26, 10:00 AM',
    venue: 'Main Oval Ground',
  },
  {
    id: 'm2',
    sport: 'BADMINTON',
    stage: 'Quarterfinal',
    color: 'from-[#EA580C] to-[#C2410C]',
    team1: { name: 'Dominators', code: 'DOM' },
    team2: { name: 'Spartans', code: 'SPA' },
    time: 'Nov 26, 12:30 PM',
    venue: 'Indoor Sports Complex',
  },
  {
    id: 'm3',
    sport: 'CHESS',
    stage: 'Round 2',
    color: 'from-[#7C3AED] to-[#5B21B6]',
    team1: { name: 'Phoenix', code: 'PHX' },
    team2: { name: 'Alphas', code: 'ALP' },
    time: 'Nov 26, 02:00 PM',
    venue: 'Mind Sports Auditorium',
  },
];

// Authentic House Crest Component
function HouseCrest({ name, className = 'w-6 h-6' }: { name: string; className?: string }) {
  const n = (name || '').toLowerCase();
  let src = '/crest-phoenix.png';
  let alt = 'Phoenix';
  if (n.includes('mav')) {
    src = '/crest-mavericks.png';
    alt = 'Mavericks';
  } else if (n.includes('dom')) {
    src = '/crest-dominators.png';
    alt = 'Dominators';
  } else if (n.includes('alp')) {
    src = '/crest-alphas.png';
    alt = 'Alphas';
  } else if (n.includes('spa')) {
    src = '/crest-spartans.png';
    alt = 'Spartans';
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`${className} object-contain drop-shadow-xs select-none`}
      loading="lazy"
    />
  );
}

export default function PublicViewerPortal() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [announcementIdx, setAnnouncementIdx] = useState(0);
  const [searchHouse, setSearchHouse] = useState('');
  const [sortBy, setSortBy] = useState<'rank' | 'points' | 'wins' | 'gold'>('rank');
  const [selectedHouse, setSelectedHouse] = useState<any>(null);
  const [selectedSport, setSelectedSport] = useState<any>(null);
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [confettiActive, setConfettiActive] = useState(false);

  // Countdown to Tournament (Nov 25, 2026)
  const [timeLeft, setTimeLeft] = useState({ days: 8, hours: 14, mins: 32, secs: 45 });

  useEffect(() => {
    fetchPublicOverview();
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.secs > 0) return { ...prev, secs: prev.secs - 1 };
        if (prev.mins > 0) return { ...prev, mins: prev.mins - 1, secs: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, mins: 59, secs: 59 };
        if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, mins: 59, secs: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Announcement Carousel Autoplay
  useEffect(() => {
    const carTimer = setInterval(() => {
      setAnnouncementIdx((prev) => (prev + 1) % ANNOUNCEMENTS.length);
    }, 4500);
    return () => clearInterval(carTimer);
  }, []);

  const fetchPublicOverview = async () => {
    try {
      const res = await fetch('/api/public/overview');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.log('Public overview fallback active');
    } finally {
      setLoading(false);
    }
  };

  const triggerConfetti = () => {
    setConfettiActive(true);
    setTimeout(() => setConfettiActive(false), 3500);
  };

  // Filter & sort leaderboard
  const sortedHouses = useMemo(() => {
    let houses = [...MOCKUP_HOUSES];
    if (searchHouse.trim()) {
      houses = houses.filter((h) =>
        h.name.toLowerCase().includes(searchHouse.toLowerCase()) ||
        h.code.toLowerCase().includes(searchHouse.toLowerCase())
      );
    }
    if (sortBy === 'points') {
      houses.sort((a, b) => b.points - a.points);
    } else if (sortBy === 'wins') {
      houses.sort((a, b) => b.wins - a.wins);
    } else if (sortBy === 'gold') {
      houses.sort((a, b) => b.gold - a.gold);
    } else {
      houses.sort((a, b) => a.rank - b.rank);
    }
    return houses;
  }, [searchHouse, sortBy]);

  const currentAnnouncement = ANNOUNCEMENTS[announcementIdx];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col font-sans selection:bg-[#0284C7] selection:text-white antialiased relative">
      {/* Confetti Celebration Overlay */}
      {confettiActive && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center overflow-hidden">
          <div className="absolute top-10 flex gap-2 animate-bounce">
            <span className="px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 text-white font-black text-sm shadow-2xl flex items-center gap-2">
              <Crown className="w-5 h-5 fill-amber-200 text-amber-200 animate-spin" />
              APL SEASON 9 CHAMPIONSHIP GLORY!
            </span>
          </div>
          {/* Confetti particles */}
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-3 h-3 rounded-xs opacity-90 animate-ping"
              style={{
                top: `${Math.random() * 85}%`,
                left: `${Math.random() * 95}%`,
                backgroundColor: ['#DC2626', '#F59E0B', '#0284C7', '#10B981', '#7C3AED', '#EA580C'][i % 6],
                transform: `rotate(${Math.random() * 360}deg)`,
                animationDuration: `${1 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* 1. TOP NAVIGATION BAR */}
      <PublicNavbar activeOverride="home" />

      {/* 2. 100% PURE CODE 3D STADIUM & CHAMPIONSHIP HERO SHOWDOWN (NO IMAGES) */}
      <section className="relative overflow-hidden bg-[#EDF4FC] border-b border-slate-200/90 pt-4 pb-14 sm:pb-18 lg:pb-22 select-none">
        {/* Pure Code SVG & CSS Stadium Atmosphere (Floodlights, Grandstands, Pennants, Ribbons) */}
        <HeroStadiumBackground />

        {/* Glowing animated spotlight under the pedestal */}
        <div
          className="absolute pointer-events-none animate-pulse-glow"
          style={{
            left: '60%',
            top: '76%',
            width: '28%',
            height: '20%',
            background: 'radial-gradient(circle, rgba(254, 240, 138, 0.5) 0%, rgba(217, 119, 6, 0.18) 50%, transparent 80%)',
            filter: 'blur(12px)',
          }}
        />

        {/* Floating Live Countdown Badge on Top Right */}
        <div className="absolute top-4 right-6 z-20 hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-sm text-xs font-semibold text-slate-700">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500" />
          </span>
          <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">
            Kickoff In:
          </span>
          <span className="font-mono font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
            {timeLeft.days}d {timeLeft.hours}h {timeLeft.mins}m {timeLeft.secs}s
          </span>
        </div>

        {/* Main 2-Column Responsive Hero Container */}
        <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 items-center">
            {/* LEFT COLUMN: PURE HTML/CSS TYPOGRAPHY & INTERACTIVE CONTROLS */}
            <div className="lg:col-span-7 space-y-4 sm:space-y-5 lg:space-y-6 pt-2 lg:pt-4 text-center lg:text-left">
              {/* Institution Eyebrow */}
              <div className="flex items-center justify-center lg:justify-start gap-3">
                <div className="h-[1.5px] w-6 sm:w-10 bg-slate-400/80" />
                <span className="text-[11px] sm:text-xs lg:text-[13px] font-black uppercase tracking-[0.22em] text-[#0A2540]">
                  NEXCORE INSTITUTE OF TECHNOLOGY
                </span>
                <div className="h-[1.5px] w-6 sm:w-10 bg-slate-400/80" />
              </div>

              {/* Huge Tournament Titles */}
              <div className="space-y-0 sm:space-y-0.5">
                <h1 className="text-6xl sm:text-7xl lg:text-8xl xl:text-[96px] font-black italic tracking-tight text-[#082855] leading-[0.92] drop-shadow-[0_3px_6px_rgba(8,40,85,0.22)]">
                  APL
                </h1>
                <h2 className="text-5xl sm:text-6xl lg:text-7xl xl:text-[84px] font-black italic tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#FFA216] via-[#F97316] to-[#D94F04] leading-[0.95] drop-shadow-[0_3px_8px_rgba(249,115,22,0.28)]">
                  SEASON 9
                </h2>
              </div>

              {/* Slanted Parallelogram Showdown Banner */}
              <div className="inline-block relative">
                <div
                  className="px-6 sm:px-8 py-2.5 sm:py-3 text-white font-black italic text-xs sm:text-sm lg:text-base uppercase tracking-[0.08em] shadow-[0_8px_20px_rgba(3,27,62,0.35)]"
                  style={{
                    background: 'linear-gradient(90deg, #021B3D 0%, #083877 82%, #FF7A00 82%, #EA580C 100%)',
                    clipPath: 'polygon(3% 0%, 100% 0%, 97% 100%, 0% 100%)',
                  }}
                >
                  THE ULTIMATE SPORTS SHOWDOWN
                </div>
              </div>

              {/* Tagline */}
              <p className="text-sm sm:text-base lg:text-lg font-bold text-slate-800 tracking-wide max-w-xl mx-auto lg:mx-0">
                8 Games. 5 Houses. One Champion. Unlimited Glory.
              </p>

              {/* Metadata Badges: Date & Venue */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 text-xs sm:text-sm font-semibold text-slate-600">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-sky-100/80 flex items-center justify-center text-[#0284C7] shadow-2xs">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <span>Nov 25th – Nov 28th, 2026</span>
                </div>
                <div className="hidden sm:block h-4 w-[1px] bg-slate-300" />
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-orange-100/80 flex items-center justify-center text-[#EA580C] shadow-2xs">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <span>Nexcore Institute of Technology</span>
                </div>
              </div>

              {/* Mobile Countdown Row (<md) */}
              <div className="flex md:hidden items-center justify-center gap-2 pt-1 text-xs font-semibold text-slate-700">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500" />
                </span>
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">
                  Kickoff In:
                </span>
                <span className="font-mono font-black text-slate-900 bg-white border border-slate-200 px-2 py-0.5 rounded text-[11px] shadow-2xs">
                  {timeLeft.days}d {timeLeft.hours}h {timeLeft.mins}m {timeLeft.secs}s
                </span>
              </div>

              {/* Interactive Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                <Link
                  href="/schedule"
                  className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-gradient-to-r from-[#FF7A00] via-[#F97316] to-[#E65100] text-white font-bold text-sm sm:text-base tracking-wide shadow-[0_6px_22px_rgba(249,115,22,0.4)] hover:shadow-[0_8px_28px_rgba(249,115,22,0.55)] hover:scale-[1.03] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2.5 group cursor-pointer"
                >
                  <span>View Schedule</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>

                <Link
                  href="#leaderboard-section"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-white border-2 border-[#0A3D80] text-[#0A3D80] font-bold text-sm sm:text-base tracking-wide shadow-sm hover:bg-[#F0F7FF] hover:border-[#0284C7] hover:text-[#0284C7] hover:scale-[1.03] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <BarChart3 className="w-4 h-4 text-[#0284C7]" />
                  <span>Live Leaderboard</span>
                </Link>

                <button
                  onClick={triggerConfetti}
                  className="hidden xl:flex items-center gap-1.5 px-4 py-3 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold hover:bg-amber-100 hover:scale-105 active:scale-95 transition-all shadow-2xs cursor-pointer"
                  title="Celebrate APL Glory"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Cheer</span>
                </button>
              </div>
            </div>

            {/* RIGHT COLUMN: PURE CODE 3D CHAMPIONSHIP TROPHY & STAGE */}
            <div className="lg:col-span-5 relative flex items-center justify-center pt-4 lg:pt-0">
              {/* Radial glow spotlight behind trophy */}
              <div
                className="absolute w-[380px] sm:w-[480px] h-[380px] sm:h-[480px] rounded-full pointer-events-none animate-pulse-glow"
                style={{
                  background: 'radial-gradient(circle, rgba(254,240,138,0.55) 0%, rgba(245,158,11,0.22) 40%, rgba(2,132,199,0.12) 65%, transparent 80%)',
                  filter: 'blur(30px)',
                }}
              />

              {/* The Pure SVG & CSS Trophy Component */}
              <div className="relative w-full max-w-[380px] sm:max-w-[460px] lg:max-w-[520px]">
                <HeroChampionshipTrophy
                  className="animate-float"
                  onCelebrate={triggerConfetti}
                />

                {/* Floating Interactive Celebrate Badge */}
                <div
                  onClick={triggerConfetti}
                  className="absolute top-2 right-4 z-20 cursor-pointer hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/85 backdrop-blur-xs text-amber-300 text-[11px] font-bold shadow-lg border border-amber-300/30 hover:scale-105 active:scale-95 transition-transform"
                >
                  <Sparkles className="w-3.5 h-3.5 fill-amber-400" />
                  <span>Click to Celebrate!</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FLOATING KEY STATS BAR */}
      <section className="relative z-20 -mt-6 sm:-mt-8 max-w-6xl mx-auto w-full px-4 sm:px-6">
        <div className="bg-white rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.06)] border border-slate-100 p-4 sm:p-5 flex items-center justify-around flex-wrap gap-4 sm:gap-6">
          {/* Stat 1 */}
          <Link
            href="/houses"
            className="flex items-center gap-3 group transition-transform hover:scale-105 cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-[#0284C7] flex items-center justify-center group-hover:bg-[#0284C7] group-hover:text-white transition-colors shadow-2xs">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="font-black text-xl sm:text-2xl text-slate-900 leading-tight block">
                5
              </span>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Clubs / Houses
              </span>
            </div>
          </Link>

          <div className="h-8 w-[1px] bg-slate-200 hidden md:block" />

          {/* Stat 2 */}
          <Link
            href="/sports"
            className="flex items-center gap-3 group transition-transform hover:scale-105 cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-[#0284C7] flex items-center justify-center group-hover:bg-[#0284C7] group-hover:text-white transition-colors shadow-2xs">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <div>
              <span className="font-black text-xl sm:text-2xl text-slate-900 leading-tight block">
                8
              </span>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Sports / Games
              </span>
            </div>
          </Link>

          <div className="h-8 w-[1px] bg-slate-200 hidden md:block" />

          {/* Stat 3 */}
          <div className="flex items-center gap-3 group transition-transform hover:scale-105">
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#EA580C] flex items-center justify-center shadow-2xs">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="font-black text-xl sm:text-2xl text-slate-900 leading-tight block">
                300+
              </span>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Registered Players
              </span>
            </div>
          </div>

          <div className="h-8 w-[1px] bg-slate-200 hidden md:block" />

          {/* Stat 4 */}
          <Link
            href="/schedule"
            className="flex items-center gap-3 group transition-transform hover:scale-105 cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-[#0284C7] flex items-center justify-center group-hover:bg-[#0284C7] group-hover:text-white transition-colors shadow-2xs">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <span className="font-black text-xl sm:text-2xl text-slate-900 leading-tight block">
                42
              </span>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Total Matches
              </span>
            </div>
          </Link>

          <div className="h-8 w-[1px] bg-slate-200 hidden md:block" />

          {/* Stat 5 */}
          <div
            onClick={triggerConfetti}
            className="flex items-center gap-3 group transition-transform hover:scale-105 cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition-colors shadow-2xs">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <span className="font-black text-xl sm:text-2xl text-slate-900 leading-tight block">
                1
              </span>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Overall Champion
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. MAIN HOMEPAGE SECTIONS */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-12 space-y-14">
        {/* ======================================================== */}
        {/* SECTION A: CHAMPIONSHIP LEADERBOARD & PODIUM */}
        {/* ======================================================== */}
        <section id="leaderboard-section" className="space-y-6 scroll-mt-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
            {/* Header info (Left 5 cols) */}
            <div className="lg:col-span-5 space-y-2">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-[#0B2545]">
                  CHAMPIONSHIP <span className="text-[#EA580C]">LEADERBOARD</span>
                </h2>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Overall house standings across all sports.
              </p>
              <div className="pt-2">
                <Link
                  href="/leaderboard"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-slate-300 hover:border-[#0284C7] bg-white text-slate-700 hover:text-[#0284C7] text-xs font-bold transition-all shadow-2xs group"
                >
                  <span>View Full Leaderboard</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Top 3 Podium (Right 7 cols) */}
            <div className="lg:col-span-7">
              <div className="grid grid-cols-3 gap-2.5 sm:gap-4 items-end">
                {/* 2nd Place: Dominators (Silver) */}
                <div
                  onClick={() => setSelectedHouse(MOCKUP_HOUSES[1])}
                  className="bg-gradient-to-b from-[#EBF3FB] via-[#F0F6FD] to-[#DDE9F8] border border-blue-200/80 rounded-2xl p-3 sm:p-4 text-center shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 cursor-pointer relative group"
                >
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-slate-300 border-2 border-white text-slate-700 font-black text-xs flex items-center justify-center shadow-xs">
                    2
                  </div>
                  <div className="w-12 h-12 mx-auto mt-2 mb-2 flex items-center justify-center">
                    <HouseCrest name="Dominators" className="w-10 h-10 drop-shadow-xs" />
                  </div>
                  <h3 className="font-black text-xs sm:text-sm text-slate-900 uppercase tracking-tight">
                    DOMINATORS
                  </h3>
                  <div className="text-[11px] sm:text-xs font-bold text-slate-600 mt-0.5">
                    <strong className="text-slate-900 font-black">380</strong> Points
                  </div>
                  <div className="text-[9px] text-slate-400 font-semibold mt-1">
                    🥈 Silver Podium
                  </div>
                </div>

                {/* 1st Place: Mavericks (Gold - Elevated) */}
                <div
                  onClick={() => setSelectedHouse(MOCKUP_HOUSES[0])}
                  className="bg-gradient-to-b from-[#FEF8E7] via-[#FFF3D1] to-[#FDE8B5] border-2 border-amber-400 rounded-2xl p-4 sm:p-5 text-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1.5 cursor-pointer relative group -translate-y-2"
                >
                  {/* Floating Gold Crown */}
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 animate-crown">
                    <Crown className="w-6 h-6 text-amber-500 fill-amber-400 drop-shadow-sm" />
                  </div>
                  <div className="w-6 h-6 rounded-full bg-amber-400 border-2 border-white text-slate-900 font-black text-xs flex items-center justify-center shadow-xs mx-auto mb-1">
                    1
                  </div>
                  <div className="w-14 h-14 mx-auto mb-2 flex items-center justify-center">
                    <HouseCrest name="Mavericks" className="w-12 h-12 drop-shadow-md" />
                  </div>
                  <h3 className="font-black text-sm sm:text-base text-slate-900 uppercase tracking-tight">
                    MAVERICKS
                  </h3>
                  <div className="text-xs sm:text-sm font-black text-amber-900 mt-0.5">
                    <strong className="text-amber-950 font-black text-sm sm:text-base">420</strong> Points
                  </div>
                  <div className="text-[10px] text-amber-700 font-bold mt-1 uppercase tracking-wider flex items-center justify-center gap-1">
                    <Sparkles className="w-3 h-3 fill-amber-500 text-amber-600" />
                    <span>#1 Seed Champion</span>
                  </div>
                </div>

                {/* 3rd Place: Spartans (Bronze) */}
                <div
                  onClick={() => setSelectedHouse(MOCKUP_HOUSES[3])}
                  className="bg-gradient-to-b from-[#FAF0E6] via-[#FAF3EC] to-[#F3DFCD] border border-amber-200/90 rounded-2xl p-3 sm:p-4 text-center shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 cursor-pointer relative group"
                >
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-amber-600 border-2 border-white text-white font-black text-xs flex items-center justify-center shadow-xs">
                    3
                  </div>
                  <div className="w-12 h-12 mx-auto mt-2 mb-2 flex items-center justify-center">
                    <HouseCrest name="Spartans" className="w-10 h-10 drop-shadow-xs" />
                  </div>
                  <h3 className="font-black text-xs sm:text-sm text-slate-900 uppercase tracking-tight">
                    SPARTANS
                  </h3>
                  <div className="text-[11px] sm:text-xs font-bold text-amber-900 mt-0.5">
                    <strong className="text-amber-950 font-black">310</strong> Points
                  </div>
                  <div className="text-[9px] text-amber-800 font-semibold mt-1">
                    🥉 Bronze Podium
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Leaderboard Table Container */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Table Filter / Search Sub-Bar */}
            <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-600 uppercase tracking-wider text-[11px]">
                  Sort By:
                </span>
                <button
                  onClick={() => setSortBy('rank')}
                  className={`px-2.5 py-1 rounded-full text-xs font-bold transition ${sortBy === 'rank' ? 'bg-[#0284C7] text-white shadow-2xs' : 'bg-white border text-slate-600'
                    }`}
                >
                  Rank
                </button>
                <button
                  onClick={() => setSortBy('points')}
                  className={`px-2.5 py-1 rounded-full text-xs font-bold transition ${sortBy === 'points' ? 'bg-[#0284C7] text-white shadow-2xs' : 'bg-white border text-slate-600'
                    }`}
                >
                  Points
                </button>
                <button
                  onClick={() => setSortBy('gold')}
                  className={`px-2.5 py-1 rounded-full text-xs font-bold transition ${sortBy === 'gold' ? 'bg-[#0284C7] text-white shadow-2xs' : 'bg-white border text-slate-600'
                    }`}
                >
                  Gold Medals
                </button>
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter House..."
                  value={searchHouse}
                  onChange={(e) => setSearchHouse(e.target.value)}
                  className="pl-8 pr-3 py-1 bg-white border border-slate-200 rounded-full text-xs text-slate-700 focus:outline-none focus:border-[#0284C7] w-36 sm:w-48"
                />
              </div>
            </div>

            {/* Navy Blue Header Bar */}
            <div className="bg-[#0A3977] text-white font-bold text-xs uppercase tracking-wider py-3 px-4 sm:px-6 grid grid-cols-12 items-center">
              <div className="col-span-1 text-center font-mono">#</div>
              <div className="col-span-4 sm:col-span-5 text-left">CLUB (HOUSE)</div>
              <div className="col-span-2 text-center">WINS</div>
              <div className="col-span-1 text-center hidden sm:block">GOLD 🏅</div>
              <div className="col-span-1 text-center hidden sm:block">SILVER 🥈</div>
              <div className="col-span-1 text-center hidden sm:block">BRONZE 🥉</div>
              <div className="col-span-5 sm:col-span-2 text-right">POINTS</div>
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-slate-100">
              {sortedHouses.map((house, idx) => {
                const isFirst = house.rank === 1;
                return (
                  <div
                    key={house.id}
                    onClick={() => setSelectedHouse(house)}
                    className={`py-3.5 px-4 sm:px-6 grid grid-cols-12 items-center hover:bg-sky-50/60 transition-colors cursor-pointer group ${isFirst ? 'bg-amber-50/30' : idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'
                      }`}
                  >
                    {/* Rank Circle */}
                    <div className="col-span-1 text-center">
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-full font-bold text-xs shadow-2xs ${house.rank === 1
                            ? 'bg-amber-400 text-slate-900 ring-2 ring-amber-300'
                            : house.rank === 2
                              ? 'bg-slate-300 text-slate-800'
                              : house.rank === 3
                                ? 'bg-amber-600 text-white'
                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                      >
                        {house.rank}
                      </span>
                    </div>

                    {/* House Details */}
                    <div className="col-span-4 sm:col-span-5 flex items-center gap-2.5 sm:gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0">
                        <HouseCrest name={house.name} className="w-7 h-7 drop-shadow-2xs" />
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 text-sm group-hover:text-[#0284C7] transition-colors block">
                          {house.name}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium block">
                          Capt: {house.captain}
                        </span>
                      </div>
                    </div>

                    {/* Wins */}
                    <div className="col-span-2 text-center font-bold text-slate-800 text-sm">
                      {house.wins}
                    </div>

                    {/* Gold */}
                    <div className="col-span-1 text-center hidden sm:flex items-center justify-center gap-1 font-semibold text-xs text-amber-600">
                      <span>🏆</span>
                      <span>{house.gold}</span>
                    </div>

                    {/* Silver */}
                    <div className="col-span-1 text-center hidden sm:flex items-center justify-center gap-1 font-semibold text-xs text-slate-500">
                      <span>🥈</span>
                      <span>{house.silver}</span>
                    </div>

                    {/* Bronze */}
                    <div className="col-span-1 text-center hidden sm:flex items-center justify-center gap-1 font-semibold text-xs text-amber-700">
                      <span>🥉</span>
                      <span>{house.bronze}</span>
                    </div>

                    {/* Points */}
                    <div className="col-span-5 sm:col-span-2 text-right">
                      <span className="font-black text-base sm:text-lg text-slate-900 font-mono tracking-tight group-hover:text-[#0284C7] transition-colors">
                        {house.points}
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold uppercase ml-1">
                        pts
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* SECTION B: TOURNAMENT UPDATES & ANNOUNCEMENTS */}
        {/* ======================================================== */}
        <section className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Left Title */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-[#0284C7] flex items-center justify-center shadow-2xs">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <span className="font-black text-xs sm:text-sm text-[#0B2545] uppercase tracking-tight block">
                TOURNAMENT UPDATES &amp;
              </span>
              <span className="font-black text-xs sm:text-sm text-[#EA580C] uppercase tracking-tight block -mt-0.5">
                ANNOUNCEMENTS
              </span>
            </div>
          </div>

          {/* Center Carousel Card */}
          <div className="flex-1 w-full bg-slate-50/80 border border-slate-200 rounded-xl px-4 py-3 flex items-center justify-between gap-3 shadow-inner">
            {/* Prev button */}
            <button
              onClick={() =>
                setAnnouncementIdx((prev) => (prev === 0 ? ANNOUNCEMENTS.length - 1 : prev - 1))
              }
              className="p-1 rounded-full hover:bg-slate-200 text-slate-600 transition"
              aria-label="Previous Announcement"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Announcement Message */}
            <div className="flex items-center gap-3 overflow-hidden text-center sm:text-left flex-1 justify-center sm:justify-start">
              <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center shrink-0 hidden sm:flex">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900 leading-tight">
                    {currentAnnouncement.title}
                  </h4>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#0284C7]/10 text-[#0284C7] uppercase">
                    {currentAnnouncement.tag}
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-slate-600 mt-0.5 truncate max-w-md sm:max-w-lg">
                  {currentAnnouncement.description}
                </p>
              </div>
            </div>

            {/* Dots Pagination */}
            <div className="flex items-center gap-1.5 shrink-0 px-2">
              {ANNOUNCEMENTS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setAnnouncementIdx(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${announcementIdx === i ? 'w-4 bg-[#0284C7]' : 'w-1.5 bg-slate-300'
                    }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>

            {/* Next button */}
            <button
              onClick={() => setAnnouncementIdx((prev) => (prev + 1) % ANNOUNCEMENTS.length)}
              className="p-1 rounded-full hover:bg-slate-200 text-slate-600 transition"
              aria-label="Next Announcement"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </section>

        {/* ======================================================== */}
        {/* SECTION C: UPCOMING MATCHES */}
        {/* ======================================================== */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#0284C7]" />
              <h2 className="text-lg sm:text-xl font-black uppercase tracking-tight text-[#0B2545]">
                UPCOMING MATCHES
              </h2>
            </div>
            <Link
              href="/schedule"
              className="text-xs font-bold text-[#EA580C] hover:text-[#C2410C] flex items-center gap-1 group transition-colors"
            >
              <span>View Full Schedule</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {UPCOMING_MATCHES.map((match) => (
              <div
                key={match.id}
                onClick={() => setSelectedMatch(match)}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 cursor-pointer overflow-hidden flex flex-col justify-between group"
              >
                {/* Header Banner Pill */}
                <div
                  className={`px-4 py-2.5 bg-gradient-to-r ${match.color} text-white flex items-center justify-between text-xs font-bold tracking-wider uppercase`}
                >
                  <div className="flex items-center gap-2">
                    <SportIcon name={match.sport} className="w-4 h-4" />
                    <span>
                      {match.sport} — {match.stage}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/80 group-hover:translate-x-0.5 transition-transform" />
                </div>

                {/* Match Opponents Section */}
                <div className="p-5 flex items-center justify-between">
                  {/* Team 1 */}
                  <div className="flex flex-col items-center text-center space-y-1.5 w-5/12">
                    <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center p-1 group-hover:scale-105 transition-transform shadow-2xs">
                      <HouseCrest name={match.team1.name} className="w-10 h-10" />
                    </div>
                    <span className="font-bold text-xs sm:text-sm text-slate-900 leading-tight">
                      {match.team1.name}
                    </span>
                  </div>

                  {/* VS Badge */}
                  <div className="w-2/12 flex flex-col items-center justify-center">
                    <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 font-black text-[11px] flex items-center justify-center border border-slate-200 shadow-inner">
                      VS
                    </span>
                  </div>

                  {/* Team 2 */}
                  <div className="flex flex-col items-center text-center space-y-1.5 w-5/12">
                    <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center p-1 group-hover:scale-105 transition-transform shadow-2xs">
                      <HouseCrest name={match.team2.name} className="w-10 h-10" />
                    </div>
                    <span className="font-bold text-xs sm:text-sm text-slate-900 leading-tight">
                      {match.team2.name}
                    </span>
                  </div>
                </div>

                {/* Match Bottom Bar */}
                <div className="px-4 py-2.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-medium">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{match.time}</span>
                  </div>
                  <div className="w-5 h-5 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-[#0284C7] group-hover:border-[#0284C7] transition-colors">
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ======================================================== */}
        {/* SECTION D: PARTICIPATING SPORTS */}
        {/* ======================================================== */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-[#0284C7]" />
              <h2 className="text-lg sm:text-xl font-black uppercase tracking-tight text-[#0B2545]">
                PARTICIPATING SPORTS
              </h2>
            </div>
            <Link
              href="/sports"
              className="text-xs font-bold text-[#0284C7] hover:underline"
            >
              Explore All Sports &amp; Rules
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-3.5">
            {MOCKUP_SPORTS.map((sport) => (
              <div
                key={sport.id}
                onClick={() => setSelectedSport(sport)}
                className={`bg-white rounded-2xl border border-slate-200 p-3.5 text-center flex flex-col items-center justify-center gap-2 shadow-xs hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group ${sport.hoverBorder}`}
              >
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center border shadow-2xs group-hover:scale-110 transition-transform ${sport.iconBg}`}
                >
                  <SportIcon name={sport.name} className="w-5 h-5" />
                </div>
                <span className="font-bold text-xs text-slate-800 group-hover:text-[#0284C7] transition-colors leading-tight">
                  {sport.name}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ======================================================== */}
        {/* SECTION E: OUR CLUBS (HOUSES) */}
        {/* ======================================================== */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#0284C7]" />
              <h2 className="text-lg sm:text-xl font-black uppercase tracking-tight text-[#0B2545]">
                OUR CLUBS <span className="text-[#EA580C]">(HOUSES)</span>
              </h2>
            </div>
            <Link
              href="/houses"
              className="text-xs font-bold text-[#EA580C] hover:underline"
            >
              Meet The House Captains
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
            {MOCKUP_HOUSES.map((club) => (
              <div
                key={club.id}
                onClick={() => setSelectedHouse(club)}
                className={`rounded-2xl p-4 bg-gradient-to-r ${club.gradient} text-white shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1.5 cursor-pointer relative overflow-hidden group`}
              >
                {/* Light shimmer sweep effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-200%] duration-1000" />

                <div className="flex items-center gap-3 relative z-10">
                  <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0 p-1 group-hover:scale-110 transition-transform">
                    <HouseCrest name={club.name} className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="font-black text-sm tracking-wide uppercase leading-tight">
                      {club.name}
                    </h3>
                    <span className="text-[10px] text-white/80 font-medium block">
                      {club.points} PTS • #{club.rank}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* ======================================================== */}
      {/* 5. INTERACTIVE MODALS */}
      {/* ======================================================== */}

      {/* House Details Modal */}
      {selectedHouse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative space-y-4">
            <button
              onClick={() => setSelectedHouse(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center p-2 shadow-xs">
                <HouseCrest name={selectedHouse.name} className="w-10 h-10" />
              </div>
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800">
                  Rank #{selectedHouse.rank}
                </span>
                <h3 className="font-black text-xl text-slate-900 uppercase">
                  {selectedHouse.name}
                </h3>
                <p className="text-xs text-slate-500 italic">
                  &ldquo;{selectedHouse.motto}&rdquo;
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-2 text-center text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 uppercase text-[10px] block font-bold">Wins</span>
                <span className="font-black text-base text-slate-900">{selectedHouse.wins}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-100">
                <span className="text-amber-700 uppercase text-[10px] block font-bold">Gold Medals</span>
                <span className="font-black text-base text-amber-900">{selectedHouse.gold}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-sky-50 border border-sky-100">
                <span className="text-sky-700 uppercase text-[10px] block font-bold">Total Points</span>
                <span className="font-black text-base text-sky-900">{selectedHouse.points}</span>
              </div>
            </div>

            <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
              <div className="flex justify-between">
                <span className="font-semibold text-slate-400">House Captain:</span>
                <span className="font-bold text-slate-800">{selectedHouse.captain}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-slate-400">House Code:</span>
                <span className="font-mono font-bold text-slate-800">{selectedHouse.code}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-slate-400">Total Medals:</span>
                <span className="font-bold text-slate-800">
                  {selectedHouse.gold + selectedHouse.silver + selectedHouse.bronze}
                </span>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <Link
                href="/houses"
                className="flex-1 py-2.5 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white text-center font-bold text-xs transition shadow-md"
              >
                View Full House Profile
              </Link>
              <button
                onClick={() => setSelectedHouse(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sport Details Modal */}
      {selectedSport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative space-y-4">
            <button
              onClick={() => setSelectedSport(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-xs ${selectedSport.iconBg}`}
              >
                <SportIcon name={selectedSport.name} className="w-7 h-7" />
              </div>
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-sky-100 text-sky-800">
                  {selectedSport.category}
                </span>
                <h3 className="font-black text-xl text-slate-900 uppercase">
                  {selectedSport.name}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {selectedSport.tag}
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Tournament Format:
              </span>
              <p className="text-xs font-semibold text-slate-800">{selectedSport.format}</p>
            </div>

            <div className="p-3 rounded-xl bg-sky-50/60 border border-sky-100 space-y-1">
              <span className="text-[10px] uppercase font-bold text-sky-700 block">
                Official Rules Summary:
              </span>
              <p className="text-xs text-slate-700">{selectedSport.rules}</p>
            </div>

            <div className="pt-2 flex gap-2">
              <Link
                href="/sports"
                className="flex-1 py-2.5 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white text-center font-bold text-xs transition shadow-md"
              >
                Open Full Sport Details
              </Link>
              <button
                onClick={() => setSelectedSport(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Match Details Modal */}
      {selectedMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative space-y-4">
            <button
              onClick={() => setSelectedMatch(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-sky-50 text-[#0284C7] flex items-center justify-center">
                <SportIcon name={selectedMatch.sport} className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-black text-lg text-slate-900 uppercase">
                  {selectedMatch.sport} — {selectedMatch.stage}
                </h3>
                <span className="text-xs text-slate-500">{selectedMatch.venue}</span>
              </div>
            </div>

            {/* Teams Faceoff */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-around">
              <div className="text-center space-y-1">
                <HouseCrest name={selectedMatch.team1.name} className="w-12 h-12 mx-auto" />
                <span className="font-bold text-sm text-slate-900 block">
                  {selectedMatch.team1.name}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {selectedMatch.team1.code}
                </span>
              </div>

              <div className="w-8 h-8 rounded-full bg-white border border-slate-200 font-black text-xs text-slate-400 flex items-center justify-center shadow-xs">
                VS
              </div>

              <div className="text-center space-y-1">
                <HouseCrest name={selectedMatch.team2.name} className="w-12 h-12 mx-auto" />
                <span className="font-bold text-sm text-slate-900 block">
                  {selectedMatch.team2.name}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {selectedMatch.team2.code}
                </span>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#0284C7]" />
                <span>
                  Scheduled Time: <strong>{selectedMatch.time}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#EA580C]" />
                <span>
                  Arena: <strong>{selectedMatch.venue}</strong>
                </span>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <Link
                href="/schedule"
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#F97316] to-[#EA580C] text-white text-center font-bold text-xs transition shadow-md"
              >
                View in Tournament Schedule
              </Link>
              <button
                onClick={() => setSelectedMatch(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. UNIFIED FOOTER */}
      <PublicFooter />
    </div>
  );
}
