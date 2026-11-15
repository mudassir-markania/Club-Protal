'use client';

import React, { useState, useEffect } from 'react';
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
  Scale,
  Sparkles,
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
  { id: 'sport-badminton', name: 'Badminton', category: 'Racquet', tournamentFormat: 'Best of 3 Sets (21 Pts)' },
  { id: 'sport-chess', name: 'Chess', category: 'Mind Sport', tournamentFormat: 'Rapid & Classical FIDE' },
  { id: 'sport-tt', name: 'Table Tennis', category: 'Racquet', tournamentFormat: '11-Point Fast Table' },
  { id: 'sport-carrom', name: 'Carrom', category: 'Indoor', tournamentFormat: 'White Slam Knockout' },
];

export default function PublicViewerPortal() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
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

  const championship = data?.championship || {};
  const isClosed = championship?.status === 'CLOSED';
  const championClub = championship?.championClub;
  const rawStandings = (data?.standings && data.standings.length > 0) ? data.standings : INITIAL_HOUSES;
  const leadingHouse = championship?.leadingHouse || rawStandings[0];
  const sports = (data?.sports && data.sports.length > 0) ? data.sports : INITIAL_SPORTS;
  const upcomingMatches = data?.upcomingMatches || [];

  return (
    <div className="min-h-screen bg-[#0A0D14] text-[#EDEDED] flex flex-col selection:bg-[#C6A04A] selection:text-[#0A0D14] antialiased">
      {/* 1. UNIFIED NAVIGATION BAR */}
      <PublicNavbar
        onRefresh={handleRefresh}
        refreshing={refreshing}
        lastUpdated={lastRefreshed}
      />

      {/* 2. PROPORTIONAL HERO SECTION */}
      <section className="py-12 sm:py-16 px-4 sm:px-8 border-b border-white/[0.08] bg-[#0A0D14]">
        <div className="max-w-6xl mx-auto">
          {isClosed && championClub ? (
            <div className="rounded-2xl bg-[#141822] border border-[#C6A04A]/40 p-6 sm:p-10 text-white space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#C6A04A] flex items-center gap-1.5">
                <Crown className="w-4 h-4 text-[#C6A04A]" />
                Tournament Concluded
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white">
                {championClub.name} are Champions
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
                Congratulations to {championClub.name}! With outstanding performance across all 7 sports, they take the APL Season 9 Trophy with {Number(championClub.totalPoints).toFixed(2)} total points.
              </p>
              <Link
                href="/leaderboard"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#C6A04A] text-slate-950 font-bold text-xs hover:bg-[#B38F3A] transition"
              >
                <span>View Final Standings</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Left Column: Balanced Typography */}
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
                    Follow real-time house standings across 7 sports and 10 cricket teams. Built on certified unique-club equal division scoring.
                  </p>
                </div>

                {/* Key Venue & Date */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#C6A04A]" />
                    <span>Nov 25 – 28, 2026</span>
                  </span>
                  <span className="text-slate-600">•</span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#C6A04A]" />
                    <span>Main Sports Complex Arena</span>
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
                  <Link
                    href="/leaderboard"
                    className="px-5 py-2.5 rounded-lg bg-[#C6A04A] hover:bg-[#B38F3A] text-slate-950 font-bold text-xs tracking-wide transition flex items-center gap-2 shadow-sm"
                  >
                    <Trophy className="w-3.5 h-3.5" />
                    <span>View Live Leaderboard</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    href="/houses"
                    className="px-4 py-2.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.1] text-slate-200 font-semibold text-xs transition"
                  >
                    Explore The 5 Houses
                  </Link>
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
                          <h3 className="font-serif font-bold text-white text-sm leading-tight">
                            {leadingHouse?.name || 'Alpha'}
                          </h3>
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
              <span className="text-xs font-semibold text-slate-600">Cricket Teams</span>
            </Link>
            <Link
              href="/sports"
              className="p-3 bg-white rounded-xl border border-[#E0DCD3] hover:border-[#C6A04A] transition text-center shadow-xs block group"
            >
              <span className="font-serif text-2xl font-bold text-slate-900 group-hover:text-[#94712B] transition block">7</span>
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
              <span>View Full Leaderboard & 7-Sport Matrix</span>
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
              <span>Explore All 5 Houses & Cricket Franchises</span>
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

        {/* SECTION 3: 7 SPORTS ARENA */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#C6A04A] block">
                7 Sports Disciplines
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white mt-1">
                Championship Arena
              </h2>
            </div>
            <Link
              href="/sports"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#C6A04A] hover:text-[#DFB85C] transition"
            >
              <span>Explore All 7 Sports & Rules</span>
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
