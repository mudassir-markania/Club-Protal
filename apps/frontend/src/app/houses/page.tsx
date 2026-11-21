'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import PublicNavbar from '@/components/public/PublicNavbar';
import PublicFooter from '@/components/public/PublicFooter';
import { usePreventScroll } from '@/hooks/usePreventScroll';
import {
  Shield,
  Users,
  Trophy,
  Medal,
  Flame,
  Zap,
  ArrowRight,
  ChevronRight,
  X,
  CheckCircle2,
  ExternalLink,
  Search,
  Sparkles,
  Award,
} from 'lucide-react';

interface HouseAthlete {
  id: string;
  name: string;
  teamName?: string;
  sports: string[];
  status: 'Captain' | 'Vice Captain' | 'Active';
  email?: string;
}

interface DynamicHouse {
  id: string;
  rank: number;
  name: string;
  code: string;
  accentColor: string;
  badgeBg: string;
  textColor: string;
  lightBg: string;
  points: number;
  mascot: string;
  squadSize: number;
  fortress: string;
  streak: string;
  motto: string;
  battleChant: string;
  captain: {
    name: string;
    viceCaptain: string;
    sport: string;
  };
  narrative: string;
  heroImage: string;
  athletes: HouseAthlete[];
  sportBreakdown: Record<string, number>;
}

// Canonical lore & branding metadata mapped to official collegiate houses
const HOUSE_METADATA: Record<
  string,
  {
    code: string;
    accentColor: string;
    badgeBg: string;
    textColor: string;
    lightBg: string;
    mascot: string;
    fortress: string;
    streak: string;
    motto: string;
    battleChant: string;
    defaultCaptain: string;
    defaultViceCaptain: string;
    captainSport: string;
    narrative: string;
    heroImage: string;
  }
> = {
  blue: {
    code: 'BLU',
    accentColor: '#0051d5',
    badgeBg: 'bg-[#dbe1ff]',
    textColor: 'text-[#0051d5]',
    lightBg: 'bg-[#dbe1ff]',
    mascot: 'Cobalt Squadron • Falcon Mascot',
    fortress: 'Badminton & BGMI',
    streak: '20 Pts Badminton Dominance',
    motto: 'Defy The Ordinary',
    battleChant: 'Blue skies roar, cobalt strike!',
    defaultCaptain: 'Roheen',
    defaultViceCaptain: 'Farhat',
    captainSport: 'Badminton • Courtside Lead',
    narrative:
      'Dominating the early championship standings, Blue Club combines surgical precision in Badminton doubles with aggressive map rotations in BGMI Esports. Led by Roheen and Farhat, their 19-athlete varsity unit sets the competitive pace of Season 9.',
    heroImage: '/badminton.jpg',
  },
  green: {
    code: 'GRN',
    accentColor: '#1b7a3d',
    badgeBg: 'bg-[#d1fae5]',
    textColor: 'text-[#1b7a3d]',
    lightBg: 'bg-[#d1fae5]',
    mascot: 'Emerald Vanguard • Spartan Crest',
    fortress: 'Badminton & Field Sports',
    streak: 'Multi-Discipline Contender',
    motto: 'Unbroken. Unshaken.',
    battleChant: 'Green banner high, iron will prevail!',
    defaultCaptain: 'Siddhi',
    defaultViceCaptain: 'Alijah',
    captainSport: 'Badminton • Varsity Striker',
    narrative:
      'Built on stamina, iron discipline, and relentless team synergy, Green Club fields 19 determined competitors under the captaincy of Siddhi and Alijah. A consistent force across both indoor courts and varsity tournaments.',
    heroImage: '/football.jpg',
  },
  yellow: {
    code: 'YEL',
    accentColor: '#d97706',
    badgeBg: 'bg-[#fef3c7]',
    textColor: 'text-[#d97706]',
    lightBg: 'bg-[#fef3c7]',
    mascot: 'Golden Monarchs • Lion Mascot',
    fortress: 'Cricket T10 & Badminton',
    streak: 'Top 3 Contender',
    motto: 'Born To Conquer',
    battleChant: 'Gold in heart, gold in triumph!',
    defaultCaptain: 'Ifra',
    defaultViceCaptain: 'Mansi',
    captainSport: 'Cricket & Racquet Sports',
    narrative:
      'Tactical warfare and individual court masterclasses define Yellow Club. Led by captain Ifra and vice captain Mansi, their balanced 18-athlete roster poses an immediate threat in Cricket T10, Badminton brackets, and chess strategy.',
    heroImage: '/cricket.jpg',
  },
  purple: {
    code: 'PUR',
    accentColor: '#7e22ce',
    badgeBg: 'bg-[#f3e8ff]',
    textColor: 'text-[#7e22ce]',
    lightBg: 'bg-[#f3e8ff]',
    mascot: 'Imperial Phoenix • Firebird Mascot',
    fortress: 'BGMI Esports & Athletics',
    streak: '6 Pts Esports Clutch',
    motto: 'Rise Above All',
    battleChant: 'Purple storm, strike like thunder!',
    defaultCaptain: 'Anam',
    defaultViceCaptain: 'Tasmiya',
    captainSport: 'BGMI Esports • Squad Lead',
    narrative:
      'Unpredictable, fast-paced, and lethal in high-pressure situations, Purple Club holds commanding frag counts and positioning in BGMI Esports. Guided by Anam and Tasmiya, their varsity roster is poised for sudden leaderboard surges.',
    heroImage: '/bgmi.jpg',
  },
  red: {
    code: 'RED',
    accentColor: '#ba1a1a',
    badgeBg: 'bg-[#ffdad6]',
    textColor: 'text-[#ba1a1a]',
    lightBg: 'bg-[#ffdad6]',
    mascot: 'The Red Legion • Bull Mascot',
    fortress: 'Carrom, Chess & Cricket',
    streak: 'Hungry Challengers',
    motto: 'Power Through Precision',
    battleChant: 'Crimson flame, conquer the arena!',
    defaultCaptain: 'Anjali',
    defaultViceCaptain: 'Kainat',
    captainSport: 'Multi-Sport Competitor',
    narrative:
      'Fierce, proud, and armed with 19 hungry collegiate competitors, Red Club approaches every contest with maximum intensity. Captained by Anjali and Kainat, they are prepared to make decisive moves as the upcoming fixtures unfold.',
    heroImage: '/carrom.jpg',
  },
};

