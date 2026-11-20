'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import PublicNavbar from '@/components/public/PublicNavbar';
import HomeFixtures from '@/components/public/HomeFixtures';
import HomePointsTable from '@/components/public/HomePointsTable';
import ChampionshipSplashScreen from '@/components/public/ChampionshipSplashScreen';
import { CarromIcon } from '@/components/ui/icons';
import {
  Trophy,
  X,
  ChevronRight,
  ArrowRight,
  Calendar,
  MapPin,
  Clock,
  Shield,
  Medal,
  Users,
  CheckCircle2,
  Tv,
  Bell,
  Sparkles,
  FileText,
} from 'lucide-react';

// Dynamic House Item Interface & Helpers
export interface HouseItem {
  id: string;
  rank: number;
  name: string;
  code: string;
  colorName: string;
  accentBorder: string;
  textColor: string;
  lightBg: string;
  points: number;
  gold: number;
  silver: number;
  bronze: number;
  motto: string;
  captain: string;
  viceCaptain?: string;
  activeAthletes: number;
  description: string;
}

function getHouseTheme(code: string = '', name: string = '') {
  const c = (code + ' ' + name).toLowerCase();
  if (c.includes('blu') || c.includes('mav')) {
    return {
      colorName: 'Cobalt Blue',
      accentBorder: 'bg-[#0051d5]',
      textColor: 'text-[#0051d5]',
      lightBg: 'bg-[#dbe1ff]',
      motto: 'Defy The Ordinary',
      description: 'High-octane powerhouses dominating field sports with blazing speed, fearless striking, and indomitable spirit.',
    };
  }
  if (c.includes('grn') || c.includes('green') || c.includes('spa')) {
    return {
      colorName: 'Emerald Green',
      accentBorder: 'bg-[#0f6b3e]',
      textColor: 'text-[#0f6b3e]',
      lightBg: 'bg-[#d1fae5]',
      motto: 'Unbroken. Unshaken.',
      description: 'Relentless fighters driven by discipline, iron endurance, and unmatched collegiate record-breaking teamwork.',
    };
  }
  if (c.includes('yel') || c.includes('yellow') || c.includes('gold') || c.includes('alp')) {
    return {
      colorName: 'Royal Gold & Solar',
      accentBorder: 'bg-[#d97706]',
      textColor: 'text-[#d97706]',
      lightBg: 'bg-[#fef3c7]',
      motto: 'Born To Conquer',
      description: 'Strategic tacticians dominating racquet sports, rapid chess, and precision football knockout brackets.',
    };
  }
  if (c.includes('pur') || c.includes('purple') || c.includes('violet') || c.includes('phx')) {
    return {
      colorName: 'Imperial Violet',
      accentBorder: 'bg-[#7e22ce]',
      textColor: 'text-[#7e22ce]',
      lightBg: 'bg-[#f3e8ff]',
      motto: 'Rise Above All',
      description: 'Defending champions renowned for tactical precision, unmatched team synergy, and absolute court command.',
    };
  }
  if (c.includes('red') || c.includes('crimson') || c.includes('dom')) {
    return {
      colorName: 'Crimson Flame',
      accentBorder: 'bg-[#ba1a1a]',
      textColor: 'text-[#ba1a1a]',
      lightBg: 'bg-[#ffdad6]',
      motto: 'Power Through Precision',
      description: 'Fierce collegiate competitors renowned for aggressive offense, high run rates, and tactical excellence.',
    };
  }
  return {
    colorName: 'Championship House',
    accentBorder: 'bg-[#000f3f]',
    textColor: 'text-[#000f3f]',
    lightBg: 'bg-[#dae2fd]',
    motto: 'United In Spirit',
    description: 'Elite collegiate house fielding top athletes in pursuit of championship glory.',
  };
}

const INITIAL_HOUSES_DATA: HouseItem[] = [
  {
    id: 'club-blue',
    rank: 1,
    name: 'Blue Club',
    code: 'BLU',
    colorName: 'Cobalt Blue',
    accentBorder: 'bg-[#0051d5]',
    textColor: 'text-[#0051d5]',
    lightBg: 'bg-[#dbe1ff]',
    points: 31,
    gold: 5,
    silver: 2,
    bronze: 1,
    motto: 'Defy The Ordinary',
    captain: 'Roheen',
    viceCaptain: 'Farhat',
    activeAthletes: 19,
    description: 'High-octane powerhouses dominating field sports with blazing speed, fearless striking, and indomitable spirit.',
  },
  {
    id: 'club-green',
    rank: 2,
    name: 'Green Club',
    code: 'GRN',
    colorName: 'Emerald Green',
    accentBorder: 'bg-[#0f6b3e]',
    textColor: 'text-[#0f6b3e]',
    lightBg: 'bg-[#d1fae5]',
    points: 9,
    gold: 4,
    silver: 4,
    bronze: 2,
    motto: 'Unbroken. Unshaken.',
    captain: 'Siddhi',
    viceCaptain: 'Alijah',
    activeAthletes: 19,
    description: 'Relentless fighters driven by discipline, iron endurance, and unmatched collegiate record-breaking teamwork.',
  },
  {
    id: 'club-yellow',
    rank: 3,
    name: 'Yellow Club',
    code: 'YEL',
    colorName: 'Royal Gold & Solar',
    accentBorder: 'bg-[#d97706]',
    textColor: 'text-[#d97706]',
    lightBg: 'bg-[#fef3c7]',
    points: 9,
    gold: 3,
    silver: 3,
    bronze: 4,
    motto: 'Born To Conquer',
    captain: 'Ifra',
    viceCaptain: 'Mansi',
    activeAthletes: 18,
    description: 'Strategic tacticians dominating racquet sports, rapid chess, and precision football knockout brackets.',
  },
  {
    id: 'club-purple',
    rank: 4,
    name: 'Purple Club',
    code: 'PUR',
    colorName: 'Imperial Violet',
    accentBorder: 'bg-[#7e22ce]',
    textColor: 'text-[#7e22ce]',
    lightBg: 'bg-[#f3e8ff]',
    points: 6,
    gold: 2,
    silver: 2,
    bronze: 3,
    motto: 'Rise Above All',
    captain: 'Anam',
    viceCaptain: 'Tasmiya',
    activeAthletes: 19,
    description: 'Defending champions renowned for tactical precision, unmatched team synergy, and absolute court command.',
  },
  {
    id: 'club-red',
    rank: 5,
    name: 'Red Club',
    code: 'RED',
    colorName: 'Crimson Flame',
    accentBorder: 'bg-[#ba1a1a]',
    textColor: 'text-[#ba1a1a]',
    lightBg: 'bg-[#ffdad6]',
    points: 0,
    gold: 2,
    silver: 1,
    bronze: 3,
    motto: 'Power Through Precision',
    captain: 'Anjali',
    viceCaptain: 'Kainat',
    activeAthletes: 19,
    description: 'Fierce collegiate competitors renowned for aggressive offense, high run rates, and tactical excellence.',
  },
];

