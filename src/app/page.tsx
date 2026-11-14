'use client';

import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Medal,
  Calendar,
  MapPin,
  Clock,
  Crown,
  Shield,
  Swords,
  Users,
  Search,
  CheckCircle2,
  RefreshCw,
  Award,
  Zap,
  BarChart3,
  Layers,
  ArrowRight,
  Flame,
  ChevronDown,
  Menu,
  X,
  Target,
  Sparkles,
  Info,
} from 'lucide-react';
import { SportIcon } from '@/components/ui/icons';

// Refined House Metadata with signature identity
const HOUSE_METADATA: Record<
  string,
  {
    code: string;
    name: string;
    accentColor: string;
    darkAccent: string;
    lightBg: string;
    motto: string;
    tagline: string;
  }
> = {
  ALP: {
    code: 'ALP',
    name: 'Alpha',
    accentColor: '#0284C7', // Deep Cyan/Sky
    darkAccent: '#0C4A6E',
    lightBg: '#F0F9FF',
    motto: 'The First & The Fierce',
    tagline: 'Precision and speed across all tournament arenas',
  },
  CRW: {
    code: 'CRW',
    name: 'Crown Crushers',
    accentColor: '#C6A04A', // Championship Gold
    darkAccent: '#785A1D',
    lightBg: '#FEFCE8',
    motto: 'Royalty in Every Arena',
    tagline: 'Reigning power in team tactics and individual showdowns',
  },
  DOM: {
    code: 'DOM',
    name: 'Dominator',
    accentColor: '#DC2626', // Crimson Ruby
    darkAccent: '#7F1D1D',
    lightBg: '#FEF2F2',
    motto: 'Unstoppable Force',
    tagline: 'Relentless drive, unyielding defense, and aggressive grit',
  },
  MAV: {
    code: 'MAV',
    name: 'Mavericks',
    accentColor: '#059669', // Emerald Jade
    darkAccent: '#064E3B',
    lightBg: '#ECFDF5',
    motto: 'Defying Every Limit',
    tagline: 'Tactical agility and strategic depth across every sport',
  },
  RYL: {
    code: 'RYL',
    name: 'Royal Force',
    accentColor: '#7C3AED', // Royal Violet
    darkAccent: '#4C1D95',
    lightBg: '#F5F3FF',
    motto: 'Power, Precision, Pride',
    tagline: 'Regal spirit built on decades of sportsmanship',
  },
};

const INITIAL_HOUSES = [
  { id: 'club-alp', name: 'Alpha', code: 'ALP', captainName: 'Ethan Hunt', rank: 1, totalPoints: 0, cricketTeams: [{ id: 'crick-alp-a', name: 'Alpha A' }, { id: 'crick-alp-b', name: 'Alpha B' }] },
  { id: 'club-crw', name: 'Crown Crushers', code: 'CRW', captainName: 'Zane Malik', rank: 2, totalPoints: 0, cricketTeams: [{ id: 'crick-crw-a', name: 'Crown Crushers A' }, { id: 'crick-crw-b', name: 'Crown Crushers B' }] },
  { id: 'club-dom', name: 'Dominator', code: 'DOM', captainName: 'Leo Vance', rank: 3, totalPoints: 0, cricketTeams: [{ id: 'crick-dom-a', name: 'Dominator A' }, { id: 'crick-dom-b', name: 'Dominator B' }] },
  { id: 'club-mav', name: 'Mavericks', code: 'MAV', captainName: 'Alex Rivera', rank: 4, totalPoints: 0, cricketTeams: [{ id: 'crick-mav-a', name: 'Mavericks A' }, { id: 'crick-mav-b', name: 'Mavericks B' }] },
  { id: 'club-ryl', name: 'Royal Force', code: 'RYL', captainName: 'Carlos Vega', rank: 5, totalPoints: 0, cricketTeams: [{ id: 'crick-ryl-a', name: 'Royal Force A' }, { id: 'crick-ryl-b', name: 'Royal Force B' }] },
];

const INITIAL_SPORTS = [
  { id: 'sport-cricket', name: 'Cricket', category: 'Outdoor Team', sportType: 'TEAM', tournamentFormat: 'T20 Knockout', numRounds: 4, allowsMixedClubs: false, maxPoints: 120, highlight: '10 House Franchises Clashing' },
  { id: 'sport-football', name: 'Football', category: 'Outdoor Team', sportType: 'TEAM', tournamentFormat: 'League + Knockout', numRounds: 4, allowsMixedClubs: false, maxPoints: 100, highlight: 'Full Pitch 11v11 Tournament' },
  { id: 'sport-bgmi', name: 'BGMI', category: 'Esports', sportType: 'SQUAD', tournamentFormat: 'Battle Royale', numRounds: 3, allowsMixedClubs: true, maxPoints: 100, highlight: 'Erangel & Miramar Multi-Squad' },
  { id: 'sport-badminton', name: 'Badminton', category: 'Racquet', sportType: 'SINGLES_DOUBLES', tournamentFormat: 'Best of 3 Sets', numRounds: 5, allowsMixedClubs: false, maxPoints: 80, highlight: 'Indoor Court Singles & Doubles' },
  { id: 'sport-chess', name: 'Chess', category: 'Strategy', sportType: 'INDIVIDUAL', tournamentFormat: 'Rapid Swiss System', numRounds: 5, allowsMixedClubs: false, maxPoints: 70, highlight: 'Grandmaster Time Controls' },
  { id: 'sport-tt', name: 'Table Tennis', category: 'Racquet', sportType: 'SINGLES_DOUBLES', tournamentFormat: 'Single Elimination', numRounds: 5, allowsMixedClubs: false, maxPoints: 60, highlight: 'Rapid Pace Spin & Reflexes' },
  { id: 'sport-carrom', name: 'Carrom', category: 'Indoor Precision', sportType: 'SINGLES_DOUBLES', tournamentFormat: 'Point Board Format', numRounds: 4, allowsMixedClubs: false, maxPoints: 50, highlight: 'Precision Striker Showdowns' },
];

