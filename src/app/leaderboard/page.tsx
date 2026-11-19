'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import PublicNavbar from '@/components/public/PublicNavbar';
import {
  Trophy,
  Crown,
  Medal,
  Shield,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Info,
  CheckCircle2,
  X,
} from 'lucide-react';

interface HouseStanding {
  rank: number;
  name: string;
  code: string;
  colorName: string;
  badgeBg: string;
  textColor: string;
  captain: string;
  played: number;
  won: number;
  lost: number;
  tied: number;
  gold: number;
  silver: number;
  bronze: number;
  fairPlayScore: number;
  bonusPoints: number;
  totalPoints: number;
  winRate: string;
  recentForm: ('W' | 'L' | 'D')[];
}

const STANDINGS_DATA: HouseStanding[] = [
  {
    rank: 1,
    name: 'Dominators',
    code: 'DOM',
    colorName: 'Cobalt Blue',
    badgeBg: 'bg-[#ffdad6]',
    textColor: 'text-[#ba1a1a]',
    captain: 'Rohit Deshmukh',
    played: 24,
    won: 18,
    lost: 5,
    tied: 1,
    gold: 6,
    silver: 3,
    bronze: 2,
    fairPlayScore: 9.8,
    bonusPoints: 18,
    totalPoints: 450,
    winRate: '72.4%',
    recentForm: ['W', 'W', 'L', 'W', 'W'],
  },
  {
    rank: 2,
    name: 'Mavericks',
    code: 'MAV',
    colorName: 'Crimson & Cyan',
    badgeBg: 'bg-[#dbe1ff]',
    textColor: 'text-[#0051d5]',
    captain: 'Aryan Sharma',
    played: 23,
    won: 16,
    lost: 6,
    tied: 1,
    gold: 4,
    silver: 5,
    bronze: 3,
    fairPlayScore: 9.5,
    bonusPoints: 12,
    totalPoints: 415,
    winRate: '68.2%',
    recentForm: ['W', 'W', 'W', 'L', 'W'],
  },
  {
    rank: 3,
    name: 'Alphas',
    code: 'ALP',
    colorName: 'Royal Gold & Emerald',
    badgeBg: 'bg-[#ffdbca]',
    textColor: 'text-[#eb6905]',
    captain: 'Vikramaditya Singh',
    played: 22,
    won: 14,
    lost: 7,
    tied: 1,
    gold: 3,
    silver: 4,
    bronze: 4,
    fairPlayScore: 9.4,
    bonusPoints: 8,
    totalPoints: 380,
    winRate: '63.6%',
    recentForm: ['L', 'W', 'W', 'W', 'L'],
  },
  {
    rank: 4,
    name: 'Spartans',
    code: 'SPA',
    colorName: 'Iron Amber',
    badgeBg: 'bg-[#dae2fd]',
    textColor: 'text-[#000f3f]',
    captain: 'Devendra Nair',
    played: 21,
    won: 11,
    lost: 9,
    tied: 1,
    gold: 2,
    silver: 3,
    bronze: 4,
    fairPlayScore: 9.2,
    bonusPoints: 6,
    totalPoints: 320,
    winRate: '52.4%',
    recentForm: ['W', 'L', 'L', 'W', 'L'],
  },
  {
    rank: 5,
    name: 'Phoenix',
    code: 'PHX',
    colorName: 'Blazing Solar',
    badgeBg: 'bg-[#ffdbca]',
    textColor: 'text-[#783200]',
    captain: 'Kabir Mehta',
    played: 20,
    won: 9,
    lost: 10,
    tied: 1,
    gold: 2,
    silver: 2,
    bronze: 3,
    fairPlayScore: 9.0,
    bonusPoints: 4,
    totalPoints: 290,
    winRate: '45.0%',
    recentForm: ['L', 'L', 'W', 'L', 'W'],
  },
];

const SPORT_POINTS_MATRIX = [
  { sport: 'Cricket T10', DOM: 70, MAV: 85, ALP: 40, SPA: 30, PHX: 25 },
  { sport: 'Football', DOM: 90, MAV: 50, ALP: 60, SPA: 45, PHX: 30 },
  { sport: 'Badminton', DOM: 45, MAV: 40, ALP: 60, SPA: 35, PHX: 30 },
  { sport: 'Basketball', DOM: 60, MAV: 75, ALP: 45, SPA: 40, PHX: 55 },
  { sport: 'Carrom', DOM: 40, MAV: 35, ALP: 50, SPA: 50, PHX: 25 },
  { sport: 'Blitz Chess', DOM: 45, MAV: 30, ALP: 50, SPA: 35, PHX: 40 },
  { sport: 'Track & Field', DOM: 80, MAV: 60, ALP: 45, SPA: 70, PHX: 45 },
  { sport: 'BGMI Esports', DOM: 20, MAV: 40, ALP: 30, SPA: 15, PHX: 40 },
];