// Exact 6 Disciplines strictly organized by the championship
const DISCIPLINES_DATA = [
  {
    id: 'cricket',
    name: 'Cricket T10',
    category: 'Cricket',
    icon: 'sports_cricket',
    pointsMax: '100 PTS MAX',
    fixturesCount: '10 Fixtures',
    description: '10 overs per side, 60 balls of high-octane power hitting under full stadium floodlights.',
    rules: 'Official T10 rules, 10 overs per innings, maximum 2 overs per bowler, powerplay overs 1-3.',
  },
  {
    id: 'football',
    name: 'Football',
    category: 'Football',
    icon: 'sports_soccer',
    pointsMax: '90 PTS MAX',
    fixturesCount: '8 Fixtures',
    description: 'High-intensity knockout format with golden goal extra time and direct penalty shootouts.',
    rules: 'Rolling substitutions permitted, direct free kicks, direct penalty shootouts in knockout draws.',
  },
  {
    id: 'badminton',
    name: 'Badminton',
    category: 'Badminton',
    icon: 'sports_tennis',
    pointsMax: '60 PTS MAX',
    fixturesCount: '12 Fixtures',
    description: 'Men’s Singles and Doubles best of 3 sets on synthetic indoor championship courts.',
    rules: 'BWF standard rules, 21-point rally scoring system, sudden death deuce up to 30 points.',
  },
  {
    id: 'carrom',
    name: 'Carrom',
    category: 'Indoor',
    icon: 'carrom',
    pointsMax: '40 PTS MAX',
    fixturesCount: '12 Fixtures',
    description: 'Classic precision board championship featuring singles, doubles, and queen cover point systems.',
    rules: 'Points limit 25 or 8 boards. White 1 pt, Black 2 pts, Queen 3 pts. Immediate confirmation cover required on queen pocketing.',
  },
  {
    id: 'chess',
    name: 'Blitz Chess',
    category: 'Indoor',
    icon: 'chess',
    pointsMax: '50 PTS MAX',
    fixturesCount: '16 Fixtures',
    description: '5-minute rapid & blitz chess tournament with international FIDE arbiters.',
    rules: 'FIDE Rapid Rules, 5 mins + 3s increment per move, electronic DGT sensory boards.',
  },
  {
    id: 'bgmi',
    name: 'BGMI Esports',
    category: 'Esports',
    icon: 'sports_esports',
    pointsMax: '75 PTS MAX',
    fixturesCount: '6 Maps',
    description: 'Squad battle royale battles in Erangel & Miramar with live LAN casting.',
    rules: 'Official BGIS tournament point matrix: 10 pts per WWCD + 1 pt per verified elimination.',
  },
];

// Featured 6 Disciplines for Hero Carousel & Discipline Switcher
const HERO_SPORTS = [
  {
    id: 'cricket',
    badge: 'FLOODLIT CRICKET T10',
    name: 'Cricket T10',
    shortName: 'Cricket',
    icon: 'sports_cricket',
    tagline: '10 OVERS • 60 BALLS PER SIDE • UNDER FLOODLIGHTS',
    headline: 'THE ARENA',
    headlineAccent: 'IS YOURS.',
    description:
      'High-octane power hitting under international stadium floodlights with live ball tracker, electronic scoreboard, and certified umpire feeds.',
    image: '/cricket.jpg',
    clashTitle: 'Cricket Marquee Opener',
    clashMatch: 'MAV v DOM • T10 CRICKET',
    clashSub: 'Main Oval Stadium • Nov 26',
  },
  {
    id: 'football',
    badge: 'COLLEGIATE TURF FOOTBALL',
    name: 'Football',
    shortName: 'Football',
    icon: 'sports_soccer',
    tagline: 'HIGH-INTENSITY KNOCKOUT • GOLDEN GOAL',
    headline: 'EVERY GOAL.',
    headlineAccent: 'EVERY TACKLE.',
    description:
      'High-stakes collegiate football under perimeter floodlights. Fast transitions, clinical finishing, and sudden-death penalty shootouts.',
    image: '/football.jpg',
    clashTitle: 'Upcoming Football Marquee',
    clashMatch: 'ALPHAS v PHOENIX • SEMI-FINAL',
    clashSub: 'Main Turf Stadium • Today 15:30',
  },
  {
    id: 'badminton',
    badge: 'BWF REGULATION BADMINTON',
    name: 'Badminton',
    shortName: 'Badminton',
    icon: 'sports_tennis',
    tagline: '21-POINT RALLY SCORING • SINGLES & DOUBLES',
    headline: 'BLISTERING SMASHES.',
    headlineAccent: 'SURGICAL TOUCH.',
    description:
      'Rapid 300+ km/h shuttlecock action on synthetic championship courts. Best of 3 sets with sudden death deuces up to 30 points.',
    image: '/badminton.jpg',
    clashTitle: 'Badminton Trophy Match',
    clashMatch: 'SPARTANS v MAV • MEN’S DOUBLES',
    clashSub: 'Indoor Sports Complex • Tomorrow',
  },
  {
    id: 'carrom',
    badge: 'CHAMPIONSHIP PRECISION CARROM',
    name: 'Carrom',
    shortName: 'Carrom',
    icon: 'carrom',
    tagline: 'QUEEN COVER • ACCURACY • PURE FINESSE',
    headline: 'PINPOINT STRIKES.',
    headlineAccent: 'MASTER POCKETING.',
    description:
      'Classic tournament board warfare with precision rebounds, white & black piece accumulation, and high-tension queen confirmation pocketing.',
    image: '/carrom.jpg',
    clashTitle: 'Carrom Board Finals',
    clashMatch: 'DOMINATORS v ALPHAS • DOUBLES',
    clashSub: 'Indoor Rec Center • Court 1',
  },
  {
    id: 'chess',
    badge: 'FIDE BLITZ CHESS ARENA',
    name: 'Blitz Chess',
    shortName: 'Chess',
    icon: 'chess',
    tagline: '5 MINS + 3 SECS INCREMENT • DGT SENSORY BOARDS',
    headline: 'STRATEGIC MIND.',
    headlineAccent: 'UNYIELDING FOCUS.',
    description:
      'Grandmaster-level tactical confrontations with digital clock timers and FIDE Swiss pairing in an acoustic, sound-dampened auditorium.',
    image: '/chess.jpg',
    clashTitle: 'Chess Championship Board 1',
    clashMatch: 'MAVERICKS v SPARTANS • BLITZ',
    clashSub: 'Mind Sports Auditorium • Today 16:00',
  },
  {
    id: 'bgmi',
    badge: 'BGMI ESPORTS LAN CLASH',
    name: 'BGMI Esports',
    shortName: 'BGMI',
    icon: 'sports_esports',
    tagline: 'BATTLE ROYALE • ERANGEL & MIRAMAR • 4-MAN SQUADS',
    headline: 'TACTICAL ROTATION.',
    headlineAccent: 'CHICKEN DINNER.',
    description:
      'High-adrenaline mobile esports battle royale on campus dedicated LAN servers with live casting, zone shifts, and squad clutch plays.',
    image: '/bgmi.jpg',
    clashTitle: 'Esports Grand Finals Map 4',
    clashMatch: 'ALL 5 HOUSES • ERANGEL SHOWDOWN',
    clashSub: 'Esports LAN Dome • Nov 28',
  },
];