const getLoreForClub = (name: string, code?: string) => {
  const n = (name || '').toLowerCase();
  const c = (code || '').toLowerCase();
  if (n.includes('blue') || c === 'blu') return HOUSE_METADATA.blue;
  if (n.includes('green') || c === 'grn') return HOUSE_METADATA.green;
  if (n.includes('yellow') || c === 'yel') return HOUSE_METADATA.yellow;
  if (n.includes('purple') || c === 'pur') return HOUSE_METADATA.purple;
  if (n.includes('red') || c === 'red') return HOUSE_METADATA.red;
  return HOUSE_METADATA.blue;
};

// Fallback initial data for immediate render before dynamic hydration
const INITIAL_FALLBACK_HOUSES: DynamicHouse[] = [
  {
    id: 'club-blue',
    rank: 1,
    name: 'Blue Club',
    code: 'BLU',
    accentColor: '#0051d5',
    badgeBg: 'bg-[#dbe1ff]',
    textColor: 'text-[#0051d5]',
    lightBg: 'bg-[#dbe1ff]',
    points: 31,
    mascot: 'Cobalt Squadron • Falcon Mascot',
    squadSize: 19,
    fortress: 'Badminton & BGMI',
    streak: '20 Pts Badminton Dominance',
    motto: 'Defy The Ordinary',
    battleChant: 'Blue skies roar, cobalt strike!',
    captain: {
      name: 'Roheen',
      viceCaptain: 'Farhat',
      sport: 'Badminton • Courtside Lead',
    },
    narrative:
      'Dominating the early championship standings, Blue Club combines surgical precision in Badminton doubles with aggressive map rotations in BGMI Esports. Led by Roheen and Farhat, their 19-athlete varsity unit sets the competitive pace of Season 9.',
    heroImage: '/badminton.jpg',
    athletes: [],
    sportBreakdown: { Badminton: 20, BGMI: 11 },
  },
  {
    id: 'club-green',
    rank: 2,
    name: 'Green Club',
    code: 'GRN',
    accentColor: '#1b7a3d',
    badgeBg: 'bg-[#d1fae5]',
    textColor: 'text-[#1b7a3d]',
    lightBg: 'bg-[#d1fae5]',
    points: 9,
    mascot: 'Emerald Vanguard • Spartan Crest',
    squadSize: 19,
    fortress: 'Badminton & Field Sports',
    streak: 'Multi-Discipline Contender',
    motto: 'Unbroken. Unshaken.',
    battleChant: 'Green banner high, iron will prevail!',
    captain: {
      name: 'Siddhi',
      viceCaptain: 'Alijah',
      sport: 'Badminton • Varsity Striker',
    },
    narrative:
      'Built on stamina, iron discipline, and relentless team synergy, Green Club fields 19 determined competitors under the captaincy of Siddhi and Alijah. A consistent force across both indoor courts and varsity tournaments.',
    heroImage: '/football.jpg',
    athletes: [],
    sportBreakdown: { Badminton: 7, BGMI: 2 },
  },
  {
    id: 'club-yellow',
    rank: 3,
    name: 'Yellow Club',
    code: 'YEL',
    accentColor: '#d97706',
    badgeBg: 'bg-[#fef3c7]',
    textColor: 'text-[#d97706]',
    lightBg: 'bg-[#fef3c7]',
    points: 9,
    mascot: 'Golden Monarchs • Lion Mascot',
    squadSize: 18,
    fortress: 'Cricket T10 & Badminton',
    streak: 'Top 3 Contender',
    motto: 'Born To Conquer',
    battleChant: 'Gold in heart, gold in triumph!',
    captain: {
      name: 'Ifra',
      viceCaptain: 'Mansi',
      sport: 'Cricket & Racquet Sports',
    },
    narrative:
      'Tactical warfare and individual court masterclasses define Yellow Club. Led by captain Ifra and vice captain Mansi, their balanced 18-athlete roster poses an immediate threat in Cricket T10, Badminton brackets, and chess strategy.',
    heroImage: '/cricket.jpg',
    athletes: [],
    sportBreakdown: { Badminton: 7, BGMI: 2 },
  },
  {
    id: 'club-purple',
    rank: 4,
    name: 'Purple Club',
    code: 'PUR',
    accentColor: '#7e22ce',
    badgeBg: 'bg-[#f3e8ff]',
    textColor: 'text-[#7e22ce]',
    lightBg: 'bg-[#f3e8ff]',
    points: 6,
    mascot: 'Imperial Phoenix • Firebird Mascot',
    squadSize: 19,
    fortress: 'BGMI Esports & Athletics',
    streak: '6 Pts Esports Clutch',
    motto: 'Rise Above All',
    battleChant: 'Purple storm, strike like thunder!',
    captain: {
      name: 'Anam',
      viceCaptain: 'Tasmiya',
      sport: 'BGMI Esports • Squad Lead',
    },
    narrative:
      'Unpredictable, fast-paced, and lethal in high-pressure situations, Purple Club holds commanding frag counts and positioning in BGMI Esports. Guided by Anam and Tasmiya, their varsity roster is poised for sudden leaderboard surges.',
    heroImage: '/bgmi.jpg',
    athletes: [],
    sportBreakdown: { BGMI: 6 },
  },
  {
    id: 'club-red',
    rank: 5,
    name: 'Red Club',
    code: 'RED',
    accentColor: '#ba1a1a',
    badgeBg: 'bg-[#ffdad6]',
    textColor: 'text-[#ba1a1a]',
    lightBg: 'bg-[#ffdad6]',
    points: 0,
    mascot: 'The Red Legion • Bull Mascot',
    squadSize: 19,
    fortress: 'Carrom, Chess & Cricket',
    streak: 'Hungry Challengers',
    motto: 'Power Through Precision',
    battleChant: 'Crimson flame, conquer the arena!',
    captain: {
      name: 'Anjali',
      viceCaptain: 'Kainat',
      sport: 'Multi-Sport Competitor',
    },
    narrative:
      'Fierce, proud, and armed with 19 hungry collegiate competitors, Red Club approaches every contest with maximum intensity. Captained by Anjali and Kainat, they are prepared to make decisive moves as the upcoming fixtures unfold.',
    heroImage: '/carrom.jpg',
    athletes: [],
    sportBreakdown: {},
  },
];

