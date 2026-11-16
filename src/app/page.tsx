'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import PublicNavbar from '@/components/public/PublicNavbar';
import PublicFooter from '@/components/public/PublicFooter';
import ChampionshipSplashScreen from '@/components/public/ChampionshipSplashScreen';
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
  Scale,
  Sparkles,
  Star,
  CheckCircle2,
} from 'lucide-react';
import { SportIcon } from '@/components/ui/icons';

const HOUSE_METADATA: Record<
  string,
  {
    code: string;
    name: string;
    accentColor: string;
  }
> = {
  ALP: { code: 'ALP', name: 'Alpha', accentColor: '#2563EB' },
  CRW: { code: 'CRW', name: 'Crown Crushers', accentColor: '#D97706' },
  DOM: { code: 'DOM', name: 'Dominator', accentColor: '#DC2626' },
  MAV: { code: 'MAV', name: 'Mavericks', accentColor: '#059669' },
  RYL: { code: 'RYL', name: 'Royal Force', accentColor: '#7C3AED' },
};

const INITIAL_HOUSES = [
  { id: 'club-alp', name: 'Alpha', code: 'ALP', captainName: 'Ethan Hunt', rank: 1, totalPoints: 0, cricketTeams: [{ id: 'crick-alp-a', name: 'Alpha A' }, { id: 'crick-alp-b', name: 'Alpha B' }] },
  { id: 'club-crw', name: 'Crown Crushers', code: 'CRW', captainName: 'Zane Malik', rank: 2, totalPoints: 0, cricketTeams: [{ id: 'crick-crw-a', name: 'Crown Crushers A' }, { id: 'crick-crw-b', name: 'Crown Crushers B' }] },
  { id: 'club-dom', name: 'Dominator', code: 'DOM', captainName: 'Leo Vance', rank: 3, totalPoints: 0, cricketTeams: [{ id: 'crick-dom-a', name: 'Dominator A' }, { id: 'crick-dom-b', name: 'Dominator B' }] },
  { id: 'club-mav', name: 'Mavericks', code: 'MAV', captainName: 'Alex Rivera', rank: 4, totalPoints: 0, cricketTeams: [{ id: 'crick-mav-a', name: 'Mavericks A' }, { id: 'crick-mav-b', name: 'Mavericks B' }] },
  { id: 'club-ryl', name: 'Royal Force', code: 'RYL', captainName: 'Carlos Vega', rank: 5, totalPoints: 0, cricketTeams: [{ id: 'crick-ryl-a', name: 'Royal Force A' }, { id: 'crick-ryl-b', name: 'Royal Force B' }] },
];

const INITIAL_SPORTS = [
  { id: 'sport-cricket', name: 'Cricket', category: 'Field Sport', tournamentFormat: '10 Teams • 2 Pools • Super 4' },
  { id: 'sport-football', name: 'Football', category: 'Field Sport', tournamentFormat: '5-a-side Turf League' },
  { id: 'sport-bgmi', name: 'BGMI', category: 'E-Sports', tournamentFormat: 'Battle Royale 4-Man Squads' },
  { id: 'sport-badminton', name: 'Badminton', category: 'Racquet', tournamentFormat: 'Singles • Doubles • Mixed Doubles' },
  { id: 'sport-chess', name: 'Chess', category: 'Mind Sport', tournamentFormat: 'Rapid & Classical FIDE' },
  { id: 'sport-tt', name: 'Table Tennis', category: 'Racquet', tournamentFormat: '11-Point Fast Table' },
  { id: 'sport-carrom', name: 'Carrom', category: 'Indoor', tournamentFormat: 'Singles • Doubles • Mixed Doubles' },
  { id: 'sport-treasure-hunt', name: 'Treasure Hunt', category: 'Adventure Quest', tournamentFormat: 'Campus Clue Quest & Vault Hunt' },
];