export default function HomePage() {
  // Multi-Sport Hero Carousel State (Automatic 3.5s cycle with pause-on-hover & interactive restart)
  const [heroIndex, setHeroIndex] = useState(0);
  const [isHeroPaused, setIsHeroPaused] = useState(false);
  const activeHero = HERO_SPORTS[heroIndex];

  useEffect(() => {
    if (isHeroPaused) return;
    const interval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % HERO_SPORTS.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [isHeroPaused, heroIndex]);

  // Dynamic Houses from Admin Backend
  const [houses, setHouses] = useState<HouseItem[]>(INITIAL_HOUSES_DATA);
  const [selectedHouse, setSelectedHouse] = useState<HouseItem | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadDynamicHouses() {
      try {
        const [lbRes, playersRes, awardsRes] = await Promise.all([
          fetch('/api/leaderboard?type=overall'),
          fetch('/api/players'),
          fetch('/api/awards?status=APPROVED'),
        ]);

        let standingsData: any[] = [];
        if (lbRes.ok) {
          const lbJson = await lbRes.json();
          standingsData = lbJson.standings || [];
        }

        let playersData: any[] = [];
        if (playersRes.ok) {
          const pJson = await playersRes.json();
          playersData = Array.isArray(pJson) ? pJson : [];
        }

        let awardsData: any[] = [];
        if (awardsRes.ok) {
          const aJson = await awardsRes.json();
          awardsData = aJson.awards || [];
        }

        const validStandings = standingsData.filter(
          (s: any) => s.club && s.club.code !== 'OT1' && s.club.name?.toLowerCase() !== 'other'
        );

        if (validStandings.length > 0 && isMounted) {
          validStandings.sort(
            (a: any, b: any) => (b.totalPoints ?? b.points ?? 0) - (a.totalPoints ?? a.points ?? 0)
          );

          const dynamicList: HouseItem[] = validStandings.map((st: any, idx: number) => {
            const club = st.club;
            const theme = getHouseTheme(club.code, club.name);
            const clubPlayers = playersData.filter(
              (p: any) => p.clubId === club._id || p.clubId === club.id
            );
            const clubAwards = awardsData.filter(
              (aw: any) => aw.clubId === club._id || aw.clubId === club.id
            );

            const gold = clubAwards.filter(
              (aw: any) =>
                aw.awardType === 'GOLD' ||
                aw.awardTitle?.toLowerCase().includes('gold') ||
                aw.awardTitle?.toLowerCase().includes('mvp')
            ).length;
            const silver = clubAwards.filter(
              (aw: any) =>
                aw.awardType === 'SILVER' || aw.awardTitle?.toLowerCase().includes('silver')
            ).length;
            const bronze = clubAwards.filter(
              (aw: any) =>
                aw.awardType === 'BRONZE' || aw.awardTitle?.toLowerCase().includes('bronze')
            ).length;

            return {
              id: club.id || club._id || `house-${idx}`,
              rank: idx + 1,
              name: club.name,
              code: club.code || 'HSE',
              colorName: theme.colorName,
              accentBorder: theme.accentBorder,
              textColor: theme.textColor,
              lightBg: theme.lightBg,
              points: Number((st.totalPoints ?? st.points ?? 0).toFixed(0)),
              gold: gold || (idx === 0 ? 5 : idx === 1 ? 4 : idx === 2 ? 3 : idx === 3 ? 2 : 1),
              silver: silver || (idx === 0 ? 2 : idx === 1 ? 4 : idx === 2 ? 3 : idx === 3 ? 2 : 1),
              bronze: bronze || (idx === 0 ? 1 : idx === 1 ? 2 : idx === 2 ? 4 : idx === 3 ? 3 : 2),
              motto: theme.motto,
              captain: club.captainName || 'Team Captain',
              viceCaptain: club.viceCaptainName || '',
              activeAthletes: clubPlayers.length > 0 ? clubPlayers.length : 19,
              description: theme.description,
            };
          });

          setHouses(dynamicList);
        }
      } catch (err) {
        console.error('Failed to load dynamic houses for homepage:', err);
      }
    }

    loadDynamicHouses();
    return () => {
      isMounted = false;
    };
  }, []);
  const [selectedSport, setSelectedSport] = useState<(typeof DISCIPLINES_DATA)[0] | null>(null);
  const [showLiveStreamModal, setShowLiveStreamModal] = useState(false);
  const [showRulebookModal, setShowRulebookModal] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  const handleSplashDismiss = () => {
    setShowSplash(false);
  };

  return (
    <div className="bg-[#faf8ff] text-[#131b2e] font-inter text-[15px] antialiased selection:bg-[#0051d5] selection:text-white min-h-screen">
      {/* 0. CINEMATIC CHAMPIONSHIP SPLASH SCREEN */}
      {showSplash && (
        <ChampionshipSplashScreen
          onComplete={handleSplashDismiss}
          autoDismissDelay={3200}
        />
      )}
      {/* 1. BRAND HEADER & NAVBAR */}
      <PublicNavbar activeOverride="home" />

      <main className="w-full pt-16 sm:pt-20 bg-[#faf8ff] min-h-[calc(100vh-64px)] sm:min-h-[calc(100vh-80px)]">
        <div className="flex flex-col w-full">
          {/* ======================================================== */}
          {/* 2. HERO SECTION (MULTI-SPORT STADIUM SHOWCASE - H-SCREEN) */}
          {/* ======================================================== */}
          <section
            onMouseEnter={() => setIsHeroPaused(true)}
            onMouseLeave={() => setIsHeroPaused(false)}
            className="relative w-full h-[calc(100dvh-4rem)] sm:h-[calc(100vh-5rem)] min-h-[calc(100dvh-4rem)] sm:min-h-[calc(100vh-5rem)] flex flex-col justify-between overflow-hidden bg-[#0a0a0c] text-white select-none"
          >
            {/* Multi-Sport Stadium Backgrounds with Fast Snappy 500ms Cross-Fade */}
            <div className="absolute inset-0 z-0 overflow-hidden">
              {HERO_SPORTS.map((sport, idx) => (
                <img
                  key={sport.id}
                  className={`absolute inset-0 w-full h-full object-cover object-center scale-105 transition-all duration-500 ease-out ${
                    idx === heroIndex ? 'opacity-90 scale-100' : 'opacity-0 scale-105 pointer-events-none'
                  }`}
                  alt={sport.name}
                  src={sport.image}
                />
              ))}
              {/* Neutral black scrim for high contrast without blue overlay wash */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-transparent pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/25 pointer-events-none" />
            </div>

            {/* Live Telemetry Watermark & Centered Content */}
            <div className="relative z-10 max-w-[1440px] mx-auto w-full px-4 sm:px-6 lg:px-12 flex-1 flex flex-col justify-center py-3 sm:py-5 min-h-0">
              {/* Monumental Typography Stack */}
              <div className="max-w-4xl flex flex-col gap-1 sm:gap-1.5 mb-3 sm:mb-4">
                <span className="text-[10px] sm:text-xs uppercase tracking-widest text-[#dbe1ff] font-bold font-manrope">
                  {activeHero.tagline}
                </span>
                <h1 className="font-manrope text-3xl xs:text-4xl sm:text-6xl lg:text-[68px] xl:text-[72px] font-extrabold uppercase tracking-tight text-white leading-tight sm:leading-[0.98]">
                  <span>{activeHero.headline}</span>
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#dae2fd] to-[#dbe1ff]">
                    {activeHero.headlineAccent}
                  </span>
                </h1>
                <p className="text-xs sm:text-sm lg:text-base text-[#b7c4fd] max-w-2xl mt-1 leading-relaxed font-normal line-clamp-2 sm:line-clamp-none">
                  {activeHero.description}
                </p>
              </div>

              {/* Discipline Switcher Pill Dock with Chevron Arrows */}
              <div className="hidden sm:flex flex-wrap items-center gap-1.5 sm:gap-2 mb-4">
                <span className="text-[10px] uppercase font-extrabold tracking-widest text-[#808dc2] font-manrope mr-1 hidden md:inline">
                  Select Discipline:
                </span>
                <button
                  type="button"
                  onClick={() => setHeroIndex((prev) => (prev - 1 + HERO_SPORTS.length) % HERO_SPORTS.length)}
                  className="w-[34px] h-[34px] rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-all cursor-pointer mr-0.5 shrink-0"
                  title="Previous Sport"
                  aria-label="Previous Sport"
                >
                  <span className="material-symbols-outlined text-[16px]">chevron_left</span>
                </button>
                {HERO_SPORTS.map((s, idx) => {
                  const active = idx === heroIndex;
                  return (
                    <button
                      key={s.id}
                      onClick={() => setHeroIndex(idx)}
                      className={`h-[34px] px-3.5 rounded-full text-[11px] sm:text-xs font-manrope font-extrabold uppercase tracking-wider transition-all duration-200 cursor-pointer inline-flex items-center gap-2 ${
                        active
                          ? 'bg-white text-[#000f3f] shadow-lg scale-105 ring-2 ring-white/50'
                          : 'bg-white/10 hover:bg-white/20 text-[#dce1ff] border border-white/10'
                      }`}
                    >
                      <span className="w-4 h-4 flex items-center justify-center shrink-0">
                        {s.icon === 'carrom' ? (
                          <CarromIcon className="w-4 h-4 shrink-0" />
                        ) : (
                          <span className="material-symbols-outlined text-[16px] leading-none select-none">{s.icon}</span>
                        )}
                      </span>
                      <span className="leading-none">{s.shortName}</span>
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => setHeroIndex((prev) => (prev + 1) % HERO_SPORTS.length)}
                  className="w-[34px] h-[34px] rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-all cursor-pointer ml-0.5 shrink-0"
                  title="Next Sport"
                  aria-label="Next Sport"
                >
                  <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                </button>
              </div>

              {/* Action Tiers & Dynamic Clashing Card */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-1">
                <a
                  href="#championship-overview"
                  className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 rounded-lg bg-[#eb6905] hover:bg-[#783200] text-white text-xs sm:text-sm uppercase tracking-wider font-bold transition-all duration-200 shadow-xl shadow-[#eb6905]/25 font-manrope cursor-pointer"
                >
                  <span>EXPLORE 6 DISCIPLINES</span>
                  <span className="material-symbols-outlined text-[20px]">north_east</span>
                </a>

                <Link
                  href="/schedule"
                  className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm uppercase tracking-wider backdrop-blur-md transition-all duration-200 font-manrope border border-white/20 cursor-pointer"
                >
                  <span>VIEW SCHEDULE</span>
                  <span className="material-symbols-outlined text-[20px]">calendar_month</span>
                </Link>


              </div>
            </div>
          </section>

          {/* ======================================================== */}
          {/* 3. CHAMPIONSHIP INTRODUCTION: ASYMMETRIC CANVAS           */}
          {/* ======================================================== */}
          <section className="w-full py-16 lg:py-20 bg-[#faf8ff]" id="championship-overview">
            <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">
              {/* Section Marker */}
              <div className="flex flex-col gap-2 mb-12">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-1 bg-[#0051d5] rounded-full" />
                  <span className="text-xs text-[#0051d5] uppercase tracking-widest font-extrabold font-manrope">
                    THE SPIRIT OF COMPETITION
                  </span>
                </div>
                <h2 className="font-manrope text-3xl sm:text-5xl font-extrabold text-[#000f3f] uppercase tracking-tight leading-none">
                  MORE THAN A GAME.
                  <br />
                  <span className="text-[#45464f] text-2xl sm:text-4xl font-bold">
                    IT&apos;S A DECADE OF LEGACY.
                  </span>
                </h2>
              </div>

              {/* Asymmetrical Editorial Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                {/* Left Rich Media Card */}
                <div className="lg:col-span-7 bg-white rounded-xl overflow-hidden shadow-md flex flex-col justify-between border border-[#e2e7ff]">
                  <div className="relative h-[320px] sm:h-[360px] w-full overflow-hidden">
                    <img
                      className="w-full h-full object-cover"
                      alt="Collegiate cricket batsman playing shot under stadium floodlights"
                      src="/cricket.jpg"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#000f3f] via-transparent to-transparent" />
                    <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
                      <div>
                        <span className="px-2.5 py-1 rounded bg-[#0051d5] text-white text-[11px] uppercase tracking-wider font-extrabold font-manrope">
                          CRICKET T10 POWERPLAY
                        </span>
                        <p className="text-xl sm:text-2xl font-bold text-white mt-2 uppercase font-manrope">
                          Record Partnership: 142 Runs
                        </p>
                      </div>
                      <span className="text-5xl font-black text-white/20 font-manrope">
                        09
                      </span>
                    </div>
                  </div>

                  <div className="p-6 flex flex-col justify-between flex-grow">
                    <p className="text-[#45464f] text-base leading-relaxed mb-6 font-normal">
                      APL brings together the finest athletes, passionate supporters, and five competing houses in one unforgettable celebration of athletic prestige, relentless drive, and raw sportsmanship. Every run counts, every goal shifts the institutional balance of power.
                    </p>
                    <div className="grid grid-cols-3 gap-4 pt-4 bg-[#f2f3ff] p-4 rounded-lg border border-[#e2e7ff]/70">
                      <div>
                        <span className="text-[11px] text-[#45464f] uppercase font-bold font-manrope">
                          All-Time Titles
                        </span>
                        <p className="text-lg sm:text-xl text-[#000f3f] font-extrabold font-manrope">
                          DOM • 3
                        </p>
                      </div>
                      <div>
                        <span className="text-[11px] text-[#45464f] uppercase font-bold font-manrope">
                          Current Holder
                        </span>
                        <p className="text-lg sm:text-xl text-[#0051d5] font-extrabold font-manrope">
                          MAVERICKS
                        </p>
                      </div>
                      <div>
                        <span className="text-[11px] text-[#45464f] uppercase font-bold font-manrope">
                          Attendance
                        </span>
                        <p className="text-lg sm:text-xl text-[#000f3f] font-extrabold font-manrope">
                          8,500+
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Stack: Quote & Sports Breakdown */}
                <div className="lg:col-span-5 flex flex-col gap-6">
                  {/* Institutional Quote Bento */}
                  <div className="bg-[#000f3f] text-white p-6 sm:p-8 rounded-xl shadow-md relative overflow-hidden flex flex-col justify-between border border-white/10">
                    <div className="relative z-10">
                      <span className="material-symbols-outlined text-[#dbe1ff] text-4xl mb-4 block">
                        format_quote
                      </span>
                      <p className="text-base sm:text-lg leading-snug uppercase tracking-wide text-[#dce1ff] font-manrope font-bold">
                        &ldquo;On these pitches and courts, students forge friendships that outlast semesters, and rivalries that define generations.&rdquo;
                      </p>
                    </div>
                    <div className="pt-6 mt-4 flex items-center gap-4 relative z-10 border-t border-white/15">
                      <div className="w-12 h-12 rounded-full bg-[#0051d5] flex items-center justify-center font-bold text-white font-manrope text-base shadow-sm">
                        DR
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs uppercase text-white font-bold font-manrope">
                          Dr. Rajeshwar Rao
                        </span>
                        <span className="text-[11px] text-[#808dc2]">
                          Dean of Physical Education &amp; Sports
                        </span>
                      </div>
                    </div>
                    <div className="absolute -right-12 -bottom-12 w-48 h-48 rounded-full bg-[#316bf3]/20 blur-2xl pointer-events-none" />
                  </div>

                  {/* Quick Sports Schedule Feature Tile */}
                  <div
                    onClick={() => setShowRulebookModal(true)}
                    className="bg-white p-5 rounded-xl shadow-sm border border-[#e2e7ff] flex items-center justify-between gap-4 hover:bg-[#e2e7ff]/40 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-[#dae2fd] text-[#000f3f] flex items-center justify-center group-hover:bg-[#000f3f] group-hover:text-white transition-colors shrink-0">
                        <span className="material-symbols-outlined text-2xl">emoji_events</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-[#0051d5] uppercase font-extrabold tracking-wider font-manrope">
                          Tournament Handbook
                        </span>
                        <span className="text-sm sm:text-base font-bold text-[#000f3f] uppercase font-manrope">
                          APL S9 Official Rulebook &amp; Bye-Laws
                        </span>
                        <span className="text-xs text-[#45464f]">
                          Includes points distribution matrix and foul conduct guidelines
                        </span>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-[#000f3f] text-2xl group-hover:translate-x-1 transition-transform shrink-0">
                      arrow_forward
                    </span>
                  </div>

                  {/* Secondary Image Tile */}
                  <div className="relative h-44 rounded-xl overflow-hidden shadow-sm border border-[#e2e7ff]">
                    <img
                      className="w-full h-full object-cover"
                      alt="Collegiate football match under bright evening lights, player shooting the ball into the top corner"
                      src="/football.jpg"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#000f3f]/90 via-[#000f3f]/30 to-transparent flex items-end p-4">
                      <div className="flex items-center justify-between w-full">
                        <span className="text-xs font-bold text-white uppercase tracking-wider font-manrope">
                          FOOTBALL QUARTER-FINALS COMPLETED
                        </span>
                        <Link
                          href="/schedule"
                          className="text-[11px] text-[#ffdbca] font-extrabold uppercase hover:underline cursor-pointer"
                        >
                          VIEW RECAP
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ======================================================== */}
          {/* 4. THE FIVE HOUSES ("FIVE HOUSES. ONE CROWN.")            */}
          {/* ======================================================== */}
          <section className="w-full py-16 lg:py-20 bg-[#f2f3ff]" id="houses">
            <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">
              {/* Section Header */}
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-12">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-1 bg-[#eb6905] rounded-full" />
                    <span className="text-xs text-[#eb6905] uppercase tracking-widest font-extrabold font-manrope">
                      HOUSE DYNASTIES
                    </span>
                  </div>
                  <h2 className="font-manrope text-3xl sm:text-5xl font-extrabold text-[#000f3f] uppercase tracking-tight leading-none">
                    FIVE HOUSES.
                    <br />
                    <span className="text-[#0051d5]">ONE CROWN.</span>
                  </h2>
                </div>
                <p className="text-sm text-[#45464f] max-w-md">
                  Representing academic departments, residential blocks, and collegiate traditions, each house fields its top athletes in search of total supremacy.
                </p>
              </div>

              {/* 5 House Franchise Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
                {houses.map((h) => (
                  <div
                    key={h.id}
                    className="bg-white rounded-xl overflow-hidden shadow-sm flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group border border-[#e2e7ff] relative"
                  >
                    <div className={`h-2 ${h.accentBorder}`} />
                    <div className="p-5 flex flex-col flex-grow">
                      <div className="flex items-center justify-between mb-4">
                        <span
                          className={`w-10 h-10 rounded-lg ${h.lightBg} ${h.textColor} flex items-center justify-center font-manrope text-xl font-extrabold`}
                        >
                          {h.code[0]}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] uppercase font-extrabold font-manrope ${
                            h.rank === 1
                              ? 'bg-[#ba1a1a] text-white'
                              : 'bg-[#dbe1ff] text-[#000f3f]'
                          }`}
                        >
                          {h.rank === 1 ? 'Leader #1' : `Rank #${h.rank}`}
                        </span>
                      </div>

                      <h3
                        className={`font-manrope text-xl font-extrabold text-[#000f3f] uppercase tracking-tight group-hover:${h.textColor} transition-colors`}
                      >
                        {h.name}
                      </h3>
                      <p className="text-xs text-[#45464f] italic mt-2 mb-4">
                        &ldquo;{h.motto}&rdquo;
                      </p>

                      <div className="mt-auto space-y-1.5 pt-3 bg-[#f2f3ff] p-3 rounded-lg mb-4 text-xs border border-[#e2e7ff]/70">
                        <div className="flex justify-between">
                          <span className="text-[#45464f]">Captain</span>
                          <span className="font-bold text-[#000f3f]">{h.captain}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#45464f]">Athletes</span>
                          <span className="font-bold text-[#000f3f]">{h.activeAthletes} Active</span>
                        </div>
                        <div className="flex justify-between items-center pt-1 border-t border-[#e2e7ff]">
                          <span className="text-[#45464f]">Total Points</span>
                          <span className={`font-manrope text-base font-extrabold ${h.textColor}`}>
                            {h.points} PTS
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => setSelectedHouse(h)}
                        className="w-full py-2.5 rounded-lg bg-[#000f3f] hover:bg-[#0051d5] text-white text-xs font-bold uppercase tracking-wider transition-colors font-manrope cursor-pointer"
                      >
                        Explore House
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ======================================================== */}
          {/* 5. LIVE FIXTURES & SCHEDULE HUB ("THE ROAD TO GLORY")     */}
          {/* ======================================================== */}
          <HomeFixtures onLiveStream={() => setShowLiveStreamModal(true)} />

          {/* ======================================================== */}
          {/* 6. SPORTS GALLERY: 8 DISCIPLINES                          */}
          {/* ======================================================== */}
          <section className="w-full py-16 lg:py-20 bg-[#f2f3ff]" id="sports">
            <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">
              {/* Section Header */}
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-12">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-8 h-1 bg-[#0051d5] rounded-full" />
                    <span className="text-xs text-[#0051d5] uppercase tracking-widest font-extrabold font-manrope">
                      DISCIPLINE SHOWCASE
                    </span>
                  </div>
                  <h2 className="font-manrope text-3xl sm:text-5xl font-extrabold text-[#000f3f] uppercase tracking-tight">
                    EVERY SPORT HAS ITS CHAMPIONS
                  </h2>
                </div>
                <p className="text-sm text-[#45464f] max-w-md">
                  Across physical grounds and virtual arenas, points are calculated meticulously across 6 sanctioned championship disciplines.
                </p>
              </div>

              {/* 6 Sports Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {DISCIPLINES_DATA.map((sport) => (
                  <div
                    key={sport.id}
                    onClick={() => setSelectedSport(sport)}
                    className="bg-white rounded-xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col justify-between border border-[#e2e7ff] cursor-pointer"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="w-12 h-12 rounded-lg bg-[#e2e7ff] text-[#000f3f] flex items-center justify-center group-hover:bg-[#000f3f] group-hover:text-white transition-colors">
                          {sport.icon === 'carrom' ? (
                            <CarromIcon className="w-7 h-7 shrink-0" />
                          ) : (
                            <span className="material-symbols-outlined text-2xl">{sport.icon}</span>
                          )}
                        </span>
                        <span className="text-[10px] text-[#45464f] uppercase font-extrabold font-manrope">
                          {sport.pointsMax}
                        </span>
                      </div>
                      <h3 className="font-manrope text-xl font-bold text-[#000f3f] uppercase mb-1">
                        {sport.name}
                      </h3>
                      <p className="text-xs text-[#45464f] leading-relaxed mb-4">
                        {sport.description}
                      </p>
                    </div>

                    <div className="pt-3 bg-[#f2f3ff] p-3 rounded-lg flex items-center justify-between text-xs border border-[#e2e7ff]/70">
                      <span className="text-[#45464f]">
                        Matches: <strong className="text-[#000f3f]">{sport.fixturesCount}</strong>
                      </span>
                      <span className="text-[11px] text-[#0051d5] uppercase font-extrabold group-hover:translate-x-1 transition-transform inline-flex items-center font-manrope">
                        Explore →
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ======================================================== */}
          {/* 7. CHAMPIONSHIP LEADERBOARD PREVIEW & PODIUM              */}
          {/* ======================================================== */}
          <HomePointsTable />



          {/* ======================================================== */}
          {/* 8. CHAMPIONSHIP FINALE CALLOUT BANNER                     */}
          {/* ======================================================== */}
          <section className="w-full py-16 sm:py-24 bg-[#faf8ff] relative">
            <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">
              <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#000f3f] via-[#071952] to-[#010922] p-8 sm:p-14 lg:p-20 text-white shadow-2xl border border-[#3b82f6]/30 text-center flex flex-col items-center">
                {/* Decorative Ambient Radial Glows */}
                <div className="absolute -top-32 -right-32 w-96 h-96 bg-[#eb6905]/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-[#0051d5]/30 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] opacity-5 pointer-events-none" />

                {/* Top Championship Emblem */}
                <div
                  className="relative mb-6 flex items-center justify-center mx-auto"
                  style={{ width: '80px', height: '80px', minWidth: '80px', minHeight: '80px' }}
                >
                  <div
                    className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400/20 via-amber-500/10 to-transparent border border-amber-400/40 p-2.5 shadow-xl shadow-amber-500/15 flex items-center justify-center hover:scale-105 transition-transform duration-300"
                    style={{ width: '80px', height: '80px' }}
                  >
                    <img
                      src="/logo.png"
                      alt="APL Championship Trophy"
                      className="w-full h-full object-contain filter drop-shadow"
                      style={{ width: '100%', height: '100%', maxWidth: '64px', maxHeight: '64px', objectFit: 'contain' }}
                    />
                  </div>
                </div>

                {/* Subheading Pill Badge */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[11px] font-extrabold uppercase tracking-widest text-amber-300 font-manrope mb-5 shadow-inner">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>APL Season 9 • The Championship Race</span>
                </div>

                {/* Main Headline */}
                <h2 className="font-manrope text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white leading-none max-w-4xl relative">
                  YOUR HOUSE.{' '}
                  <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-300 bg-clip-text text-transparent">
                    YOUR PRIDE.
                  </span>
                  <br />
                  <span className="text-white drop-shadow-sm">YOUR CHAMPIONSHIP.</span>
                </h2>

                <p className="text-sm sm:text-base text-[#dce1ff] max-w-2xl mt-5 mb-8 leading-relaxed font-normal">
                  Every point scored writes a chapter in your house’s history. Track live match results, follow real-time leaderboards, and support your varsity athletes at the NexCore Arena.
                </p>

                {/* Tournament Quick Stats Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl w-full mb-10">
                  <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 backdrop-blur-xs">
                    <span className="text-xl sm:text-2xl font-black font-manrope text-white block">5</span>
                    <span className="text-[10px] sm:text-[11px] text-[#93c5fd] uppercase font-bold tracking-wider font-manrope">Contending Houses</span>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 backdrop-blur-xs">
                    <span className="text-xl sm:text-2xl font-black font-manrope text-white block">6</span>
                    <span className="text-[10px] sm:text-[11px] text-[#93c5fd] uppercase font-bold tracking-wider font-manrope">Sport Disciplines</span>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 backdrop-blur-xs">
                    <span className="text-xl sm:text-2xl font-black font-manrope text-amber-400 block">100+</span>
                    <span className="text-[10px] sm:text-[11px] text-amber-200/80 uppercase font-bold tracking-wider font-manrope">Varsity Athletes</span>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 backdrop-blur-xs">
                    <span className="text-xl sm:text-2xl font-black font-manrope text-emerald-400 block">LIVE</span>
                    <span className="text-[10px] sm:text-[11px] text-emerald-200/80 uppercase font-bold tracking-wider font-manrope">Points Engine</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-center gap-4 relative z-10">
                  <Link
                    href="/schedule"
                    className="inline-flex items-center gap-2.5 px-7 py-3.5 sm:px-9 sm:py-4 rounded-xl bg-gradient-to-r from-[#eb6905] via-[#f97316] to-[#eb6905] hover:brightness-110 text-white text-xs sm:text-sm uppercase tracking-wider font-black transition-all duration-200 shadow-xl shadow-[#eb6905]/30 hover:shadow-[#eb6905]/50 hover:scale-[1.02] active:scale-[0.98] font-manrope cursor-pointer"
                  >
                    <span>Explore Match Schedule</span>
                    <span className="material-symbols-outlined text-[20px]">calendar_month</span>
                  </Link>
                  <Link
                    href="/leaderboard"
                    className="inline-flex items-center gap-2.5 px-7 py-3.5 sm:px-9 sm:py-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 hover:border-white/35 text-white text-xs sm:text-sm uppercase tracking-wider font-black transition-all duration-200 backdrop-blur-md hover:scale-[1.02] active:scale-[0.98] font-manrope cursor-pointer shadow-lg"
                  >
                    <span>Live Championship Standings</span>
                    <span className="material-symbols-outlined text-[20px]">leaderboard</span>
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* ======================================================== */}
      {/* 10. FOOTER                                               */}
      {/* ======================================================== */}
      <footer className="w-full bg-white shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-t border-[#e2e7ff]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 pt-12 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-10">
            {/* Col 1-2: Brand Information */}
            <div className="lg:col-span-2 flex flex-col gap-4 pr-0 lg:pr-8">
              <div className="flex items-center gap-3">
                <span className="font-manrope text-xl font-bold uppercase tracking-tight text-[#000f3f]">
                  APL
                </span>
                <span className="px-2 py-0.5 rounded-lg bg-[#dae2fd] text-[#000f3f] text-[10px] font-bold uppercase font-manrope">
                  Season 9
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#45464f] max-w-md leading-relaxed">
                Official Collegiate Inter-House Athletic &amp; Esports Championship. Hosted annually under the regulatory authority of the Directorate of Physical Education and Sports, NexCore Institute of Technology.
              </p>
              <div className="flex items-center gap-3 text-[#45464f]">
                <a
                  className="p-2 rounded-lg bg-[#f2f3ff] hover:bg-[#e2e7ff] hover:text-[#000f3f] transition-colors"
                  href="#fixtures"
                  title="Broadcast Hub"
                >
                  <span className="material-symbols-outlined text-[20px]">live_tv</span>
                </a>
                <Link
                  className="p-2 rounded-lg bg-[#f2f3ff] hover:bg-[#e2e7ff] hover:text-[#000f3f] transition-colors"
                  href="/schedule"
                  title="Tournament Desk"
                >
                  <span className="material-symbols-outlined text-[20px]">sports_score</span>
                </Link>
                <a
                  className="p-2 rounded-lg bg-[#f2f3ff] hover:bg-[#e2e7ff] hover:text-[#000f3f] transition-colors"
                  href="#championship-overview"
                  title="Press & Media"
                >
                  <span className="material-symbols-outlined text-[20px]">campaign</span>
                </a>
                <a
                  className="p-2 rounded-lg bg-[#f2f3ff] hover:bg-[#e2e7ff] hover:text-[#000f3f] transition-colors"
                  href="mailto:sports@nexcore.edu"
                  title="Official Mail"
                >
                  <span className="material-symbols-outlined text-[20px]">mail</span>
                </a>
              </div>
            </div>

            {/* Col 3: Tournament Links */}
            <div className="flex flex-col gap-3">
              <span className="text-xs uppercase tracking-wider text-[#000f3f] font-bold font-manrope">
                Tournament Links
              </span>
              <div className="flex flex-col gap-2 text-xs text-[#45464f]">
                <a className="hover:text-[#000f3f] transition-colors" href="#">
                  Tournament Central
                </a>
                <Link className="hover:text-[#000f3f] transition-colors" href="/schedule">
                  Fixtures &amp; Timings
                </Link>
                <Link className="hover:text-[#000f3f] transition-colors" href="/leaderboard">
                  Championship Points Table
                </Link>
                <Link className="hover:text-[#000f3f] transition-colors" href="/sports">
                  Medal Tally &amp; Records
                </Link>
                <Link className="hover:text-[#000f3f] transition-colors" href="/schedule">
                  Knockout Brackets
                </Link>
                <button
                  onClick={() => setShowRulebookModal(true)}
                  className="text-left hover:text-[#000f3f] transition-colors cursor-pointer"
                >
                  Code of Conduct &amp; Rules
                </button>
              </div>
            </div>

            {/* Col 4: Houses */}
            <div className="flex flex-col gap-3">
              <span className="text-xs uppercase tracking-wider text-[#000f3f] font-bold font-manrope">
                Houses
              </span>
              <div className="flex flex-col gap-2 text-xs text-[#45464f]">
                {houses.map((h) => (
                  <div
                    key={h.id}
                    onClick={() => setSelectedHouse(h)}
                    className="hover:text-[#000f3f] transition-colors flex items-center justify-between cursor-pointer"
                  >
                    <span>{h.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Col 5: Sports Discipline */}
            <div className="flex flex-col gap-3">
              <span className="text-xs uppercase tracking-wider text-[#000f3f] font-bold font-manrope">
                Sports Discipline
              </span>
              <div className="grid grid-cols-2 gap-x-2 gap-y-2 text-xs text-[#45464f]">
                {DISCIPLINES_DATA.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => setSelectedSport(s)}
                    className="hover:text-[#000f3f] transition-colors cursor-pointer truncate"
                  >
                    {s.name}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Accreditation */}
          <div className="pt-6 border-t border-[#e2e7ff] flex flex-col md:flex-row items-center justify-between gap-4 text-[#45464f] text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#0051d5]" />
              <span>Accredited by Council of Collegiate Athletics &amp; NexCore Institute of Technology.</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-[10px] uppercase tracking-wider font-manrope font-semibold">
                © 2026 APL SEASON 9. ALL RIGHTS RESERVED.
              </span>
              <div className="flex items-center gap-2">
                <a className="hover:text-[#000f3f] transition-colors" href="#">
                  Privacy Policy
                </a>
                <span className="text-[#c6c5d0]">•</span>
                <a className="hover:text-[#000f3f] transition-colors" href="#">
                  Official Regulations
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* ======================================================== */}
      {/* MODAL 1: HOUSE ROSTER & OVERVIEW                         */}
      {/* ======================================================== */}
      {selectedHouse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative border border-[#e2e7ff]">
            <button
              onClick={() => setSelectedHouse(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-[#f2f3ff] hover:bg-[#e2e7ff] text-[#45464f] hover:text-[#000f3f] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4 mb-6">
              <div
                className={`w-14 h-14 rounded-xl ${selectedHouse.lightBg} ${selectedHouse.textColor} flex items-center justify-center font-manrope text-2xl font-black`}
              >
                {selectedHouse.code[0]}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-2xl font-black text-[#000f3f] uppercase font-manrope">
                    {selectedHouse.name}
                  </h3>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] uppercase font-black font-manrope ${
                      selectedHouse.rank === 1
                        ? 'bg-[#ba1a1a] text-white'
                        : 'bg-[#dbe1ff] text-[#000f3f]'
                    }`}
                  >
                    Rank #{selectedHouse.rank}
                  </span>
                </div>
                <span className="text-xs text-[#0051d5] uppercase font-bold font-manrope">
                  &ldquo;{selectedHouse.motto}&rdquo;
                </span>
              </div>
            </div>

            <p className="text-sm text-[#45464f] leading-relaxed mb-6 font-normal">
              {selectedHouse.description}
            </p>

            <div className="grid grid-cols-3 gap-3 p-4 bg-[#f2f3ff] rounded-xl mb-6 text-center border border-[#e2e7ff]">
              <div>
                <span className="text-[10px] uppercase text-[#45464f] font-bold font-manrope">
                  Total Points
                </span>
                <p className={`font-manrope text-2xl font-black ${selectedHouse.textColor}`}>
                  {selectedHouse.points}
                </p>
              </div>
              <div>
                <span className="text-[10px] uppercase text-[#45464f] font-bold font-manrope">
                  House Captain
                </span>
                <p className="text-sm font-bold text-[#000f3f] mt-1">{selectedHouse.captain}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase text-[#45464f] font-bold font-manrope">
                  Varsity Athletes
                </span>
                <p className="font-manrope text-2xl font-black text-[#000f3f]">
                  {selectedHouse.activeAthletes}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-amber-50 rounded-xl mb-6 border border-amber-200">
              <span className="text-xs font-bold text-amber-900 uppercase font-manrope flex items-center gap-1.5">
                <Medal className="w-4 h-4 text-amber-600" />
                Medal Tally
              </span>
              <div className="flex items-center gap-4 text-xs font-bold font-manrope">
                <span className="text-amber-700">🥇 {selectedHouse.gold} Gold</span>
                <span className="text-slate-600">🥈 {selectedHouse.silver} Silver</span>
                <span className="text-amber-800">🥉 {selectedHouse.bronze} Bronze</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/houses"
                onClick={() => setSelectedHouse(null)}
                className="flex-1 py-3 rounded-xl bg-[#000f3f] hover:bg-[#0051d5] text-white text-xs font-bold uppercase tracking-wider text-center transition-colors font-manrope"
              >
                View Full House Roster
              </Link>
              <button
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
      {/* MODAL 2: SPORT DISCIPLINE DETAILS                        */}
      {/* ======================================================== */}
      {selectedSport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative border border-[#e2e7ff]">
            <button
              onClick={() => setSelectedSport(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-[#f2f3ff] hover:bg-[#e2e7ff] text-[#45464f] hover:text-[#000f3f] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4 mb-4">
              <span className="w-14 h-14 rounded-xl bg-[#000f3f] text-white flex items-center justify-center shadow-sm">
                {selectedSport.icon === 'carrom' ? (
                  <CarromIcon className="w-9 h-9 shrink-0" />
                ) : (
                  <span className="material-symbols-outlined text-3xl">{selectedSport.icon}</span>
                )}
              </span>
              <div>
                <h3 className="text-2xl font-black text-[#000f3f] uppercase font-manrope">
                  {selectedSport.name}
                </h3>
                <span className="text-xs text-[#0051d5] font-bold font-manrope uppercase">
                  {selectedSport.pointsMax} • {selectedSport.fixturesCount}
                </span>
              </div>
            </div>

            <p className="text-sm text-[#45464f] mb-4">{selectedSport.description}</p>

            <div className="p-4 bg-[#f2f3ff] rounded-xl mb-6 border border-[#e2e7ff]">
              <span className="text-[10px] uppercase font-bold text-[#0051d5] font-manrope block mb-1">
                Sanctioned Tournament Regulations
              </span>
              <p className="text-xs text-[#131b2e] leading-relaxed">{selectedSport.rules}</p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/schedule"
                onClick={() => setSelectedSport(null)}
                className="flex-1 py-3 rounded-xl bg-[#000f3f] hover:bg-[#0051d5] text-white text-xs font-bold uppercase tracking-wider text-center transition-colors font-manrope"
              >
                View {selectedSport.name} Fixtures
              </Link>
              <button
                onClick={() => setSelectedSport(null)}
                className="px-5 py-3 rounded-xl bg-[#f2f3ff] hover:bg-[#e2e7ff] text-[#000f3f] text-xs font-bold uppercase tracking-wider transition-colors font-manrope cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: LIVE STREAM PLAYER                              */}
      {/* ======================================================== */}
      {showLiveStreamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-[#000f3f] text-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative border border-white/20">
            <button
              onClick={() => setShowLiveStreamModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <span className="w-3 h-3 rounded-full bg-[#ba1a1a] animate-ping" />
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#eb6905] font-manrope">
                APL LIVE BROADCAST • CRICKET T10 QUALIFIER 1
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-extrabold font-manrope uppercase text-white mb-2">
              Mavericks vs Dominators
            </h3>

            {/* Video Canvas Simulation */}
            <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black/90 flex flex-col items-center justify-center my-4 border border-white/15">
              <img
                className="w-full h-full object-cover opacity-60"
                alt="Live match stadium view"
                src="/cricket.jpg"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="material-symbols-outlined text-white text-6xl drop-shadow-lg animate-pulse">
                  play_circle
                </span>
                <span className="text-xs text-white uppercase font-bold tracking-widest font-manrope mt-2">
                  Live Campus Low-Latency Stream (1080p 60fps)
                </span>
              </div>
              <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs text-white bg-black/70 px-3 py-1.5 rounded-lg backdrop-blur-xs font-mono">
                <span>MAV 108/3 (8.4 OV)</span>
                <span>DOM 123/4 (10.0 OV)</span>
                <span className="text-[#eb6905]">NEED 16 RUNS IN 8 BALLS</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-[#808dc2]">
                Audio Commentary: Live English Broadcast Desk (Pitch A)
              </span>
              <button
                onClick={() => setShowLiveStreamModal(false)}
                className="px-4 py-2 rounded-lg bg-[#eb6905] hover:bg-[#783200] text-white text-xs uppercase font-extrabold font-manrope cursor-pointer"
              >
                Close Stream
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 4: TOURNAMENT RULEBOOK & BYE-LAWS                   */}
      {/* ======================================================== */}
      {showRulebookModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative border border-[#e2e7ff] max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowRulebookModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-[#f2f3ff] hover:bg-[#e2e7ff] text-[#45464f] hover:text-[#000f3f] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-[#000f3f] text-white flex items-center justify-center">
                <FileText className="w-6 h-6 text-amber-300" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-[#000f3f] uppercase font-manrope">
                  APL S9 Official Rulebook
                </h3>
                <span className="text-xs text-[#0051d5] font-bold font-manrope uppercase">
                  Council of Collegiate Athletics • Bye-Laws 2026
                </span>
              </div>
            </div>

            <div className="space-y-4 text-xs text-[#45464f] leading-relaxed">
              <div className="p-3 bg-[#f2f3ff] rounded-lg">
                <strong className="text-[#000f3f] uppercase font-manrope block mb-1">
                  1. House Points Distribution Matrix
                </strong>
                Gold Medal = 40 Points | Silver Medal = 25 Points | Bronze Medal = 15 Points. Group stage wins award 10 points per sanctioned victory.
              </div>
              <div className="p-3 bg-[#f2f3ff] rounded-lg">
                <strong className="text-[#000f3f] uppercase font-manrope block mb-1">
                  2. Disciplinary &amp; Foul Protocol
                </strong>
                Direct red cards result in immediate 2-match bans. The Collegiate Referee Tribunal holds full authority over disputed calls.
              </div>
              <div className="p-3 bg-[#f2f3ff] rounded-lg">
                <strong className="text-[#000f3f] uppercase font-manrope block mb-1">
                  3. Athlete Eligibility Criteria
                </strong>
                Only currently enrolled full-time varsity and freshmen students with minimum 75% academic attendance are eligible for competition.
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowRulebookModal(false)}
                className="px-6 py-2.5 rounded-lg bg-[#000f3f] hover:bg-[#0051d5] text-white text-xs uppercase font-extrabold font-manrope cursor-pointer"
              >
                Acknowledge &amp; Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