export default function PublicViewerPortal() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [standingsView, setStandingsView] = useState<'podium' | 'table' | 'matrix'>('podium');
  const [sportFilter, setSportFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<string>('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetchPublicOverview();
    setLastRefreshed(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  }, []);

  const fetchPublicOverview = async () => {
    try {
      const res = await fetch('/api/public/overview');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error('Failed to load public championship data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPublicOverview();
    setLastRefreshed(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  };

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  const championship = data?.championship;
  const rawStandings = data?.standings && data.standings.length > 0 ? data.standings : INITIAL_HOUSES;
  const sports = data?.sports && data.sports.length > 0 ? data.sports : INITIAL_SPORTS;
  const approvedMatches = data?.approvedMatches || [];
  const upcomingMatches = data?.upcomingMatches || [];
  const isClosed = championship?.status === 'CLOSED';
  const championClub = championship?.championClub;

  const filteredStandings = rawStandings.filter((club: any) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      club.name.toLowerCase().includes(q) ||
      club.code.toLowerCase().includes(q) ||
      (club.captainName && club.captainName.toLowerCase().includes(q))
    );
  });

  const leadingHouse = rawStandings[0] || null;

  const filteredApprovedMatches = sportFilter
    ? approvedMatches.filter((m: any) => m.sportId === sportFilter || m.sport?.name === sportFilter)
    : approvedMatches;

  const filteredUpcomingMatches = sportFilter
    ? upcomingMatches.filter((m: any) => m.sportId === sportFilter || m.sport?.name === sportFilter)
    : upcomingMatches;

  return (
    <div className="min-h-screen bg-[#080A0E] text-[#F4F1E9] flex flex-col selection:bg-[#C6A04A] selection:text-[#080A0E] antialiased">
      {/* ========================================================= */}
      {/* TOP NAVIGATION BAR                                        */}
      {/* ========================================================= */}
      <header className="sticky top-0 z-50 bg-[#080A0E]/95 backdrop-blur-md border-b border-[#252B34] px-4 sm:px-8 py-3.5 flex items-center justify-between transition-colors">
        {/* Brand Identity */}
        <div className="flex items-center gap-3.5 cursor-pointer" onClick={() => scrollToSection('hero')}>
          <div className="w-11 h-11 rounded-xl bg-[#141820] border border-[#C6A04A]/40 p-1 flex items-center justify-center shrink-0 shadow-sm">
            <img
              src="/logo.png"
              alt="APL Season 9 Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif text-lg sm:text-xl font-bold tracking-tight text-white">
                APL <span className="text-[#C6A04A]">Season 9</span>
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#141820] text-[#C6A04A] border border-[#C6A04A]/30">
                Championship
              </span>
            </div>
            <p className="text-[11px] text-[#A4A8B0] hidden sm:block">
              Official Inter-Club Public Portal • 5 Houses • 10 Cricket Teams • 7 Sports
            </p>
          </div>
        </div>

        {/* Section Quick Jump Navigation (Desktop) */}
        <nav className="hidden lg:flex items-center gap-1.5 bg-[#141820] p-1.5 rounded-xl border border-[#252B34]">
          <button
            onClick={() => scrollToSection('overview')}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-[#A4A8B0] hover:text-white hover:bg-white/[0.04] transition"
          >
            Overview
          </button>
          <button
            onClick={() => scrollToSection('leaderboard')}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-[#C6A04A] bg-[#080A0E] border border-[#C6A04A]/30 transition shadow-xs"
          >
            Leaderboard
          </button>
          <button
            onClick={() => scrollToSection('houses')}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-[#A4A8B0] hover:text-white hover:bg-white/[0.04] transition"
          >
            The 5 Houses
          </button>
          <button
            onClick={() => scrollToSection('sports')}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-[#A4A8B0] hover:text-white hover:bg-white/[0.04] transition"
          >
            7 Sports Arena
          </button>
          <button
            onClick={() => scrollToSection('matches')}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-[#A4A8B0] hover:text-white hover:bg-white/[0.04] transition"
          >
            Match Radar
          </button>
          <button
            onClick={() => scrollToSection('results')}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-[#A4A8B0] hover:text-white hover:bg-white/[0.04] transition"
          >
            Results
          </button>
          <button
            onClick={() => scrollToSection('points-system')}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-[#A4A8B0] hover:text-white hover:bg-white/[0.04] transition"
          >
            Points Engine
          </button>
        </nav>

        {/* Live Refresh & Mobile Menu Toggle */}
        <div className="flex items-center gap-2.5">
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#141820] border border-[#252B34] text-[#A4A8B0] text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Live Standings</span>
          </div>

          <button
            onClick={handleRefresh}
            className="p-2 text-[#A4A8B0] hover:text-white hover:bg-[#141820] rounded-lg transition border border-[#252B34] active:scale-95"
            title={`Last refreshed at ${lastRefreshed}`}
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-[#C6A04A]' : ''}`} />
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-[#A4A8B0] hover:text-white bg-[#141820] border border-[#252B34] rounded-lg transition"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden sticky top-[69px] z-40 bg-[#080A0E] border-b border-[#252B34] p-4 space-y-2">
          <button
            onClick={() => scrollToSection('overview')}
            className="w-full text-left px-4 py-2.5 rounded-lg text-xs font-semibold text-[#A4A8B0] hover:text-white hover:bg-[#141820]"
          >
            Overview
          </button>
          <button
            onClick={() => scrollToSection('leaderboard')}
            className="w-full text-left px-4 py-2.5 rounded-lg text-xs font-semibold text-[#C6A04A] bg-[#141820]"
          >
            Leaderboard
          </button>
          <button
            onClick={() => scrollToSection('houses')}
            className="w-full text-left px-4 py-2.5 rounded-lg text-xs font-semibold text-[#A4A8B0] hover:text-white hover:bg-[#141820]"
          >
            The 5 Houses
          </button>
          <button
            onClick={() => scrollToSection('sports')}
            className="w-full text-left px-4 py-2.5 rounded-lg text-xs font-semibold text-[#A4A8B0] hover:text-white hover:bg-[#141820]"
          >
            7 Sports Arena
          </button>
          <button
            onClick={() => scrollToSection('matches')}
            className="w-full text-left px-4 py-2.5 rounded-lg text-xs font-semibold text-[#A4A8B0] hover:text-white hover:bg-[#141820]"
          >
            Match Radar
          </button>
          <button
            onClick={() => scrollToSection('results')}
            className="w-full text-left px-4 py-2.5 rounded-lg text-xs font-semibold text-[#A4A8B0] hover:text-white hover:bg-[#141820]"
          >
            Approved Scores
          </button>
          <button
            onClick={() => scrollToSection('points-system')}
            className="w-full text-left px-4 py-2.5 rounded-lg text-xs font-semibold text-[#A4A8B0] hover:text-white hover:bg-[#141820]"
          >
            Points Division Engine
          </button>
        </div>
      )}

      {/* ========================================================= */}
      {/* SECTION A: CHAMPIONSHIP HERO (DARK & BOLD)                */}
      {/* ========================================================= */}
      <section id="hero" className="relative pt-12 pb-20 px-4 sm:px-8 border-b border-[#252B34] bg-gradient-to-b from-[#080A0E] via-[#0E121A] to-[#080A0E] overflow-hidden">
        {/* Subtle Geometric Graphic Accent */}
        <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-[#C6A04A]/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          {isClosed && championClub ? (
            /* OFFICIAL CONCLUDED CHAMPION BANNER */
            <div className="rounded-3xl bg-[#141820] border-2 border-[#C6A04A] p-8 sm:p-14 text-white relative overflow-hidden shadow-2xl">
              <div className="max-w-2xl space-y-4">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#080A0E] border border-[#C6A04A]/40 text-[#C6A04A] text-xs font-bold uppercase tracking-wider">
                  <Crown className="w-4 h-4 text-[#C6A04A]" />
                  Tournament Champions Declared
                </span>
                <h1 className="font-serif text-4xl sm:text-6xl font-bold tracking-tight text-white">
                  {championClub.name} <span className="text-[#C6A04A]">Victorious</span>
                </h1>
                <p className="text-sm sm:text-base text-[#A4A8B0] leading-relaxed">
                  The APL Season 9 Inter-Club House Championship has officially completed. Through exceptional teamwork across all 7 sports, {championClub.name} claims the championship trophy with a total of {Number(championClub.totalPoints).toFixed(2)} points!
                </p>
                <button
                  onClick={() => scrollToSection('leaderboard')}
                  className="mt-2 px-6 py-3 rounded-xl bg-[#C6A04A] hover:bg-[#94712B] text-[#080A0E] font-bold text-xs uppercase tracking-wider transition flex items-center gap-2"
                >
                  <Trophy className="w-4 h-4" />
                  <span>View Full Standings</span>
                </button>
              </div>
            </div>
          ) : (
            /* ACTIVE TOURNAMENT HERO COMPOSITION */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left Column: Expressive Headline & Details */}
              <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                {/* Official Tagline Badge */}
                <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#141820] border border-[#C6A04A]/30 text-xs text-[#C6A04A] font-semibold tracking-wider uppercase">
                  <span className="w-2 h-2 rounded-full bg-[#C6A04A]" />
                  <span>OFFICIAL INTER-CLUB TOURNAMENT • NOV 25 – 28, 2026</span>
                </div>

                {/* Main Headline */}
                <div className="space-y-3">
                  <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.08] text-white">
                    Inter-Club <br />
                    <span className="text-[#C6A04A]">House Championship</span>
                  </h1>
                  <div className="w-24 h-1 bg-[#C6A04A] mx-auto lg:mx-0 my-3" />
                  <p className="text-base sm:text-lg text-[#A4A8B0] max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                    Follow real-time house standings across 7 sports and 10 cricket teams. Built on certified unique-club equal division scoring.
                  </p>
                </div>

                {/* Key Venue & Date Line */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-5 text-xs text-[#A4A8B0] pt-1">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Calendar className="w-4 h-4 text-[#C6A04A]" />
                    November 25 – 28, 2026
                  </span>
                  <span className="hidden sm:inline text-[#252B34]">•</span>
                  <span className="flex items-center gap-1.5 font-medium">
                    <MapPin className="w-4 h-4 text-[#C6A04A]" />
                    Main Sports Complex Arena
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-3">
                  <button
                    onClick={() => scrollToSection('leaderboard')}
                    className="px-6 py-3.5 rounded-xl bg-[#C6A04A] hover:bg-[#94712B] text-[#080A0E] font-bold text-xs uppercase tracking-wider transition flex items-center gap-2 shadow-sm active:scale-95"
                  >
                    <Trophy className="w-4 h-4 text-[#080A0E]" />
                    <span>View Live Leaderboard</span>
                    <ArrowRight className="w-4 h-4 text-[#080A0E]" />
                  </button>
                  <button
                    onClick={() => scrollToSection('houses')}
                    className="px-5 py-3.5 rounded-xl bg-[#141820] hover:bg-[#1C222E] border border-[#C6A04A]/40 text-[#F4F1E9] font-bold text-xs uppercase tracking-wider transition active:scale-95"
                  >
                    Explore The 5 Houses
                  </button>
                </div>
              </div>

              {/* Right Column: Layered Trophy Card & Tournament Leader */}
              <div className="lg:col-span-5 flex flex-col items-center justify-center">
                <div className="w-full max-w-md rounded-3xl bg-[#141820] border border-[#252B34] p-7 text-center space-y-6 shadow-2xl relative">
                  {/* Subtle Corner Accent */}
                  <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-[#080A0E] border border-[#C6A04A]/30 text-[10px] font-bold text-[#C6A04A] uppercase tracking-wider">
                    APL Season 9
                  </div>

                  {/* Trophy Visual */}
                  <div className="relative py-4 flex items-center justify-center">
                    <img
                      src="/logo.png"
                      alt="APL Championship Trophy"
                      className="w-48 h-48 sm:w-56 sm:h-56 object-contain select-none"
                    />
                  </div>

                  {/* Leading Club Highlight Card */}
                  <div className="p-4 rounded-2xl bg-[#080A0E] border border-[#C6A04A]/30 text-left">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#C6A04A] flex items-center gap-1.5">
                        <Flame className="w-3.5 h-3.5 text-[#C6A04A]" />
                        Current Tournament Leader
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-black bg-[#C6A04A] text-[#080A0E]">
                        RANK #1
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#141820] border border-[#C6A04A]/40 flex items-center justify-center font-serif font-black text-[#C6A04A] text-sm">
                          {leadingHouse?.code || 'ALP'}
                        </div>
                        <div>
                          <h4 className="font-serif font-bold text-white text-lg">
                            {leadingHouse?.name || 'Alpha'}
                          </h4>
                          <span className="text-xs text-[#A4A8B0]">
                            Captain: {leadingHouse?.captainName || 'Ethan Hunt'}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-[#A4A8B0] block uppercase font-medium">Points</span>
                        <span className="font-mono font-black text-xl text-[#C6A04A]">
                          {leadingHouse ? `${Number(leadingHouse.totalPoints).toFixed(2)}` : '0.00'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION B: CHAMPIONSHIP OVERVIEW (IVORY / LIGHT CONTRAST) */}
      {/* ========================================================= */}
      <section id="overview" className="py-16 px-4 sm:px-8 bg-[#F4F1E9] text-[#080A0E] border-b border-[#E2DEC9]">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E2DEC9] pb-6">
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-[#94712B] block">
                Tournament Structure
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#080A0E] mt-1">
                Championship Architecture
              </h2>
            </div>
            <p className="text-sm text-[#4A4E57] max-w-lg leading-relaxed">
              Designed to test all-around athletics and sportsmanship through house point accumulation and certified equal division.
            </p>
          </div>

          {/* 4 Feature Stat Tiles in Light High-Contrast Style */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-white border border-[#E2DEC9] shadow-sm hover:border-[#C6A04A] transition">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-[#94712B]">01 • Houses</span>
                <Shield className="w-5 h-5 text-[#94712B]" />
              </div>
              <div className="font-serif text-4xl font-bold text-[#080A0E]">5 Houses</div>
              <p className="text-xs text-[#5E636E] mt-2 leading-relaxed">
                Alpha, Crown Crushers, Dominator, Mavericks, and Royal Force battling for the cup.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-[#E2DEC9] shadow-sm hover:border-[#C6A04A] transition">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-[#94712B]">02 • Cricket</span>
                <Trophy className="w-5 h-5 text-[#94712B]" />
              </div>
              <div className="font-serif text-4xl font-bold text-[#080A0E]">10 Teams</div>
              <p className="text-xs text-[#5E636E] mt-2 leading-relaxed">
                Each house fields 2 independent cricket franchises (Team A and Team B squads).
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-[#E2DEC9] shadow-sm hover:border-[#C6A04A] transition">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-[#94712B]">03 • Disciplines</span>
                <Zap className="w-5 h-5 text-[#94712B]" />
              </div>
              <div className="font-serif text-4xl font-bold text-[#080A0E]">7 Sports</div>
              <p className="text-xs text-[#5E636E] mt-2 leading-relaxed">
                Competitions across BGMI, Carrom, Badminton, Chess, Table Tennis, Cricket, and Football.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-[#E2DEC9] shadow-sm hover:border-[#C6A04A] transition">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-[#94712B]">04 • System</span>
                <Target className="w-5 h-5 text-[#94712B]" />
              </div>
              <div className="font-serif text-4xl font-bold text-[#080A0E]">Equal Split</div>
              <p className="text-xs text-[#5E636E] mt-2 leading-relaxed">
                Mixed-house squads receive exactly equal division among unique houses represented.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION C: THE FIVE HOUSES ("WAR ROOM" - DARK SECTION)    */}
      {/* ========================================================= */}
      <section id="houses" className="py-20 px-4 sm:px-8 bg-[#080A0E] text-white border-b border-[#252B34]">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#252B34] pb-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#C6A04A] block">
                Participating Franchises
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-white mt-1">
                The 5 Competing Houses
              </h2>
            </div>
            <p className="text-sm text-[#A4A8B0] max-w-md leading-relaxed">
              Every house fields athletes across all 7 sports, and sponsors 2 distinct cricket teams whose points roll up to the parent house.
            </p>
          </div>

          {/* 5 Distinct House Cards with Creative Architectural Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rawStandings.map((club: any) => {
              const meta = HOUSE_METADATA[club.code] || HOUSE_METADATA.ALP;
              return (
                <article
                  key={club.id}
                  className="rounded-3xl bg-[#141820] border border-[#252B34] p-6 space-y-5 hover:border-[#C6A04A]/60 transition duration-300 relative group flex flex-col justify-between shadow-lg"
                >
                  <div className="space-y-4">
                    {/* Header with Crest and Rank */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3.5">
                        <div
                          className="w-12 h-12 rounded-2xl flex items-center justify-center font-serif font-black text-xl text-white shadow-md"
                          style={{ backgroundColor: meta.accentColor }}
                        >
                          {club.code}
                        </div>
                        <div>
                          <h3 className="font-serif text-2xl font-bold text-white leading-tight">
                            {club.name}
                          </h3>
                          <span className="text-[11px] font-semibold text-[#C6A04A]">
                            {meta.motto}
                          </span>
                        </div>
                      </div>
                      <span className="font-mono text-xs font-black px-2.5 py-1 rounded-full bg-[#080A0E] border border-[#252B34] text-[#C6A04A]">
                        Rank #{club.rank}
                      </span>
                    </div>

                    <p className="text-xs text-[#A4A8B0] italic leading-relaxed border-l-2 pl-3" style={{ borderColor: meta.accentColor }}>
                      "{meta.tagline}"
                    </p>

                    {/* House Details Panel */}
                    <div className="p-3.5 rounded-xl bg-[#080A0E] border border-[#252B34] text-xs space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-[#A4A8B0]">Senior House Captain:</span>
                        <span className="font-medium text-white">{club.captainName || 'Senior Captain'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#A4A8B0]">Cumulative Points:</span>
                        <span className="font-mono font-bold text-[#C6A04A]">{Number(club.totalPoints).toFixed(2)} pts</span>
                      </div>
                    </div>

                    {/* 2 Cricket Teams */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#A4A8B0] block">
                        Sponsored Cricket Franchises (2):
                      </span>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {club.cricketTeams?.map((ct: any) => (
                          <div
                            key={ct.id}
                            className="p-2.5 rounded-xl bg-[#080A0E] border border-[#252B34] text-center font-semibold text-white"
                          >
                            <span>🏏 {ct.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] text-[#A4A8B0] italic block text-center pt-3 border-t border-[#252B34]">
                    Points from Team A and B roll up directly into {club.name}.
                  </span>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION D: 7 SPORTS ARENA (IVORY / LIGHT CONTRAST)        */}
      {/* ========================================================= */}
      <section id="sports" className="py-20 px-4 sm:px-8 bg-[#F4F1E9] text-[#080A0E] border-b border-[#E2DEC9]">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E2DEC9] pb-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#94712B] block">
                Multi-Sport Disciplines
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-[#080A0E] mt-1">
                Seven Sports Arena
              </h2>
            </div>
            <p className="text-sm text-[#4A4E57] max-w-md leading-relaxed">
              Points are competed for across outdoor stadiums, racquet courts, esports arenas, and indoor board disciplines.
            </p>
          </div>

          {/* Creative Asymmetric Sports Grid (Featured Top 2 + 5 Sub Disciplines) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sports.map((sp: any, idx: number) => {
              const isLarge = idx === 0 || idx === 1;
              return (
                <article
                  key={sp.id}
                  className={`rounded-3xl bg-white border border-[#E2DEC9] p-6 space-y-4 shadow-sm hover:border-[#C6A04A] transition duration-200 ${
                    isLarge ? 'md:col-span-1 lg:col-span-1 ring-1 ring-[#C6A04A]/20' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-[#F4F1E9] border border-[#E2DEC9] flex items-center justify-center text-[#94712B]">
                      <SportIcon name={sp.name} className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#F4F1E9] text-[#94712B] border border-[#E2DEC9]">
                      {sp.category}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-serif text-2xl font-bold text-[#080A0E]">{sp.name}</h3>
                    <p className="text-xs text-[#6B7280] font-medium mt-0.5">{sp.highlight || `${sp.numRounds} rounds of competitive tournament`}</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#F9F8F5] border border-[#E2DEC9] text-xs space-y-1.5 text-[#4B5563]">
                    <div className="flex justify-between">
                      <span className="font-medium text-[#6B7280]">Tournament Format:</span>
                      <span className="font-semibold text-[#080A0E]">{sp.tournamentFormat}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-[#6B7280]">Structure:</span>
                      <span className="font-semibold text-[#080A0E]">{sp.sportType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-[#6B7280]">Points Division:</span>
                      <span className="font-semibold text-[#94712B]">Equal Unique-Club</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-[#6B7280]">Mixed Clubs:</span>
                      <span className={`font-semibold ${sp.allowsMixedClubs ? 'text-emerald-700' : 'text-[#6B7280]'}`}>
                        {sp.allowsMixedClubs ? 'Allowed (Divided Evenly)' : 'Single Club Only'}
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION E: CHAMPIONSHIP LEADERBOARD (DARK SECTION)        */}
      {/* ========================================================= */}
      <section id="leaderboard" className="py-20 px-4 sm:px-8 bg-[#080A0E] text-white border-b border-[#252B34]">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#252B34] pb-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#C6A04A] block">
                Official Points Table
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-white mt-1">
                Championship Leaderboard
              </h2>
            </div>
            <p className="text-sm text-[#A4A8B0] max-w-md leading-relaxed">
              Updated live as referees submit official match scores and results are certified by the tournament director.
            </p>
          </div>

          {/* View Modes Switcher & Filter Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-[#141820] border border-[#252B34]">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-[#A4A8B0] ml-1">Display Format:</span>
              <div className="flex items-center bg-[#080A0E] p-1 rounded-xl border border-[#252B34]">
                <button
                  onClick={() => setStandingsView('podium')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                    standingsView === 'podium'
                      ? 'bg-[#C6A04A] text-[#080A0E] shadow-sm'
                      : 'text-[#A4A8B0] hover:text-white'
                  }`}
                >
                  <Trophy className="w-3.5 h-3.5" />
                  <span>Podium & Cards</span>
                </button>
                <button
                  onClick={() => setStandingsView('table')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                    standingsView === 'table'
                      ? 'bg-[#C6A04A] text-[#080A0E] shadow-sm'
                      : 'text-[#A4A8B0] hover:text-white'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>Full Table</span>
                </button>
                <button
                  onClick={() => setStandingsView('matrix')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                    standingsView === 'matrix'
                      ? 'bg-[#C6A04A] text-[#080A0E] shadow-sm'
                      : 'text-[#A4A8B0] hover:text-white'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>7-Sport Matrix</span>
                </button>
              </div>
            </div>

            {/* Live Filter Input */}
            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 text-[#A4A8B0] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search house or captain..."
                className="w-full pl-9 pr-3 py-2 bg-[#080A0E] border border-[#252B34] rounded-xl text-xs text-white placeholder-[#A4A8B0] focus:outline-none focus:border-[#C6A04A] transition"
              />
            </div>
          </div>

          {/* VIEW MODE 1: 3D PODIUM & CARDS */}
          {standingsView === 'podium' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pt-4">
                {/* 2nd Place: Silver Runner-Up */}
                {rawStandings[1] && (
                  <article className="order-2 md:order-1 rounded-3xl bg-[#141820] border border-[#252B34] p-6 text-center space-y-4 hover:border-slate-400 transition">
                    <div className="w-10 h-10 rounded-xl bg-[#080A0E] border border-slate-400/50 text-slate-200 font-serif font-black text-sm flex items-center justify-center mx-auto">
                      🥈 2
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Second Place
                      </span>
                      <h3 className="font-serif text-2xl font-bold text-white mt-0.5">{rawStandings[1].name}</h3>
                      <p className="text-xs text-[#A4A8B0]">Senior Captain: {rawStandings[1].captainName || 'Senior Captain'}</p>
                    </div>

                    <div className="flex items-center justify-center gap-1.5 my-3 flex-wrap">
                      {rawStandings[1].cricketTeams?.map((ct: any) => (
                        <span key={ct.id} className="px-2.5 py-1 rounded-lg bg-[#080A0E] border border-[#252B34] text-[10px] text-slate-300 font-medium">
                          🏏 {ct.name}
                        </span>
                      ))}
                    </div>

                    <div className="pt-4 border-t border-[#252B34] flex items-center justify-between text-xs">
                      <span className="text-[#A4A8B0] uppercase font-semibold">Total Points</span>
                      <span className="font-mono font-black text-xl text-white">
                        {Number(rawStandings[1].totalPoints).toFixed(2)} pts
                      </span>
                    </div>
                  </article>
                )}

                {/* 1st Place: Gold Leader (Elevated Podium Center) */}
                {rawStandings[0] && (
                  <article className="order-1 md:order-2 rounded-3xl bg-[#141820] border-2 border-[#C6A04A] p-8 text-center space-y-4 md:-translate-y-4 shadow-2xl relative">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#080A0E] border border-[#C6A04A]/60 text-[#C6A04A] text-xs font-black uppercase tracking-wider">
                      <Crown className="w-3.5 h-3.5 text-[#C6A04A]" />
                      <span>Tournament Leader #1</span>
                    </div>

                    <div className="w-14 h-14 rounded-2xl bg-[#080A0E] border-2 border-[#C6A04A] text-[#C6A04A] font-serif font-black text-2xl flex items-center justify-center mx-auto shadow-md">
                      🥇 1
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#C6A04A]">
                        Current Champion Seed
                      </span>
                      <h3 className="font-serif text-3xl font-black text-white mt-0.5">{rawStandings[0].name}</h3>
                      <p className="text-xs text-[#A4A8B0]">Senior Captain: {rawStandings[0].captainName || 'Ethan Hunt'}</p>
                    </div>

                    <div className="flex items-center justify-center gap-2 my-4 flex-wrap">
                      {rawStandings[0].cricketTeams?.map((ct: any) => (
                        <span key={ct.id} className="px-3 py-1 rounded-xl bg-[#080A0E] border border-[#C6A04A]/40 text-[11px] text-[#C6A04A] font-bold">
                          🏏 {ct.name}
                        </span>
                      ))}
                    </div>

                    <div className="pt-4 border-t border-[#C6A04A]/40 flex items-center justify-between text-xs">
                      <span className="text-[#C6A04A] uppercase font-bold">Championship Points</span>
                      <span className="font-mono font-black text-2xl text-[#C6A04A]">
                        {Number(rawStandings[0].totalPoints).toFixed(2)} pts
                      </span>
                    </div>
                  </article>
                )}

                {/* 3rd Place: Bronze Contender */}
                {rawStandings[2] && (
                  <article className="order-3 rounded-3xl bg-[#141820] border border-[#252B34] p-6 text-center space-y-4 hover:border-amber-700 transition">
                    <div className="w-10 h-10 rounded-xl bg-[#080A0E] border border-amber-700/50 text-amber-500 font-serif font-black text-sm flex items-center justify-center mx-auto">
                      🥉 3
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500">
                        Third Place
                      </span>
                      <h3 className="font-serif text-2xl font-bold text-white mt-0.5">{rawStandings[2].name}</h3>
                      <p className="text-xs text-[#A4A8B0]">Senior Captain: {rawStandings[2].captainName || 'Senior Captain'}</p>
                    </div>

                    <div className="flex items-center justify-center gap-1.5 my-3 flex-wrap">
                      {rawStandings[2].cricketTeams?.map((ct: any) => (
                        <span key={ct.id} className="px-2.5 py-1 rounded-lg bg-[#080A0E] border border-[#252B34] text-[10px] text-slate-300 font-medium">
                          🏏 {ct.name}
                        </span>
                      ))}
                    </div>

                    <div className="pt-4 border-t border-[#252B34] flex items-center justify-between text-xs">
                      <span className="text-[#A4A8B0] uppercase font-semibold">Total Points</span>
                      <span className="font-mono font-black text-xl text-amber-500">
                        {Number(rawStandings[2].totalPoints).toFixed(2)} pts
                      </span>
                    </div>
                  </article>
                )}
              </div>

              {/* Remaining Houses (4th & 5th) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {rawStandings.slice(3).map((club: any) => (
                  <div
                    key={club.id}
                    className="p-5 rounded-2xl bg-[#141820] border border-[#252B34] flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-[#080A0E] border border-[#252B34] flex items-center justify-center font-serif font-black text-sm text-[#A4A8B0]">
                        #{club.rank}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-serif font-bold text-white text-base">{club.name}</h4>
                          <span className="text-xs font-mono text-[#A4A8B0]">({club.code})</span>
                        </div>
                        <p className="text-xs text-[#A4A8B0]">Captain: {club.captainName || 'Senior Captain'}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-semibold text-[#A4A8B0] block uppercase">Points</span>
                      <span className="font-mono font-black text-lg text-white">
                        {Number(club.totalPoints).toFixed(2)} pts
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VIEW MODE 2: FULL STANDINGS TABLE */}
          {standingsView === 'table' && (
            <div className="rounded-3xl bg-[#141820] border border-[#252B34] overflow-hidden">
              <div className="p-6 border-b border-[#252B34] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-serif text-2xl font-bold text-white">Championship Standings Table</h3>
                  <p className="text-xs text-[#A4A8B0] mt-0.5">Cumulative points across all approved tournament results</p>
                </div>
                <span className="text-xs text-[#C6A04A] font-semibold">5 Houses Participating</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#080A0E] text-[11px] font-bold uppercase tracking-wider text-[#A4A8B0] border-b border-[#252B34]">
                    <tr>
                      <th className="py-4 px-6 text-center">Rank</th>
                      <th className="py-4 px-6">House</th>
                      <th className="py-4 px-6">Senior Captain</th>
                      <th className="py-4 px-6">Sponsored Cricket Teams</th>
                      <th className="py-4 px-6 text-right">Total Points</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#252B34]">
                    {filteredStandings.map((club: any) => {
                      const meta = HOUSE_METADATA[club.code] || HOUSE_METADATA.ALP;
                      return (
                        <tr key={club.id} className="hover:bg-[#080A0E]/50 transition">
                          <td className="py-4 px-6 text-center font-mono font-black text-base text-white">
                            {club.rank === 1 ? (
                              <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg bg-[#C6A04A] text-[#080A0E] font-black text-xs shadow-sm">
                                🥇 #1
                              </span>
                            ) : (
                              `#${club.rank}`
                            )}
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: meta.accentColor }} />
                              <div>
                                <span className="font-serif font-bold text-base text-white block">{club.name}</span>
                                <span className="text-[10px] text-[#A4A8B0]">{meta.motto}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-[#A4A8B0] font-medium">
                            {club.captainName || 'Senior Captain'}
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {club.cricketTeams?.map((ct: any) => (
                                <span
                                  key={ct.id}
                                  className="px-2.5 py-1 rounded-lg bg-[#080A0E] border border-[#252B34] text-[10px] text-slate-300 font-semibold"
                                >
                                  🏏 {ct.name}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="py-4 px-6 text-right font-mono font-black text-lg text-[#C6A04A]">
                            {Number(club.totalPoints).toFixed(2)} pts
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VIEW MODE 3: 7-SPORT MATRIX VIEW */}
          {standingsView === 'matrix' && (
            <div className="rounded-3xl bg-[#141820] border border-[#252B34] overflow-hidden">
              <div className="p-6 border-b border-[#252B34]">
                <h3 className="font-serif text-2xl font-bold text-white">7-Sport Points Matrix Breakdown</h3>
                <p className="text-xs text-[#A4A8B0] mt-0.5">Points earned by each house across the 7 sports</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#080A0E] text-[10px] font-bold uppercase tracking-wider text-[#A4A8B0] border-b border-[#252B34]">
                    <tr>
                      <th className="py-4 px-6">House</th>
                      {sports.map((sp: any) => (
                        <th key={sp.id} className="py-4 px-3 text-center">
                          <span className="block font-bold">{sp.name}</span>
                        </th>
                      ))}
                      <th className="py-4 px-6 text-right">Cumulative Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#252B34] font-mono">
                    {filteredStandings.map((club: any) => {
                      const meta = HOUSE_METADATA[club.code] || HOUSE_METADATA.ALP;
                      return (
                        <tr key={club.id} className="hover:bg-[#080A0E]/50 transition">
                          <td className="py-4 px-6 font-sans font-bold text-white flex items-center gap-2.5">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: meta.accentColor }} />
                            {club.name}
                          </td>
                          {sports.map((sp: any) => {
                            const score = club.sportBreakdown?.[sp.id] ?? club.sportBreakdown?.[sp.name] ?? 0;
                            return (
                              <td key={sp.id} className="py-4 px-3 text-center">
                                {score > 0 ? (
                                  <span className="px-2 py-0.5 rounded bg-[#080A0E] text-[#C6A04A] font-bold border border-[#C6A04A]/30">
                                    {score.toFixed(2)}
                                  </span>
                                ) : (
                                  <span className="text-[#252B34]">—</span>
                                )}
                              </td>
                            );
                          })}
                          <td className="py-4 px-6 text-right font-black text-base text-[#C6A04A]">
                            {Number(club.totalPoints).toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION F: MATCH RADAR (IVORY / LIGHT CONTRAST)           */}
      {/* ========================================================= */}
      <section id="matches" className="py-20 px-4 sm:px-8 bg-[#F4F1E9] text-[#080A0E] border-b border-[#E2DEC9]">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E2DEC9] pb-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#94712B] block">
                Competition Schedule
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-[#080A0E] mt-1">
                Match Radar & Fixtures
              </h2>
            </div>

            {/* Sport Filter Dropdown */}
            <select
              value={sportFilter}
              onChange={(e) => setSportFilter(e.target.value)}
              className="px-4 py-2 bg-white border border-[#E2DEC9] rounded-xl text-xs font-bold text-[#080A0E] outline-none focus:border-[#C6A04A]"
            >
              <option value="">All 7 Disciplines</option>
              {sports.map((sp: any) => (
                <option key={sp.id} value={sp.id}>{sp.name}</option>
              ))}
            </select>
          </div>

          {filteredUpcomingMatches.length === 0 ? (
            <div className="p-14 rounded-3xl bg-white border border-[#E2DEC9] text-center text-[#5E636E]">
              <Calendar className="w-12 h-12 text-[#94712B]/40 mx-auto mb-3" />
              <h4 className="text-base font-bold text-[#080A0E]">No scheduled fixtures match your current filter.</h4>
              <p className="text-xs text-[#5E636E] mt-1">Official fixtures will appear as tournament directors release the daily rosters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredUpcomingMatches.map((m: any) => (
                <article
                  key={m.id}
                  className="p-6 rounded-3xl bg-white border border-[#E2DEC9] space-y-4 hover:border-[#C6A04A] transition shadow-sm"
                >
                  <div className="flex items-center justify-between border-b border-[#E2DEC9] pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#F4F1E9] flex items-center justify-center text-[#94712B]">
                        <SportIcon name={m.sport?.name} className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="font-bold text-sm text-[#080A0E] block">{m.sport?.name}</span>
                        <span className="text-[11px] text-[#5E636E] font-mono">{m.matchCode} • {m.round}</span>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#F4F1E9] text-[#94712B] border border-[#E2DEC9]">
                      Scheduled
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#F9F8F5] border border-[#E2DEC9] text-center">
                    <span className="text-sm font-bold text-[#080A0E]">
                      {m.participants?.[0]?.teamName || m.participants?.[0]?.cricketTeam?.name || m.participants?.[0]?.club?.name || 'Competing Squad'}
                    </span>
                    {m.participants?.length > 1 && (
                      <div className="my-1.5 text-xs font-black text-[#94712B]">VS</div>
                    )}
                    <span className="text-sm font-bold text-[#080A0E]">
                      {m.participants?.[1]?.teamName || m.participants?.[1]?.cricketTeam?.name || m.participants?.[1]?.club?.name || ''}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-[#5E636E] pt-1">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#94712B]" />
                      {m.venue?.name || 'Main Court'}
                    </span>
                    <span className="flex items-center gap-1.5 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-[#94712B]" />
                      {new Date(m.matchDate).toLocaleDateString()} at {m.matchTime || '14:00'}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION G: APPROVED SCORES (DARK SECTION)                 */}
      {/* ========================================================= */}
      <section id="results" className="py-20 px-4 sm:px-8 bg-[#080A0E] text-white border-b border-[#252B34]">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#252B34] pb-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#C6A04A] block">
                Verified Match Ledger
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-white mt-1">
                Approved Competition Scores
              </h2>
            </div>

            <select
              value={sportFilter}
              onChange={(e) => setSportFilter(e.target.value)}
              className="px-4 py-2 bg-[#141820] border border-[#252B34] rounded-xl text-xs font-bold text-white outline-none focus:border-[#C6A04A]"
            >
              <option value="">All 7 Sports</option>
              {sports.map((sp: any) => (
                <option key={sp.id} value={sp.id}>{sp.name}</option>
              ))}
            </select>
          </div>

          {filteredApprovedMatches.length === 0 ? (
            <div className="p-14 rounded-3xl bg-[#141820] border border-[#252B34] text-center text-[#A4A8B0]">
              <CheckCircle2 className="w-12 h-12 text-[#252B34] mx-auto mb-3" />
              <h4 className="text-base font-bold text-white">No approved results recorded yet.</h4>
              <p className="text-xs text-[#A4A8B0] mt-1">Scores will appear here live once referees submit official competition points.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredApprovedMatches.map((m: any) => (
                <article
                  key={m.id}
                  className="p-6 rounded-3xl bg-[#141820] border border-[#252B34] space-y-4 hover:border-[#C6A04A]/60 transition shadow-lg"
                >
                  <div className="flex items-center justify-between border-b border-[#252B34] pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#080A0E] flex items-center justify-center text-[#C6A04A]">
                        <SportIcon name={m.sport?.name} className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="font-bold text-sm text-white block">{m.sport?.name}</span>
                        <span className="text-[11px] text-[#A4A8B0] font-mono">{m.matchCode} • {m.round}</span>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Approved Result
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    {m.participants?.map((p: any) => (
                      <div key={p.id} className="p-3 rounded-2xl bg-[#080A0E] border border-[#252B34] flex items-center justify-between">
                        <div>
                          <span className="font-bold text-white block text-sm">
                            {p.cricketTeam?.name || p.teamName || p.club?.name}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-mono font-black text-[#C6A04A] text-base">{p.score ?? 0} pts</span>
                          {p.rank && (
                            <span className="text-[10px] text-[#A4A8B0] block">
                              Rank #{p.rank}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-xs text-[#A4A8B0] pt-1">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#A4A8B0]" />
                      {m.venue?.name || 'Main Arena'}
                    </span>
                    <span>{new Date(m.matchDate).toLocaleDateString()}</span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION H: CHAMPIONSHIP POINTS SYSTEM (EXPLANATION ENGINE) */}
      {/* ========================================================= */}
      <section id="points-system" className="py-20 px-4 sm:px-8 bg-[#141820] text-white border-b border-[#252B34]">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="border-b border-[#252B34] pb-6">
            <span className="text-xs font-bold uppercase tracking-widest text-[#C6A04A] block">
              Automated Integrity Protocol
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-white mt-1">
              Unique-Club Equal Division Engine
            </h2>
            <p className="text-sm text-[#A4A8B0] max-w-2xl mt-2 leading-relaxed">
              In mixed-squad disciplines (such as BGMI Squads), earned points are distributed strictly and equally among the unique houses represented by squad members.
            </p>
          </div>

          {/* Visual Formula Diagram */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-[#080A0E] border border-[#252B34] space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#C6A04A]">Rule 1 • Squad Identification</span>
              <h3 className="font-serif text-xl font-bold text-white">Unique House Detection</h3>
              <p className="text-xs text-[#A4A8B0] leading-relaxed">
                If a 4-player BGMI squad consists of 2 Mavericks players, 1 Dominator player, and 1 Alpha player, the algorithm recognizes exactly <strong>3 unique houses</strong> (Mavericks, Dominator, Alpha).
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#080A0E] border border-[#252B34] space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#C6A04A]">Rule 2 • Equal Division</span>
              <h3 className="font-serif text-xl font-bold text-white">Equal Point Allocation</h3>
              <p className="text-xs text-[#A4A8B0] leading-relaxed">
                If the squad earns 1st Place (100 points), the points are divided equally among the 3 unique houses: <br />
                <code className="text-[#C6A04A] font-mono text-sm block mt-1.5">100 / 3 = 33.33 pts each</code>
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#080A0E] border border-[#252B34] space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#C6A04A]">Rule 3 • Deterministic Remainder</span>
              <h3 className="font-serif text-xl font-bold text-white">Fair Remainder Rotation</h3>
              <p className="text-xs text-[#A4A8B0] leading-relaxed">
                Any fractional cent remainder (+0.01) is rotated deterministically to ensure the sum of points allocated strictly equals the total points awarded: <br />
                <code className="text-emerald-400 font-mono text-sm block mt-1.5">33.33 + 33.33 + 33.34 = 100.00</code>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION I: COMPREHENSIVE CHAMPIONSHIP FOOTER              */}
      {/* ========================================================= */}
      <footer className="bg-[#080A0E] py-14 px-4 sm:px-8 text-xs text-[#A4A8B0]">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-[#252B34]">
            {/* Column 1: Brand & Championship Statement */}
            <div className="space-y-3 md:col-span-1">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#141820] border border-[#C6A04A]/40 p-1 flex items-center justify-center">
                  <img src="/logo.png" alt="APL Logo" className="w-full h-full object-contain" />
                </div>
                <span className="font-serif font-bold text-white text-base">
                  APL Season 9
                </span>
              </div>
              <p className="text-[11px] text-[#A4A8B0] leading-relaxed">
                Inter-Club Sports Championship. The annual tournament uniting five historical houses across seven athletic disciplines.
              </p>
            </div>

            {/* Column 2: Navigation Links */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-white block mb-1">
                Portal Sections
              </span>
              <ul className="space-y-1.5 text-[11px]">
                <li><button onClick={() => scrollToSection('overview')} className="hover:text-[#C6A04A] transition">Championship Overview</button></li>
                <li><button onClick={() => scrollToSection('leaderboard')} className="hover:text-[#C6A04A] transition">Live Leaderboard</button></li>
                <li><button onClick={() => scrollToSection('houses')} className="hover:text-[#C6A04A] transition">The 5 Houses</button></li>
                <li><button onClick={() => scrollToSection('sports')} className="hover:text-[#C6A04A] transition">7 Sports Arena</button></li>
                <li><button onClick={() => scrollToSection('matches')} className="hover:text-[#C6A04A] transition">Match Radar & Fixtures</button></li>
              </ul>
            </div>

            {/* Column 3: The 5 Houses */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-white block mb-1">
                Competing Houses
              </span>
              <ul className="space-y-1.5 text-[11px]">
                <li>Alpha (ALP) • Ethan Hunt</li>
                <li>Crown Crushers (CRW) • Zane Malik</li>
                <li>Dominator (DOM) • Leo Vance</li>
                <li>Mavericks (MAV) • Alex Rivera</li>
                <li>Royal Force (RYL) • Carlos Vega</li>
              </ul>
            </div>

            {/* Column 4: Disciplines */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-white block mb-1">
                7 Sports Disciplines
              </span>
              <p className="text-[11px] text-[#A4A8B0] leading-relaxed">
                Cricket (10 Teams) • Football • BGMI Squads • Badminton • Chess • Table Tennis • Carrom
              </p>
              <div className="pt-2">
                <span className="inline-block px-2.5 py-1 rounded bg-[#141820] text-[#C6A04A] border border-[#252B34] text-[10px] font-mono">
                  Engine: Unique-Club Equal Split
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#A4A8B0]">
            <p>© 2026 APL Season 9 Inter-Club House Championship. All rights reserved.</p>
            <p className="font-mono text-[10px] text-[#6B7280]">
              Spectator Public Edition • No Authentication Required
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
