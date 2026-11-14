'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Trophy,
  Medal,
  Calendar,
  MapPin,
  Clock,
  Sparkles,
  Crown,
  ChevronRight,
  Shield,
  Swords,
  Users,
  Search,
  Filter,
  CheckCircle2,
  RefreshCw,
  Flame,
  Award,
  Zap,
  Gamepad2,
  TrendingUp,
  Target,
  ArrowRight,
  BarChart3,
  Layers,
  Radio,
} from 'lucide-react';
import { SportIcon, ClubBadge, MedalBadge } from '@/components/ui/icons';

// House Identity Config with signature themes and mottos
const HOUSE_THEMES: Record<
  string,
  {
    bgGradient: string;
    borderGlow: string;
    accentColor: string;
    textAccent: string;
    badgeBg: string;
    motto: string;
    tagline: string;
  }
> = {
  ALP: {
    bgGradient: 'from-cyan-950/70 via-blue-950/50 to-navy-950',
    borderGlow: 'border-cyan-500/50 hover:border-cyan-400 hover:shadow-cyan-500/20',
    accentColor: '#06B6D4',
    textAccent: 'text-cyan-400',
    badgeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    motto: 'The First & The Fierce',
    tagline: 'Precision and speed across every discipline',
  },
  CRW: {
    bgGradient: 'from-amber-950/70 via-yellow-950/40 to-navy-950',
    borderGlow: 'border-amber-500/50 hover:border-amber-400 hover:shadow-amber-500/20',
    accentColor: '#F59E0B',
    textAccent: 'text-amber-400',
    badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    motto: 'Royalty in Every Arena',
    tagline: 'Reigning power in team and individual showdowns',
  },
  DOM: {
    bgGradient: 'from-red-950/70 via-rose-950/40 to-navy-950',
    borderGlow: 'border-red-500/50 hover:border-red-400 hover:shadow-red-500/20',
    accentColor: '#EF4444',
    textAccent: 'text-red-400',
    badgeBg: 'bg-red-500/20 text-red-300 border-red-500/40',
    motto: 'Unstoppable Force',
    tagline: 'Relentless drive and aggressive competitive grit',
  },
  MAV: {
    bgGradient: 'from-emerald-950/70 via-teal-950/40 to-navy-950',
    borderGlow: 'border-emerald-500/50 hover:border-emerald-400 hover:shadow-emerald-500/20',
    accentColor: '#10B981',
    textAccent: 'text-emerald-400',
    badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    motto: 'Defying Every Limit',
    tagline: 'Strategic depth and agile multi-sport execution',
  },
  RYL: {
    bgGradient: 'from-purple-950/70 via-indigo-950/40 to-navy-950',
    borderGlow: 'border-purple-500/50 hover:border-purple-400 hover:shadow-purple-500/20',
    accentColor: '#8B5CF6',
    textAccent: 'text-purple-400',
    badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    motto: 'Power, Precision, Pride',
    tagline: 'Regal spirit built on championship discipline',
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
  { id: 'sport-bgmi', name: 'BGMI', category: 'Esports', sportType: 'SQUAD', tournamentFormat: 'Battle Royale', numRounds: 3, allowsMixedClubs: true },
  { id: 'sport-cricket', name: 'Cricket', category: 'Outdoor Team', sportType: 'TEAM', tournamentFormat: 'T20 Knockout', numRounds: 4, allowsMixedClubs: false },
  { id: 'sport-football', name: 'Football', category: 'Outdoor Team', sportType: 'TEAM', tournamentFormat: 'League + Knockout', numRounds: 4, allowsMixedClubs: false },
  { id: 'sport-badminton', name: 'Badminton', category: 'Racquet', sportType: 'SINGLES_DOUBLES', tournamentFormat: 'Best of 3 Sets', numRounds: 5, allowsMixedClubs: false },
  { id: 'sport-chess', name: 'Chess', category: 'Strategy', sportType: 'INDIVIDUAL', tournamentFormat: 'Rapid Swiss System', numRounds: 5, allowsMixedClubs: false },
  { id: 'sport-tt', name: 'Table Tennis', category: 'Racquet', sportType: 'SINGLES_DOUBLES', tournamentFormat: 'Single Elimination', numRounds: 5, allowsMixedClubs: false },
  { id: 'sport-carrom', name: 'Carrom', category: 'Indoor Precision', sportType: 'SINGLES_DOUBLES', tournamentFormat: 'Point Board Format', numRounds: 4, allowsMixedClubs: false },
];

export default function PublicViewerPortal() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'standings' | 'houses' | 'sports' | 'schedule' | 'results'>('standings');
  const [standingsView, setStandingsView] = useState<'podium' | 'table' | 'matrix'>('podium');
  const [sportFilter, setSportFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<string>('');

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

  const championship = data?.championship;
  const rawStandings = data?.standings && data.standings.length > 0 ? data.standings : INITIAL_HOUSES;
  const sports = data?.sports && data.sports.length > 0 ? data.sports : INITIAL_SPORTS;
  const approvedMatches = data?.approvedMatches || [];
  const upcomingMatches = data?.upcomingMatches || [];
  const isClosed = championship?.status === 'CLOSED';
  const championClub = championship?.championClub;

  // Filter standings based on search query
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
    <div className="min-h-screen bg-[#050B14] text-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950 relative overflow-x-hidden">
      {/* Dynamic Ambient Neon Spotlights */}
      <div className="fixed top-0 left-1/4 -translate-x-1/2 w-[600px] h-[500px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed top-12 right-1/4 translate-x-1/2 w-[550px] h-[500px] bg-amber-500/12 rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-purple-600/8 rounded-full blur-[160px] pointer-events-none" />

      {/* ========================================================= */}
      {/* PUBLIC HEADER (STRICTLY SPECTATOR ONLY - NO LOGIN BTN)    */}
      {/* ========================================================= */}
      <header className="sticky top-0 z-50 bg-[#060D17]/90 backdrop-blur-xl border-b border-white/[0.08] px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-2xl">
        {/* Brand Showcase */}
        <div className="flex items-center gap-3.5">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-yellow-300 rounded-2xl blur-sm opacity-60 group-hover:opacity-100 transition duration-500" />
            <div className="relative w-12 h-12 rounded-2xl bg-[#091526] border border-amber-500/50 p-1 flex items-center justify-center shadow-lg">
              <img
                src="/logo.png"
                alt="APL Season 9 Logo"
                className="w-full h-full object-contain filter drop-shadow-[0_4px_12px_rgba(245,158,11,0.4)]"
              />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif text-xl sm:text-2xl font-black tracking-tight text-white">
                APL <span className="gold-gradient-text">Season 9</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-gradient-to-r from-amber-500/25 to-yellow-500/15 text-amber-300 border border-amber-500/40 shadow-sm">
                Championship
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:flex items-center gap-2">
              <span>Public Spectator Portal</span>
              <span>•</span>
              <span className="text-cyan-400 font-medium">5 Houses</span>
              <span>•</span>
              <span className="text-amber-400 font-medium">10 Cricket Teams</span>
              <span>•</span>
              <span className="text-emerald-400 font-medium">7 Sports</span>
            </p>
          </div>
        </div>

        {/* Desktop Navigation Tabs */}
        <nav className="hidden lg:flex items-center gap-1.5 bg-[#091526]/80 p-1.5 rounded-2xl border border-white/[0.06] backdrop-blur-md">
          <button
            onClick={() => setActiveTab('standings')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'standings'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30'
                : 'text-slate-300 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>Leaderboard</span>
          </button>
          <button
            onClick={() => setActiveTab('houses')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'houses'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30'
                : 'text-slate-300 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-cyan-400" />
            <span>The 5 Houses</span>
          </button>
          <button
            onClick={() => setActiveTab('sports')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'sports'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30'
                : 'text-slate-300 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>7 Sports</span>
          </button>
          <button
            onClick={() => setActiveTab('schedule')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'schedule'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30'
                : 'text-slate-300 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
            <span>Match Radar</span>
          </button>
          <button
            onClick={() => setActiveTab('results')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'results'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30'
                : 'text-slate-300 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-rose-400" />
            <span>Approved Scores</span>
          </button>
        </nav>

        {/* Live Refresh and Status */}
        <div className="flex items-center gap-2.5">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Live Standings</span>
          </div>

          <button
            onClick={handleRefresh}
            className="p-2.5 text-slate-300 hover:text-white hover:bg-white/[0.08] rounded-xl transition border border-white/[0.08] active:scale-95 group"
            title={`Last updated: ${lastRefreshed}`}
          >
            <RefreshCw className={`w-4 h-4 transition duration-500 group-hover:rotate-180 ${refreshing ? 'animate-spin text-amber-400' : ''}`} />
          </button>
        </div>
      </header>

      {/* ========================================================= */}
      {/* 3. CRAZY HERO SECTION: 3D TROPHY SHOWCASE & GLOWING AURA  */}
      {/* ========================================================= */}
      <section className="relative overflow-hidden pt-8 pb-14 px-4 sm:px-8 border-b border-white/[0.06] bg-gradient-to-b from-[#091526] via-[#070E1A] to-[#050B14]">
        {/* Giant Golden Radial Backdrop */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[550px] radial-glow-gold pointer-events-none" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] radial-glow-blue pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          {isClosed && championClub ? (
            /* OFFICIAL CHAMPION DECLARED HERO */
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-400 p-8 sm:p-14 text-slate-950 shadow-2xl shadow-amber-500/30 border-2 border-amber-300">
              <div className="absolute -right-6 -bottom-6 w-80 h-80 opacity-30 pointer-events-none">
                <img src="/logo.png" alt="APL Trophy" className="w-full h-full object-contain filter drop-shadow-2xl" />
              </div>
              <div className="relative z-10 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-950 text-amber-400 text-xs font-black uppercase tracking-wider mb-4 shadow-md">
                  <Crown className="w-4 h-4 text-amber-400 animate-bounce" />
                  <span>APL SEASON 9 GRAND CHAMPION</span>
                </div>
                <h1 className="font-serif text-4xl sm:text-6xl font-black tracking-tight text-slate-950 leading-tight">
                  {championClub.name} Reigns Supreme!
                </h1>
                <p className="text-base sm:text-lg font-bold text-slate-900 mt-4 leading-relaxed">
                  Congratulations to {championClub.name}! With unparalleled dominance across all 7 sports and 10 cricket teams, they lift the APL Season 9 Trophy with a monumental total of {Number(championClub.totalPoints).toFixed(2)} points!
                </p>
                <div className="mt-6 flex items-center gap-4">
                  <button
                    onClick={() => setActiveTab('standings')}
                    className="px-6 py-3 rounded-2xl bg-slate-950 hover:bg-slate-900 text-amber-400 font-extrabold text-sm shadow-xl flex items-center gap-2 transition"
                  >
                    <Trophy className="w-4 h-4 text-amber-400" />
                    <span>View Championship Standings</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* DYNAMIC ACTIVE TOURNAMENT HERO */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              {/* Left Column: Bold Typography & Action Badges */}
              <div className="lg:col-span-7 text-center lg:text-left space-y-6">
                <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-500/20 via-indigo-500/15 to-purple-500/20 border border-blue-400/30 text-blue-300 text-xs font-black uppercase tracking-widest shadow-inner">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                  <span>APL SEASON 9 • MAIN ARENA • NOV 25 - 28, 2026</span>
                </div>

                <div className="space-y-2">
                  <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.08] text-white">
                    Inter-Club <br />
                    <span className="gold-gradient-text drop-shadow-[0_4px_24px_rgba(245,158,11,0.35)]">
                      House Championship
                    </span>
                  </h1>
                  <p className="text-base sm:text-lg text-slate-300 max-w-xl mx-auto lg:mx-0 font-medium leading-relaxed">
                    The ultimate multi-sport battleground. Follow live house standings across 7 sports and 10 cricket teams, powered by our unique-club equal division points engine.
                  </p>
                </div>

                {/* 4 Feature Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <div className="p-3.5 rounded-2xl bg-[#091526]/80 border border-white/[0.08] backdrop-blur-md text-left hover:border-cyan-500/40 transition">
                    <span className="text-[10px] font-extrabold uppercase text-cyan-400 tracking-wider block">Battling</span>
                    <span className="font-serif text-2xl font-black text-white">5 Houses</span>
                    <p className="text-[10px] text-slate-400 mt-0.5">Alpha to Royal Force</p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-[#091526]/80 border border-white/[0.08] backdrop-blur-md text-left hover:border-amber-500/40 transition">
                    <span className="text-[10px] font-extrabold uppercase text-amber-400 tracking-wider block">Cricket</span>
                    <span className="font-serif text-2xl font-black text-white">10 Teams</span>
                    <p className="text-[10px] text-slate-400 mt-0.5">2 Squads Per House</p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-[#091526]/80 border border-white/[0.08] backdrop-blur-md text-left hover:border-emerald-500/40 transition">
                    <span className="text-[10px] font-extrabold uppercase text-emerald-400 tracking-wider block">Arenas</span>
                    <span className="font-serif text-2xl font-black text-white">7 Sports</span>
                    <p className="text-[10px] text-slate-400 mt-0.5">From BGMI to Football</p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-[#091526]/80 border border-white/[0.08] backdrop-blur-md text-left hover:border-purple-500/40 transition">
                    <span className="text-[10px] font-extrabold uppercase text-purple-400 tracking-wider block">Division</span>
                    <span className="font-serif text-2xl font-black text-white">Equal Split</span>
                    <p className="text-[10px] text-slate-400 mt-0.5">Strict Unique-Club</p>
                  </div>
                </div>

                {/* Quick Action Navigation Buttons */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
                  <button
                    onClick={() => setActiveTab('standings')}
                    className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/25 flex items-center gap-2.5 transition active:scale-95"
                  >
                    <Trophy className="w-4 h-4 text-slate-950" />
                    <span>View Live Leaderboard</span>
                    <ArrowRight className="w-4 h-4 text-slate-950" />
                  </button>
                  <button
                    onClick={() => setActiveTab('houses')}
                    className="px-5 py-3.5 rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.12] text-white font-bold text-sm backdrop-blur-md flex items-center gap-2 transition active:scale-95"
                  >
                    <Shield className="w-4 h-4 text-cyan-400" />
                    <span>Explore The 5 Houses</span>
                  </button>
                </div>
              </div>

              {/* Right Column: High-Voltage 3D Trophy Showcase Card */}
              <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
                {/* Floating Trophy Unit */}
                <div className="relative w-full max-w-md p-8 rounded-3xl bg-gradient-to-b from-[#0F223D]/90 via-[#0B1728]/95 to-[#060D17] border-2 border-amber-500/40 shadow-2xl shadow-amber-500/20 backdrop-blur-xl text-center overflow-hidden">
                  {/* Glowing Ambient Behind Trophy */}
                  <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-amber-500/25 rounded-full blur-[70px] pointer-events-none" />

                  {/* Corner Season Pill */}
                  <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-[10px] font-black text-amber-300 uppercase tracking-widest">
                    APL Season 9
                  </div>

                  {/* 3D Floating Trophy Image */}
                  <div className="relative my-4 flex items-center justify-center">
                    <img
                      src="/logo.png"
                      alt="Official APL Golden Trophy"
                      className="w-56 h-56 sm:w-64 sm:h-64 object-contain filter drop-shadow-[0_16px_40px_rgba(245,158,11,0.55)] animate-float select-none"
                    />
                  </div>

                  {/* Current Tournament Leader Callout */}
                  <div className="mt-2 p-4 rounded-2xl bg-[#070E1A]/90 border border-amber-500/30">
                    <div className="flex items-center justify-between text-left mb-1.5">
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5 text-amber-400" />
                        CURRENT #1 SEED
                      </span>
                      <span className="text-[11px] font-mono font-black text-amber-400">
                        {leadingHouse ? `${Number(leadingHouse.totalPoints).toFixed(2)} pts` : '0.00 pts'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center font-serif font-black text-amber-300 text-sm">
                          {leadingHouse?.code || 'ALP'}
                        </div>
                        <div className="text-left">
                          <h4 className="font-serif font-bold text-white text-base leading-tight">
                            {leadingHouse?.name || 'Alpha'}
                          </h4>
                          <span className="text-[11px] text-slate-400">
                            Capt: {leadingHouse?.captainName || 'Senior Captain'}
                          </span>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-lg bg-amber-400 text-slate-950 font-black text-xs shadow-sm">
                        RANK 1
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 4. MOBILE NAVIGATION TABS (TOUCH-FRIENDLY PILLS)          */}
      {/* ========================================================= */}
      <div className="lg:hidden sticky top-[72px] z-40 bg-[#060D17]/95 border-b border-white/[0.08] px-4 py-2.5 flex items-center gap-2 overflow-x-auto scrollbar-none backdrop-blur-md">
        <button
          onClick={() => setActiveTab('standings')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
            activeTab === 'standings' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white bg-white/[0.04]'
          }`}
        >
          <Trophy className="w-3.5 h-3.5" />
          <span>Leaderboard</span>
        </button>
        <button
          onClick={() => setActiveTab('houses')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
            activeTab === 'houses' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white bg-white/[0.04]'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>The 5 Houses</span>
        </button>
        <button
          onClick={() => setActiveTab('sports')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
            activeTab === 'sports' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white bg-white/[0.04]'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>7 Sports</span>
        </button>
        <button
          onClick={() => setActiveTab('schedule')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
            activeTab === 'schedule' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white bg-white/[0.04]'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Match Radar</span>
        </button>
        <button
          onClick={() => setActiveTab('results')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
            activeTab === 'results' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white bg-white/[0.04]'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Results</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* 5. MAIN CONTENT ARENA                                     */}
      {/* ========================================================= */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8 space-y-10 relative z-10">
        {/* ======================================================= */}
        {/* TAB 1: LIVE STANDINGS & 3D PODIUM MATRIX               */}
        {/* ======================================================= */}
        {activeTab === 'standings' && (
          <div className="space-y-10">
            {/* View Switcher and Live Filter Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-3xl bg-[#091526]/80 border border-white/[0.08] backdrop-blur-md">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-2">Display Mode:</span>
                <div className="flex items-center bg-[#060D17] p-1 rounded-2xl border border-white/[0.08]">
                  <button
                    onClick={() => setStandingsView('podium')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                      standingsView === 'podium' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Trophy className="w-3.5 h-3.5 text-amber-400" />
                    <span>3D Podium & Cards</span>
                  </button>
                  <button
                    onClick={() => setStandingsView('table')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                      standingsView === 'table' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Full Table</span>
                  </button>
                  <button
                    onClick={() => setStandingsView('matrix')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                      standingsView === 'matrix' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5 text-emerald-400" />
                    <span>7-Sport Matrix</span>
                  </button>
                </div>
              </div>

              {/* Search Box */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search House or Captain..."
                  className="w-full pl-10 pr-4 py-2 bg-[#060D17] border border-white/[0.08] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
                />
              </div>
            </div>

            {/* 3D OLYMPIC PODIUM CARDS (TOP 3 HOUSES) */}
            {standingsView === 'podium' && (
              <div className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pt-4">
                  {/* 2nd Place: Silver Podium */}
                  {rawStandings[1] && (
                    <div className="order-2 md:order-1 relative rounded-3xl bg-gradient-to-b from-[#121E31] via-[#0C1726] to-[#070D17] border-2 border-slate-400/50 p-6 shadow-xl text-center group hover:scale-[1.02] transition duration-300">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-slate-300 to-slate-100 text-slate-950 font-black text-lg flex items-center justify-center mx-auto mb-3 shadow-lg shadow-slate-300/20">
                        🥈 2
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        SILVER RUNNER-UP
                      </span>
                      <h3 className="font-serif text-2xl font-black text-white mt-1">{rawStandings[1].name}</h3>
                      <p className="text-xs text-slate-400 font-medium">Capt: {rawStandings[1].captainName || 'Senior Captain'}</p>

                      {/* Cricket Teams */}
                      <div className="flex items-center justify-center gap-1.5 my-4 flex-wrap">
                        {rawStandings[1].cricketTeams?.map((ct: any) => (
                          <span key={ct.id} className="px-2.5 py-1 rounded-lg bg-white/[0.06] border border-white/[0.08] text-[10px] text-slate-300 font-bold">
                            🏏 {ct.name}
                          </span>
                        ))}
                      </div>

                      <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between">
                        <span className="text-[11px] text-slate-400 font-semibold uppercase">Points</span>
                        <span className="font-mono text-2xl font-black text-slate-200">
                          {Number(rawStandings[1].totalPoints).toFixed(2)} pts
                        </span>
                      </div>
                    </div>
                  )}

                  {/* 1st Place: Golden Crown Podium (Elevated) */}
                  {rawStandings[0] && (
                    <div className="order-1 md:order-2 relative rounded-3xl bg-gradient-to-b from-[#1E2E4A] via-[#111F36] to-[#091322] border-2 border-amber-400 p-8 shadow-2xl shadow-amber-500/25 text-center md:-translate-y-4 group hover:scale-[1.03] transition duration-300">
                      {/* Floating Crown Badge */}
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 text-xs font-black uppercase tracking-wider shadow-lg flex items-center gap-1.5">
                        <Crown className="w-4 h-4 text-slate-950" />
                        <span>TOURNAMENT LEADER #1</span>
                      </div>

                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-300 text-slate-950 font-black text-2xl flex items-center justify-center mx-auto mt-2 mb-3 shadow-xl shadow-amber-500/30">
                        🥇 1
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
                        CURRENT CHAMPION SEED
                      </span>
                      <h3 className="font-serif text-3xl font-black text-white mt-1">{rawStandings[0].name}</h3>
                      <p className="text-xs text-amber-300 font-semibold">Senior Capt: {rawStandings[0].captainName || 'Ethan Hunt'}</p>

                      {/* Cricket Teams */}
                      <div className="flex items-center justify-center gap-2 my-5 flex-wrap">
                        {rawStandings[0].cricketTeams?.map((ct: any) => (
                          <span key={ct.id} className="px-3 py-1 rounded-xl bg-amber-500/15 border border-amber-500/40 text-[11px] text-amber-300 font-bold">
                            🏏 {ct.name}
                          </span>
                        ))}
                      </div>

                      <div className="pt-4 border-t border-amber-500/30 flex items-center justify-between">
                        <span className="text-xs text-amber-300 font-bold uppercase">Total Points</span>
                        <span className="font-mono text-3xl font-black gold-gradient-text">
                          {Number(rawStandings[0].totalPoints).toFixed(2)} pts
                        </span>
                      </div>
                    </div>
                  )}

                  {/* 3rd Place: Bronze Podium */}
                  {rawStandings[2] && (
                    <div className="order-3 relative rounded-3xl bg-gradient-to-b from-[#181C26] via-[#10141D] to-[#070D17] border-2 border-amber-700/50 p-6 shadow-xl text-center group hover:scale-[1.02] transition duration-300">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-700 to-amber-600 text-amber-100 font-black text-lg flex items-center justify-center mx-auto mb-3 shadow-lg shadow-amber-800/20">
                        🥉 3
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-amber-600">
                        BRONZE CONTENDER
                      </span>
                      <h3 className="font-serif text-2xl font-black text-white mt-1">{rawStandings[2].name}</h3>
                      <p className="text-xs text-slate-400 font-medium">Capt: {rawStandings[2].captainName || 'Senior Captain'}</p>

                      {/* Cricket Teams */}
                      <div className="flex items-center justify-center gap-1.5 my-4 flex-wrap">
                        {rawStandings[2].cricketTeams?.map((ct: any) => (
                          <span key={ct.id} className="px-2.5 py-1 rounded-lg bg-white/[0.06] border border-white/[0.08] text-[10px] text-slate-300 font-bold">
                            🏏 {ct.name}
                          </span>
                        ))}
                      </div>

                      <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between">
                        <span className="text-[11px] text-slate-400 font-semibold uppercase">Points</span>
                        <span className="font-mono text-2xl font-black text-amber-500">
                          {Number(rawStandings[2].totalPoints).toFixed(2)} pts
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Remaining Houses (4th and 5th) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {rawStandings.slice(3).map((club: any) => (
                    <div
                      key={club.id}
                      className="p-5 rounded-2xl bg-[#091526]/80 border border-white/[0.08] flex items-center justify-between hover:border-white/[0.18] transition"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-white/[0.06] border border-white/[0.1] flex items-center justify-center font-serif font-black text-lg text-slate-300">
                          #{club.rank}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-serif text-xl font-bold text-white">{club.name}</h4>
                            <span className="text-xs font-mono text-slate-400">({club.code})</span>
                          </div>
                          <p className="text-xs text-slate-400">Capt: {club.captainName || 'Senior Captain'}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] font-semibold text-slate-400 block uppercase">Total Points</span>
                        <span className="font-mono text-xl font-black text-slate-200">
                          {Number(club.totalPoints).toFixed(2)} pts
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* FULL OFFICIAL TABLE VIEW */}
            {standingsView === 'table' && (
              <div className="rounded-3xl bg-[#091526]/90 border border-white/[0.08] shadow-2xl overflow-hidden backdrop-blur-md">
                <div className="p-6 border-b border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="font-serif text-2xl font-black text-white">Championship Standings Table</h2>
                    <p className="text-xs text-slate-400 mt-1">Live point tally updated after every approved match result</p>
                  </div>
                  <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40">
                    5 Houses Competing
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#060D17]/80 text-[11px] font-black uppercase tracking-wider text-slate-400 border-b border-white/[0.08]">
                      <tr>
                        <th className="py-4 px-6 text-center">Rank</th>
                        <th className="py-4 px-6">House</th>
                        <th className="py-4 px-6">Senior Captain</th>
                        <th className="py-4 px-6">Sponsored Cricket Teams</th>
                        <th className="py-4 px-6 text-right">Cumulative Points</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.06]">
                      {filteredStandings.map((club: any) => {
                        const theme = HOUSE_THEMES[club.code] || HOUSE_THEMES.ALP;
                        return (
                          <tr key={club.id} className="hover:bg-white/[0.03] transition">
                            <td className="py-4 px-6 text-center">
                              {club.rank === 1 ? (
                                <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-amber-400 text-slate-950 font-black text-xs shadow-md">
                                  🥇 1
                                </span>
                              ) : club.rank === 2 ? (
                                <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-slate-300 text-slate-950 font-black text-xs shadow-md">
                                  🥈 2
                                </span>
                              ) : club.rank === 3 ? (
                                <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-amber-700 text-amber-100 font-black text-xs shadow-md">
                                  🥉 3
                                </span>
                              ) : (
                                <span className="font-mono font-bold text-slate-400 text-sm">#{club.rank}</span>
                              )}
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-3">
                                <div
                                  className="w-10 h-10 rounded-xl flex items-center justify-center font-serif font-black text-base text-white shadow-md"
                                  style={{ backgroundColor: theme.accentColor }}
                                >
                                  {club.code}
                                </div>
                                <div>
                                  <span className="font-serif font-bold text-base text-white block">{club.name}</span>
                                  <span className="text-[10px] text-slate-400 italic">{theme.motto}</span>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-6 text-slate-300 font-medium">
                              {club.captainName || 'Senior Captain'}
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {club.cricketTeams?.map((ct: any) => (
                                  <span
                                    key={ct.id}
                                    className="px-2.5 py-1 rounded-lg bg-[#060D17] border border-white/[0.08] text-[10px] text-slate-300 font-bold"
                                  >
                                    🏏 {ct.name}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="py-4 px-6 text-right font-mono font-black text-lg text-amber-400">
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

            {/* 7-SPORT POINTS HEATMAP MATRIX */}
            {standingsView === 'matrix' && (
              <div className="rounded-3xl bg-[#091526]/90 border border-white/[0.08] shadow-2xl overflow-hidden backdrop-blur-md">
                <div className="p-6 border-b border-white/[0.08]">
                  <h2 className="font-serif text-2xl font-black text-white">7-Sport Points Matrix Breakdown</h2>
                  <p className="text-xs text-slate-400 mt-1">Multi-sport points earned by each house across the 7 disciplines</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#060D17]/80 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-white/[0.08]">
                      <tr>
                        <th className="py-4 px-6">House</th>
                        {sports.map((sp: any) => (
                          <th key={sp.id} className="py-4 px-3 text-center">
                            <div className="flex flex-col items-center gap-1">
                              <div className="w-7 h-7 rounded-lg bg-white/[0.06] flex items-center justify-center text-amber-400">
                                <SportIcon name={sp.name} className="w-3.5 h-3.5" />
                              </div>
                              <span className="font-bold text-[10px]">{sp.name}</span>
                            </div>
                          </th>
                        ))}
                        <th className="py-4 px-6 text-right">Total Points</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.06] font-mono">
                      {filteredStandings.map((club: any) => {
                        const theme = HOUSE_THEMES[club.code] || HOUSE_THEMES.ALP;
                        return (
                          <tr key={club.id} className="hover:bg-white/[0.03] transition">
                            <td className="py-4 px-6 font-sans font-bold text-white flex items-center gap-3">
                              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: theme.accentColor }} />
                              <span className="font-serif text-sm">{club.name}</span>
                            </td>
                            {sports.map((sp: any) => {
                              const score = club.sportBreakdown?.[sp.id] ?? club.sportBreakdown?.[sp.name] ?? 0;
                              return (
                                <td key={sp.id} className="py-4 px-3 text-center">
                                  {score > 0 ? (
                                    <span className="px-2 py-1 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                                      {score.toFixed(2)}
                                    </span>
                                  ) : (
                                    <span className="text-slate-600">—</span>
                                  )}
                                </td>
                              );
                            })}
                            <td className="py-4 px-6 text-right font-black text-base text-amber-400">
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
        )}

        {/* ======================================================= */}
        {/* TAB 2: THE 5 HOUSES WAR ROOM SHOWCASE                  */}
        {/* ======================================================= */}
        {activeTab === 'houses' && (
          <div className="space-y-8 animate-in fade-in">
            <div className="p-8 rounded-3xl bg-gradient-to-r from-[#0E1F38] via-[#091526] to-[#070D18] border border-white/[0.08] relative overflow-hidden">
              <div className="relative z-10 max-w-2xl">
                <span className="text-xs font-black uppercase tracking-widest text-cyan-400">
                  House Profiles & Cricket Franchises
                </span>
                <h2 className="font-serif text-3xl sm:text-4xl font-black text-white mt-1">
                  The 5 Championship Houses
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                  Each house fields elite competitors across all 7 sports, and sponsors 2 distinct cricket squads (Team A and Team B) whose earned points roll directly into the parent house points ledger.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rawStandings.map((club: any) => {
                const theme = HOUSE_THEMES[club.code] || HOUSE_THEMES.ALP;
                return (
                  <article
                    key={club.id}
                    className={`rounded-3xl bg-gradient-to-b ${theme.bgGradient} border-2 ${theme.borderGlow} p-6 space-y-6 shadow-2xl relative overflow-hidden group hover:scale-[1.01] transition duration-300`}
                  >
                    {/* Top Row: Crest & Code */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3.5">
                        <div
                          className="w-14 h-14 rounded-2xl flex items-center justify-center font-serif font-black text-2xl text-white shadow-xl"
                          style={{ backgroundColor: theme.accentColor }}
                        >
                          {club.code}
                        </div>
                        <div>
                          <h3 className="font-serif text-2xl font-black text-white">{club.name}</h3>
                          <span className={`text-[11px] font-bold uppercase tracking-wider ${theme.textAccent}`}>
                            {theme.motto}
                          </span>
                        </div>
                      </div>
                      <span className="font-mono text-xs font-black px-3 py-1 rounded-full bg-white/[0.08] border border-white/[0.1] text-amber-400">
                        Rank #{club.rank}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed italic border-l-2 pl-3" style={{ borderColor: theme.accentColor }}>
                      "{theme.tagline}"
                    </p>

                    {/* House Stats Box */}
                    <div className="p-4 rounded-2xl bg-[#060D17]/80 border border-white/[0.08] space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Senior House Captain:</span>
                        <span className="font-bold text-white">{club.captainName || 'Senior Captain'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Championship Points:</span>
                        <span className="font-mono font-black text-amber-400 text-sm">
                          {Number(club.totalPoints).toFixed(2)} pts
                        </span>
                      </div>
                    </div>

                    {/* 2 Sponsored Cricket Teams */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                        Sponsored Cricket Teams (2 Squads):
                      </span>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {club.cricketTeams?.map((ct: any) => (
                          <div
                            key={ct.id}
                            className="p-3 rounded-xl bg-[#070E1A] border border-white/[0.08] text-center font-bold text-slate-200 shadow-sm"
                          >
                            <span className="block text-slate-100">{ct.name}</span>
                            <span className="text-[9px] text-slate-500 font-normal">Official Roster</span>
                          </div>
                        ))}
                      </div>
                      <span className="text-[10px] text-slate-400 italic block text-center pt-1">
                        Points earned by Team A & B roll directly into {club.name}.
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        )}

        {/* ======================================================= */}
        {/* TAB 3: 7 SPORTS ARENA SHOWCASE                         */}
        {/* ======================================================= */}
        {activeTab === 'sports' && (
          <div className="space-y-8 animate-in fade-in">
            <div className="p-8 rounded-3xl bg-gradient-to-r from-[#0E1F38] via-[#091526] to-[#070D18] border border-white/[0.08] relative overflow-hidden">
              <span className="text-xs font-black uppercase tracking-widest text-amber-400">
                Official Competition Disciplines
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-black text-white mt-1">
                The 7 Championship Sports
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
                Matches are regulated under strict tournament guidelines with automated unique-club point division for mixed-club squads.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sports.map((sp: any) => (
                <article
                  key={sp.id}
                  className="rounded-3xl bg-[#091526]/80 border border-white/[0.08] p-6 space-y-4 hover:border-amber-500/40 transition shadow-xl group"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-yellow-500/10 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-md">
                      <SportIcon name={sp.name} className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-serif text-xl font-bold text-white">{sp.name}</h3>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                        {sp.category} • {sp.sportType}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#060D17]/80 border border-white/[0.08] text-xs space-y-2 text-slate-300">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Format:</span>
                      <span className="font-bold text-white">{sp.tournamentFormat}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Rounds:</span>
                      <span className="font-bold text-white">{sp.numRounds} rounds</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Points Split:</span>
                      <span className="text-amber-400 font-extrabold">Equal Unique-Club</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Mixed Squads:</span>
                      <span className={`font-bold ${sp.allowsMixedClubs ? 'text-emerald-400' : 'text-slate-400'}`}>
                        {sp.allowsMixedClubs ? 'Allowed (Split Evenly)' : 'Single Club Only'}
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

        {/* ======================================================= */}
        {/* TAB 4: MATCH RADAR & FIXTURES                          */}
        {/* ======================================================= */}
        {activeTab === 'schedule' && (
          <div className="space-y-8 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#091526]/80 border border-white/[0.08]">
              <div>
                <h2 className="font-serif text-2xl font-black text-white">Upcoming Competition Radar</h2>
                <p className="text-xs text-slate-400 mt-1">Official fixtures scheduled across Nov 25 – 28, 2026</p>
              </div>

              {/* Sport Filter */}
              <select
                value={sportFilter}
                onChange={(e) => setSportFilter(e.target.value)}
                className="px-4 py-2.5 bg-[#060D17] border border-white/[0.1] rounded-xl text-xs font-bold text-slate-200 outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="">All 7 Sports</option>
                {sports.map((sp: any) => (
                  <option key={sp.id} value={sp.id}>{sp.name}</option>
                ))}
              </select>
            </div>

            {filteredUpcomingMatches.length === 0 ? (
              <div className="p-14 rounded-3xl bg-[#091526]/40 border border-white/[0.06] text-center text-slate-400">
                <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h4 className="text-base font-bold text-white">No upcoming fixtures scheduled for this filter.</h4>
                <p className="text-xs text-slate-500 mt-1">Check back as tournament directors release the daily schedules.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredUpcomingMatches.map((m: any) => (
                  <article
                    key={m.id}
                    className="p-6 rounded-3xl bg-[#091526]/90 border border-white/[0.08] space-y-4 hover:border-blue-500/40 transition shadow-xl"
                  >
                    <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400">
                          <SportIcon name={m.sport?.name} className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-bold text-sm text-white block">{m.sport?.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{m.matchCode} • {m.round}</span>
                        </div>
                      </div>
                      <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/40">
                        Scheduled
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#060D17]/80 border border-white/[0.06] text-center">
                      <span className="text-xs font-bold text-slate-300">
                        {m.participants?.[0]?.teamName || m.participants?.[0]?.cricketTeam?.name || m.participants?.[0]?.club?.name || 'Competing Squad'}
                      </span>
                      {m.participants?.length > 1 && (
                        <div className="my-2 text-xs font-black text-amber-500">VS</div>
                      )}
                      <span className="text-xs font-bold text-slate-300">
                        {m.participants?.[1]?.teamName || m.participants?.[1]?.cricketTeam?.name || m.participants?.[1]?.club?.name || ''}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-white/[0.06]">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        {m.venue?.name || 'Main Court'}
                      </span>
                      <span className="flex items-center gap-1.5 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        {new Date(m.matchDate).toLocaleDateString()} at {m.matchTime || '14:00'}
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ======================================================= */}
        {/* TAB 5: OFFICIALLY APPROVED RESULTS                      */}
        {/* ======================================================= */}
        {activeTab === 'results' && (
          <div className="space-y-8 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#091526]/80 border border-white/[0.08]">
              <div>
                <h2 className="font-serif text-2xl font-black text-white">Approved Competition Scores</h2>
                <p className="text-xs text-slate-400 mt-1">Officially verified and approved by Tournament Administration</p>
              </div>

              <select
                value={sportFilter}
                onChange={(e) => setSportFilter(e.target.value)}
                className="px-4 py-2.5 bg-[#060D17] border border-white/[0.1] rounded-xl text-xs font-bold text-slate-200 outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="">All 7 Sports</option>
                {sports.map((sp: any) => (
                  <option key={sp.id} value={sp.id}>{sp.name}</option>
                ))}
              </select>
            </div>

            {filteredApprovedMatches.length === 0 ? (
              <div className="p-14 rounded-3xl bg-[#091526]/40 border border-white/[0.06] text-center text-slate-400">
                <CheckCircle2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h4 className="text-base font-bold text-white">No approved results recorded yet.</h4>
                <p className="text-xs text-slate-500 mt-1">Scores will appear here live once referees submit results.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredApprovedMatches.map((m: any) => (
                  <article
                    key={m.id}
                    className="p-6 rounded-3xl bg-[#091526]/90 border border-white/[0.08] space-y-4 hover:border-emerald-500/40 transition shadow-xl"
                  >
                    <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                          <SportIcon name={m.sport?.name} className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-bold text-sm text-white block">{m.sport?.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{m.matchCode} • {m.round}</span>
                        </div>
                      </div>
                      <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        Official Result
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      {m.participants?.map((p: any) => (
                        <div key={p.id} className="p-3 rounded-2xl bg-[#060D17] border border-white/[0.06] flex items-center justify-between">
                          <div>
                            <span className="font-bold text-white block text-sm">
                              {p.cricketTeam?.name || p.teamName || p.club?.name}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="font-mono font-black text-amber-400 text-base">{p.score ?? 0} pts</span>
                            {p.rank && (
                              <span className="text-[10px] text-slate-400 block font-semibold">
                                Rank #{p.rank}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-white/[0.06]">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        {m.venue?.name || 'Main Arena'}
                      </span>
                      <span>{new Date(m.matchDate).toLocaleDateString()}</span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* ========================================================= */}
      {/* 6. SPECTATOR FOOTER (STRICTLY NO ADMIN OR REFEREE BUTTONS) */}
      {/* ========================================================= */}
      <footer className="bg-[#040810] border-t border-white/[0.08] py-10 px-4 sm:px-8 mt-16 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#091526] p-1 border border-amber-500/30 flex items-center justify-center">
              <img src="/logo.png" alt="APL Logo" className="w-full h-full object-contain" />
            </div>
            <div className="text-left">
              <span className="font-serif font-black text-white text-sm block">
                APL Season 9 House Championship
              </span>
              <span className="text-[10px] text-slate-400">Inter-Club Sports League • Official Fan Portal</span>
            </div>
          </div>

          <p className="text-slate-400 text-[11px]">
            Strictly public viewer edition. No sign-in required. Referees and tournament administrators use isolated role gateways.
          </p>

          <span className="text-[11px] text-slate-600 font-mono">
            Season 2026 • Build 9.4
          </span>
        </div>
      </footer>
    </div>
  );
}
