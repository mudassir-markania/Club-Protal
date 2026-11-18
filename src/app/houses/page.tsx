'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import PublicNavbar from '@/components/public/PublicNavbar';
import {
  Shield,
  Users,
  Trophy,
  Medal,
  Flame,
  Zap,
  ArrowRight,
  ChevronRight,
  X,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

interface HouseDetail {
  id: string;
  rank: number;
  name: string;
  code: string;
  accentColor: string;
  badgeBg: string;
  textColor: string;
  points: number;
  mascot: string;
  squadSize: number;
  fortress: string;
  streak: string;
  motto: string;
  battleChant: string;
  captain: {
    name: string;
    sport: string;
    year: string;
  };
  narrative: string;
  heroImage: string;
  athletes: {
    name: string;
    sport: string;
    role: string;
    status: 'Active' | 'Captain' | 'Vice Captain';
  }[];
}

const HOUSES_FULL_DATA: HouseDetail[] = [
  {
    id: 'dominators',
    rank: 1,
    name: 'Dominators',
    code: 'DOM',
    accentColor: '#ba1a1a',
    badgeBg: 'bg-[#ffdad6]',
    textColor: 'text-[#ba1a1a]',
    points: 450,
    mascot: 'The Red Legion • Bull Mascot',
    squadSize: 72,
    fortress: 'Football / Track',
    streak: '14 Match Streak',
    motto: 'Power Through Precision',
    battleChant: 'Crimson wave, break the cage!',
    captain: {
      name: 'Rohit Deshmukh',
      sport: 'Football • Senior Striker',
      year: 'Final Year ME',
    },
    narrative:
      'Reigning champions for three consecutive seasons, the Dominators bring an unrelenting physical tempo. Their ground dominance in Football and 400m relays anchors their lead on the overall points table. Known for military-like drills led by Deshmukh.',
    heroImage:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD2hezt5BjzBRFF05UV7ls00v9nv5wXNofhVA5yteG5diT3tugcdmyiwpAyWv-WZsVmPCTOwGBkFogv-yIA2vCzpmNGw3NpNUfDLloXSRTsRZLXFxxfTxvzWtsIkU49H_4BJiLX38wf3yUC7-DTrtjJYXtWtFCn0KJQxr4lrFcJA19k5XDL1T8Hsg_v_5c8yQIGSRQRhJ1snuC88bMlfMaJ5cTE6QBY6ytXJyXytJyQ',
    athletes: [
      { name: 'Rohit Deshmukh', sport: 'Football', role: 'Striker / Goalkeeper', status: 'Captain' },
      { name: 'Kunal Patil', sport: 'Football', role: 'Center Back', status: 'Vice Captain' },
      { name: 'Dev Malhotra', sport: 'Athletics', role: '100m Sprinter', status: 'Active' },
      { name: 'Aakash Verma', sport: 'Cricket T10', role: 'Pace Bowler', status: 'Active' },
      { name: 'Tanvi Gokhale', sport: 'Badminton', role: 'Singles Seed #1', status: 'Active' },
      { name: 'Samar Singhania', sport: 'Basketball', role: 'Center', status: 'Active' },
    ],
  },
  {
    id: 'mavericks',
    rank: 2,
    name: 'Mavericks',
    code: 'MAV',
    accentColor: '#0051d5',
    badgeBg: 'bg-[#dbe1ff]',
    textColor: 'text-[#0051d5]',
    points: 415,
    mascot: 'Cobalt Squadron • Falcon Mascot',
    squadSize: 68,
    fortress: 'Cricket / Basketball',
    streak: 'Record High Runs',
    motto: 'Defy The Ordinary',
    battleChant: 'Blue skies roar, blue sky strike!',
    captain: {
      name: 'Aryan Sharma',
      sport: 'Cricket • All-Rounder',
      year: 'Third Year CSE',
    },
    narrative:
      'The aerial tacticians of Apex Arena. The Mavericks lean heavily into tactical fast breaks on the hardwood and high run-rate aggression in Cricket T10. Aryan Sharma’s leadership has bridged junior prodigies with veteran collegiate seniors into a lethal unit.',
    heroImage:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCWIWlsIPqevz4HD46QenroRW9JQopH9hrHdO4mA22Vk8f2HxiDWNMNIzYoy_OVi5L9THK3KTaxnFWA7D9D4SWXV98CSUX4h3ATMRroTp_bZfpqpasdunrg1GQVrHpNyM20kpIPuQqc4jLEyfSwQbZerm--fq6XNCa8a0_SDGFD1meouyoW0ozQQQK1P582fx2rSOvruv-uhxoLvimrf6HF_kEJipIA9-YXq6bhM20U',
    athletes: [
      { name: 'Aryan Sharma', sport: 'Cricket T10', role: 'All-Rounder', status: 'Captain' },
      { name: 'Harsh Vardhan', sport: 'Basketball', role: 'Point Guard', status: 'Vice Captain' },
      { name: 'Rishabh Sen', sport: 'Cricket T10', role: 'Opening Batsman', status: 'Active' },
      { name: 'Pooja Hegde', sport: 'Badminton', role: 'Mixed Doubles', status: 'Active' },
      { name: 'Manish Kumar', sport: 'Football', role: 'Winger', status: 'Active' },
      { name: 'Zoya Khan', sport: 'BGMI Esports', role: 'IGL / Fragger', status: 'Active' },
    ],
  },
  {
    id: 'alphas',
    rank: 3,
    name: 'Alphas',
    code: 'ALP',
    accentColor: '#eb6905',
    badgeBg: 'bg-[#ffdbca]',
    textColor: 'text-[#eb6905]',
    points: 380,
    mascot: 'Golden Monarchs • Lion Mascot',
    squadSize: 65,
    fortress: 'Racquet Sports / Chess',
    streak: 'Undefeated in TT',
    motto: 'Born To Conquer',
    battleChant: 'Gold in heart, gold in play!',
    captain: {
      name: 'Vikramaditya Singh',
      sport: 'Badminton • National Seed',
      year: 'Final Year ECE',
    },
    narrative:
      'Masters of strategic warfare. Dominating individual bracket events and indoor athletics, the Alphas boast undisputed records in Blitz Chess and Badminton singles, combining surgical court positioning with relentless stamina.',
    heroImage:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDYXCIdNG-nT14M423btXvJzXDhumFzOoGCOS-MUbhvU05K5AJjMijYBgApjQMaqIVmQv_oDyAaojUWxG4HfXfvGYjSaGhfg1KdKXQbUE68zJrKYlkfwtqQJXkrAxpBJi5YftSX9ZlaPbaNnGe5G4fWP5ejAuLVcQNDotnRK2s0-mVjOj_gWwrRKLQwUcOW18IhTZ0IhbgY8O-wf19stZMp_aiPOudhV9IaiKx6wF2d',
    athletes: [
      { name: 'Vikramaditya Singh', sport: 'Badminton', role: 'Singles Seed #1', status: 'Captain' },
      { name: 'Riddhi Sen', sport: 'Badminton', role: 'Women’s Singles', status: 'Vice Captain' },
      { name: 'Pranav Jha', sport: 'Table Tennis', role: 'Singles Champ', status: 'Active' },
      { name: 'Aditi Rao', sport: 'Blitz Chess', role: 'Board 1 Master', status: 'Active' },
      { name: 'Farhan Ali', sport: 'Football', role: 'Midfield Playmaker', status: 'Active' },
      { name: 'Sanya Mirza', sport: 'Athletics', role: 'Relay Anchor', status: 'Active' },
    ],
  },
  {
    id: 'spartans',
    rank: 4,
    name: 'Spartans',
    code: 'SPA',
    accentColor: '#000f3f',
    badgeBg: 'bg-[#dae2fd]',
    textColor: 'text-[#000f3f]',
    points: 320,
    mascot: 'Emerald Vanguard • Spartan Helmet',
    squadSize: 64,
    fortress: 'Track & Field / Relays',
    streak: 'Record 4x100m Time',
    motto: 'Unbroken. Unshaken.',
    battleChant: 'Shield to shield, iron will!',
    captain: {
      name: 'Devendra Nair',
      sport: 'Track & Field • Decathlete',
      year: 'Third Year Civil',
    },
    narrative:
      'The stamina engine of the university. Built on iron discipline and high aerobic endurance, Spartans dominate long-distance heats, shot-put, and fiercely contest table tennis doubles.',
    heroImage:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuATP42Sfu3lffWOxOPFEGm1S_9k8tfnGu_z0HEjaERDGY0NtQRoPDozZja1mdCqEyYdVf2F849G2NiXvKDCw9K7KEExLkxN982wUQ0vf_GIBO9qrW2AWrXknjlfq9EmVWOoOUws587WQ_ufk9PIrK1vI4CcCw6UR4E5P-72SgfZpBxGFZOcdh3VqhXLV4WCqMbX0JabrfgxJcP_PjqWfp8Aok2Fq1bxVV7hPSx3GO6L',
    athletes: [
      { name: 'Devendra Nair', sport: 'Athletics', role: 'Decathlon / Relays', status: 'Captain' },
      { name: 'Tanmay Joshi', sport: 'Table Tennis', role: 'Doubles Ace', status: 'Vice Captain' },
      { name: 'Gaurav Gill', sport: 'Cricket T10', role: 'Middle Order', status: 'Active' },
      { name: 'Megha Nair', sport: 'Basketball', role: 'Power Forward', status: 'Active' },
      { name: 'Arvind Swamy', sport: 'Football', role: 'Sweeper Keeper', status: 'Active' },
      { name: 'Rohit K.', sport: 'Esports', role: 'Sniper', status: 'Active' },
    ],
  },
  {
    id: 'phoenix',
    rank: 5,
    name: 'Phoenix',
    code: 'PHX',
    accentColor: '#783200',
    badgeBg: 'bg-[#ffdbca]',
    textColor: 'text-[#783200]',
    points: 290,
    mascot: 'Solar Legion • Firebird Mascot',
    squadSize: 60,
    fortress: 'Esports / Volleyball',
    streak: 'WWCD Record Holders',
    motto: 'Rise Above All',
    battleChant: 'From the ashes, we ignite!',
    captain: {
      name: 'Kabir Mehta',
      sport: 'Basketball • Point Guard',
      year: 'Second Year AI/DS',
    },
    narrative:
      'The youngest and most volatile franchise. Unpredictable in fast-break offensive sets and tactical esports drops, Phoenix routinely causes marquee upsets against the top two seeds.',
    heroImage:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAYgHttvkcX2GSBqMH7qDXIXjYFRis-CkG6x5RDFd3GFuBWpIzt_EKbjvSMgvjlxLuYpWP2mSRvnL08kYqR6kU8563xCiTz3R8QdH8MoO-MlJM7u6XxejdweTTxlkylbYLP0rfpNp1d3yumZaMwyDRMT6DJuKhBKlVZaAsSdSzQemlyuo8Ew9PQI6c1Wkg2b80TF0Kk1mW_AaDX4jhNRcXwnX3uE1CZ93xu9wPUZ04S',
    athletes: [
      { name: 'Kabir Mehta', sport: 'Basketball', role: 'Point Guard', status: 'Captain' },
      { name: 'Sahil Ansari', sport: 'BGMI Esports', role: 'Assaulter / Scout', status: 'Vice Captain' },
      { name: 'Priya Sharma', sport: 'Badminton', role: 'Mixed Doubles', status: 'Active' },
      { name: 'Naveen Raj', sport: 'Football', role: 'Fullback', status: 'Active' },
      { name: 'Kiran Deep', sport: 'Blitz Chess', role: 'Board 2 Master', status: 'Active' },
      { name: 'Shreya Roy', sport: 'Table Tennis', role: 'Singles', status: 'Active' },
    ],
  },
];

export default function HousesPage() {
  const [selectedHouse, setSelectedHouse] = useState<HouseDetail | null>(null);

  const scrollToHouse = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-[#faf8ff] text-[#131b2e] font-inter text-[15px] antialiased selection:bg-[#0051d5] selection:text-white min-h-screen">
      <PublicNavbar activeOverride="houses" />

      <main className="w-full pt-20 pb-20">
        {/* ======================================================== */}
        {/* TOP HERO HEADER                                          */}
        {/* ======================================================== */}
        <section className="w-full bg-[#000f3f] text-white py-12 lg:py-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#000f3f] via-[#172554] to-[#000f3f] opacity-90" />
          <div className="absolute -right-24 -top-24 w-96 h-96 bg-[#0051d5]/20 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 relative z-10 flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <span className="text-xs uppercase tracking-widest text-[#dbe1ff] font-extrabold font-manrope">
                REGIMENTAL CRESTS &amp; ATHLETIC CONTENDERS • APL S9
              </span>
              <h1 className="font-manrope text-4xl sm:text-6xl font-black uppercase tracking-tight text-white leading-none">
                HOUSE DIRECTORY &amp; CRESTS
              </h1>
              <p className="text-sm sm:text-base text-[#b7c4fd] max-w-3xl leading-relaxed mt-1">
                Five Houses. Bound by Tradition. Driven by Victory. Explore the captains, athlete rosters, historical fortresses, and battle anthems across the collegiate championship.
              </p>
            </div>

            {/* Quick KPI stats */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-white/10 border border-white/15 text-xs font-bold font-manrope">
                <span className="text-[#eb6905] text-base font-black">5</span>
                <span className="text-[#dce1ff]">Competing Houses</span>
              </div>
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-white/10 border border-white/15 text-xs font-bold font-manrope">
                <span className="text-white text-base font-black">300+</span>
                <span className="text-[#dce1ff]">Varsity Athletes</span>
              </div>
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-white/10 border border-white/15 text-xs font-bold font-manrope">
                <span className="text-[#dbe1ff] text-base font-black">1</span>
                <span className="text-[#dce1ff]">Inter-House Crown</span>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* QUICK JUMP NAVIGATION BAR                                 */}
        {/* ======================================================== */}
        <section className="w-full bg-white py-3 shadow-xs border-b border-[#e2e7ff] sticky top-20 z-40">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 flex items-center justify-between gap-4 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-[#45464f] uppercase font-bold font-manrope mr-1">
                Jump to House:
              </span>
              {HOUSES_FULL_DATA.map((h) => (
                <button
                  key={h.id}
                  onClick={() => scrollToHouse(h.id)}
                  className="px-3.5 py-1.5 rounded-lg bg-[#f2f3ff] hover:bg-[#000f3f] hover:text-white transition-colors text-xs uppercase font-extrabold font-manrope text-[#000f3f] flex items-center gap-2 shrink-0 cursor-pointer"
                >
                  <span className={`w-2 h-2 rounded-full ${h.badgeBg} border`} />
                  {h.name}
                </button>
              ))}
            </div>

            <a
              href="#stats-matrix"
              className="hidden md:inline-flex px-3.5 py-1.5 rounded-lg bg-[#000f3f] hover:bg-[#0051d5] text-white text-xs uppercase font-bold font-manrope transition-colors shrink-0"
            >
              Compare Attributes
            </a>
          </div>
        </section>

        {/* ======================================================== */}
        {/* EDITORIAL HOUSE SHOWCASE CARDS (5 MAJOR FRANCHISES)       */}
        {/* ======================================================== */}
        <section className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 py-12 flex flex-col gap-10">
          {HOUSES_FULL_DATA.map((house) => (
            <article
              key={house.id}
              id={house.id}
              className="w-full bg-white rounded-2xl shadow-sm border border-[#e2e7ff] overflow-hidden group scroll-mt-36"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[460px]">
                {/* Visual & Mascot Hero Column */}
                <div className="lg:col-span-5 relative bg-[#000f3f] flex flex-col justify-between p-6 sm:p-8 text-white overflow-hidden">
                  <div
                    className="absolute inset-0 bg-cover bg-center opacity-35 group-hover:scale-105 transition-transform duration-700"
                    style={{ backgroundImage: `url('${house.heroImage}')` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#000f3f] via-[#000f3f]/60 to-transparent" />

                  <div className="relative z-10 flex items-center justify-between">
                    <span
                      className={`px-3 py-1 rounded-full ${house.badgeBg} ${house.textColor} text-xs uppercase font-black tracking-widest flex items-center gap-1.5 font-manrope`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${house.badgeBg} animate-ping`} />
                      Rank {house.rank} • {house.points} PTS
                    </span>
                    <span className="font-manrope text-5xl font-black text-white/20 select-none">
                      0{house.rank}
                    </span>
                  </div>

                  <div className="relative z-10 flex flex-col gap-1.5 mt-20">
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-2xl text-[#ffdbca]">
                        shield
                      </span>
                      <span className="text-xs uppercase tracking-widest text-[#dce1ff] font-bold font-manrope">
                        {house.mascot}
                      </span>
                    </div>
                    <h2 className="font-manrope text-4xl sm:text-5xl font-black uppercase text-white leading-none">
                      {house.name}
                    </h2>
                    <p className="text-sm uppercase tracking-wider text-[#ffdbca] italic font-semibold">
                      &ldquo;{house.motto}&rdquo;
                    </p>
                  </div>
                </div>

                {/* Roster, Captain & Metrics Column */}
                <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between gap-6 bg-white">
                  {/* Quick Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-[#f2f3ff] p-4 rounded-xl border border-[#e2e7ff] flex flex-col">
                      <span className="text-[10px] text-[#45464f] uppercase tracking-wider font-bold font-manrope">
                        Captain
                      </span>
                      <span className="font-manrope text-base font-extrabold text-[#000f3f] mt-1">
                        {house.captain.name}
                      </span>
                      <span className="text-xs text-[#45464f]">{house.captain.sport}</span>
                    </div>

                    <div className="bg-[#f2f3ff] p-4 rounded-xl border border-[#e2e7ff] flex flex-col">
                      <span className="text-[10px] text-[#45464f] uppercase tracking-wider font-bold font-manrope">
                        Squad Strength
                      </span>
                      <span className="font-manrope text-base font-extrabold text-[#000f3f] mt-1">
                        {house.squadSize} Athletes
                      </span>
                      <span className="text-xs text-[#0051d5] font-semibold">Full Roster Filled</span>
                    </div>

                    <div className="bg-[#f2f3ff] p-4 rounded-xl border border-[#e2e7ff] flex flex-col">
                      <span className="text-[10px] text-[#45464f] uppercase tracking-wider font-bold font-manrope">
                        Core Fortresses
                      </span>
                      <span className="font-manrope text-base font-extrabold text-[#000f3f] mt-1">
                        {house.fortress}
                      </span>
                      <span className="text-xs text-[#45464f]">{house.streak}</span>
                    </div>
                  </div>

                  {/* Narrative */}
                  <div className="flex flex-col gap-1">
                    <span className="text-xs uppercase tracking-wider text-[#000f3f] font-bold font-manrope">
                      House Heraldry &amp; Season Narrative
                    </span>
                    <p className="text-xs sm:text-sm text-[#45464f] leading-relaxed">
                      {house.narrative}
                    </p>
                  </div>

                  {/* Battle Chant Strip & Action */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 bg-[#f2f3ff] rounded-xl p-4 border border-[#e2e7ff]">
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <div className="w-10 h-10 rounded-lg bg-[#000f3f] flex items-center justify-center text-white shrink-0">
                        <span className="material-symbols-outlined text-xl">military_tech</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase text-[#45464f] font-bold font-manrope">
                          Official Battle Chant
                        </span>
                        <span className="text-xs sm:text-sm font-bold text-[#000f3f] italic">
                          &ldquo;{house.battleChant}&rdquo;
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedHouse(house)}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-[#000f3f] hover:bg-[#0051d5] text-white text-xs uppercase tracking-wider font-bold transition-colors shrink-0 shadow-xs flex items-center justify-center gap-2 font-manrope cursor-pointer"
                    >
                      <span>Inspect Roster</span>
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </section>

        {/* ======================================================== */}
        {/* COMPARATIVE ATTRIBUTES MATRIX                             */}
        {/* ======================================================== */}
        <section id="stats-matrix" className="w-full py-12 bg-[#f2f3ff] border-t border-[#e2e7ff]">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-3 h-8 bg-[#0051d5] rounded-full" />
                <div>
                  <span className="text-xs uppercase tracking-widest text-[#0051d5] font-extrabold font-manrope">
                    HEAD-TO-HEAD COMPARISON
                  </span>
                  <h3 className="font-manrope text-2xl sm:text-3xl font-extrabold text-[#000f3f] uppercase">
                    House Attributes &amp; Core Strengths
                  </h3>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-[#e2e7ff] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-[#000f3f] text-white text-xs uppercase font-extrabold font-manrope">
                      <th className="py-4 px-6">House</th>
                      <th className="py-4 px-4 text-center">Rank</th>
                      <th className="py-4 px-4 text-center">Points</th>
                      <th className="py-4 px-4 text-center">Athletes</th>
                      <th className="py-4 px-6">Dominant Discipline</th>
                      <th className="py-4 px-6">Leadership</th>
                      <th className="py-4 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs divide-y divide-[#e2e7ff]">
                    {HOUSES_FULL_DATA.map((h) => (
                      <tr key={h.id} className="hover:bg-[#faf8ff] transition-colors">
                        <td className="py-4 px-6">
                          <strong className="font-manrope text-sm font-extrabold uppercase text-[#000f3f]">
                            {h.name}
                          </strong>
                        </td>
                        <td className="py-4 px-4 text-center font-manrope font-bold text-[#0051d5]">
                          0{h.rank}
                        </td>
                        <td className="py-4 px-4 text-center font-manrope font-black text-sm text-[#000f3f]">
                          {h.points}
                        </td>
                        <td className="py-4 px-4 text-center font-mono">{h.squadSize}</td>
                        <td className="py-4 px-6 font-semibold text-[#000f3f]">{h.fortress}</td>
                        <td className="py-4 px-6 text-[#45464f]">{h.captain.name}</td>
                        <td className="py-4 px-4 text-right">
                          <button
                            onClick={() => setSelectedHouse(h)}
                            className="px-3 py-1 rounded bg-[#f2f3ff] hover:bg-[#000f3f] hover:text-white text-[#000f3f] text-[11px] uppercase font-bold font-manrope transition-colors cursor-pointer"
                          >
                            Roster
                          </button>
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

      {/* ROSTER MODAL */}
      {selectedHouse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative border border-[#e2e7ff] max-h-[90vh] overflow-y-auto">
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
                <div className="flex items-center gap-2">
                  <h3 className="font-manrope text-2xl font-black text-[#000f3f] uppercase">
                    {selectedHouse.name} Varsity Roster
                  </h3>
                </div>
                <span className="text-xs text-[#0051d5] font-bold font-manrope uppercase">
                  {selectedHouse.squadSize} Registered Athletes • {selectedHouse.points} Championship Points
                </span>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <span className="text-xs uppercase font-extrabold text-[#000f3f] font-manrope block">
                Lead Competitors &amp; Squad Roster
              </span>
              <div className="divide-y divide-[#e2e7ff] border border-[#e2e7ff] rounded-xl overflow-hidden bg-[#faf8ff]">
                {selectedHouse.athletes.map((ath, idx) => (
                  <div key={idx} className="p-3 sm:p-4 flex items-center justify-between text-xs bg-white">
                    <div>
                      <strong className="font-manrope text-sm font-bold text-[#000f3f] block">
                        {ath.name}
                      </strong>
                      <span className="text-[11px] text-[#45464f]">
                        {ath.sport} • {ath.role}
                      </span>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded text-[10px] font-black uppercase font-manrope ${
                        ath.status === 'Captain'
                          ? 'bg-[#000f3f] text-white'
                          : ath.status === 'Vice Captain'
                          ? 'bg-[#0051d5] text-white'
                          : 'bg-[#f2f3ff] text-[#45464f]'
                      }`}
                    >
                      {ath.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/schedule"
                onClick={() => setSelectedHouse(null)}
                className="flex-1 py-3 rounded-xl bg-[#000f3f] hover:bg-[#0051d5] text-white text-xs font-bold uppercase tracking-wider text-center transition-colors font-manrope"
              >
                View Next Fixtures for {selectedHouse.name}
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
