'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import PublicNavbar from '@/components/public/PublicNavbar';
import PublicFooter from '@/components/public/PublicFooter';
import { Scale, Calculator, ShieldCheck, CheckCircle2, Trophy, ArrowRight } from 'lucide-react';

const HOUSES_LIST = [
  { code: 'ALP', name: 'Alpha', color: '#2563EB' },
  { code: 'CRW', name: 'Crown Crushers', color: '#D97706' },
  { code: 'DOM', name: 'Dominator', color: '#DC2626' },
  { code: 'MAV', name: 'Mavericks', color: '#059669' },
  { code: 'RYL', name: 'Royal Force', color: '#7C3AED' },
];

export default function PointsRulesPage() {
  // Interactive Simulator State
  const [selectedHouses, setSelectedHouses] = useState<string[]>(['ALP', 'MAV', 'DOM', 'MAV']); // 4 players, 3 unique houses
  const [rawPoints, setRawPoints] = useState<number>(100);

  const toggleHouseInSquad = (code: string) => {
    if (selectedHouses.length >= 6) return;
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
  const totalBase = (Number(baseSplit) * uniqueCount);
  const remainder = Number((rawPoints - totalBase).toFixed(2));

  return (
    <div className="min-h-screen bg-[#0A0D14] text-[#EDEDED] flex flex-col selection:bg-[#C6A04A] selection:text-[#0A0D14] antialiased">
      <PublicNavbar activeOverride="rules" />

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-8 space-y-10">
        {/* Page Header */}
        <div className="border-b border-white/[0.08] pb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs text-[#C6A04A] mb-3">
            <Scale className="w-3.5 h-3.5" />
            <span>Automated Scoring Protocol</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Unique-Club Equal Division Engine
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-2xl leading-relaxed">
            In multi-squad and open-roster disciplines like BGMI, points earned by a team are divided strictly and equally among the unique houses represented by its squad members, with deterministic remainder rotation.
          </p>
        </div>

        {/* 3 Step Protocol Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-[#141822] border border-white/[0.08] space-y-3">
            <div className="w-8 h-8 rounded-lg bg-[#0A0D14] border border-[#C6A04A]/30 text-[#C6A04A] font-serif font-bold text-sm flex items-center justify-center">
              1
            </div>
            <span className="text-[10px] font-bold text-[#C6A04A] uppercase tracking-wider block">Detection</span>
            <h3 className="font-serif text-lg font-bold text-white">Unique House Identification</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              If a 4-player squad consists of 2 Mavericks, 1 Dominator, and 1 Alpha, the engine filters duplicates and detects exactly <strong>3 unique houses</strong>.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#141822] border border-white/[0.08] space-y-3">
            <div className="w-8 h-8 rounded-lg bg-[#0A0D14] border border-[#C6A04A]/30 text-[#C6A04A] font-serif font-bold text-sm flex items-center justify-center">
              2
            </div>
            <span className="text-[10px] font-bold text-[#C6A04A] uppercase tracking-wider block">Division</span>
            <h3 className="font-serif text-lg font-bold text-white">Equal Point Split</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Points are divided evenly by the number of unique houses represented:
            </p>
            <div className="p-2.5 rounded-lg bg-[#0A0D14] border border-white/[0.06] text-center font-mono text-xs text-[#C6A04A] font-bold">
              100 pts ÷ 3 houses = 33.33 pts each
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#141822] border border-white/[0.08] space-y-3">
            <div className="w-8 h-8 rounded-lg bg-[#0A0D14] border border-emerald-500/30 text-emerald-400 font-serif font-bold text-sm flex items-center justify-center">
              3
            </div>
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">Integrity</span>
            <h3 className="font-serif text-lg font-bold text-white">Deterministic Balance</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Fractional remainders (e.g. +0.01 cent) are rotated deterministically to guarantee 100% mathematical zero-leakage:
            </p>
            <div className="p-2.5 rounded-lg bg-[#0A0D14] border border-white/[0.06] text-center font-mono text-xs text-emerald-400 font-bold">
              33.33 + 33.33 + 33.34 = 100.00
            </div>
          </div>
        </div>

        {/* Interactive Live Protocol Simulator */}
        <div className="rounded-2xl bg-[#141822] border border-white/[0.08] p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.06] pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#0A0D14] border border-[#C6A04A]/30 flex items-center justify-center text-[#C6A04A]">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-serif text-xl font-bold text-white">Live Points Division Simulator</h2>
                <span className="text-xs text-slate-400">Test how squads of various house athletes receive equal championship points</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400">Points Earned:</span>
              <input
                type="number"
                min="10"
                max="1000"
                step="10"
                value={rawPoints}
                onChange={(e) => setRawPoints(Math.max(1, Number(e.target.value)))}
                className="w-24 px-3 py-1.5 rounded-lg bg-[#0A0D14] border border-white/[0.1] text-xs font-mono font-bold text-[#C6A04A] text-center focus:outline-none focus:border-[#C6A04A]"
              />
            </div>
          </div>

          {/* Squad Roster */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white">Current Squad Roster ({selectedHouses.length} Athletes):</span>
              <span className="text-slate-400">Click a badge to remove from squad</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {selectedHouses.map((code, idx) => {
                const house = HOUSES_LIST.find((h) => h.code === code) || HOUSES_LIST[0];
                return (
                  <button
                    key={idx}
                    onClick={() => removePlayerFromSquad(idx)}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold text-white flex items-center gap-2 shadow-xs hover:opacity-80 transition"
                    style={{ backgroundColor: house.color }}
                    title="Click to remove"
                  >
                    <span>Player {idx + 1} ({house.code})</span>
                    <span className="text-[10px] opacity-75">✕</span>
                  </button>
                );
              })}
            </div>

            {/* Add Athlete Buttons */}
            <div className="pt-2 flex items-center gap-2 flex-wrap">
              <span className="text-xs text-slate-400 mr-1">Add Athlete:</span>
              {HOUSES_LIST.map((h) => (
                <button
                  key={h.code}
                  onClick={() => toggleHouseInSquad(h.code)}
                  className="px-2.5 py-1 rounded bg-[#0A0D14] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-semibold text-slate-300 hover:text-white transition"
                >
                  + {h.name} ({h.code})
                </button>
              ))}
            </div>
          </div>

          {/* Calculation Outcome */}
          <div className="p-5 rounded-xl bg-[#0A0D14] border border-[#C6A04A]/30 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div>
                <span className="text-slate-400">Unique Houses Represented: </span>
                <strong className="text-white font-mono text-sm">{uniqueCount} Unique Houses</strong>
                <span className="text-slate-500 ml-2">({uniqueHouses.join(', ')})</span>
              </div>
              <div>
                <span className="text-slate-400">Calculation: </span>
                <strong className="text-[#C6A04A] font-mono">{rawPoints} pts ÷ {uniqueCount} houses</strong>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
              {uniqueHouses.map((code, idx) => {
                const house = HOUSES_LIST.find((h) => h.code === code) || HOUSES_LIST[0];
                const housePoints = idx === 0 ? (Number(baseSplit) + remainder).toFixed(2) : Number(baseSplit).toFixed(2);
                return (
                  <div
                    key={code}
                    className="p-3.5 rounded-lg bg-[#141822] border border-white/[0.06] flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-md flex items-center justify-center font-bold text-xs text-white" style={{ backgroundColor: house.color }}>
                        {code}
                      </div>
                      <span className="font-serif font-bold text-xs text-white">{house.name}</span>
                    </div>
                    <span className="font-mono font-bold text-sm text-[#C6A04A]">
                      +{housePoints} pts
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Standard Championship Points Table */}
        <div className="rounded-2xl bg-[#141822] border border-white/[0.08] p-6 space-y-4">
          <h2 className="font-serif text-lg font-bold text-white">Championship Points Allotment by Discipline</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#0A0D14] text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-white/[0.08]">
                <tr>
                  <th className="py-3 px-4">Discipline</th>
                  <th className="py-3 px-4 text-center">Format</th>
                  <th className="py-3 px-4 text-right">1st Place</th>
                  <th className="py-3 px-4 text-right">2nd Place</th>
                  <th className="py-3 px-4 text-right">3rd Place</th>
                  <th className="py-3 px-4 text-right">4th Place</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06] font-mono">
                <tr className="hover:bg-white/[0.02]">
                  <td className="py-3 px-4 font-sans font-bold text-white">Cricket</td>
                  <td className="py-3 px-4 text-center text-slate-400 font-sans">Pool & Knockout</td>
                  <td className="py-3 px-4 text-right text-[#C6A04A] font-bold">100.00 pts</td>
                  <td className="py-3 px-4 text-right text-slate-300">70.00 pts</td>
                  <td className="py-3 px-4 text-right text-slate-400">45.00 pts</td>
                  <td className="py-3 px-4 text-right text-slate-500">25.00 pts</td>
                </tr>
                <tr className="hover:bg-white/[0.02]">
                  <td className="py-3 px-4 font-sans font-bold text-white">BGMI (Battle Royale)</td>
                  <td className="py-3 px-4 text-center text-slate-400 font-sans">Squad Matrix</td>
                  <td className="py-3 px-4 text-right text-[#C6A04A] font-bold">75.00 pts</td>
                  <td className="py-3 px-4 text-right text-slate-300">50.00 pts</td>
                  <td className="py-3 px-4 text-right text-slate-400">35.00 pts</td>
                  <td className="py-3 px-4 text-right text-slate-500">20.00 pts</td>
                </tr>
                <tr className="hover:bg-white/[0.02]">
                  <td className="py-3 px-4 font-sans font-bold text-white">Football</td>
                  <td className="py-3 px-4 text-center text-slate-400 font-sans">5-a-side Turf</td>
                  <td className="py-3 px-4 text-right text-[#C6A04A] font-bold">75.00 pts</td>
                  <td className="py-3 px-4 text-right text-slate-300">50.00 pts</td>
                  <td className="py-3 px-4 text-right text-slate-400">35.00 pts</td>
                  <td className="py-3 px-4 text-right text-slate-500">20.00 pts</td>
                </tr>
                <tr className="hover:bg-white/[0.02]">
                  <td className="py-3 px-4 font-sans font-bold text-white">Badminton</td>
                  <td className="py-3 px-4 text-center text-slate-400 font-sans">Sets (21 pts)</td>
                  <td className="py-3 px-4 text-right text-[#C6A04A] font-bold">50.00 pts</td>
                  <td className="py-3 px-4 text-right text-slate-300">35.00 pts</td>
                  <td className="py-3 px-4 text-right text-slate-400">20.00 pts</td>
                  <td className="py-3 px-4 text-right text-slate-500">10.00 pts</td>
                </tr>
                <tr className="hover:bg-white/[0.02]">
                  <td className="py-3 px-4 font-sans font-bold text-white">Table Tennis</td>
                  <td className="py-3 px-4 text-center text-slate-400 font-sans">11-Point Fast Table</td>
                  <td className="py-3 px-4 text-right text-[#C6A04A] font-bold">50.00 pts</td>
                  <td className="py-3 px-4 text-right text-slate-300">35.00 pts</td>
                  <td className="py-3 px-4 text-right text-slate-400">20.00 pts</td>
                  <td className="py-3 px-4 text-right text-slate-500">10.00 pts</td>
                </tr>
                <tr className="hover:bg-white/[0.02]">
                  <td className="py-3 px-4 font-sans font-bold text-white">Carrom</td>
                  <td className="py-3 px-4 text-center text-slate-400 font-sans">White Slam Knockout</td>
                  <td className="py-3 px-4 text-right text-[#C6A04A] font-bold">40.00 pts</td>
                  <td className="py-3 px-4 text-right text-slate-300">25.00 pts</td>
                  <td className="py-3 px-4 text-right text-slate-400">15.00 pts</td>
                  <td className="py-3 px-4 text-right text-slate-500">8.00 pts</td>
                </tr>
                <tr className="hover:bg-white/[0.02]">
                  <td className="py-3 px-4 font-sans font-bold text-white">Chess</td>
                  <td className="py-3 px-4 text-center text-slate-400 font-sans">Rapid & Classical</td>
                  <td className="py-3 px-4 text-right text-[#C6A04A] font-bold">40.00 pts</td>
                  <td className="py-3 px-4 text-right text-slate-300">25.00 pts</td>
                  <td className="py-3 px-4 text-right text-slate-400">15.00 pts</td>
                  <td className="py-3 px-4 text-right text-slate-500">8.00 pts</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}