export default function PublicViewerPortal() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<string>('');
  const [showSplash, setShowSplash] = useState(false);

  useEffect(() => {
    fetchPublicOverview();
    setLastRefreshed(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

    // Show splash screen on first visit of this session
    if (typeof window !== 'undefined' && !sessionStorage.getItem('apl_splash_shown')) {
      setShowSplash(true);
    }
  }, []);

  const handleSplashComplete = () => {
    setShowSplash(false);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('apl_splash_shown', 'true');
    }
  };

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

  const championship = data?.championship || {};
  const isClosed = championship?.status === 'CLOSED';
  const championClub = championship?.championClub;
  const rawStandings = (data?.standings && data.standings.length > 0) ? data.standings : INITIAL_HOUSES;
  const leadingHouse = championship?.leadingHouse || rawStandings[0];
  const sports = (data?.sports && data.sports.length > 0) ? data.sports : INITIAL_SPORTS;
  const upcomingMatches = data?.upcomingMatches || [];
  const approvedMatches = data?.approvedMatches || [];

  return (
    <div className="min-h-screen bg-[#0A0D14] text-[#EDEDED] flex flex-col selection:bg-[#C6A04A] selection:text-[#0A0D14] antialiased">
      {/* Crazy Championship Splash Screen */}
      {showSplash && (
        <ChampionshipSplashScreen
          onComplete={handleSplashComplete}
          autoDismissDelay={3800}
        />
      )}

      {/* 1. UNIFIED NAVIGATION BAR */}
      <PublicNavbar
        onRefresh={handleRefresh}
        refreshing={refreshing}
        lastUpdated={lastRefreshed}
        activeOverride="home"
      />

      {/* 2. CINEMATIC CHAMPIONSHIP HERO BANNER */}
      <section className="relative overflow-hidden border-b border-[#C6A04A]/30 bg-[#080A0E] text-white">
        {/* Cinematic Backdrop Image with Rich Layered Lighting */}
        <div
          className="absolute inset-0 bg-cover bg-right lg:bg-center z-0 opacity-80"
          style={{ backgroundImage: "url('/hero-bg.jpg')" }}
        />

        {/* Ambient Gradient Overlays for Readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#080A0E] via-[#080A0E]/90 via-45% to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080A0E] via-[#080A0E]/40 to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0D14]/90 via-transparent to-transparent z-10 pointer-events-none" />

        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-8 py-12 sm:py-16 lg:py-20 flex flex-col justify-between min-h-[560px] lg:min-h-[640px]">
          {isClosed && championClub ? (
            <div className="max-w-2xl rounded-2xl bg-[#141822]/90 backdrop-blur-md border border-[#C6A04A] p-6 sm:p-10 text-white space-y-4 shadow-2xl my-auto">
              <span className="text-xs font-bold uppercase tracking-wider text-[#C6A04A] flex items-center gap-2">
                <Crown className="w-4 h-4 text-[#C6A04A]" />
                Tournament Concluded
              </span>
              <h1 className="font-serif text-3xl sm:text-5xl font-bold text-white">
                {championClub.name} are Champions!
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Congratulations to {championClub.name}! With outstanding performance across all 8 sports, they take the APL Season 9 Trophy with {Number(championClub.totalPoints).toFixed(2)} total points.
              </p>
              <Link
                href="/leaderboard"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#C6A04A] text-slate-950 font-bold text-xs uppercase tracking-wider hover:bg-[#B38F3A] transition shadow-lg"
              >
                <span>View Final Standings</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center flex-1">
              {/* Left Column: Bold 3D Championship Typography */}
              <div className="lg:col-span-8 space-y-5 text-left max-w-2xl">
                {/* Inter-Club Crown Pill */}
                <div className="inline-flex items-center gap-2.5 select-none">
                  <div className="h-[1px] w-6 sm:w-10 bg-gradient-to-r from-transparent to-[#C6A04A]" />
                  <Crown className="w-3.5 h-3.5 text-[#C6A04A]" />
                  <span className="text-[11px] sm:text-xs font-black uppercase tracking-[0.3em] text-[#C6A04A]">
                    INTER - CLUB
                  </span>
                  <div className="h-[1px] w-6 sm:w-10 bg-gradient-to-l from-transparent to-[#C6A04A]" />
                </div>

                {/* Main Dual-Tone Metallic Headline */}
                <div className="space-y-0 select-none">
                  <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black uppercase tracking-tight leading-none text-transparent bg-clip-text bg-gradient-to-b from-white via-[#F0F2F5] to-[#B0B7C3] drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)] italic font-sans">
                    HOUSE
                  </h1>
                  <h2 className="text-4xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tight leading-none text-transparent bg-clip-text bg-gradient-to-b from-[#FFF2B2] via-[#DFB85C] to-[#8C6D23] drop-shadow-[0_4px_24px_rgba(198,160,74,0.45)] italic font-sans -mt-1 sm:-mt-2">
                    CHAMPIONSHIP
                  </h2>
                </div>

                {/* Subtitle & Season Tag */}
                <div className="flex items-center gap-3 pt-1">
                  <div className="h-[1px] w-6 bg-[#C6A04A]/60" />
                  <span className="text-xs sm:text-sm font-bold uppercase tracking-[0.25em] text-[#C6A04A]">
                    APL SEASON 9
                  </span>
                  <div className="h-[1px] w-6 bg-[#C6A04A]/60" />
                </div>

                {/* Tagline */}
                <p className="text-xs sm:text-sm font-bold tracking-widest text-slate-200 uppercase pt-1">
                  5 HOUSES. 8 SPORTS. 10 HOUSE TEAMS. ONE CHAMPION.
                </p>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-3.5 pt-3">
                  <Link
                    href="/leaderboard"
                    className="px-6 py-3 rounded-full bg-gradient-to-r from-[#DFB85C] via-[#C6A04A] to-[#B38F3A] hover:from-[#EDC96F] hover:to-[#C6A04A] text-slate-950 font-black text-xs uppercase tracking-wider transition-all duration-300 shadow-xl shadow-[#C6A04A]/25 hover:shadow-[#C6A04A]/50 flex items-center gap-2 group"
                  >
                    <span>VIEW LIVE LEADERBOARD</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>

                  <Link
                    href="/houses"
                    className="px-6 py-3 rounded-full bg-[#0E131C]/80 hover:bg-[#141A24] border border-[#C6A04A]/60 hover:border-[#C6A04A] text-slate-100 font-bold text-xs uppercase tracking-wider transition-all duration-300 shadow-md backdrop-blur-sm flex items-center gap-2 group"
                  >
                    <span>EXPLORE THE 5 HOUSES</span>
                    <ChevronRight className="w-4 h-4 text-[#C6A04A] group-hover:translate-x-0.5 transition-transform" />
                  </Link>

                  <button
                    onClick={() => setShowSplash(true)}
                    className="px-4 py-3 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.12] hover:border-[#C6A04A]/60 text-[#F3D787] font-bold text-xs uppercase tracking-wider transition-all duration-200 shadow-md flex items-center gap-2 group"
                    title="Play Championship Intro Spectacle"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#C6A04A] group-hover:rotate-12 transition-transform" />
                    <span>INTRO SPECTACLE</span>
                  </button>
                </div>

                {/* Live Current Leader Mini-Badge */}
                <div className="pt-2 flex items-center gap-3 text-xs text-slate-400">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#141822]/80 border border-white/[0.08] backdrop-blur-sm">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[11px] font-medium text-slate-300">
                      Current #1 Seed: <strong className="text-[#C6A04A] font-bold">{leadingHouse?.name || 'Alpha'}</strong> ({Number(leadingHouse?.totalPoints || 0).toFixed(2)} pts)
                    </span>
                  </div>
                  <span className="text-slate-600 hidden sm:inline">•</span>
                  <span className="text-[11px] text-slate-400 hidden sm:inline">
                    Nov 25 – 28, 2026 • Main Sports Complex
                  </span>
                </div>
              </div>

              {/* Right Column: Kept clear for trophy visibility */}
              <div className="lg:col-span-4 hidden lg:block" />
            </div>
          )}

          {/* 3. SLEEK FLOATING SPORTS CONSOLE DOCK */}
          <div className="pt-10 w-full">
            <div className="rounded-2xl sm:rounded-full bg-[#080B10]/90 border border-[#C6A04A]/40 backdrop-blur-md p-2.5 sm:px-6 sm:py-3.5 flex items-center justify-between gap-3 overflow-x-auto shadow-2xl shadow-black/90">
              <div className="flex items-center gap-4 sm:gap-7 shrink-0">
                {sports.map((sp: any) => (
                  <Link
                    key={sp.id}
                    href={`/sports`}
                    className="flex items-center gap-2 text-slate-400 hover:text-white group transition"
                  >
                    <div className="w-7 h-7 rounded-lg bg-[#141822] border border-white/[0.08] flex items-center justify-center text-[#C6A04A] group-hover:border-[#C6A04A] group-hover:text-white transition shadow-inner">
                      <SportIcon name={sp.name} className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[11px] font-bold tracking-wider uppercase group-hover:text-[#C6A04A] transition whitespace-nowrap">
                      {sp.name}
                    </span>
                  </Link>
                ))}
              </div>

              {/* 08 Sports Emblem */}
              <div className="shrink-0 pl-3 border-l border-white/[0.1] hidden sm:block">
                <span className="px-3.5 py-1.5 rounded-full bg-[#C6A04A]/15 border border-[#C6A04A]/50 text-[#C6A04A] font-black text-xs italic tracking-wider whitespace-nowrap">
                  08 SPORTS
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. COMPACT OVERVIEW STATS STRIP */}
      <section className="py-6 px-4 sm:px-8 bg-[#F5F2EB] text-slate-900 border-b border-[#E0DCD3]">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <Link
              href="/houses"
              className="p-3 bg-white rounded-xl border border-[#E0DCD3] hover:border-[#C6A04A] transition text-center shadow-xs block group"
            >
              <span className="font-serif text-2xl font-bold text-slate-900 group-hover:text-[#94712B] transition block">5</span>
              <span className="text-xs font-semibold text-slate-600">Houses</span>
            </Link>
            <Link
              href="/houses"
              className="p-3 bg-white rounded-xl border border-[#E0DCD3] hover:border-[#C6A04A] transition text-center shadow-xs block group"
            >
              <span className="font-serif text-2xl font-bold text-slate-900 group-hover:text-[#94712B] transition block">10</span>
              <span className="text-xs font-semibold text-slate-600">House Teams</span>
            </Link>
            <Link
              href="/sports"
              className="p-3 bg-white rounded-xl border border-[#E0DCD3] hover:border-[#C6A04A] transition text-center shadow-xs block group"
            >
              <span className="font-serif text-2xl font-bold text-slate-900 group-hover:text-[#94712B] transition block">8</span>
              <span className="text-xs font-semibold text-slate-600">Sports Arena</span>
            </Link>
            <Link
              href="/points-rules"
              className="p-3 bg-white rounded-xl border border-[#E0DCD3] hover:border-[#C6A04A] transition text-center shadow-xs block group"
            >
              <span className="font-serif text-2xl font-bold text-[#94712B] block">Equal Split</span>
              <span className="text-xs font-semibold text-slate-600">Fair Division Engine</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 4. MAIN HOMEPAGE CONTENT */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-8 space-y-12">
        {/* SECTION 1: LEADERBOARD SPOTLIGHT */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#C6A04A] block">
                Official Standings
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white mt-1">
                Championship Leaderboard
              </h2>
            </div>
            <Link
              href="/leaderboard"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#C6A04A] hover:text-[#DFB85C] transition"
            >
              <span>View Full Leaderboard & 8-Sport Matrix</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Top 3 Podium Cards */}
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
        </section>

        {/* SECTION: MATCH HIGHLIGHTS & STAR PLAYERS OF THE MATCH (Section 5 Compliant) */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Star className="w-3.5 h-3.5 fill-[#C6A04A] text-[#C6A04A]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#C6A04A]">
                  Certified Match Highlights
                </span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">
                Star Players of the Match
              </h2>
            </div>
            <Link
              href="/player-leaderboard"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#C6A04A] hover:text-[#DFB85C] transition"
            >
              <span>Explore Player Leaderboard</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {approvedMatches.length === 0 ? (
            <div className="p-8 rounded-2xl bg-[#141822] border border-white/[0.08] text-center space-y-2">
              <Star className="w-8 h-8 text-[#C6A04A]/60 mx-auto" />
              <h3 className="font-serif text-base font-bold text-white">Championship Matches Underway</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                As tournament referees submit final results and the Tournament Director certifies them, certified Star Players and match highlights will be showcased here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {approvedMatches.map((m: any) => {
                const winner =
                  m.participants?.find((p: any) => p.isWinner) ||
                  (m.participants?.[0]?.score > (m.participants?.[1]?.score || 0)
                    ? m.participants?.[0]
                    : m.participants?.[1]);
                const winnerName =
                  winner?.teamName ||
                  winner?.cricketTeam?.name ||
                  winner?.club?.name ||
                  'Championship Winner';

                return (
                  <article
                    key={m.id}
                    className="p-6 rounded-2xl bg-gradient-to-b from-[#141822] to-[#0D1017] border border-white/[0.08] hover:border-[#C6A04A]/50 transition shadow-lg space-y-4"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-[#0A0D14] border border-white/[0.08] flex items-center justify-center text-[#C6A04A]">
                          <SportIcon name={m.sport?.name} className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs text-white">{m.sport?.name}</span>
                            <span className="font-mono text-[10px] text-slate-400">• {m.matchCode}</span>
                          </div>
                          <span className="text-[10px] text-slate-400">{m.round}</span>
                        </div>
                      </div>

                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Certified Result</span>
                      </span>
                    </div>

                    {/* Winner & Match Summary */}
                    <div className="p-3.5 rounded-xl bg-[#0A0D14] border border-white/[0.06] flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                          Winning Team / Entry
                        </span>
                        <span className="font-serif font-bold text-sm text-[#F3D787] flex items-center gap-1.5 mt-0.5">
                          <Trophy className="w-3.5 h-3.5 text-[#C6A04A]" />
                          <span>{winnerName}</span>
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                          Scores / Points
                        </span>
                        <span className="font-mono font-bold text-xs text-white">
                          {m.participants?.[0]?.score || 0} pts vs {m.participants?.[1]?.score || 0} pts
                        </span>
                      </div>
                    </div>

                    {/* ⭐ Star Player Spotlight Card */}
                    {m.starPlayer && (
                      <div className="p-4 rounded-xl bg-gradient-to-r from-[#1A2234] via-[#141822] to-[#1A2234] border border-[#C6A04A]/50 shadow-md space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-[#C6A04A]/20 border border-[#C6A04A]/50 flex items-center justify-center text-[#C6A04A]">
                              <Star className="w-4 h-4 fill-[#C6A04A]" />
                            </div>
                            <div>
                              <span className="text-[10px] uppercase font-black text-[#F3D787] tracking-wider block">
                                Star Player of the Match
                              </span>
                              <h4 className="font-serif text-base font-bold text-white">
                                {m.starPlayer.name}
                              </h4>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-[9px] uppercase font-bold text-slate-400 block">Individual Points</span>
                            <span className="font-mono font-black text-amber-300 text-sm">
                              +{m.starPlayerPoints || 0} pts
                            </span>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between text-[11px] text-slate-300">
                          <span>
                            House: <strong className="text-white">{m.starPlayer.club?.name || 'House Representative'}</strong>
                          </span>
                          <span className="text-slate-400">
                            Team: {m.starPlayer.teamName || winnerName}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Card Footer Link */}
                    <div className="pt-2 flex items-center justify-between text-xs text-slate-400">
                      <span>{m.matchDate} • {m.venue?.name || 'Olympic Arena'}</span>
                      <Link
                        href="/results"
                        className="text-[#C6A04A] hover:text-[#F3D787] font-bold text-[11px] inline-flex items-center gap-1 transition"
                      >
                        <span>View Match Details</span>
                        <ChevronRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* SECTION 2: THE 5 HOUSES SHOWCASE */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#C6A04A] block">
                The 5 Houses
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white mt-1">
                Participating Houses
              </h2>
            </div>
            <Link
              href="/houses"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#C6A04A] hover:text-[#DFB85C] transition"
            >
              <span>Explore All 5 Houses & Teams</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rawStandings.map((club: any) => {
              const meta = HOUSE_METADATA[club.code] || HOUSE_METADATA.ALP;
              return (
                <article
                  key={club.id}
                  className="rounded-2xl bg-[#141822] border border-white/[0.08] p-6 space-y-5 hover:border-[#C6A04A]/40 transition shadow-sm"
                >
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

                  <div className="space-y-1.5">
                    <span className="text-[11px] font-medium text-slate-400 block">
                      House Teams
                    </span>
                    <div className="flex items-center gap-2 flex-wrap">
                      {club.cricketTeams?.map((ct: any) => (
                        <span
                          key={ct.id}
                          className="px-2.5 py-1 rounded-md bg-[#0A0D14] border border-white/[0.06] text-xs font-medium text-slate-200"
                        >
                          {ct.name}
                        </span>
                      ))}
                    </div>
                  </div>

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
        </section>

        {/* SECTION 3: 8 SPORTS ARENA */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#C6A04A] block">
                8 Sports Disciplines
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white mt-1">
                Championship Arena
              </h2>
            </div>
            <Link
              href="/sports"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#C6A04A] hover:text-[#DFB85C] transition"
            >
              <span>Explore All 8 Sports & Rules</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {sports.slice(0, 4).map((sp: any) => (
              <article
                key={sp.id}
                className="rounded-xl bg-[#141822] border border-white/[0.08] p-5 space-y-3 hover:border-[#C6A04A] transition shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-lg bg-[#0A0D14] border border-white/[0.08] flex items-center justify-center text-[#C6A04A]">
                    <SportIcon name={sp.name} className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-[#0A0D14] text-[#C6A04A] border border-white/[0.08]">
                    {sp.category}
                  </span>
                </div>

                <div>
                  <h3 className="font-serif text-base font-bold text-white">{sp.name}</h3>
                  <span className="text-xs text-slate-400 font-medium block mt-0.5">{sp.tournamentFormat}</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* SECTION 4: POINTS DIVISION PROTOCOL */}
        <section className="p-6 sm:p-8 rounded-2xl bg-[#141822] border border-white/[0.08] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.06] pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#C6A04A] block">
                Automated Scoring Protocol
              </span>
              <h2 className="font-serif text-2xl font-bold text-white mt-1">
                Unique-Club Equal Division Engine
              </h2>
            </div>
            <Link
              href="/points-rules"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#C6A04A] hover:text-[#DFB85C] transition"
            >
              <span>Test Live Simulator & Rules</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-5 rounded-xl bg-[#0A0D14] border border-white/[0.06] space-y-2">
              <span className="text-[10px] font-bold text-[#C6A04A] uppercase tracking-wider block">1. Unique Houses</span>
              <h3 className="font-serif text-sm font-bold text-white">Detect Representation</h3>
              <p className="text-slate-400 leading-relaxed">
                Counts unique houses in a mixed squad (e.g. 4 players representing 3 houses).
              </p>
            </div>
            <div className="p-5 rounded-xl bg-[#0A0D14] border border-white/[0.06] space-y-2">
              <span className="text-[10px] font-bold text-[#C6A04A] uppercase tracking-wider block">2. Divide Points</span>
              <h3 className="font-serif text-sm font-bold text-white">Equal Point Split</h3>
              <p className="text-slate-400 leading-relaxed">
                Points are divided evenly: <code className="text-[#C6A04A] font-mono">100 ÷ 3 = 33.33 pts</code>
              </p>
            </div>
            <div className="p-5 rounded-xl bg-[#0A0D14] border border-white/[0.06] space-y-2">
              <span className="text-[10px] font-bold text-[#C6A04A] uppercase tracking-wider block">3. Remainder Balance</span>
              <h3 className="font-serif text-sm font-bold text-white">Deterministic Rotation</h3>
              <p className="text-slate-400 leading-relaxed">
                Fractional cents rotate fairly: <code className="text-emerald-400 font-mono">33.33 + 33.33 + 33.34 = 100</code>
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* 5. UNIFIED FOOTER */}
      <PublicFooter />
    </div>
  );
}
