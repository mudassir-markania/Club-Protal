'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import PublicNavbar from '@/components/public/PublicNavbar';
import PublicFooter from '@/components/public/PublicFooter';
import { Scale, Calculator, ShieldCheck, CheckCircle2, Trophy, ArrowRight, FileText, Sparkles, Award } from 'lucide-react';

const HOUSES_LIST = [
  { code: 'MAV', name: 'Blue (Mavericks)', color: '#0051d5' },
  { code: 'DOM', name: 'Red (Dominator)', color: '#dc2626' },
  { code: 'ALP', name: 'Green (Alpha)', color: '#16a34a' },
  { code: 'RYL', name: 'Purple (Royal Force)', color: '#7c3aed' },
  { code: 'CRW', name: 'Yellow (Crown Crushers)', color: '#d97706' },
];

export default function PointsRulesPage() {
  // Interactive Simulator State (BGMI Squad Example: 8 pts divided among unique houses)
  const [selectedHouses, setSelectedHouses] = useState<string[]>(['MAV', 'DOM', 'ALP', 'MAV']); // 4 players, 3 unique houses
  const [rawPoints, setRawPoints] = useState<number>(8); // BGMI Match win: 8 pts

  const toggleHouseInSquad = (code: string) => {
    if (selectedHouses.length >= 8) return;
    setSelectedHouses([...selectedHouses, code]);
  };

  const removePlayerFromSquad = (idx: number) => {
    if (selectedHouses.length <= 1) return;
    const next = [...selectedHouses];
    next.splice(idx, 1);
    setSelectedHouses(next);
  };

  // Calculate unique houses
  const uniqueHouses = Array.from(new Set(selectedHouses));
  const uniqueCount = uniqueHouses.length;
  const baseSplit = uniqueCount > 0 ? (rawPoints / uniqueCount).toFixed(2) : '0.00';
  const totalBase = Number(baseSplit) * uniqueCount;
  const remainder = Number((rawPoints - totalBase).toFixed(2));

  return (
    <div className="min-h-screen bg-[#0A0D14] text-[#EDEDED] flex flex-col selection:bg-[#C6A04A] selection:text-[#0A0D14] antialiased">
      <PublicNavbar activeOverride="rules" />

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-8 space-y-10 pt-24">
        {/* Page Header */}
        <div className="border-b border-white/[0.08] pb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs text-[#C6A04A] mb-3">
            <Scale className="w-3.5 h-3.5" />
            <span>Official Scoring Rules • sports_points_distribution.pdf</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Official Points Distribution Engine
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-3xl leading-relaxed">
            Automatic sports point distribution rules. Matches take place on ground, results and award winners are submitted by certified referees, and points are calculated automatically using the exact rules below.
          </p>
        </div>

        {/* 1. Official PDF Tables */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
            <h2 className="font-serif text-xl font-bold text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-[#C6A04A]" />
              <span>1. Official Tournament Scoring Matrix (PDF Specification)</span>
            </h2>
            <span className="text-xs text-slate-400 font-mono">Source of Truth</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Football Card */}
            <div className="rounded-2xl bg-[#141822] border border-white/[0.08] p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-2">
                <h3 className="font-sans font-bold text-white text-base flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>FOOTBALL</span>
                </h3>
                <span className="text-[11px] font-mono text-[#C6A04A] font-bold">4 Rules</span>
              </div>
              <table className="w-full text-xs">
                <thead className="text-[10px] uppercase font-bold text-slate-400 border-b border-white/[0.06]">
                  <tr>
                    <th className="py-2 text-left">Category</th>
                    <th className="py-2 text-right">Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04] font-mono">
                  <tr>
                    <td className="py-2.5 font-sans text-slate-300">Per match win</td>
                    <td className="py-2.5 text-right font-bold text-[#C6A04A]">10 pts</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-sans text-slate-300">Final winner</td>
                    <td className="py-2.5 text-right font-bold text-[#C6A04A]">50 pts</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-sans text-slate-300">Final loser</td>
                    <td className="py-2.5 text-right font-bold text-slate-300">25 pts</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-sans text-slate-300 flex items-center gap-1.5">
                      <span>Top scorer</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 uppercase">Individual</span>
                    </td>
                    <td className="py-2.5 text-right font-bold text-[#C6A04A]">15 pts</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* BGMI Card */}
            <div className="rounded-2xl bg-[#141822] border border-white/[0.08] p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-2">
                <h3 className="font-sans font-bold text-white text-base flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  <span>BGMI (ESPORTS)</span>
                </h3>
                <span className="text-[11px] font-mono text-[#C6A04A] font-bold">5 Rules</span>
              </div>
              <table className="w-full text-xs">
                <thead className="text-[10px] uppercase font-bold text-slate-400 border-b border-white/[0.06]">
                  <tr>
                    <th className="py-2 text-left">Category</th>
                    <th className="py-2 text-right">Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04] font-mono">
                  <tr>
                    <td className="py-2.5 font-sans text-slate-300">Per match win (WWCD)</td>
                    <td className="py-2.5 text-right font-bold text-[#C6A04A]">8 pts</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-sans text-slate-300">Overall winner</td>
                    <td className="py-2.5 text-right font-bold text-[#C6A04A]">20 pts</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-sans text-slate-300">Runner-up</td>
                    <td className="py-2.5 text-right font-bold text-slate-300">12 pts</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-sans text-slate-300 flex items-center gap-1.5">
                      <span>MVP</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 uppercase">Individual</span>
                    </td>
                    <td className="py-2.5 text-right font-bold text-[#C6A04A]">5 pts</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-sans text-slate-300">Third place (if 7 teams participate)</td>
                    <td className="py-2.5 text-right font-bold text-slate-400">8 pts</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Cricket Card (Full width or span-2) */}
            <div className="md:col-span-2 rounded-2xl bg-[#141822] border border-white/[0.08] p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-2">
                <h3 className="font-sans font-bold text-white text-base flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>CRICKET</span>
                </h3>
                <span className="text-[11px] font-mono text-[#C6A04A] font-bold">13 Rules</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                <table className="w-full text-xs">
                  <thead className="text-[10px] uppercase font-bold text-slate-400 border-b border-white/[0.06]">
                    <tr>
                      <th className="py-2 text-left">Category</th>
                      <th className="py-2 text-right">Points</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04] font-mono">
                    <tr>
                      <td className="py-2.5 font-sans text-slate-300">Per match win</td>
                      <td className="py-2.5 text-right font-bold text-[#C6A04A]">10 pts</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-sans text-slate-300">Best batsman — Men</td>
                      <td className="py-2.5 text-right font-bold text-[#C6A04A]">10 pts</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-sans text-slate-300">Best batsman — Women</td>
                      <td className="py-2.5 text-right font-bold text-slate-300">5 pts</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-sans text-slate-300">Best bowler — Men</td>
                      <td className="py-2.5 text-right font-bold text-[#C6A04A]">10 pts</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-sans text-slate-300">Best bowler — Women</td>
                      <td className="py-2.5 text-right font-bold text-slate-300">5 pts</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-sans text-slate-300">Best fielder — Men</td>
                      <td className="py-2.5 text-right font-bold text-[#C6A04A]">10 pts</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-sans text-slate-300">Best fielder — Women</td>
                      <td className="py-2.5 text-right font-bold text-slate-300">5 pts</td>
                    </tr>
                  </tbody>
                </table>

                <table className="w-full text-xs">
                  <thead className="text-[10px] uppercase font-bold text-slate-400 border-b border-white/[0.06]">
                    <tr>
                      <th className="py-2 text-left">Category</th>
                      <th className="py-2 text-right">Points</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04] font-mono">
                    <tr>
                      <td className="py-2.5 font-sans text-slate-300">Most fours</td>
                      <td className="py-2.5 text-right font-bold text-slate-300">5 pts</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-sans text-slate-300">Most sixes</td>
                      <td className="py-2.5 text-right font-bold text-slate-300">5 pts</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-sans text-slate-300">Man of the Tournament — Men</td>
                      <td className="py-2.5 text-right font-bold text-[#C6A04A]">15 pts</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-sans text-slate-300">Man of the Tournament — Women</td>
                      <td className="py-2.5 text-right font-bold text-[#C6A04A]">10 pts</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-sans text-slate-300">Final winner</td>
                      <td className="py-2.5 text-right font-bold text-[#C6A04A]">50 pts</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-sans text-slate-300">Final loser</td>
                      <td className="py-2.5 text-right font-bold text-slate-300">25 pts</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-sans text-slate-300">Third place</td>
                      <td className="py-2.5 text-right font-bold text-slate-300">20 pts</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Badminton & Carrom Matrix */}
            <div className="rounded-2xl bg-[#141822] border border-white/[0.08] p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-2">
                <h3 className="font-sans font-bold text-white text-base flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-500" />
                  <span>BADMINTON / CARROM</span>
                </h3>
                <span className="text-[11px] font-mono text-[#C6A04A] font-bold">Category Matrix</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Applied independently to Badminton and Carrom across official categories:
              </p>
              <table className="w-full text-xs text-left">
                <thead className="text-[10px] uppercase font-bold text-slate-400 border-b border-white/[0.06]">
                  <tr>
                    <th className="py-2">Event Category</th>
                    <th className="py-2 text-right">1st</th>
                    <th className="py-2 text-right">2nd</th>
                    <th className="py-2 text-right">3rd</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04] font-mono">
                  <tr>
                    <td className="py-2 font-sans text-slate-300">Men&apos;s singles / doubles</td>
                    <td className="py-2 text-right font-bold text-[#C6A04A]">10</td>
                    <td className="py-2 text-right text-slate-300">7</td>
                    <td className="py-2 text-right text-slate-400">5</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-sans text-slate-300">Women&apos;s singles / doubles</td>
                    <td className="py-2 text-right font-bold text-[#C6A04A]">10</td>
                    <td className="py-2 text-right text-slate-300">7</td>
                    <td className="py-2 text-right text-slate-400">5</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-sans text-slate-300">Mixed</td>
                    <td className="py-2 text-right font-bold text-[#C6A04A]">20</td>
                    <td className="py-2 text-right text-slate-300">14</td>
                    <td className="py-2 text-right text-slate-400">10</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-sans text-slate-300">MD</td>
                    <td className="py-2 text-right font-bold text-[#C6A04A]">20</td>
                    <td className="py-2 text-right text-slate-300">14</td>
                    <td className="py-2 text-right text-slate-400">10</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-sans text-slate-300">WD</td>
                    <td className="py-2 text-right font-bold text-[#C6A04A]">20</td>
                    <td className="py-2 text-right text-slate-300">14</td>
                    <td className="py-2 text-right text-slate-400">10</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Chess Card */}
            <div className="rounded-2xl bg-[#141822] border border-white/[0.08] p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-2">
                <h3 className="font-sans font-bold text-white text-base flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-500" />
                  <span>CHESS</span>
                </h3>
                <span className="text-[11px] font-mono text-[#C6A04A] font-bold">2 Rules</span>
              </div>
              <table className="w-full text-xs">
                <thead className="text-[10px] uppercase font-bold text-slate-400 border-b border-white/[0.06]">
                  <tr>
                    <th className="py-2 text-left">Category</th>
                    <th className="py-2 text-right">Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04] font-mono">
                  <tr>
                    <td className="py-2.5 font-sans text-slate-300">1st place (Champion)</td>
                    <td className="py-2.5 text-right font-bold text-[#C6A04A]">10 pts</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-sans text-slate-300">2nd place (Runner-up)</td>
                    <td className="py-2.5 text-right font-bold text-slate-300">5 pts</td>
                  </tr>
                </tbody>
              </table>
              <div className="pt-3 border-t border-white/[0.06] text-[11px] text-slate-400">
                Points are credited directly to each athlete&apos;s registered collegiate house upon admin verification.
              </div>
            </div>
          </div>
        </div>

        {/* 2. Interactive Unique-Club Simulator */}
        <div className="rounded-2xl bg-[#141822] border border-white/[0.08] p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
            <div>
              <span className="text-[11px] font-mono text-[#C6A04A] uppercase tracking-wider block">
                MATHEMATICAL ENGINE SIMULATOR
              </span>
              <h2 className="font-serif text-xl font-bold text-white">
                Interactive Unique-Club Division Simulator
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400">Test Points:</span>
              <input
                type="number"
                value={rawPoints}
                onChange={(e) => setRawPoints(Math.max(1, parseFloat(e.target.value) || 0))}
                className="w-20 px-3 py-1.5 rounded-lg bg-[#0A0D14] border border-white/[0.1] text-xs font-mono font-bold text-right text-[#C6A04A] focus:outline-none focus:border-[#C6A04A]"
              />
            </div>
          </div>

          <p className="text-xs text-slate-400">
            Build a mock squad below to witness how the backend divides points equally among unique houses (not by player headcount) with fair remainder rotation.
          </p>

          {/* Squad Roster Editor */}
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
              Current Squad ({selectedHouses.length} Athletes):
            </span>
            <div className="flex flex-wrap gap-2">
              {selectedHouses.map((code, idx) => {
                const h = HOUSES_LIST.find((item) => item.code === code);
                return (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-sans font-bold bg-[#0A0D14] border border-white/[0.1] text-white"
                  >
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: h?.color }} />
                    <span>{h?.name}</span>
                    <button
                      onClick={() => removePlayerFromSquad(idx)}
                      className="ml-1 text-slate-500 hover:text-red-400"
                    >
                      ×
                    </button>
                  </span>
                );
              })}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <span className="text-xs text-slate-500">Add Athlete from House:</span>
              {HOUSES_LIST.map((h) => (
                <button
                  key={h.code}
                  onClick={() => toggleHouseInSquad(h.code)}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 transition"
                >
                  + {h.name.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Calculation Breakdown Result */}
          <div className="p-4 rounded-xl bg-[#0A0D14] border border-white/[0.06] space-y-3 text-xs">
            <div className="flex items-center justify-between text-slate-300">
              <span>Original Points Earned:</span>
              <span className="font-mono font-bold text-[#C6A04A] text-sm">{rawPoints.toFixed(2)} pts</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span>Unique Houses Represented:</span>
              <span className="font-mono font-bold text-white text-sm">{uniqueCount} Unique Houses</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span>Base Share per Unique House:</span>
              <span className="font-mono font-bold text-white">{baseSplit} pts each</span>
            </div>
            {remainder > 0 && (
              <div className="flex items-center justify-between text-amber-400 text-[11px]">
                <span>Deterministic Remainder:</span>
                <span className="font-mono">+{remainder}¢ rotated to first house</span>
              </div>
            )}
            <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between font-bold text-white">
              <span>Sum of Distributed Points:</span>
              <span className="font-mono text-[#C6A04A]">{rawPoints.toFixed(2)} pts (100% Balanced)</span>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
