'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import PublicNavbar from '@/components/public/PublicNavbar';
import PublicFooter from '@/components/public/PublicFooter';
import { SportIcon } from '@/components/ui/icons';
import { Calendar, CheckCircle2, ChevronRight, Trophy } from 'lucide-react';

const INITIAL_SPORTS = [
  { id: 'sport-bgmi', name: 'BGMI', category: 'E-Sports', tournamentFormat: 'Battle Royale 4-Man Squads', description: 'Mixed-house squads competing across multiple maps. Points split evenly among unique represented houses.' },
  { id: 'sport-carrom', name: 'Carrom', category: 'Indoor', tournamentFormat: 'White Slam Knockout', description: 'Traditional board showdown featuring singles and doubles brackets.' },
  { id: 'sport-badminton', name: 'Badminton', category: 'Racquet', tournamentFormat: 'Best of 3 Sets (21 Pts)', description: 'Fast-paced singles and doubles matches played on indoor wooden courts.' },
  { id: 'sport-chess', name: 'Chess', category: 'Mind Sport', tournamentFormat: 'Rapid & Classical FIDE', description: 'Strategic intellectual battles on 64 squares with clock-controlled rounds.' },
  { id: 'sport-tt', name: 'Table Tennis', category: 'Racquet', tournamentFormat: '11-Point Fast Table', description: 'High-speed table tennis singles and doubles with sudden death deuce rules.' },
  { id: 'sport-cricket', name: 'Cricket', category: 'Field Sport', tournamentFormat: '10 Teams • 2 Pools • Super 4', description: 'Main championship centerpiece with 10 franchise teams competing for the trophy.' },
  { id: 'sport-football', name: 'Football', category: 'Field Sport', tournamentFormat: '5-a-side Turf League', description: 'Intense 5-a-side football on synthetic turf with group stage and finals.' },
];

export default function SportsPage() {
  const [sports, setSports] = useState<any[]>(INITIAL_SPORTS);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState('');

  useEffect(() => {
    fetchSports();
    setLastRefreshed(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  }, []);

  const fetchSports = async () => {
    try {
      const res = await fetch('/api/public/overview');
      if (res.ok) {
        const json = await res.json();
        if (json.sports && json.sports.length > 0) {
          setSports(json.sports);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchSports();
    setLastRefreshed(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  };

  const categories = ['ALL', 'Field Sport', 'Racquet', 'Indoor', 'E-Sports', 'Mind Sport'];

  const filteredSports = selectedCategory === 'ALL'
    ? sports
    : sports.filter((s) => s.category?.toLowerCase() === selectedCategory.toLowerCase());

  return (
    <div className="min-h-screen bg-[#0A0D14] text-[#EDEDED] flex flex-col selection:bg-[#C6A04A] selection:text-[#0A0D14] antialiased">
      <PublicNavbar onRefresh={handleRefresh} refreshing={refreshing} lastUpdated={lastRefreshed} activeOverride="sports" />

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-8 space-y-8">
        {/* Header */}
        <div className="border-b border-white/[0.08] pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs text-[#C6A04A] mb-3">
              <Trophy className="w-3.5 h-3.5" />
              <span>Championship Arena</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white tracking-tight">
              7 Sports Disciplines
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-2xl leading-relaxed">
              Every house competes across all 7 official disciplines. Points scored across these disciplines roll directly into the unified APL Season 9 championship tally.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  selectedCategory === cat
                    ? 'bg-[#C6A04A] text-slate-950 font-bold'
                    : 'bg-[#141822] text-slate-400 hover:text-white border border-white/[0.06]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Sports Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSports.map((sp: any) => (
            <article
              key={sp.id}
              className="rounded-2xl bg-[#141822] border border-white/[0.08] hover:border-[#C6A04A]/50 transition p-6 space-y-4 shadow-sm flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Header: Icon + Category Badge */}
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-[#0A0D14] border border-white/[0.08] flex items-center justify-center text-[#C6A04A] shadow-inner">
                    <SportIcon name={sp.name} className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-[#0A0D14] text-[#C6A04A] border border-[#C6A04A]/30">
                    {sp.category || 'Discipline'}
                  </span>
                </div>

                {/* Name + Format */}
                <div>
                  <h2 className="font-serif text-2xl font-bold text-white tracking-tight">
                    {sp.name}
                  </h2>
                  <span className="text-xs font-medium text-slate-400 block mt-1">
                    {sp.tournamentFormat || 'Championship Tournament'}
                  </span>
                </div>

                {/* Description if present */}
                <p className="text-xs text-slate-400 leading-relaxed">
                  {sp.description || `Official ${sp.name} competition in APL Season 9 with certified rules and points division.`}
                </p>
              </div>

              {/* Action Links */}
              <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between gap-2">
                <Link
                  href={`/schedule?sport=${encodeURIComponent(sp.name)}`}
                  className="inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-[#C6A04A] transition font-medium"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Fixtures</span>
                </Link>
                <Link
                  href={`/results?sport=${encodeURIComponent(sp.name)}`}
                  className="inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-[#C6A04A] transition font-medium"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Results</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}