export default function LeaderboardPage() {
  const [viewMode, setViewMode] = useState<'consolidated' | 'discipline' | 'medals'>('consolidated');
  const [selectedHouse, setSelectedHouse] = useState<HouseStanding | null>(null);

  return (
    <div className="bg-[#faf8ff] text-[#131b2e] font-inter text-[15px] antialiased selection:bg-[#0051d5] selection:text-white min-h-screen">
      <PublicNavbar activeOverride="leaderboard" />

      <main className="w-full pt-20 pb-20">
        {/* ======================================================== */}
        {/* HEADER SECTION                                           */}
        {/* ======================================================== */}
        <section className="w-full bg-[#000f3f] text-white py-12 lg:py-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#000f3f] via-[#172554] to-[#000f3f] opacity-90" />
          <div className="absolute -right-24 -top-24 w-96 h-96 bg-[#eb6905]/15 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex flex-col gap-2">
              <span className="text-xs uppercase tracking-widest text-[#dbe1ff] font-extrabold font-manrope">
                OFFICIAL POINTS ENGINE • TELEMETRY v9.4
              </span>
              <h1 className="font-manrope text-4xl sm:text-6xl font-black uppercase tracking-tight text-white leading-none">
                LEADERBOARD &amp; STANDINGS
              </h1>
              <p className="text-sm sm:text-base text-[#b7c4fd] max-w-2xl leading-relaxed mt-1">
                Where legacy is forged. Official point tallies, medal counts, win-loss telemetry, and fair play ratings for all 5 competing collegiate houses.
              </p>
            </div>

            {/* Quick View Mode Switcher */}
            <div className="flex items-center gap-1.5 bg-white/10 p-1.5 rounded-xl border border-white/15 backdrop-blur-md self-start md:self-auto shrink-0">
              <button
                onClick={() => setViewMode('consolidated')}
                className={`px-4 py-2 rounded-lg text-xs uppercase tracking-wider font-extrabold font-manrope transition-all cursor-pointer ${
                  viewMode === 'consolidated'
                    ? 'bg-white text-[#000f3f] shadow-sm'
                    : 'text-[#dbe1ff] hover:text-white'
                }`}
              >
                Consolidated
              </button>
              <button
                onClick={() => setViewMode('discipline')}
                className={`px-4 py-2 rounded-lg text-xs uppercase tracking-wider font-extrabold font-manrope transition-all cursor-pointer ${
                  viewMode === 'discipline'
                    ? 'bg-white text-[#000f3f] shadow-sm'
                    : 'text-[#dbe1ff] hover:text-white'
                }`}
              >
                By Discipline
              </button>
              <button
                onClick={() => setViewMode('medals')}
                className={`px-4 py-2 rounded-lg text-xs uppercase tracking-wider font-extrabold font-manrope transition-all cursor-pointer ${
                  viewMode === 'medals'
                    ? 'bg-white text-[#000f3f] shadow-sm'
                    : 'text-[#dbe1ff] hover:text-white'
                }`}
              >
                Medal Hunt
              </button>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* SECTION 1: THE GRAND CHAMPIONSHIP PODIUM                 */}
        {/* ======================================================== */}
        <section className="w-full py-12 lg:py-16">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">
            <div className="bg-[#f2f3ff] rounded-2xl p-6 sm:p-10 shadow-sm border border-[#e2e7ff] relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-[#e2e7ff]">
                <div className="flex items-center gap-3">
                  <span className="w-3 h-8 bg-[#0051d5] rounded-full" />
                  <div>
                    <span className="text-xs uppercase tracking-widest text-[#0051d5] font-extrabold font-manrope">
                      THE PRESTIGE TIER
                    </span>
                    <h2 className="font-manrope text-2xl sm:text-3xl font-extrabold uppercase text-[#000f3f]">
                      Championship Podium
                    </h2>
                  </div>
                </div>
                <span className="text-xs text-[#45464f] uppercase font-bold font-manrope bg-white px-3 py-1.5 rounded-lg border border-[#e2e7ff] self-start sm:self-auto">
                  Calculated on 48/64 Fixtures Completed
                </span>
              </div>

              {/* 3-Column Podium Display */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pt-10">
                {/* 2nd Place: Mavericks (Silver) */}
                <div className="order-2 md:order-1 flex flex-col items-center">
                  <div className="w-full bg-white rounded-2xl p-6 shadow-sm border border-[#e2e7ff] hover:-translate-y-1 transition-transform">
                    <div className="flex items-center justify-between pb-3 border-b border-[#e2e7ff]">
                      <span className="w-8 h-8 rounded-full bg-[#dae2fd] text-[#000f3f] flex items-center justify-center font-manrope font-extrabold text-xs">
                        P2
                      </span>
                      <span className="px-2.5 py-0.5 rounded bg-[#000f3f] text-white text-[10px] uppercase font-black font-manrope">
                        Mavericks • Crimson
                      </span>
                    </div>

                    <div className="flex items-center gap-4 py-4">
                      <div className="w-14 h-14 rounded-xl bg-[#dbe1ff] text-[#0051d5] flex items-center justify-center font-manrope text-2xl font-black shadow-inner">
                        M
                      </div>
                      <div>
                        <h3 className="font-manrope text-xl font-black text-[#000f3f] uppercase leading-tight">
                          Mavericks
                        </h3>
                        <span className="text-xs text-[#45464f] block font-medium">Capt. Aryan Sharma</span>
                        <span className="text-[11px] text-[#0051d5] uppercase font-extrabold font-manrope">
                          Gap: -35 Pts
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 py-3 text-center bg-[#f2f3ff] rounded-xl my-2 border border-[#e2e7ff]">
                      <div>
                        <span className="text-[10px] text-[#45464f] uppercase font-bold">Gold</span>
                        <p className="font-manrope text-lg font-black text-[#000f3f]">04</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#45464f] uppercase font-bold">Silver</span>
                        <p className="font-manrope text-lg font-black text-[#000f3f]">05</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#45464f] uppercase font-bold">Bronze</span>
                        <p className="font-manrope text-lg font-black text-[#000f3f]">03</p>
                      </div>
                    </div>

                    <div className="flex items-baseline justify-between pt-3 border-t border-[#e2e7ff]">
                      <span className="text-xs text-[#45464f] uppercase font-bold font-manrope">
                        Championship Pts
                      </span>
                      <span className="font-manrope text-3xl font-black text-[#000f3f] tabular-nums">
                        415
                      </span>
                    </div>
                  </div>

                  {/* Physical Podium Pedestal 2 */}
                  <div className="w-full h-24 bg-[#dae2fd] rounded-b-2xl flex flex-col items-center justify-center shadow-inner mt-2 border-t-2 border-[#b7c4fd]">
                    <span className="font-manrope text-4xl font-black text-[#45464f]/30">2</span>
                    <span className="text-[10px] uppercase tracking-widest text-[#45464f] font-bold font-manrope">
                      Silver Pedestal
                    </span>
                  </div>
                </div>

                {/* 1st Place: Dominators (Gold - Center & Elevated) */}
                <div className="order-1 md:order-2 flex flex-col items-center -mt-6">
                  {/* Crown Indicator */}
                  <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-[#eb6905] text-white text-xs uppercase tracking-widest font-black mb-3 shadow-md font-manrope">
                    <span className="material-symbols-outlined text-[18px]">crown</span>
                    Championship Leader
                  </div>

                  <div className="w-full bg-white rounded-2xl p-7 shadow-xl border-2 border-[#0051d5]/40 hover:-translate-y-1 transition-transform">
                    <div className="flex items-center justify-between pb-3 border-b border-[#e2e7ff]">
                      <span className="w-9 h-9 rounded-full bg-[#0051d5] text-white flex items-center justify-center font-manrope font-black text-sm shadow-sm">
                        1
                      </span>
                      <span className="px-2.5 py-1 rounded bg-[#0051d5] text-white text-[10px] uppercase tracking-wider font-black font-manrope">
                        Dominators • Cobalt
                      </span>
                    </div>

                    <div className="flex items-center gap-4 py-4">
                      <div className="w-16 h-16 rounded-xl bg-[#000f3f] text-[#ffdbca] flex items-center justify-center font-manrope text-3xl font-black shadow-md">
                        D
                      </div>
                      <div>
                        <h3 className="font-manrope text-2xl font-black text-[#000f3f] uppercase leading-tight">
                          Dominators
                        </h3>
                        <span className="text-xs text-[#45464f] block font-medium">Capt. Rohit Deshmukh</span>
                        <span className="text-[11px] text-[#eb6905] uppercase font-black font-manrope flex items-center gap-1 mt-0.5">
                          <span className="w-2 h-2 rounded-full bg-[#eb6905] animate-ping" />
                          Peak Win Rate: 72.4%
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 py-3 text-center bg-[#f2f3ff] rounded-xl my-2 border border-[#e2e7ff]">
                      <div>
                        <span className="text-[10px] text-[#45464f] uppercase font-bold">Gold</span>
                        <p className="font-manrope text-xl font-black text-[#000f3f]">06</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#45464f] uppercase font-bold">Silver</span>
                        <p className="font-manrope text-xl font-black text-[#000f3f]">03</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#45464f] uppercase font-bold">Bronze</span>
                        <p className="font-manrope text-xl font-black text-[#000f3f]">02</p>
                      </div>
                    </div>

                    <div className="flex items-baseline justify-between pt-3 border-t border-[#e2e7ff]">
                      <div>
                        <span className="text-xs text-[#45464f] uppercase font-bold font-manrope block">
                          Championship Pts
                        </span>
                        <span className="text-[10px] text-[#0051d5] font-bold font-manrope">
                          +18 Bonus Pts Earned
                        </span>
                      </div>
                      <span className="font-manrope text-4xl font-black text-[#000f3f] tabular-nums">
                        450
                      </span>
                    </div>
                  </div>

                  {/* Physical Podium Pedestal 1 */}
                  <div className="w-full h-36 bg-[#000f3f] text-white rounded-b-2xl flex flex-col items-center justify-center shadow-lg mt-2 relative overflow-hidden border-t-2 border-[#dbe1ff]">
                    <span className="font-manrope text-5xl font-black text-[#dbe1ff]">1</span>
                    <span className="text-xs uppercase tracking-widest text-[#b7c4fd] font-bold font-manrope mt-1">
                      Grand Gold Pedestal
                    </span>
                  </div>
                </div>

                {/* 3rd Place: Alphas (Bronze) */}
                <div className="order-3 flex flex-col items-center">
                  <div className="w-full bg-white rounded-2xl p-6 shadow-sm border border-[#e2e7ff] hover:-translate-y-1 transition-transform">
                    <div className="flex items-center justify-between pb-3 border-b border-[#e2e7ff]">
                      <span className="w-8 h-8 rounded-full bg-[#ffdbca] text-[#783200] flex items-center justify-center font-manrope font-extrabold text-xs">
                        P3
                      </span>
                      <span className="px-2.5 py-0.5 rounded bg-[#ffdbca] text-[#783200] text-[10px] uppercase font-black font-manrope">
                        Alphas • Emerald
                      </span>
                    </div>

                    <div className="flex items-center gap-4 py-4">
                      <div className="w-14 h-14 rounded-xl bg-[#ffdbca] text-[#eb6905] flex items-center justify-center font-manrope text-2xl font-black shadow-inner">
                        A
                      </div>
                      <div>
                        <h3 className="font-manrope text-xl font-black text-[#000f3f] uppercase leading-tight">
                          Alphas
                        </h3>
                        <span className="text-xs text-[#45464f] block font-medium">Capt. Vikramaditya Singh</span>
                        <span className="text-[11px] text-[#eb6905] uppercase font-extrabold font-manrope">
                          Gap: -70 Pts
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 py-3 text-center bg-[#f2f3ff] rounded-xl my-2 border border-[#e2e7ff]">
                      <div>
                        <span className="text-[10px] text-[#45464f] uppercase font-bold">Gold</span>
                        <p className="font-manrope text-lg font-black text-[#000f3f]">03</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#45464f] uppercase font-bold">Silver</span>
                        <p className="font-manrope text-lg font-black text-[#000f3f]">04</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#45464f] uppercase font-bold">Bronze</span>
                        <p className="font-manrope text-lg font-black text-[#000f3f]">04</p>
                      </div>
                    </div>

                    <div className="flex items-baseline justify-between pt-3 border-t border-[#e2e7ff]">
                      <span className="text-xs text-[#45464f] uppercase font-bold font-manrope">
                        Championship Pts
                      </span>
                      <span className="font-manrope text-3xl font-black text-[#000f3f] tabular-nums">
                        380
                      </span>
                    </div>
                  </div>

                  {/* Physical Podium Pedestal 3 */}
                  <div className="w-full h-18 bg-[#e2e7ff] rounded-b-2xl flex flex-col items-center justify-center shadow-inner mt-2 border-t-2 border-[#c6c5d0]">
                    <span className="font-manrope text-3xl font-black text-[#45464f]/30">3</span>
                    <span className="text-[10px] uppercase tracking-widest text-[#45464f] font-bold font-manrope">
                      Bronze Pedestal
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* SECTION 2: COMPREHENSIVE STANDINGS TABLE                 */}
        {/* ======================================================== */}
        <section className="w-full py-8">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-3 h-8 bg-[#0051d5] rounded-full" />
                <h2 className="font-manrope text-2xl sm:text-3xl font-extrabold uppercase text-[#000f3f]">
                  Complete Season 9 Points Table
                </h2>
              </div>
              <span className="text-xs text-[#45464f] font-mono">
                Formula: Win = 10p, Gold = 40p, Silver = 25p, Bronze = 15p, Bonus = Fair Play
              </span>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-[#e2e7ff] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-[#000f3f] text-white text-xs uppercase font-extrabold font-manrope">
                      <th className="py-4 px-4 text-center">Rank</th>
                      <th className="py-4 px-6">House</th>
                      <th className="py-4 px-3 text-center">Pld</th>
                      <th className="py-4 px-3 text-center">W</th>
                      <th className="py-4 px-3 text-center">L</th>
                      <th className="py-4 px-3 text-center">T</th>
                      <th className="py-4 px-3 text-center text-amber-300">🥇 Gold</th>
                      <th className="py-4 px-3 text-center text-slate-300">🥈 Sil</th>
                      <th className="py-4 px-3 text-center text-amber-500">🥉 Brz</th>
                      <th className="py-4 px-4 text-center">Fair Play</th>
                      <th className="py-4 px-4 text-center">Form</th>
                      <th className="py-4 px-6 text-right">Total Pts</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs font-medium divide-y divide-[#e2e7ff]">
                    {STANDINGS_DATA.map((house) => (
                      <tr
                        key={house.code}
                        onClick={() => setSelectedHouse(house)}
                        className="hover:bg-[#f2f3ff] transition-colors cursor-pointer group"
                      >
                        <td className="py-4 px-4 text-center">
                          <span
                            className={`inline-flex items-center justify-center w-7 h-7 rounded-lg font-manrope font-black text-xs ${
                              house.rank === 1
                                ? 'bg-[#ba1a1a] text-white'
                                : house.rank === 2
                                ? 'bg-[#0051d5] text-white'
                                : house.rank === 3
                                ? 'bg-[#eb6905] text-white'
                                : 'bg-[#e2e7ff] text-[#45464f]'
                            }`}
                          >
                            0{house.rank}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <span
                              className={`w-9 h-9 rounded-lg ${house.badgeBg} ${house.textColor} flex items-center justify-center font-manrope font-black text-sm`}
                            >
                              {house.code}
                            </span>
                            <div>
                              <strong className="font-manrope text-base font-extrabold uppercase text-[#000f3f] block leading-tight group-hover:text-[#0051d5] transition-colors">
                                {house.name}
                              </strong>
                              <span className="text-[11px] text-[#45464f]">
                                {house.colorName} • Capt. {house.captain}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-3 text-center font-bold text-[#000f3f]">{house.played}</td>
                        <td className="py-4 px-3 text-center font-bold text-emerald-700">{house.won}</td>
                        <td className="py-4 px-3 text-center font-bold text-[#ba1a1a]">{house.lost}</td>
                        <td className="py-4 px-3 text-center text-[#45464f]">{house.tied}</td>
                        <td className="py-4 px-3 text-center font-black text-[#000f3f]">{house.gold}</td>
                        <td className="py-4 px-3 text-center font-bold text-[#45464f]">{house.silver}</td>
                        <td className="py-4 px-3 text-center font-bold text-[#45464f]">{house.bronze}</td>
                        <td className="py-4 px-4 text-center font-mono font-bold text-[#0051d5]">
                          {house.fairPlayScore}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            {house.recentForm.map((f, i) => (
                              <span
                                key={i}
                                className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-black font-mono ${
                                  f === 'W'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : f === 'L'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-slate-100 text-slate-800'
                                }`}
                              >
                                {f}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <span className="font-manrope text-xl font-black text-[#000f3f]">
                            {house.totalPoints}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* SECTION 3: SPORT-WISE POINTS MATRIX (BY DISCIPLINE)      */}
        {/* ======================================================== */}
        <section className="w-full py-8 bg-[#f2f3ff] border-t border-[#e2e7ff]">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-3 h-8 bg-[#0051d5] rounded-full" />
                <div>
                  <span className="text-xs uppercase tracking-widest text-[#0051d5] font-extrabold font-manrope">
                    DISCIPLINE MATRIX
                  </span>
                  <h3 className="font-manrope text-2xl sm:text-3xl font-extrabold text-[#000f3f] uppercase">
                    Points Breakdown by Sport
                  </h3>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-[#e2e7ff] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-[#e2e7ff] text-[#000f3f] text-xs uppercase font-extrabold font-manrope">
                      <th className="py-3 px-6">Discipline</th>
                      <th className="py-3 px-4 text-center text-[#ba1a1a]">DOM</th>
                      <th className="py-3 px-4 text-center text-[#0051d5]">MAV</th>
                      <th className="py-3 px-4 text-center text-[#eb6905]">ALP</th>
                      <th className="py-3 px-4 text-center text-[#000f3f]">SPA</th>
                      <th className="py-3 px-4 text-center text-[#783200]">PHX</th>
                      <th className="py-3 px-6 text-right">Top Performer</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs divide-y divide-[#e2e7ff]">
                    {SPORT_POINTS_MATRIX.map((row, idx) => (
                      <tr key={idx} className="hover:bg-[#faf8ff] transition-colors">
                        <td className="py-3.5 px-6 font-bold text-[#000f3f] font-manrope">
                          {row.sport}
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono font-bold">{row.DOM}</td>
                        <td className="py-3.5 px-4 text-center font-mono font-bold">{row.MAV}</td>
                        <td className="py-3.5 px-4 text-center font-mono font-bold">{row.ALP}</td>
                        <td className="py-3.5 px-4 text-center font-mono font-bold">{row.SPA}</td>
                        <td className="py-3.5 px-4 text-center font-mono font-bold">{row.PHX}</td>
                        <td className="py-3.5 px-6 text-right">
                          <span className="px-2 py-0.5 rounded bg-[#dae2fd] text-[#000f3f] font-bold text-[10px] font-manrope uppercase">
                            {row.DOM >= row.MAV && row.DOM >= row.ALP
                              ? 'Dominators'
                              : row.MAV >= row.ALP
                              ? 'Mavericks'
                              : 'Alphas'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* HOUSE MODAL */}
      {selectedHouse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative border border-[#e2e7ff]">
            <button
              onClick={() => setSelectedHouse(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-[#f2f3ff] hover:bg-[#e2e7ff] text-[#45464f] hover:text-[#000f3f] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4 mb-6">
              <span
                className={`w-14 h-14 rounded-xl ${selectedHouse.badgeBg} ${selectedHouse.textColor} flex items-center justify-center font-manrope font-black text-2xl shadow-sm`}
              >
                {selectedHouse.code}
              </span>
              <div>
                <h3 className="font-manrope text-2xl font-black text-[#000f3f] uppercase">
                  {selectedHouse.name}
                </h3>
                <span className="text-xs text-[#0051d5] font-bold font-manrope uppercase">
                  Rank #{selectedHouse.rank} • {selectedHouse.totalPoints} Points
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 p-4 bg-[#f2f3ff] rounded-xl mb-6 text-xs border border-[#e2e7ff]">
              <div>
                <span className="text-[#45464f]">Captain:</span>
                <p className="font-bold text-[#000f3f] mt-0.5">{selectedHouse.captain}</p>
              </div>
              <div>
                <span className="text-[#45464f]">Peak Win Rate:</span>
                <p className="font-bold text-emerald-700 mt-0.5">{selectedHouse.winRate}</p>
              </div>
              <div>
                <span className="text-[#45464f]">Fair Play Rating:</span>
                <p className="font-bold text-[#0051d5] mt-0.5">{selectedHouse.fairPlayScore} / 10</p>
              </div>
              <div>
                <span className="text-[#45464f]">Bonus Earned:</span>
                <p className="font-bold text-[#eb6905] mt-0.5">+{selectedHouse.bonusPoints} Pts</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/houses"
                onClick={() => setSelectedHouse(null)}
                className="flex-1 py-3 rounded-xl bg-[#000f3f] hover:bg-[#0051d5] text-white text-xs font-bold uppercase tracking-wider text-center transition-colors font-manrope"
              >
                Inspect House Roster
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
    </div>
  );
}
