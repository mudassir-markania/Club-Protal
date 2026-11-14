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
} from 'lucide-react';
import { SportIcon } from '@/components/ui/icons';

// Refined House Metadata with subtle championship accents
const HOUSE_METADATA: Record<
  string,
  {
    code: string;
    name: string;
    accentColor: string;
    motto: string;
  }
> = {
  ALP: {
    code: 'ALP',
    name: 'Alpha',
    accentColor: '#38BDF8',
    motto: 'The First & The Fierce',
  },
  CRW: {
    code: 'CRW',
    name: 'Crown Crushers',
    accentColor: '#C5A04A',
    motto: 'Royalty in Every Arena',
  },
  DOM: {
    code: 'DOM',
    name: 'Dominator',
    accentColor: '#F87171',
    motto: 'Unstoppable Force',
  },
  MAV: {
    code: 'MAV',
    name: 'Mavericks',
    accentColor: '#34D399',
    motto: 'Defying Every Limit',
  },
  RYL: {
    code: 'RYL',
    name: 'Royal Force',
    accentColor: '#A78BFA',
    motto: 'Power, Precision, Pride',
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
    <div className="min-h-screen bg-[#080B10] text-[#F1EFE8] flex flex-col selection:bg-[#C5A04A] selection:text-[#080B10] antialiased">
      {/* ========================================================= */}
      {/* 1. PUBLIC HEADER (CLEAN, SOPHISTICATED NAVIGATION)        */}
      {/* ========================================================= */}
      <header className="sticky top-0 z-50 bg-[#080B10]/95 backdrop-blur-md border-b border-[#252B34] px-4 sm:px-8 py-3.5 flex items-center justify-between transition-colors">
        {/* Brand Showcase */}
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#10151D] border border-[#252B34] p-1 flex items-center justify-center shrink-0">
            <img
              src="/logo.png"
              alt="APL Season 9 Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif text-lg sm:text-xl font-bold tracking-tight text-[#F1EFE8]">
                APL <span className="text-[#C5A04A]">Season 9</span>
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-[#141A23] text-[#C5A04A] border border-[#C5A04A]/30">
                Championship
              </span>
            </div>
            <p className="text-[11px] text-[#9299A5] hidden sm:block">
              Inter-Club House Championship • 5 Houses • 10 Cricket Teams • 7 Sports
            </p>
          </div>
        </div>

        {/* Desktop Navigation Tabs */}
        <nav className="hidden lg:flex items-center gap-1 bg-[#10151D] p-1 rounded-xl border border-[#252B34]">
          <button
            onClick={() => setActiveTab('standings')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition ${
              activeTab === 'standings'
                ? 'bg-[#141A23] text-[#C5A04A] border border-[#C5A04A]/30 font-semibold shadow-xs'
                : 'text-[#9299A5] hover:text-[#F1EFE8] hover:bg-white/[0.02]'
            }`}
          >
            Leaderboard
          </button>
          <button
            onClick={() => setActiveTab('houses')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition ${
              activeTab === 'houses'
                ? 'bg-[#141A23] text-[#C5A04A] border border-[#C5A04A]/30 font-semibold shadow-xs'
                : 'text-[#9299A5] hover:text-[#F1EFE8] hover:bg-white/[0.02]'
            }`}
          >
            The 5 Houses
          </button>
          <button
            onClick={() => setActiveTab('sports')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition ${
              activeTab === 'sports'
                ? 'bg-[#141A23] text-[#C5A04A] border border-[#C5A04A]/30 font-semibold shadow-xs'
                : 'text-[#9299A5] hover:text-[#F1EFE8] hover:bg-white/[0.02]'
            }`}
          >
            7 Sports
          </button>
          <button
            onClick={() => setActiveTab('schedule')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition ${
              activeTab === 'schedule'
                ? 'bg-[#141A23] text-[#C5A04A] border border-[#C5A04A]/30 font-semibold shadow-xs'
                : 'text-[#9299A5] hover:text-[#F1EFE8] hover:bg-white/[0.02]'
            }`}
          >
            Match Radar
          </button>
          <button
            onClick={() => setActiveTab('results')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition ${
              activeTab === 'results'
                ? 'bg-[#141A23] text-[#C5A04A] border border-[#C5A04A]/30 font-semibold shadow-xs'
                : 'text-[#9299A5] hover:text-[#F1EFE8] hover:bg-white/[0.02]'
            }`}
          >
            Approved Scores
          </button>
        </nav>

        {/* Live Status and Refresh */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#10151D] border border-[#252B34] text-[#9299A5] text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Live Standings</span>
          </div>

          <button
            onClick={handleRefresh}
            className="p-2 text-[#9299A5] hover:text-[#F1EFE8] hover:bg-[#10151D] rounded-lg transition border border-[#252B34] active:scale-95"
            title={`Last refreshed at ${lastRefreshed}`}
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-[#C5A04A]' : ''}`} />
          </button>
        </div>
      </header>

      {/* ========================================================= */}
      {/* 2. REFINED HERO SECTION (EDITORIAL CHAMPIONSHIP FEEL)     */}
      {/* ========================================================= */}
      <section className="relative pt-10 pb-14 px-4 sm:px-8 border-b border-[#252B34] bg-gradient-to-b from-[#0D1117] via-[#090C12] to-[#080B10]">
        <div className="max-w-7xl mx-auto">
          {isClosed && championClub ? (
            /* CONCLUDED CHAMPIONSHIP SUMMARY */
            <div className="rounded-2xl bg-[#10151D] border border-[#C5A04A]/40 p-8 sm:p-12 text-[#F1EFE8]">
              <div className="max-w-2xl space-y-4">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#C5A04A] uppercase tracking-wider">
                  <Crown className="w-4 h-4 text-[#C5A04A]" />
                  Championship Concluded
                </span>
                <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-[#F1EFE8]">
                  {championClub.name} crowned <span className="text-[#C5A04A]">Champions</span>
                </h1>
                <p className="text-sm sm:text-base text-[#9299A5] leading-relaxed">
                  The APL Season 9 Inter-Club House Championship has officially drawn to a close. Demonstrating elite consistency across all 7 sports, {championClub.name} finishes atop the leaderboard with {Number(championClub.totalPoints).toFixed(2)} total points.
                </p>
                <button
                  onClick={() => setActiveTab('standings')}
                  className="mt-2 px-5 py-2.5 rounded-xl bg-[#C5A04A] hover:bg-[#B38F3A] text-[#080B10] font-semibold text-xs tracking-wide transition flex items-center gap-2"
                >
                  <Trophy className="w-3.5 h-3.5 text-[#080B10]" />
                  <span>View Full Table</span>
                </button>
              </div>
            </div>
          ) : (
            /* ACTIVE TOURNAMENT HERO */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              {/* Left Column: Prestigious Typography & Statistics */}
              <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#10151D] border border-[#252B34] text-xs text-[#C5A04A] font-semibold tracking-wide">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C5A04A]" />
                  <span>APL SEASON 9 • MAIN ARENA • NOV 25 – 28, 2026</span>
                </div>

                <div className="space-y-3">
                  <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.12] text-[#F1EFE8]">
                    Inter-Club <span className="text-[#C5A04A]">House Championship</span>
                  </h1>
                  <p className="text-sm sm:text-base text-[#9299A5] max-w-xl mx-auto lg:mx-0 leading-relaxed">
                    Official tournament standings and multi-sport leaderboard across 5 houses and 10 cricket teams, calculated using the certified unique-club equal division system.
                  </p>
                </div>

                {/* 4 Statistics Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <div className="p-3.5 rounded-xl bg-[#10151D] border border-[#252B34] text-left">
                    <span className="text-[10px] font-semibold uppercase text-[#9E813E] tracking-wider block">Houses</span>
                    <span className="font-serif text-2xl font-bold text-[#F1EFE8] mt-0.5 block">5</span>
                    <p className="text-[11px] text-[#9299A5] mt-0.5">Alpha to Royal</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#10151D] border border-[#252B34] text-left">
                    <span className="text-[10px] font-semibold uppercase text-[#9E813E] tracking-wider block">Cricket</span>
                    <span className="font-serif text-2xl font-bold text-[#F1EFE8] mt-0.5 block">10</span>
                    <p className="text-[11px] text-[#9299A5] mt-0.5">A & B Squads</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#10151D] border border-[#252B34] text-left">
                    <span className="text-[10px] font-semibold uppercase text-[#9E813E] tracking-wider block">Sports</span>
                    <span className="font-serif text-2xl font-bold text-[#F1EFE8] mt-0.5 block">7</span>
                    <p className="text-[11px] text-[#9299A5] mt-0.5">Multi-Discipline</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#10151D] border border-[#252B34] text-left">
                    <span className="text-[10px] font-semibold uppercase text-[#9E813E] tracking-wider block">System</span>
                    <span className="font-serif text-lg font-bold text-[#F1EFE8] mt-1 block">Equal Split</span>
                    <p className="text-[11px] text-[#9299A5] mt-0.5">Unique-Club</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-1">
                  <button
                    onClick={() => setActiveTab('standings')}
                    className="px-5 py-2.5 rounded-xl bg-[#C5A04A] hover:bg-[#B38F3A] text-[#080B10] font-semibold text-xs tracking-wide transition flex items-center gap-2 active:scale-95"
                  >
                    <Trophy className="w-3.5 h-3.5 text-[#080B10]" />
                    <span>View Live Leaderboard</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#080B10]" />
                  </button>
                  <button
                    onClick={() => setActiveTab('houses')}
                    className="px-4 py-2.5 rounded-xl bg-[#141A23] hover:bg-[#1A222E] border border-[#252B34] text-[#F1EFE8] font-medium text-xs tracking-wide transition active:scale-95"
                  >
                    Explore The 5 Houses
                  </button>
                </div>
              </div>

              {/* Right Column: Clean Trophy Showcase & Leading House Card */}
              <div className="lg:col-span-5 flex flex-col items-center justify-center">
                <div className="w-full max-w-sm rounded-2xl bg-[#10151D] border border-[#252B34] p-6 text-center space-y-5 shadow-sm">
                  {/* Trophy Image Display without glow */}
                  <div className="relative py-2 flex items-center justify-center">
                    <img
                      src="/logo.png"
                      alt="Official APL Golden Trophy"
                      className="w-44 h-44 object-contain select-none"
                    />
                  </div>

                  {/* Clean Ranking Card */}
                  <div className="p-4 rounded-xl bg-[#141A23] border border-[#252B34] text-left">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9E813E]">
                        Tournament Leader
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#10151D] text-[#C5A04A] border border-[#C5A04A]/30">
                        Seed #1
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div>
                        <h4 className="font-serif font-bold text-[#F1EFE8] text-lg">
                          {leadingHouse?.name || 'Alpha'}
                        </h4>
                        <span className="text-xs text-[#9299A5]">
                          Captain: {leadingHouse?.captainName || 'Ethan Hunt'}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-[#9299A5] block uppercase">Points</span>
                        <span className="font-mono font-bold text-lg text-[#C5A04A]">
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
      {/* 3. MOBILE NAVIGATION TABS (TOUCH-FRIENDLY PILLS)          */}
      {/* ========================================================= */}
      <div className="lg:hidden sticky top-[65px] z-40 bg-[#080B10] border-b border-[#252B34] px-4 py-2.5 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('standings')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
            activeTab === 'standings' ? 'bg-[#C5A04A] text-[#080B10] font-semibold' : 'text-[#9299A5] bg-[#10151D]'
          }`}
        >
          Leaderboard
        </button>
        <button
          onClick={() => setActiveTab('houses')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
            activeTab === 'houses' ? 'bg-[#C5A04A] text-[#080B10] font-semibold' : 'text-[#9299A5] bg-[#10151D]'
          }`}
        >
          The 5 Houses
        </button>
        <button
          onClick={() => setActiveTab('sports')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
            activeTab === 'sports' ? 'bg-[#C5A04A] text-[#080B10] font-semibold' : 'text-[#9299A5] bg-[#10151D]'
          }`}
        >
          7 Sports
        </button>
        <button
          onClick={() => setActiveTab('schedule')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
            activeTab === 'schedule' ? 'bg-[#C5A04A] text-[#080B10] font-semibold' : 'text-[#9299A5] bg-[#10151D]'
          }`}
        >
          Match Radar
        </button>
        <button
          onClick={() => setActiveTab('results')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
            activeTab === 'results' ? 'bg-[#C5A04A] text-[#080B10] font-semibold' : 'text-[#9299A5] bg-[#10151D]'
          }`}
        >
          Approved Scores
        </button>
      </div>

      {/* ========================================================= */}
      {/* 4. MAIN CONTENT ARENA                                     */}
      {/* ========================================================= */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8 space-y-8">
        {/* ======================================================= */}
        {/* TAB 1: LIVE STANDINGS & REFINED PODIUM MATRIX          */}
        {/* ======================================================= */}
        {activeTab === 'standings' && (
          <div className="space-y-8">
            {/* View Switcher and Search */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-[#10151D] border border-[#252B34]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-[#9299A5] ml-1">View Format:</span>
                <div className="flex items-center bg-[#080B10] p-1 rounded-lg border border-[#252B34]">
                  <button
                    onClick={() => setStandingsView('podium')}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition flex items-center gap-1.5 ${
                      standingsView === 'podium'
                        ? 'bg-[#141A23] text-[#C5A04A] border border-[#C5A04A]/30 font-semibold'
                        : 'text-[#9299A5] hover:text-[#F1EFE8]'
                    }`}
                  >
                    <Trophy className="w-3.5 h-3.5 text-[#C5A04A]" />
                    <span>Podium & Cards</span>
                  </button>
                  <button
                    onClick={() => setStandingsView('table')}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition flex items-center gap-1.5 ${
                      standingsView === 'table'
                        ? 'bg-[#141A23] text-[#C5A04A] border border-[#C5A04A]/30 font-semibold'
                        : 'text-[#9299A5] hover:text-[#F1EFE8]'
                    }`}
                  >
                    <BarChart3 className="w-3.5 h-3.5 text-[#9299A5]" />
                    <span>Full Standings</span>
                  </button>
                  <button
                    onClick={() => setStandingsView('matrix')}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition flex items-center gap-1.5 ${
                      standingsView === 'matrix'
                        ? 'bg-[#141A23] text-[#C5A04A] border border-[#C5A04A]/30 font-semibold'
                        : 'text-[#9299A5] hover:text-[#F1EFE8]'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5 text-[#9299A5]" />
                    <span>7-Sport Matrix</span>
                  </button>
                </div>
              </div>

              {/* Clean Search Input */}
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-[#9299A5] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter by house or captain..."
                  className="w-full pl-9 pr-3 py-1.5 bg-[#080B10] border border-[#252B34] rounded-lg text-xs text-[#F1EFE8] placeholder-[#9299A5] focus:outline-none focus:border-[#C5A04A] transition"
                />
              </div>
            </div>

            {/* REFINED 3D PODIUM & CARDS */}
            {standingsView === 'podium' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-end pt-2">
                  {/* 2nd Place: Silver Runner-Up */}
                  {rawStandings[1] && (
                    <article className="order-2 md:order-1 rounded-2xl bg-[#10151D] border border-[#252B34] p-5 text-center">
                      <div className="w-9 h-9 rounded-lg bg-[#141A23] border border-[#252B34] text-[#F1EFE8] font-serif font-bold text-sm flex items-center justify-center mx-auto mb-2.5">
                        2
                      </div>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9299A5]">
                        Second Place
                      </span>
                      <h3 className="font-serif text-xl font-bold text-[#F1EFE8] mt-0.5">{rawStandings[1].name}</h3>
                      <p className="text-xs text-[#9299A5]">Captain: {rawStandings[1].captainName || 'Senior Captain'}</p>

                      <div className="flex items-center justify-center gap-1.5 my-3 flex-wrap">
                        {rawStandings[1].cricketTeams?.map((ct: any) => (
                          <span key={ct.id} className="px-2 py-0.5 rounded bg-[#141A23] border border-[#252B34] text-[10px] text-[#9299A5]">
                            {ct.name}
                          </span>
                        ))}
                      </div>

                      <div className="pt-3 border-t border-[#252B34] flex items-center justify-between text-xs">
                        <span className="text-[#9299A5] uppercase font-medium">Total Points</span>
                        <span className="font-mono font-bold text-base text-[#F1EFE8]">
                          {Number(rawStandings[1].totalPoints).toFixed(2)} pts
                        </span>
                      </div>
                    </article>
                  )}

                  {/* 1st Place: Gold Leader (Featured) */}
                  {rawStandings[0] && (
                    <article className="order-1 md:order-2 rounded-2xl bg-[#10151D] border-2 border-[#C5A04A]/60 p-6 text-center md:-translate-y-2">
                      <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#141A23] border border-[#C5A04A]/40 text-[#C5A04A] text-[10px] font-semibold uppercase tracking-wider mb-2">
                        <Crown className="w-3 h-3 text-[#C5A04A]" />
                        <span>Leader</span>
                      </div>

                      <div className="w-11 h-11 rounded-xl bg-[#141A23] border border-[#C5A04A] text-[#C5A04A] font-serif font-bold text-lg flex items-center justify-center mx-auto mb-2">
                        1
                      </div>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9E813E]">
                        Tournament Leader
                      </span>
                      <h3 className="font-serif text-2xl font-bold text-[#F1EFE8] mt-0.5">{rawStandings[0].name}</h3>
                      <p className="text-xs text-[#9299A5]">Senior Captain: {rawStandings[0].captainName || 'Ethan Hunt'}</p>

                      <div className="flex items-center justify-center gap-1.5 my-3.5 flex-wrap">
                        {rawStandings[0].cricketTeams?.map((ct: any) => (
                          <span key={ct.id} className="px-2.5 py-0.5 rounded bg-[#141A23] border border-[#C5A04A]/30 text-[10px] text-[#C5A04A]">
                            {ct.name}
                          </span>
                        ))}
                      </div>

                      <div className="pt-3.5 border-t border-[#252B34] flex items-center justify-between text-xs">
                        <span className="text-[#9299A5] uppercase font-medium">Championship Points</span>
                        <span className="font-mono font-bold text-xl text-[#C5A04A]">
                          {Number(rawStandings[0].totalPoints).toFixed(2)} pts
                        </span>
                      </div>
                    </article>
                  )}

                  {/* 3rd Place: Bronze Contender */}
                  {rawStandings[2] && (
                    <article className="order-3 rounded-2xl bg-[#10151D] border border-[#252B34] p-5 text-center">
                      <div className="w-9 h-9 rounded-lg bg-[#141A23] border border-[#252B34] text-[#9E813E] font-serif font-bold text-sm flex items-center justify-center mx-auto mb-2.5">
                        3
                      </div>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9299A5]">
                        Third Place
                      </span>
                      <h3 className="font-serif text-xl font-bold text-[#F1EFE8] mt-0.5">{rawStandings[2].name}</h3>
                      <p className="text-xs text-[#9299A5]">Captain: {rawStandings[2].captainName || 'Senior Captain'}</p>

                      <div className="flex items-center justify-center gap-1.5 my-3 flex-wrap">
                        {rawStandings[2].cricketTeams?.map((ct: any) => (
                          <span key={ct.id} className="px-2 py-0.5 rounded bg-[#141A23] border border-[#252B34] text-[10px] text-[#9299A5]">
                            {ct.name}
                          </span>
                        ))}
                      </div>

                      <div className="pt-3 border-t border-[#252B34] flex items-center justify-between text-xs">
                        <span className="text-[#9299A5] uppercase font-medium">Total Points</span>
                        <span className="font-mono font-bold text-base text-[#F1EFE8]">
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
                      className="p-4 rounded-xl bg-[#10151D] border border-[#252B34] flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-[#141A23] border border-[#252B34] flex items-center justify-center font-serif font-bold text-sm text-[#9299A5]">
                          #{club.rank}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-serif font-bold text-[#F1EFE8] text-base">{club.name}</h4>
                            <span className="text-[11px] font-mono text-[#9299A5]">({club.code})</span>
                          </div>
                          <p className="text-xs text-[#9299A5]">Captain: {club.captainName || 'Senior Captain'}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] font-medium text-[#9299A5] block uppercase">Points</span>
                        <span className="font-mono font-bold text-base text-[#F1EFE8]">
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
              <div className="rounded-2xl bg-[#10151D] border border-[#252B34] overflow-hidden">
                <div className="p-5 border-b border-[#252B34] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="font-serif text-xl font-bold text-[#F1EFE8]">Championship Standings Table</h2>
                    <p className="text-xs text-[#9299A5] mt-0.5">Cumulative points across all approved tournament results</p>
                  </div>
                  <span className="text-xs text-[#9299A5] font-medium">5 Houses Participating</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#141A23] text-[10px] font-semibold uppercase tracking-wider text-[#9299A5] border-b border-[#252B34]">
                      <tr>
                        <th className="py-3 px-5 text-center">Rank</th>
                        <th className="py-3 px-5">House</th>
                        <th className="py-3 px-5">Senior Captain</th>
                        <th className="py-3 px-5">Sponsored Cricket Teams</th>
                        <th className="py-3 px-5 text-right">Cumulative Points</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#252B34]">
                      {filteredStandings.map((club: any) => {
                        const meta = HOUSE_METADATA[club.code] || HOUSE_METADATA.ALP;
                        return (
                          <tr key={club.id} className="hover:bg-[#141A23]/50 transition">
                            <td className="py-3.5 px-5 text-center font-mono font-bold text-sm text-[#F1EFE8]">
                              {club.rank === 1 ? (
                                <span className="inline-flex items-center justify-center px-2 py-0.5 rounded bg-[#141A23] text-[#C5A04A] border border-[#C5A04A]/30">
                                  #1
                                </span>
                              ) : (
                                `#${club.rank}`
                              )}
                            </td>
                            <td className="py-3.5 px-5">
                              <div className="flex items-center gap-2.5">
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: meta.accentColor }} />
                                <div>
                                  <span className="font-serif font-bold text-sm text-[#F1EFE8] block">{club.name}</span>
                                  <span className="text-[10px] text-[#9299A5]">{meta.motto}</span>
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-5 text-[#9299A5]">
                              {club.captainName || 'Senior Captain'}
                            </td>
                            <td className="py-3.5 px-5">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {club.cricketTeams?.map((ct: any) => (
                                  <span
                                    key={ct.id}
                                    className="px-2 py-0.5 rounded bg-[#141A23] border border-[#252B34] text-[10px] text-[#9299A5]"
                                  >
                                    {ct.name}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="py-3.5 px-5 text-right font-mono font-bold text-base text-[#C5A04A]">
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

            {/* 7-SPORT POINTS MATRIX VIEW */}
            {standingsView === 'matrix' && (
              <div className="rounded-2xl bg-[#10151D] border border-[#252B34] overflow-hidden">
                <div className="p-5 border-b border-[#252B34]">
                  <h2 className="font-serif text-xl font-bold text-[#F1EFE8]">7-Sport Points Matrix Breakdown</h2>
                  <p className="text-xs text-[#9299A5] mt-0.5">Points earned by each house across the 7 championship disciplines</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#141A23] text-[10px] font-semibold uppercase tracking-wider text-[#9299A5] border-b border-[#252B34]">
                      <tr>
                        <th className="py-3 px-5">House</th>
                        {sports.map((sp: any) => (
                          <th key={sp.id} className="py-3 px-3 text-center">
                            <span className="block font-medium">{sp.name}</span>
                          </th>
                        ))}
                        <th className="py-3 px-5 text-right">Total Points</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#252B34] font-mono">
                      {filteredStandings.map((club: any) => {
                        const meta = HOUSE_METADATA[club.code] || HOUSE_METADATA.ALP;
                        return (
                          <tr key={club.id} className="hover:bg-[#141A23]/50 transition">
                            <td className="py-3.5 px-5 font-sans font-bold text-[#F1EFE8] flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: meta.accentColor }} />
                              {club.name}
                            </td>
                            {sports.map((sp: any) => {
                              const score = club.sportBreakdown?.[sp.id] ?? club.sportBreakdown?.[sp.name] ?? 0;
                              return (
                                <td key={sp.id} className="py-3.5 px-3 text-center">
                                  {score > 0 ? (
                                    <span className="px-2 py-0.5 rounded bg-[#141A23] text-[#C5A04A] font-semibold border border-[#C5A04A]/30">
                                      {score.toFixed(2)}
                                    </span>
                                  ) : (
                                    <span className="text-[#9299A5]/40">—</span>
                                  )}
                                </td>
                              );
                            })}
                            <td className="py-3.5 px-5 text-right font-bold text-sm text-[#C5A04A]">
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
        {/* TAB 2: THE 5 HOUSES SHOWCASE                           */}
        {/* ======================================================= */}
        {activeTab === 'houses' && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-[#10151D] border border-[#252B34]">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#9E813E]">
                Championship Franchises
              </span>
              <h2 className="font-serif text-2xl font-bold text-[#F1EFE8] mt-1">
                The 5 Participating Houses
              </h2>
              <p className="text-xs text-[#9299A5] mt-1.5 max-w-2xl leading-relaxed">
                Each house fields participants across all 7 sports, and sponsors 2 distinct cricket teams (Team A and Team B) whose earned points roll directly up to the parent house.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {rawStandings.map((club: any) => {
                const meta = HOUSE_METADATA[club.code] || HOUSE_METADATA.ALP;
                return (
                  <article
                    key={club.id}
                    className="rounded-2xl bg-[#10151D] border border-[#252B34] p-5 space-y-4 hover:border-[#3B4350] transition"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center font-serif font-bold text-base text-[#080B10]"
                          style={{ backgroundColor: meta.accentColor }}
                        >
                          {club.code}
                        </div>
                        <div>
                          <h3 className="font-serif text-lg font-bold text-[#F1EFE8]">{club.name}</h3>
                          <span className="text-[11px] text-[#9299A5]">{meta.motto}</span>
                        </div>
                      </div>
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#141A23] border border-[#252B34] text-[#C5A04A]">
                        Rank #{club.rank}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#141A23] border border-[#252B34] text-xs space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-[#9299A5]">Senior Captain:</span>
                        <span className="font-medium text-[#F1EFE8]">{club.captainName || 'Senior Captain'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#9299A5]">Championship Points:</span>
                        <span className="font-mono font-bold text-[#C5A04A]">{Number(club.totalPoints).toFixed(2)} pts</span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9299A5] block">
                        Sponsored Cricket Teams (2):
                      </span>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {club.cricketTeams?.map((ct: any) => (
                          <div
                            key={ct.id}
                            className="p-2.5 rounded-lg bg-[#141A23] border border-[#252B34] text-center font-medium text-[#F1EFE8]"
                          >
                            {ct.name}
                          </div>
                        ))}
                      </div>
                      <span className="text-[10px] text-[#9299A5] italic block text-center pt-1">
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
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-[#10151D] border border-[#252B34]">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#9E813E]">
                Official Disciplines
              </span>
              <h2 className="font-serif text-2xl font-bold text-[#F1EFE8] mt-1">
                The 7 Championship Sports
              </h2>
              <p className="text-xs text-[#9299A5] mt-1.5 max-w-2xl leading-relaxed">
                Matches are regulated under official competition standards with automated unique-club point division for mixed-club squads.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {sports.map((sp: any) => (
                <article
                  key={sp.id}
                  className="rounded-2xl bg-[#10151D] border border-[#252B34] p-5 space-y-3.5 hover:border-[#3B4350] transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#141A23] border border-[#252B34] flex items-center justify-center text-[#C5A04A]">
                      <SportIcon name={sp.name} className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-serif text-base font-bold text-[#F1EFE8]">{sp.name}</h3>
                      <span className="text-[10px] text-[#9299A5] uppercase font-semibold">
                        {sp.category} • {sp.sportType}
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#141A23] border border-[#252B34] text-xs space-y-1.5 text-[#9299A5]">
                    <div className="flex items-center justify-between">
                      <span>Format:</span>
                      <span className="font-medium text-[#F1EFE8]">{sp.tournamentFormat}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Rounds:</span>
                      <span className="font-medium text-[#F1EFE8]">{sp.numRounds} rounds</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Point Division:</span>
                      <span className="text-[#C5A04A] font-semibold">Equal Unique-Club</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Mixed Squads:</span>
                      <span className={`font-medium ${sp.allowsMixedClubs ? 'text-emerald-400' : 'text-[#9299A5]'}`}>
                        {sp.allowsMixedClubs ? 'Allowed (Divided Evenly)' : 'Single Club'}
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
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#10151D] border border-[#252B34]">
              <div>
                <h2 className="font-serif text-xl font-bold text-[#F1EFE8]">Upcoming Competition Radar</h2>
                <p className="text-xs text-[#9299A5] mt-0.5">Scheduled fixtures across tournament days (Nov 25 – 28, 2026)</p>
              </div>

              {/* Clean Sport Filter */}
              <select
                value={sportFilter}
                onChange={(e) => setSportFilter(e.target.value)}
                className="px-3.5 py-1.5 bg-[#080B10] border border-[#252B34] rounded-lg text-xs font-medium text-[#F1EFE8] outline-none focus:border-[#C5A04A]"
              >
                <option value="">All 7 Sports</option>
                {sports.map((sp: any) => (
                  <option key={sp.id} value={sp.id}>{sp.name}</option>
                ))}
              </select>
            </div>

            {filteredUpcomingMatches.length === 0 ? (
              <div className="p-12 rounded-2xl bg-[#10151D] border border-[#252B34] text-center text-[#9299A5]">
                <Calendar className="w-10 h-10 text-[#252B34] mx-auto mb-2" />
                <h4 className="text-sm font-semibold text-[#F1EFE8]">No upcoming fixtures scheduled for this selection.</h4>
                <p className="text-xs text-[#9299A5] mt-0.5">Official fixtures will appear as match assignments are released.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredUpcomingMatches.map((m: any) => (
                  <article
                    key={m.id}
                    className="p-5 rounded-2xl bg-[#10151D] border border-[#252B34] space-y-3.5 hover:border-[#3B4350] transition"
                  >
                    <div className="flex items-center justify-between border-b border-[#252B34] pb-2.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-[#141A23] flex items-center justify-center text-[#C5A04A]">
                          <SportIcon name={m.sport?.name} className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-bold text-sm text-[#F1EFE8] block">{m.sport?.name}</span>
                          <span className="text-[10px] text-[#9299A5] font-mono">{m.matchCode} • {m.round}</span>
                        </div>
                      </div>
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-semibold uppercase bg-[#141A23] text-[#9299A5] border border-[#252B34]">
                        Scheduled
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-[#141A23] border border-[#252B34] text-center">
                      <span className="text-xs font-semibold text-[#F1EFE8]">
                        {m.participants?.[0]?.teamName || m.participants?.[0]?.cricketTeam?.name || m.participants?.[0]?.club?.name || 'Competing Squad'}
                      </span>
                      {m.participants?.length > 1 && (
                        <div className="my-1.5 text-xs font-bold text-[#C5A04A]">VS</div>
                      )}
                      <span className="text-xs font-semibold text-[#F1EFE8]">
                        {m.participants?.[1]?.teamName || m.participants?.[1]?.cricketTeam?.name || m.participants?.[1]?.club?.name || ''}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-[#9299A5] pt-1">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#9299A5]" />
                        {m.venue?.name || 'Main Court'}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#9299A5]" />
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
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#10151D] border border-[#252B34]">
              <div>
                <h2 className="font-serif text-xl font-bold text-[#F1EFE8]">Approved Competition Scores</h2>
                <p className="text-xs text-[#9299A5] mt-0.5">Officially certified and approved by tournament referees</p>
              </div>

              <select
                value={sportFilter}
                onChange={(e) => setSportFilter(e.target.value)}
                className="px-3.5 py-1.5 bg-[#080B10] border border-[#252B34] rounded-lg text-xs font-medium text-[#F1EFE8] outline-none focus:border-[#C5A04A]"
              >
                <option value="">All 7 Sports</option>
                {sports.map((sp: any) => (
                  <option key={sp.id} value={sp.id}>{sp.name}</option>
                ))}
              </select>
            </div>

            {filteredApprovedMatches.length === 0 ? (
              <div className="p-12 rounded-2xl bg-[#10151D] border border-[#252B34] text-center text-[#9299A5]">
                <CheckCircle2 className="w-10 h-10 text-[#252B34] mx-auto mb-2" />
                <h4 className="text-sm font-semibold text-[#F1EFE8]">No approved results recorded yet.</h4>
                <p className="text-xs text-[#9299A5] mt-0.5">Verified scores will appear here after referees submit points.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredApprovedMatches.map((m: any) => (
                  <article
                    key={m.id}
                    className="p-5 rounded-2xl bg-[#10151D] border border-[#252B34] space-y-3.5 hover:border-[#3B4350] transition"
                  >
                    <div className="flex items-center justify-between border-b border-[#252B34] pb-2.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-[#141A23] flex items-center justify-center text-[#C5A04A]">
                          <SportIcon name={m.sport?.name} className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-bold text-sm text-[#F1EFE8] block">{m.sport?.name}</span>
                          <span className="text-[10px] text-[#9299A5] font-mono">{m.matchCode} • {m.round}</span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-[#141A23] text-emerald-400 border border-emerald-500/30">
                        Approved
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      {m.participants?.map((p: any) => (
                        <div key={p.id} className="p-2.5 rounded-lg bg-[#141A23] border border-[#252B34] flex items-center justify-between">
                          <div>
                            <span className="font-bold text-[#F1EFE8] block text-sm">
                              {p.cricketTeam?.name || p.teamName || p.club?.name}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="font-mono font-bold text-[#C5A04A] text-sm">{p.score ?? 0} pts</span>
                            {p.rank && (
                              <span className="text-[10px] text-[#9299A5] block">
                                Rank #{p.rank}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-xs text-[#9299A5] pt-1">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#9299A5]" />
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
      {/* 5. REFINED FOOTER                                         */}
      {/* ========================================================= */}
      <footer className="bg-[#080B10] border-t border-[#252B34] py-8 px-4 sm:px-8 mt-12 text-xs text-[#9299A5]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-[#10151D] p-1 border border-[#252B34] flex items-center justify-center">
              <img src="/logo.png" alt="APL Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <span className="font-serif font-bold text-[#F1EFE8] text-sm block">
                APL Season 9 House Championship
              </span>
              <span className="text-[10px] text-[#9299A5]">Inter-Club Sports League • Official Public Portal</span>
            </div>
          </div>

          <p className="text-[11px] text-[#9299A5]">
            Public viewer portal. Administrative and referee operations are managed in isolated portals.
          </p>

          <span className="text-[11px] text-[#9299A5] font-mono">
            Season 2026
          </span>
        </div>
      </footer>
    </div>
  );
}
