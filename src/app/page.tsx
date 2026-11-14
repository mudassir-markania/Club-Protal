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
  Menu,
  X,
  Target,
  Sparkles,
  Info,
} from 'lucide-react';
import { SportIcon } from '@/components/ui/icons';

// Refined House Metadata
const HOUSE_METADATA: Record<
  string,
  {
    code: string;
    name: string;
    accentColor: string;
  }
> = {
  ALP: {
    code: 'ALP',
    name: 'Alpha',
    accentColor: '#0284C7',
  },
  CRW: {
    code: 'CRW',
    name: 'Crown Crushers',
    accentColor: '#C6A04A',
  },
  DOM: {
    code: 'DOM',
    name: 'Dominator',
    accentColor: '#DC2626',
  },
  MAV: {
    code: 'MAV',
    name: 'Mavericks',
    accentColor: '#059669',
  },
  RYL: {
    code: 'RYL',
    name: 'Royal Force',
    accentColor: '#7C3AED',
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
  { id: 'sport-cricket', name: 'Cricket', category: 'Outdoor Team', sportType: 'Team', tournamentFormat: 'T20 Knockout' },
  { id: 'sport-football', name: 'Football', category: 'Outdoor Team', sportType: 'Team', tournamentFormat: 'League + Knockout' },
  { id: 'sport-bgmi', name: 'BGMI', category: 'Esports', sportType: 'Squad', tournamentFormat: 'Battle Royale' },
  { id: 'sport-badminton', name: 'Badminton', category: 'Racquet', sportType: 'Singles/Doubles', tournamentFormat: 'Best of 3 Sets' },
  { id: 'sport-chess', name: 'Chess', category: 'Strategy', sportType: 'Individual', tournamentFormat: 'Rapid Swiss' },
  { id: 'sport-tt', name: 'Table Tennis', category: 'Racquet', sportType: 'Singles/Doubles', tournamentFormat: 'Single Elimination' },
  { id: 'sport-carrom', name: 'Carrom', category: 'Indoor Precision', sportType: 'Singles/Doubles', tournamentFormat: 'Point Board' },
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
      const offset = 70;
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
    <div className="min-h-screen bg-[#0A0D14] text-[#EDEDED] flex flex-col selection:bg-[#C6A04A] selection:text-[#0A0D14] antialiased">
      {/* ========================================================= */}
      {/* 1. CLEAN NAVIGATION BAR                                   */}
      {/* ========================================================= */}
      <header className="sticky top-0 z-50 bg-[#0A0D14]/95 backdrop-blur-md border-b border-white/[0.08] px-4 sm:px-8 py-3 flex items-center justify-between">
        {/* Brand */}
        <div
          className="flex items-center gap-3 cursor-pointer select-none"
          onClick={() => scrollToSection('hero')}
        >
          <div className="w-8 h-8 rounded-lg bg-[#141822] border border-[#C6A04A]/30 p-1 flex items-center justify-center shrink-0">
            <img src="/logo.png" alt="APL Logo" className="w-full h-full object-contain" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-serif text-base font-bold text-white tracking-tight">
              APL <span className="text-[#C6A04A]">Season 9</span>
            </span>
            <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-white/[0.06] text-[#C6A04A] border border-[#C6A04A]/30">
              House Championship
            </span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 text-xs font-medium text-slate-300">
          <button onClick={() => scrollToSection('leaderboard')} className="text-[#C6A04A] font-semibold hover:text-[#DFB85C] transition">
            Leaderboard
          </button>
          <button onClick={() => scrollToSection('houses')} className="hover:text-white transition">
            The 5 Houses
          </button>
          <button onClick={() => scrollToSection('sports')} className="hover:text-white transition">
            7 Sports
          </button>
          <button onClick={() => scrollToSection('matches')} className="hover:text-white transition">
            Schedule
          </button>
          <button onClick={() => scrollToSection('results')} className="hover:text-white transition">
            Results
          </button>
          <button onClick={() => scrollToSection('points-system')} className="hover:text-white transition">
            Points Rules
          </button>
        </nav>

        {/* Live Status and Refresh */}
        <div className="flex items-center gap-2.5">
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/[0.08] text-xs text-slate-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Live Standings</span>
          </div>

          <button
            onClick={handleRefresh}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/[0.06] rounded-md transition border border-white/[0.08]"
            title={`Updated ${lastRefreshed}`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-[#C6A04A]' : ''}`} />
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 text-slate-300 hover:text-white bg-white/[0.06] rounded-md border border-white/[0.08]"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden sticky top-[57px] z-40 bg-[#0E131C] border-b border-white/[0.08] p-4 space-y-2 text-xs font-medium">
          <button onClick={() => scrollToSection('leaderboard')} className="w-full text-left p-2 rounded bg-white/[0.05] text-[#C6A04A] font-semibold">
            Leaderboard
          </button>
          <button onClick={() => scrollToSection('houses')} className="w-full text-left p-2 rounded hover:bg-white/[0.05] text-slate-300">
            The 5 Houses
          </button>
          <button onClick={() => scrollToSection('sports')} className="w-full text-left p-2 rounded hover:bg-white/[0.05] text-slate-300">
            7 Sports
          </button>
          <button onClick={() => scrollToSection('matches')} className="w-full text-left p-2 rounded hover:bg-white/[0.05] text-slate-300">
            Schedule
          </button>
          <button onClick={() => scrollToSection('results')} className="w-full text-left p-2 rounded hover:bg-white/[0.05] text-slate-300">
            Approved Results
          </button>
          <button onClick={() => scrollToSection('points-system')} className="w-full text-left p-2 rounded hover:bg-white/[0.05] text-slate-300">
            Points Rules
          </button>
        </div>
      )}

      {/* ========================================================= */}
      {/* SECTION A: CLEAN HERO (PROPORTIONAL, AIRY & ELEGANT)      */}
      {/* ========================================================= */}
      <section id="hero" className="py-12 sm:py-16 px-4 sm:px-8 border-b border-white/[0.08] bg-[#0A0D14]">
        <div className="max-w-6xl mx-auto">
          {isClosed && championClub ? (
            <div className="rounded-2xl bg-[#141822] border border-[#C6A04A]/40 p-6 sm:p-10 text-white">
              <div className="max-w-xl space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#C6A04A] flex items-center gap-1.5">
                  <Crown className="w-4 h-4 text-[#C6A04A]" />
                  Tournament Concluded
                </span>
                <h1 className="font-serif text-2xl sm:text-4xl font-bold text-white">
                  {championClub.name} are Champions
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Congratulations to {championClub.name}! With outstanding performance across all 7 sports, they take the APL Season 9 Trophy with {Number(championClub.totalPoints).toFixed(2)} total points.
                </p>
                <button
                  onClick={() => scrollToSection('leaderboard')}
                  className="mt-2 px-4 py-2 rounded-lg bg-[#C6A04A] text-slate-950 font-bold text-xs hover:bg-[#B38F3A] transition"
                >
                  View Final Standings
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Left Column: Proportional Typography */}
              <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs text-[#C6A04A]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C6A04A]" />
                  <span>Inter-Club Championship • Nov 25 – 28, 2026</span>
                </div>

                <div className="space-y-2">
                  <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight">
                    Inter-Club <span className="text-[#C6A04A]">House Championship</span>
                  </h1>
                  <p className="text-sm text-slate-300 max-w-lg mx-auto lg:mx-0 leading-relaxed">
                    Live multi-sport championship across 5 houses and 10 cricket teams.
                  </p>
                </div>

                {/* Key Venue & Date */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#C6A04A]" />
                    Nov 25 – 28, 2026
                  </span>
                  <span className="text-slate-600">•</span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#C6A04A]" />
                    Main Sports Complex
                  </span>
                </div>

                {/* Buttons */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
                  <button
                    onClick={() => scrollToSection('leaderboard')}
                    className="px-5 py-2.5 rounded-lg bg-[#C6A04A] hover:bg-[#B38F3A] text-slate-950 font-bold text-xs tracking-wide transition flex items-center gap-2"
                  >
                    <Trophy className="w-3.5 h-3.5" />
                    <span>View Leaderboard</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => scrollToSection('houses')}
                    className="px-4 py-2.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.1] text-slate-200 font-semibold text-xs transition"
                  >
                    The 5 Houses
                  </button>
                </div>
              </div>

              {/* Right Column: Clean Trophy Showcase */}
              <div className="lg:col-span-5 flex flex-col items-center">
                <div className="w-full max-w-sm rounded-2xl bg-[#141822] border border-white/[0.08] p-6 space-y-5 shadow-lg">
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-white/[0.06]">
                    <span className="font-semibold text-slate-400">APL Season 9 Trophy</span>
                    <span className="font-mono text-emerald-400 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      Live Standings
                    </span>
                  </div>

                  {/* Trophy Image */}
                  <div className="py-2 flex items-center justify-center">
                    <img
                      src="/logo.png"
                      alt="APL Trophy"
                      className="w-36 h-36 sm:w-40 sm:h-40 object-contain select-none"
                    />
                  </div>

                  {/* Leader Spotlight */}
                  <div className="p-3.5 rounded-xl bg-[#0E131C] border border-[#C6A04A]/30">
                    <div className="flex items-center justify-between text-[11px] font-bold text-[#C6A04A] uppercase tracking-wider mb-1.5">
                      <span>Current #1 Seed</span>
                      <span className="px-1.5 py-0.5 rounded bg-[#C6A04A] text-slate-950 font-black text-[10px]">
                        Rank 1
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-0.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-[#141822] border border-[#C6A04A]/40 flex items-center justify-center font-serif font-bold text-xs text-[#C6A04A]">
                          {leadingHouse?.code || 'ALP'}
                        </div>
                        <div>
                          <h4 className="font-serif font-bold text-white text-sm leading-tight">
                            {leadingHouse?.name || 'Alpha'}
                          </h4>
                          <span className="text-xs text-slate-400">
                            Capt: {leadingHouse?.captainName || 'Ethan Hunt'}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block font-medium">Points</span>
                        <span className="font-mono font-bold text-base text-[#C6A04A]">
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
      {/* SECTION B: COMPACT STATS STRIP (LIGHT / IVORY)            */}
      {/* ========================================================= */}
      <section id="overview" className="py-8 px-4 sm:px-8 bg-[#F5F2EB] text-slate-900 border-b border-[#E0DCD3]">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-3.5 bg-white rounded-xl border border-[#E0DCD3] shadow-xs">
              <span className="font-serif text-2xl font-bold text-slate-900 block">5</span>
              <span className="text-xs font-semibold text-slate-600">Houses</span>
            </div>
            <div className="p-3.5 bg-white rounded-xl border border-[#E0DCD3] shadow-xs">
              <span className="font-serif text-2xl font-bold text-slate-900 block">10</span>
              <span className="text-xs font-semibold text-slate-600">Cricket Teams</span>
            </div>
            <div className="p-3.5 bg-white rounded-xl border border-[#E0DCD3] shadow-xs">
              <span className="font-serif text-2xl font-bold text-slate-900 block">7</span>
              <span className="text-xs font-semibold text-slate-600">Sports</span>
            </div>
            <div className="p-3.5 bg-white rounded-xl border border-[#E0DCD3] shadow-xs">
              <span className="font-serif text-2xl font-bold text-[#94712B] block">Equal Split</span>
              <span className="text-xs font-semibold text-slate-600">Fair Division Engine</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION C: THE FIVE HOUSES (SPACIOUS, UNCLUTTERED)       */}
      {/* ========================================================= */}
      <section id="houses" className="py-16 px-4 sm:px-8 bg-[#0A0D14] text-white border-b border-white/[0.08]">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#C6A04A] block">
                The 5 Houses
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white mt-1">
                Participating Houses
              </h2>
            </div>
            <span className="text-xs text-slate-400 font-medium hidden sm:block">
              5 Houses • 10 Cricket Teams
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rawStandings.map((club: any) => {
              const meta = HOUSE_METADATA[club.code] || HOUSE_METADATA.ALP;
              return (
                <article
                  key={club.id}
                  className="rounded-2xl bg-[#141822] border border-white/[0.08] p-6 space-y-5 hover:border-[#C6A04A]/40 transition shadow-sm"
                >
                  {/* Header: Crest + Name + Rank */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center font-serif font-bold text-base text-white shadow-xs"
                        style={{ backgroundColor: meta.accentColor }}
                      >
                        {club.code}
                      </div>
                      <div>
                        <h3 className="font-serif text-lg font-bold text-white leading-tight">
                          {club.name}
                        </h3>
                        <span className="text-xs text-slate-400">
                          Capt: {club.captainName || 'Senior Captain'}
                        </span>
                      </div>
                    </div>
                    <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-[#0A0D14] border border-white/[0.08] text-[#C6A04A]">
                      #{club.rank}
                    </span>
                  </div>

                  {/* Cricket Teams */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-medium text-slate-400 block">
                      Cricket Teams
                    </span>
                    <div className="flex items-center gap-2 flex-wrap">
                      {club.cricketTeams?.map((ct: any) => (
                        <span
                          key={ct.id}
                          className="px-2.5 py-1 rounded-md bg-[#0A0D14] border border-white/[0.06] text-xs font-medium text-slate-200"
                        >
                          🏏 {ct.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Points Bar */}
                  <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between">
                    <span className="text-xs text-slate-400">Championship Points</span>
                    <span className="font-mono font-bold text-base text-[#C6A04A]">
                      {Number(club.totalPoints).toFixed(2)} pts
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION D: 7 SPORTS ARENA (LIGHT / AIRY)                  */}
      {/* ========================================================= */}
      <section id="sports" className="py-16 px-4 sm:px-8 bg-[#F5F2EB] text-slate-900 border-b border-[#E0DCD3]">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex items-center justify-between border-b border-[#E0DCD3] pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#94712B] block">
                7 Sports
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
                Tournament Disciplines
              </h2>
            </div>
            <span className="text-xs text-slate-600 font-medium hidden sm:block">
              Multi-Sport Championship
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {sports.map((sp: any) => (
              <article
                key={sp.id}
                className="rounded-xl bg-white border border-[#E0DCD3] p-5 space-y-3 hover:border-[#C6A04A] transition shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-lg bg-[#F5F2EB] border border-[#E0DCD3] flex items-center justify-center text-[#94712B]">
                    <SportIcon name={sp.name} className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-[#F5F2EB] text-[#94712B]">
                    {sp.category}
                  </span>
                </div>

                <div>
                  <h3 className="font-serif text-base font-bold text-slate-900">{sp.name}</h3>
                  <span className="text-xs text-slate-500 font-medium block mt-0.5">{sp.tournamentFormat}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION E: LEADERBOARD (DARK & SPACIOUS)                  */}
      {/* ========================================================= */}
      <section id="leaderboard" className="py-16 px-4 sm:px-8 bg-[#0A0D14] text-white border-b border-white/[0.08]">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#C6A04A] block">
                Points Table
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white mt-1">
                Championship Leaderboard
              </h2>
            </div>

            {/* View Switcher */}
            <div className="flex items-center bg-[#141822] p-1 rounded-lg border border-white/[0.08]">
              <button
                onClick={() => setStandingsView('podium')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                  standingsView === 'podium' ? 'bg-[#C6A04A] text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Podium
              </button>
              <button
                onClick={() => setStandingsView('table')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                  standingsView === 'table' ? 'bg-[#C6A04A] text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Table
              </button>
              <button
                onClick={() => setStandingsView('matrix')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                  standingsView === 'matrix' ? 'bg-[#C6A04A] text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Matrix
              </button>
            </div>
          </div>

          {/* VIEW MODE 1: PODIUM */}
          {standingsView === 'podium' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pt-2">
                {/* 2nd Place */}
                {rawStandings[1] && (
                  <article className="order-2 md:order-1 rounded-2xl bg-[#141822] border border-white/[0.08] p-6 text-center space-y-3">
                    <span className="w-8 h-8 rounded-lg bg-[#0A0D14] border border-slate-400/40 text-slate-200 font-serif font-bold text-sm inline-flex items-center justify-center">
                      2
                    </span>
                    <div>
                      <h3 className="font-serif text-xl font-bold text-white">{rawStandings[1].name}</h3>
                      <p className="text-xs text-slate-400">Capt: {rawStandings[1].captainName || 'Senior Captain'}</p>
                    </div>
                    <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between text-xs">
                      <span className="text-slate-400">Total Points</span>
                      <span className="font-mono font-bold text-base text-white">
                        {Number(rawStandings[1].totalPoints).toFixed(2)} pts
                      </span>
                    </div>
                  </article>
                )}

                {/* 1st Place */}
                {rawStandings[0] && (
                  <article className="order-1 md:order-2 rounded-2xl bg-[#141822] border-2 border-[#C6A04A] p-7 text-center space-y-3 md:-translate-y-2 shadow-lg">
                    <span className="w-10 h-10 rounded-xl bg-[#0A0D14] border border-[#C6A04A] text-[#C6A04A] font-serif font-bold text-base inline-flex items-center justify-center">
                      1
                    </span>
                    <div>
                      <h3 className="font-serif text-2xl font-bold text-white">{rawStandings[0].name}</h3>
                      <p className="text-xs text-slate-300">Capt: {rawStandings[0].captainName || 'Ethan Hunt'}</p>
                    </div>
                    <div className="pt-4 border-t border-[#C6A04A]/30 flex items-center justify-between text-xs">
                      <span className="text-[#C6A04A] font-semibold">Championship Points</span>
                      <span className="font-mono font-bold text-xl text-[#C6A04A]">
                        {Number(rawStandings[0].totalPoints).toFixed(2)} pts
                      </span>
                    </div>
                  </article>
                )}

                {/* 3rd Place */}
                {rawStandings[2] && (
                  <article className="order-3 rounded-2xl bg-[#141822] border border-white/[0.08] p-6 text-center space-y-3">
                    <span className="w-8 h-8 rounded-lg bg-[#0A0D14] border border-amber-700/40 text-amber-500 font-serif font-bold text-sm inline-flex items-center justify-center">
                      3
                    </span>
                    <div>
                      <h3 className="font-serif text-xl font-bold text-white">{rawStandings[2].name}</h3>
                      <p className="text-xs text-slate-400">Capt: {rawStandings[2].captainName || 'Senior Captain'}</p>
                    </div>
                    <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between text-xs">
                      <span className="text-slate-400">Total Points</span>
                      <span className="font-mono font-bold text-base text-amber-500">
                        {Number(rawStandings[2].totalPoints).toFixed(2)} pts
                      </span>
                    </div>
                  </article>
                )}
              </div>

              {/* 4th & 5th Place Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {rawStandings.slice(3).map((club: any) => (
                  <div key={club.id} className="p-4 rounded-xl bg-[#141822] border border-white/[0.08] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg bg-[#0A0D14] border border-white/[0.08] flex items-center justify-center font-serif font-bold text-xs text-slate-400">
                        #{club.rank}
                      </span>
                      <div>
                        <span className="font-serif font-bold text-white text-sm">{club.name}</span>
                        <p className="text-xs text-slate-400">Capt: {club.captainName || 'Senior Captain'}</p>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-sm text-slate-200">
                      {Number(club.totalPoints).toFixed(2)} pts
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VIEW MODE 2: TABLE */}
          {standingsView === 'table' && (
            <div className="rounded-xl bg-[#141822] border border-white/[0.08] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#0A0D14] text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-white/[0.08]">
                    <tr>
                      <th className="py-3 px-4 text-center">Rank</th>
                      <th className="py-3 px-4">House</th>
                      <th className="py-3 px-4">Captain</th>
                      <th className="py-3 px-4">Cricket Teams</th>
                      <th className="py-3 px-4 text-right">Points</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.06]">
                    {filteredStandings.map((club: any) => {
                      const meta = HOUSE_METADATA[club.code] || HOUSE_METADATA.ALP;
                      return (
                        <tr key={club.id} className="hover:bg-white/[0.02] transition">
                          <td className="py-3.5 px-4 text-center font-mono font-bold text-sm text-white">
                            #{club.rank}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2.5">
                              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: meta.accentColor }} />
                              <span className="font-serif font-bold text-sm text-white">{club.name}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-slate-300">
                            {club.captainName || 'Senior Captain'}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {club.cricketTeams?.map((ct: any) => (
                                <span key={ct.id} className="px-2 py-0.5 rounded bg-[#0A0D14] border border-white/[0.06] text-[10px] text-slate-300">
                                  {ct.name}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono font-bold text-sm text-[#C6A04A]">
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

          {/* VIEW MODE 3: MATRIX */}
          {standingsView === 'matrix' && (
            <div className="rounded-xl bg-[#141822] border border-white/[0.08] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#0A0D14] text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-white/[0.08]">
                    <tr>
                      <th className="py-3 px-4">House</th>
                      {sports.map((sp: any) => (
                        <th key={sp.id} className="py-3 px-3 text-center">{sp.name}</th>
                      ))}
                      <th className="py-3 px-4 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.06] font-mono">
                    {filteredStandings.map((club: any) => {
                      const meta = HOUSE_METADATA[club.code] || HOUSE_METADATA.ALP;
                      return (
                        <tr key={club.id} className="hover:bg-white/[0.02] transition">
                          <td className="py-3 px-4 font-sans font-bold text-white flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: meta.accentColor }} />
                            {club.name}
                          </td>
                          {sports.map((sp: any) => {
                            const score = club.sportBreakdown?.[sp.id] ?? club.sportBreakdown?.[sp.name] ?? 0;
                            return (
                              <td key={sp.id} className="py-3 px-3 text-center">
                                {score > 0 ? (
                                  <span className="px-1.5 py-0.5 rounded bg-[#0A0D14] text-[#C6A04A] font-bold border border-[#C6A04A]/30">
                                    {score.toFixed(2)}
                                  </span>
                                ) : (
                                  <span className="text-slate-600">—</span>
                                )}
                              </td>
                            );
                          })}
                          <td className="py-3 px-4 text-right font-black text-sm text-[#C6A04A]">
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
      {/* SECTION F: MATCH RADAR (LIGHT / IVORY)                    */}
      {/* ========================================================= */}
      <section id="matches" className="py-16 px-4 sm:px-8 bg-[#F5F2EB] text-slate-900 border-b border-[#E0DCD3]">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center justify-between border-b border-[#E0DCD3] pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#94712B] block">
                Schedule
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
                Upcoming Fixtures
              </h2>
            </div>

            <select
              value={sportFilter}
              onChange={(e) => setSportFilter(e.target.value)}
              className="px-3 py-1.5 bg-white border border-[#E0DCD3] rounded-lg text-xs font-semibold text-slate-800 outline-none"
            >
              <option value="">All Sports</option>
              {sports.map((sp: any) => (
                <option key={sp.id} value={sp.id}>{sp.name}</option>
              ))}
            </select>
          </div>

          {filteredUpcomingMatches.length === 0 ? (
            <div className="p-8 rounded-xl bg-white border border-[#E0DCD3] text-center text-slate-500">
              <Calendar className="w-8 h-8 text-[#94712B]/40 mx-auto mb-2" />
              <h4 className="text-xs font-semibold text-slate-900">No scheduled fixtures match your filter.</h4>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredUpcomingMatches.map((m: any) => (
                <article
                  key={m.id}
                  className="p-5 rounded-xl bg-white border border-[#E0DCD3] space-y-3 shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">{m.sport?.name}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{m.round}</span>
                  </div>

                  <div className="p-3 rounded-lg bg-[#FAF8F5] border border-[#E0DCD3] text-center text-xs font-bold text-slate-900">
                    {m.participants?.[0]?.teamName || m.participants?.[0]?.cricketTeam?.name || m.participants?.[0]?.club?.name || 'TBD'}
                    {m.participants?.length > 1 && (
                      <span className="mx-2 text-[#94712B] font-black">VS</span>
                    )}
                    {m.participants?.[1]?.teamName || m.participants?.[1]?.cricketTeam?.name || m.participants?.[1]?.club?.name || ''}
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{m.venue?.name || 'Main Court'}</span>
                    <span>{new Date(m.matchDate).toLocaleDateString()} at {m.matchTime || '14:00'}</span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION G: APPROVED SCORES (DARK)                         */}
      {/* ========================================================= */}
      <section id="results" className="py-16 px-4 sm:px-8 bg-[#0A0D14] text-white border-b border-white/[0.08]">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#C6A04A] block">
                Official Scores
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white mt-1">
                Approved Match Results
              </h2>
            </div>

            <select
              value={sportFilter}
              onChange={(e) => setSportFilter(e.target.value)}
              className="px-3 py-1.5 bg-[#141822] border border-white/[0.08] rounded-lg text-xs font-semibold text-white outline-none"
            >
              <option value="">All Sports</option>
              {sports.map((sp: any) => (
                <option key={sp.id} value={sp.id}>{sp.name}</option>
              ))}
            </select>
          </div>

          {filteredApprovedMatches.length === 0 ? (
            <div className="p-8 rounded-xl bg-[#141822] border border-white/[0.08] text-center text-slate-400">
              <CheckCircle2 className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <h4 className="text-xs font-semibold text-white">No approved results recorded yet.</h4>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredApprovedMatches.map((m: any) => (
                <article
                  key={m.id}
                  className="p-5 rounded-xl bg-[#141822] border border-white/[0.08] space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-white">{m.sport?.name}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/15 text-emerald-400">
                      Approved
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    {m.participants?.map((p: any) => (
                      <div key={p.id} className="p-2 rounded-lg bg-[#0A0D14] flex items-center justify-between">
                        <span className="font-semibold text-white">
                          {p.cricketTeam?.name || p.teamName || p.club?.name}
                        </span>
                        <span className="font-mono font-bold text-[#C6A04A] text-sm">{p.score ?? 0} pts</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>{m.venue?.name || 'Main Arena'}</span>
                    <span>{new Date(m.matchDate).toLocaleDateString()}</span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION H: POINTS DIVISION ENGINE (CLEAN & PUNCHY)        */}
      {/* ========================================================= */}
      <section id="points-system" className="py-16 px-4 sm:px-8 bg-[#141822] text-white border-b border-white/[0.08]">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="border-b border-white/[0.08] pb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#C6A04A] block">
              Fair Division Rules
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white mt-1">
              Equal Division Protocol
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Points earned by mixed squads are split equally among represented unique houses.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-5 rounded-xl bg-[#0A0D14] border border-white/[0.06] space-y-1.5">
              <span className="text-[10px] font-bold text-[#C6A04A] uppercase tracking-wider block">1. Unique Houses</span>
              <h3 className="font-serif text-sm font-bold text-white">Detect Representation</h3>
              <p className="text-slate-400">
                Counts unique houses in a mixed squad (e.g. 4 players representing 3 houses).
              </p>
            </div>
            <div className="p-5 rounded-xl bg-[#0A0D14] border border-white/[0.06] space-y-1.5">
              <span className="text-[10px] font-bold text-[#C6A04A] uppercase tracking-wider block">2. Divide Points</span>
              <h3 className="font-serif text-sm font-bold text-white">Equal Point Split</h3>
              <p className="text-slate-400">
                Points are divided evenly: <code className="text-[#C6A04A] font-mono">100 ÷ 3 = 33.33 pts</code>
              </p>
            </div>
            <div className="p-5 rounded-xl bg-[#0A0D14] border border-white/[0.06] space-y-1.5">
              <span className="text-[10px] font-bold text-[#C6A04A] uppercase tracking-wider block">3. Remainder Balance</span>
              <h3 className="font-serif text-sm font-bold text-white">Deterministic Rotation</h3>
              <p className="text-slate-400">
                Fractional cents rotate fairly: <code className="text-emerald-400 font-mono">33.33 + 33.33 + 33.34 = 100</code>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION I: CLEAN FOOTER                                   */}
      {/* ========================================================= */}
      <footer className="bg-[#0A0D14] py-8 px-4 sm:px-8 text-xs text-slate-400">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#141822] border border-[#C6A04A]/30 p-1 flex items-center justify-center">
              <img src="/logo.png" alt="APL Logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-serif font-bold text-white text-sm">
              APL Season 9 House Championship
            </span>
          </div>

          <p className="text-[11px] text-slate-500">
            Official Spectator Portal • No Login Required
          </p>

          <span className="text-[11px] text-slate-500 font-mono">
            Season 2026
          </span>
        </div>
      </footer>
    </div>
  );
}