export default function HousesPage() {
  const [houses, setHouses] = useState<DynamicHouse[]>(INITIAL_FALLBACK_HOUSES);
  const [loading, setLoading] = useState(true);
  const [selectedHouse, setSelectedHouse] = useState<DynamicHouse | null>(null);
  usePreventScroll(!!selectedHouse);
  const [rosterSearch, setRosterSearch] = useState('');
  const [pageSearch, setPageSearch] = useState('');

  // Fetch dynamic data from Admin Panel API routes
  useEffect(() => {
    let cancelled = false;

    const loadDynamicData = async () => {
      try {
        setLoading(true);

        const [clubsRes, lbRes, playersRes] = await Promise.all([
          fetch('/api/clubs'),
          fetch('/api/leaderboard?type=overall'),
          fetch('/api/players'),
        ]);

        if (!clubsRes.ok || !lbRes.ok) {
          throw new Error('Could not fetch house data');
        }

        const clubsData = await clubsRes.json();
        const lbData = await lbRes.json();
        const playersData = playersRes.ok ? await playersRes.json() : [];

        // Standings from approved points engine
        const standingsList: any[] = Array.isArray(lbData.standings) ? lbData.standings : [];
        const rawClubs: any[] = Array.isArray(clubsData) ? clubsData : [];
        const allPlayers: any[] = Array.isArray(playersData) ? playersData : [];

        // Filter out placeholder clubs like 'OTHER' / 'OT1'
        const validClubs = rawClubs.filter(
          (c) => c.code !== 'OT1' && c.name?.toUpperCase() !== 'OTHER'
        );

        const dynamicList: DynamicHouse[] = validClubs.map((club) => {
          const clubId = club.id || club._id;
          const lore = getLoreForClub(club.name, club.code);

          // Find standing in approved leaderboard
          const standing = standingsList.find(
            (s) => (s.club?.id || s.club?._id) === clubId || s.club?.name === club.name
          );

          const points = typeof standing?.points === 'number' ? standing.points : club.totalPoints || 0;
          const rank = standing?.rank || club.currentRank || 99;
          const sportBreakdown = standing?.sportBreakdown || {};

          // Filter registered players belonging to this house
          const housePlayers = allPlayers.filter(
            (p) => (p.clubId || p.club?.id || p.club?._id) === clubId || p.club?.name === club.name
          );

          const captainName = club.captainName || lore.defaultCaptain;
          const viceCaptainName = club.viceCaptainName || lore.defaultViceCaptain;

          // Map players with role detection
          const athletes: HouseAthlete[] = housePlayers.map((p) => {
            const sportsList = Array.isArray(p.sports)
              ? p.sports.map((sp: any) => sp.sport?.name || sp.name).filter(Boolean)
              : [];

            let status: 'Captain' | 'Vice Captain' | 'Active' = 'Active';
            if (p.name?.trim().toLowerCase() === captainName.trim().toLowerCase()) {
              status = 'Captain';
            } else if (p.name?.trim().toLowerCase() === viceCaptainName.trim().toLowerCase()) {
              status = 'Vice Captain';
            }

            return {
              id: p.id || p._id,
              name: p.name || 'Athlete',
              teamName: p.teamName || '',
              sports: sportsList.length > 0 ? sportsList : ['Varsity Athletics'],
              status,
              email: p.email,
            };
          });

          // Sort athletes: Captain first, then Vice Captain, then alphabetical
          athletes.sort((a, b) => {
            if (a.status === 'Captain') return -1;
            if (b.status === 'Captain') return 1;
            if (a.status === 'Vice Captain') return -1;
            if (b.status === 'Vice Captain') return 1;
            return a.name.localeCompare(b.name);
          });

          // Determine dominant fortresses from sport breakdown
          const topSports = Object.entries(sportBreakdown)
            .filter(([k, v]) => !k.startsWith('sport-') && typeof v === 'number' && v > 0)
            .sort((a, b) => (b[1] as number) - (a[1] as number))
            .map(([k]) => k);

          const fortress =
            topSports.length > 0 ? topSports.slice(0, 2).join(' & ') : lore.fortress;

          return {
            id: clubId,
            rank,
            name: club.name,
            code: club.code || lore.code,
            accentColor: lore.accentColor,
            badgeBg: lore.badgeBg,
            textColor: lore.textColor,
            lightBg: lore.lightBg,
            points,
            mascot: lore.mascot,
            squadSize: housePlayers.length > 0 ? housePlayers.length : lore.code === 'YEL' ? 18 : 19,
            fortress,
            streak: points > 0 ? `${points} Championship PTS` : lore.streak,
            motto: lore.motto,
            battleChant: lore.battleChant,
            captain: {
              name: captainName,
              viceCaptain: viceCaptainName,
              sport: lore.captainSport,
            },
            narrative: lore.narrative,
            heroImage: lore.heroImage,
            athletes,
            sportBreakdown,
          };
        });

        // Sort by approved points descending, then rank ascending
        dynamicList.sort((a, b) => {
          if (b.points !== a.points) return b.points - a.points;
          return a.rank - b.rank;
        });

        // Re-assign 1-based ranks
        dynamicList.forEach((h, idx) => {
          h.rank = idx + 1;
        });

        if (!cancelled && dynamicList.length > 0) {
          setHouses(dynamicList);
        }
      } catch (err) {
        console.error('Error fetching dynamic houses:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadDynamicData();

    return () => {
      cancelled = true;
    };
  }, []);

  const totalAthletes = useMemo(() => {
    return houses.reduce((acc, h) => acc + h.squadSize, 0);
  }, [houses]);

  const scrollToHouse = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Filter houses by search query if any
  const filteredHouses = useMemo(() => {
    const q = pageSearch.trim().toLowerCase();
    if (!q) return houses;
    return houses.filter(
      (h) =>
        h.name.toLowerCase().includes(q) ||
        h.code.toLowerCase().includes(q) ||
        h.captain.name.toLowerCase().includes(q) ||
        h.captain.viceCaptain.toLowerCase().includes(q) ||
        h.fortress.toLowerCase().includes(q) ||
        h.athletes.some((a) => a.name.toLowerCase().includes(q))
    );
  }, [houses, pageSearch]);

  // Modal filtered athletes
  const modalAthletes = useMemo(() => {
    if (!selectedHouse) return [];
    const q = rosterSearch.trim().toLowerCase();
    if (!q) return selectedHouse.athletes;
    return selectedHouse.athletes.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.teamName?.toLowerCase().includes(q) ||
        a.sports.some((s) => s.toLowerCase().includes(q))
    );
  }, [selectedHouse, rosterSearch]);

  return (
    <div className="bg-[#faf8ff] text-[#131b2e] font-inter text-[15px] antialiased selection:bg-[#0051d5] selection:text-white min-h-screen flex flex-col justify-between">
      <div>
        <PublicNavbar activeOverride="houses" />

        {/* ======================================================== */}
        {/* 1. HERO HEADER: STADIUM HOUSE DYNASTIES                  */}
        {/* ======================================================== */}
        <header className="relative w-full pt-24 sm:pt-28 lg:pt-32 pb-12 sm:pb-16 bg-gradient-to-br from-[#000f3f] via-[#071952] to-[#010922] text-white overflow-hidden border-b border-[#3b82f6]/20 shadow-xl">
          {/* Decorative Ambient Radial Glows */}
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-[#eb6905]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-[#0051d5]/25 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] opacity-5 pointer-events-none" />

          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Left Column: Heading & Live KPI Strip */}
              <div className="lg:col-span-7 flex flex-col items-start">
                {/* Season Pill Badge */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[11px] font-extrabold uppercase tracking-widest text-amber-300 font-manrope mb-4 shadow-inner">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>APL Season 9 • Official House Dynasties</span>
                </div>

                {/* Main Headline */}
                <h1 className="font-manrope text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white leading-none">
                  FIVE HOUSES.{' '}
                  <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-300 bg-clip-text text-transparent">
                    ONE CROWN.
                  </span>
                </h1>

                <p className="text-sm sm:text-base text-[#dce1ff] max-w-2xl mt-4 leading-relaxed font-normal">
                  Representing collegiate departments, residential houses, and athletic traditions. Explore official rosters, captain leadership, certified points telemetry, and battle anthems across the collegiate championship.
                </p>

                {/* Dynamic Telemetry Metric Chips */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 w-full max-w-2xl mt-7">
                  <div className="p-3 sm:p-3.5 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md">
                    <span className="text-[10px] sm:text-[11px] uppercase tracking-wider font-extrabold text-[#93c5fd] font-manrope block">
                      Houses
                    </span>
                    <span className="block font-manrope text-2xl sm:text-3xl font-black text-white">5</span>
                    <span className="text-[10px] text-white/60 font-medium">Contenders</span>
                  </div>

                  <div className="p-3 sm:p-3.5 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md">
                    <span className="text-[10px] sm:text-[11px] uppercase tracking-wider font-extrabold text-amber-300 font-manrope block">
                      Athletes
                    </span>
                    <span className="block font-manrope text-2xl sm:text-3xl font-black text-amber-400">
                      {totalAthletes > 0 ? totalAthletes : 94}
                    </span>
                    <span className="text-[10px] text-amber-200/70 font-medium">Active Varsity</span>
                  </div>

                  <div className="p-3 sm:p-3.5 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md">
                    <span className="text-[10px] sm:text-[11px] uppercase tracking-wider font-extrabold text-[#93c5fd] font-manrope block">
                      Disciplines
                    </span>
                    <span className="block font-manrope text-2xl sm:text-3xl font-black text-white">6</span>
                    <span className="text-[10px] text-white/60 font-medium">Sport Leagues</span>
                  </div>

                  <div className="p-3 sm:p-3.5 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md">
                    <span className="text-[10px] sm:text-[11px] uppercase tracking-wider font-extrabold text-emerald-300 font-manrope block">
                      Engine
                    </span>
                    <span className="block font-manrope text-2xl sm:text-3xl font-black text-emerald-400">LIVE</span>
                    <span className="text-[10px] text-emerald-200/70 font-medium">Admin Synced</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Crest Showcase Grid Card */}
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
                          Championship Houses Standings
                        </span>
                        <span className="text-[10px] text-[#93c5fd] font-medium font-manrope">
                          NexCore Directorate of Sports
                        </span>
                      </div>
                    </div>

                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-[10px] font-bold text-emerald-300 uppercase tracking-wider font-manrope">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Live Standings
                    </span>
                  </div>

                  {/* 5 Houses Quick Rank Chips */}
                  <div className="pt-4 space-y-2">
                    {houses.map((h) => (
                      <button
                        key={h.id}
                        type="button"
                        onClick={() => scrollToHouse(h.id)}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl bg-black/25 hover:bg-black/40 border border-white/10 transition-colors text-left group cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className="w-7 h-7 rounded-lg flex items-center justify-center font-manrope font-black text-xs text-white shrink-0 shadow-sm"
                            style={{ backgroundColor: h.accentColor }}
                          >
                            {h.code.charAt(0)}
                          </span>
                          <div className="min-w-0">
                            <span className="block font-manrope text-xs font-bold text-white uppercase truncate group-hover:text-amber-300 transition-colors">
                              {h.name}
                            </span>
                            <span className="block text-[10px] text-[#93c5fd] truncate">
                              Capt. {h.captain.name} • {h.squadSize} Athletes
                            </span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="block font-manrope text-xs font-black text-amber-400">
                            {h.points} PTS
                          </span>
                          <span className="text-[9px] uppercase font-bold text-white/50">
                            Rank #{h.rank}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-4 mt-2 border-t border-white/10 text-xs">
                    <Link
                      href="/leaderboard"
                      className="text-amber-300 hover:text-amber-200 font-extrabold uppercase tracking-wider font-manrope flex items-center gap-1 text-[11px]"
                    >
                      <span>Full Points Table</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                    <Link
                      href="/schedule"
                      className="text-[#93c5fd] hover:text-white font-bold uppercase tracking-wider font-manrope text-[11px]"
                    >
                      Match Fixtures
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* ======================================================== */}
        {/* 2. STICKY JUMP-TO BAR & SEARCH                           */}
        {/* ======================================================== */}
        <section className="w-full bg-white py-3 shadow-xs border-b border-[#e2e7ff] sticky top-16 sm:top-20 z-40">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              <span className="text-xs text-[#45464f] uppercase font-bold font-manrope mr-1 shrink-0">
                Jump to House:
              </span>
              {houses.map((h) => (
                <button
                  key={h.id}
                  onClick={() => scrollToHouse(h.id)}
                  className="px-3.5 py-1.5 rounded-lg bg-[#f2f3ff] hover:bg-[#000f3f] hover:text-white transition-all text-xs uppercase font-extrabold font-manrope text-[#000f3f] flex items-center gap-2 shrink-0 cursor-pointer shadow-xs active:scale-95"
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: h.accentColor }}
                  />
                  <span>{h.name}</span>
                  <span className="text-[10px] opacity-70">#{h.rank}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="relative w-full md:w-64">
                <Search className="w-4 h-4 text-[#757682] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="search"
                  value={pageSearch}
                  onChange={(e) => setPageSearch(e.target.value)}
                  placeholder="Filter athlete or house..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#f2f3ff] border border-[#e2e7ff] text-xs outline-none focus:ring-2 focus:ring-[#0051d5] focus:bg-white transition-all font-inter"
                />
              </div>

              <a
                href="#comparison-matrix"
                className="hidden lg:inline-flex px-3.5 py-1.5 rounded-lg bg-[#000f3f] hover:bg-[#0051d5] text-white text-xs uppercase font-bold font-manrope transition-colors shrink-0 shadow-xs"
              >
                Compare Matrix
              </a>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* 3. EDITORIAL HOUSE SHOWCASE CARDS (DYNAMIC 5 HOUSES)     */}
        {/* ======================================================== */}
        <section className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 py-12 flex flex-col gap-10">
          {filteredHouses.length === 0 ? (
            <div className="py-20 text-center bg-white rounded-2xl border border-[#e2e7ff] p-8">
              <Shield className="w-12 h-12 text-[#c5c6d0] mx-auto mb-3" />
              <p className="font-manrope text-base font-bold text-[#000f3f]">
                No houses or athletes found matching &ldquo;{pageSearch}&rdquo;
              </p>
              <button
                onClick={() => setPageSearch('')}
                className="mt-3 px-4 py-2 rounded-lg bg-[#000f3f] text-white text-xs uppercase font-bold font-manrope cursor-pointer"
              >
                Clear Search Filter
              </button>
            </div>
          ) : (
            filteredHouses.map((house) => (
              <article
                key={house.id}
                id={house.id}
                className="w-full bg-white rounded-2xl shadow-sm border border-[#e2e7ff] overflow-hidden group scroll-mt-36 hover:shadow-md transition-shadow"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[460px]">
                  {/* Visual & Mascot Hero Column */}
                  <div className="lg:col-span-5 relative bg-[#000f3f] flex flex-col justify-between p-6 sm:p-8 text-white overflow-hidden">
                    <div
                      className="absolute inset-0 bg-cover bg-center opacity-30 group-hover:scale-105 transition-transform duration-700"
                      style={{ backgroundImage: `url('${house.heroImage}')` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#000f3f] via-[#000f3f]/75 to-transparent" />

                    {/* Top Crest & Rank Badge */}
                    <div className="relative z-10 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span
                          className="px-3.5 py-1.5 rounded-full text-xs uppercase font-black tracking-widest flex items-center gap-2 font-manrope shadow-md"
                          style={{ backgroundColor: house.accentColor, color: '#ffffff' }}
                        >
                          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                          Rank #{house.rank} • {house.points} PTS
                        </span>
                      </div>
                      <span className="font-manrope text-5xl font-black text-white/20 select-none">
                        0{house.rank}
                      </span>
                    </div>

                    {/* Emblem & House Name */}
                    <div className="relative z-10 flex flex-col gap-2 mt-16 sm:mt-24">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center font-manrope font-black text-xl text-white shadow-lg border border-white/20 shrink-0"
                          style={{ backgroundColor: house.accentColor }}
                        >
                          {house.code.charAt(0)}
                        </div>
                        <div>
                          <span className="text-[11px] uppercase tracking-widest text-amber-300 font-extrabold font-manrope block">
                            {house.mascot}
                          </span>
                          <span className="text-[10px] uppercase font-mono text-[#93c5fd]">
                            Regimental Crest: {house.code}
                          </span>
                        </div>
                      </div>

                      <h2 className="font-manrope text-3xl sm:text-5xl font-black uppercase text-white leading-none mt-1">
                        {house.name}
                      </h2>
                      <p className="text-xs sm:text-sm uppercase tracking-wider text-[#ffdbca] italic font-semibold">
                        &ldquo;{house.motto}&rdquo;
                      </p>
                    </div>
                  </div>

                  {/* Roster, Captain & Metrics Column */}
                  <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between gap-6 bg-white">
                    {/* Quick Metric Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                      <div className="bg-[#f2f3ff] p-4 rounded-xl border border-[#e2e7ff] flex flex-col">
                        <span className="text-[10px] text-[#45464f] uppercase tracking-wider font-extrabold font-manrope flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[16px] text-[#0051d5]">military_tech</span>
                          Leadership
                        </span>
                        <span className="font-manrope text-base font-extrabold text-[#000f3f] mt-1 truncate">
                          {house.captain.name}
                        </span>
                        <span className="text-xs text-[#45464f] truncate">
                          VC: {house.captain.viceCaptain}
                        </span>
                      </div>

                      <div className="bg-[#f2f3ff] p-4 rounded-xl border border-[#e2e7ff] flex flex-col">
                        <span className="text-[10px] text-[#45464f] uppercase tracking-wider font-extrabold font-manrope flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[16px] text-emerald-600">groups</span>
                          Squad Strength
                        </span>
                        <span className="font-manrope text-base font-extrabold text-[#000f3f] mt-1">
                          {house.squadSize} Athletes
                        </span>
                        <span className="text-xs text-[#0051d5] font-semibold">
                          Verified Roster Active
                        </span>
                      </div>

                      <div className="bg-[#f2f3ff] p-4 rounded-xl border border-[#e2e7ff] flex flex-col">
                        <span className="text-[10px] text-[#45464f] uppercase tracking-wider font-extrabold font-manrope flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[16px] text-amber-600">sports_score</span>
                          Key Fortresses
                        </span>
                        <span className="font-manrope text-base font-extrabold text-[#000f3f] mt-1 truncate">
                          {house.fortress}
                        </span>
                        <span className="text-xs text-amber-700 font-bold truncate">
                          {house.streak}
                        </span>
                      </div>
                    </div>

                    {/* Heraldry Narrative */}
                    <div className="flex flex-col gap-1.5">
                      <span className="text-xs uppercase tracking-wider text-[#000f3f] font-extrabold font-manrope flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px] text-[#0051d5]">menu_book</span>
                        House Heraldry &amp; Season Narrative
                      </span>
                      <p className="text-xs sm:text-sm text-[#45464f] leading-relaxed">
                        {house.narrative}
                      </p>
                    </div>

                    {/* Featured Lead Athletes Preview */}
                    {house.athletes.length > 0 && (
                      <div className="bg-[#faf8ff] p-3.5 rounded-xl border border-[#e2e7ff]">
                        <span className="text-[10px] uppercase font-bold text-[#757682] font-manrope block mb-2">
                          Featured Competitors &amp; Star Lineup ({house.athletes.length} Registered)
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {house.athletes.slice(0, 4).map((ath) => (
                            <div
                              key={ath.id}
                              className="px-2.5 py-1 rounded-lg bg-white border border-[#e2e7ff] text-xs flex items-center gap-1.5 shadow-2xs"
                            >
                              <span
                                className="w-1.5 h-1.5 rounded-full"
                                style={{ backgroundColor: house.accentColor }}
                              />
                              <span className="font-bold text-[#000f3f] font-manrope">{ath.name}</span>
                              <span className="text-[10px] text-[#45464f]">
                                ({ath.sports[0] || 'Varsity'})
                              </span>
                              {ath.status !== 'Active' && (
                                <span className="text-[9px] font-black uppercase px-1 rounded bg-[#000f3f] text-white">
                                  {ath.status === 'Captain' ? 'Capt' : 'VC'}
                                </span>
                              )}
                            </div>
                          ))}
                          {house.athletes.length > 4 && (
                            <span className="px-2.5 py-1 rounded-lg text-xs font-bold text-[#0051d5] flex items-center">
                              +{house.athletes.length - 4} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Battle Chant Strip & Action Bar */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 bg-[#f2f3ff] rounded-xl p-4 border border-[#e2e7ff]">
                      <div className="flex items-center gap-3 w-full sm:w-auto min-w-0">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-white shrink-0 shadow-sm"
                          style={{ backgroundColor: house.accentColor }}
                        >
                          <span className="material-symbols-outlined text-xl">campaign</span>
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-[10px] uppercase text-[#45464f] font-extrabold font-manrope">
                            Official Battle Chant
                          </span>
                          <span className="text-xs sm:text-sm font-bold text-[#000f3f] italic truncate">
                            &ldquo;{house.battleChant}&rdquo;
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0">
                        <Link
                          href="/schedule"
                          className="px-4 py-2.5 rounded-lg border border-[#000f3f]/20 hover:border-[#000f3f] bg-white hover:bg-[#000f3f] text-[#000f3f] hover:text-white text-xs uppercase tracking-wider font-extrabold transition-all duration-150 font-manrope text-center"
                        >
                          Fixtures
                        </Link>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedHouse(house);
                            setRosterSearch('');
                          }}
                          className="px-5 py-2.5 rounded-lg bg-[#000f3f] hover:bg-[#0051d5] text-white text-xs uppercase tracking-wider font-extrabold transition-all duration-150 shadow-xs flex items-center justify-center gap-2 font-manrope cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                        >
                          <span>Full Roster ({house.squadSize})</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))
          )}
        </section>

        {/* ======================================================== */}
        {/* 4. COMPARATIVE ATTRIBUTES MATRIX                          */}
        {/* ======================================================== */}
        <section id="comparison-matrix" className="w-full py-12 sm:py-16 bg-[#f2f3ff] border-t border-[#e2e7ff]">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-8 bg-[#0051d5] rounded-full" />
                <div>
                  <span className="text-xs uppercase tracking-widest text-[#0051d5] font-extrabold font-manrope">
                    HEAD-TO-HEAD COMPARISON
                  </span>
                  <h3 className="font-manrope text-2xl sm:text-3xl font-black text-[#000f3f] uppercase tracking-tight">
                    House Attributes &amp; Performance Matrix
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href="/leaderboard"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#000f3f] hover:bg-[#0051d5] text-white text-xs uppercase font-extrabold font-manrope transition-colors shadow-xs"
                >
                  <span>Championship Standings</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-[#e2e7ff] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-[#000f3f] text-white text-xs uppercase font-extrabold font-manrope">
                      <th className="py-4 px-6">House Dynasty</th>
                      <th className="py-4 px-4 text-center">Current Rank</th>
                      <th className="py-4 px-4 text-center">Approved Points</th>
                      <th className="py-4 px-4 text-center">Athletes</th>
                      <th className="py-4 px-6">Dominant Fortress</th>
                      <th className="py-4 px-6">Captain &amp; Leadership</th>
                      <th className="py-4 px-4 text-right">Roster Access</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs divide-y divide-[#e2e7ff]">
                    {houses.map((h) => (
                      <tr key={h.id} className="hover:bg-[#faf8ff] transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <span
                              className="w-8 h-8 rounded-lg flex items-center justify-center font-manrope font-black text-xs text-white shrink-0 shadow-xs"
                              style={{ backgroundColor: h.accentColor }}
                            >
                              {h.code.charAt(0)}
                            </span>
                            <div>
                              <strong className="font-manrope text-sm font-extrabold uppercase text-[#000f3f] block">
                                {h.name}
                              </strong>
                              <span className="text-[10px] text-[#45464f] font-mono">{h.code}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center font-manrope font-black text-base text-[#0051d5]">
                          #{h.rank}
                        </td>
                        <td className="py-4 px-4 text-center font-manrope font-black text-sm text-[#000f3f]">
                          <span className="px-2.5 py-1 rounded-md bg-[#dae2fd] text-[#000f3f] font-mono">
                            {h.points} PTS
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center font-mono font-bold text-sm text-[#45464f]">
                          {h.squadSize}
                        </td>
                        <td className="py-4 px-6 font-semibold text-[#000f3f]">{h.fortress}</td>
                        <td className="py-4 px-6">
                          <span className="font-bold text-[#000f3f] block">{h.captain.name}</span>
                          <span className="text-[10px] text-[#45464f]">VC: {h.captain.viceCaptain}</span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedHouse(h);
                              setRosterSearch('');
                            }}
                            className="px-3 py-1.5 rounded-lg bg-[#f2f3ff] hover:bg-[#000f3f] hover:text-white text-[#000f3f] text-[11px] uppercase font-extrabold font-manrope transition-colors cursor-pointer shadow-2xs"
                          >
                            Inspect ({h.squadSize})
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ======================================================== */}
      {/* 5. INTERACTIVE ATHLETE ROSTER MODAL                      */}
      {/* ======================================================== */}
      {selectedHouse && (
        <div
          className="fixed inset-0 !m-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in overscroll-none touch-none"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedHouse(null);
          }}
          onTouchMove={(e) => {
            if (e.target === e.currentTarget) e.preventDefault();
          }}
          onWheel={(e) => {
            if (e.target === e.currentTarget) e.preventDefault();
          }}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative border border-[#e2e7ff] max-h-[90vh] flex flex-col touch-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedHouse(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-[#f2f3ff] hover:bg-[#e2e7ff] text-[#45464f] hover:text-[#000f3f] transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-4 mb-4 pb-4 border-b border-[#e2e7ff]">
              <span
                className="w-14 h-14 rounded-2xl flex items-center justify-center font-manrope font-black text-2xl text-white shadow-md shrink-0"
                style={{ backgroundColor: selectedHouse.accentColor }}
              >
                {selectedHouse.code}
              </span>
              <div>
                <h3 className="font-manrope text-xl sm:text-2xl font-black text-[#000f3f] uppercase leading-tight">
                  {selectedHouse.name} Varsity Roster
                </h3>
                <span className="text-xs text-[#0051d5] font-extrabold font-manrope uppercase mt-0.5 block">
                  Rank #{selectedHouse.rank} • {selectedHouse.points} Championship Points • {selectedHouse.squadSize} Athletes
                </span>
              </div>
            </div>

            {/* Search filter inside modal */}
            <div className="relative mb-4">
              <Search className="w-4 h-4 text-[#757682] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                value={rosterSearch}
                onChange={(e) => setRosterSearch(e.target.value)}
                placeholder="Search athlete by name or sport..."
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#f2f3ff] border border-[#e2e7ff] text-xs outline-none focus:ring-2 focus:ring-[#0051d5] focus:bg-white font-inter"
              />
            </div>

            {/* Athlete List (Scrollable) */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-2 mb-4">
              {modalAthletes.length === 0 ? (
                <p className="text-center py-8 text-xs text-[#45464f]">
                  No athletes found matching &ldquo;{rosterSearch}&rdquo;
                </p>
              ) : (
                <div className="divide-y divide-[#e2e7ff] border border-[#e2e7ff] rounded-xl overflow-hidden bg-[#faf8ff]">
                  {modalAthletes.map((ath) => (
                    <div
                      key={ath.id}
                      className="p-3 sm:p-4 flex items-center justify-between gap-3 text-xs bg-white hover:bg-[#faf8ff] transition-colors"
                    >
                      <div className="min-w-0">
                        <strong className="font-manrope text-sm font-bold text-[#000f3f] block truncate">
                          {ath.name}
                        </strong>
                        <span className="text-[11px] text-[#45464f] block truncate mt-0.5">
                          {ath.sports.join(', ')} {ath.teamName ? `• Squad: ${ath.teamName}` : ''}
                        </span>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded text-[10px] font-black uppercase font-manrope shrink-0 ${
                          ath.status === 'Captain'
                            ? 'bg-[#000f3f] text-white shadow-xs'
                            : ath.status === 'Vice Captain'
                            ? 'bg-[#0051d5] text-white shadow-xs'
                            : 'bg-[#f2f3ff] text-[#45464f]'
                        }`}
                      >
                        {ath.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center gap-3 pt-3 border-t border-[#e2e7ff]">
              <Link
                href="/schedule"
                onClick={() => setSelectedHouse(null)}
                className="flex-1 py-3 rounded-xl bg-[#000f3f] hover:bg-[#0051d5] text-white text-xs font-bold uppercase tracking-wider text-center transition-colors font-manrope"
              >
                View Matches for {selectedHouse.name}
              </Link>
              <button
                type="button"
                onClick={() => setSelectedHouse(null)}
                className="px-5 py-3 rounded-xl bg-[#f2f3ff] hover:bg-[#e2e7ff] text-[#000f3f] text-xs font-bold uppercase tracking-wider transition-colors font-manrope cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 6. PUBLIC FOOTER                                         */}
      {/* ======================================================== */}
      <PublicFooter />
    </div>
  );
}
