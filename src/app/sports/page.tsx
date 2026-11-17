'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import PublicNavbar from '@/components/public/PublicNavbar';
import PublicFooter from '@/components/public/PublicFooter';
import { SportIcon } from '@/components/ui/icons';
import { Trophy, Calendar, ChevronRight } from 'lucide-react';

const INITIAL_SPORTS = [
  { id: 'sport-cricket', name: 'Cricket', category: 'Field Sport', tournamentFormat: '10 Teams • 2 Pools • Super 4', description: 'Main tournament flagship with 10 franchise teams competing across league matches, semifinals, and grand final.' },
  { id: 'sport-football', name: 'Football', category: 'Field Sport', tournamentFormat: '5-a-side Turf League', description: 'Fast-paced turf football with knockout stages and sudden-death penalty deciders.' },
  { id: 'sport-badminton', name: 'Badminton', category: 'Racquet', tournamentFormat: 'Singles • Doubles • Mixed Doubles', description: 'Intense 21-point rally format across Men’s Singles, Women’s Singles, and Mixed Doubles.' },
  { id: 'sport-tt', name: 'Table Tennis', category: 'Racquet', tournamentFormat: '11-Point Fast Table', description: 'Speed and precision ping-pong on international standard tables with sudden death deuce rules.' },
  { id: 'sport-chess', name: 'Chess', category: 'Mind Sport', tournamentFormat: 'Rapid & Classical FIDE', description: 'Strategic intellectual showdown with digital clock timers and FIDE Swiss bracket system.' },
  { id: 'sport-carrom', name: 'Carrom', category: 'Indoor', tournamentFormat: 'Singles • Doubles • Mixed Doubles', description: 'Classic precision board championship featuring singles, doubles, and queen cover point systems.' },
  { id: 'sport-bgmi', name: 'BGMI', category: 'E-Sports', tournamentFormat: 'Battle Royale 4-Man Squads', description: 'High-intensity mobile esports battle royale across custom campus servers with live casting.' },
  { id: 'sport-mystery', name: 'Mystery Game', category: 'Secret Quest', tournamentFormat: 'Revealed on Nov 27th', description: 'Surprise team challenge unlocked on tournament Day 3 with bonus championship points.' },
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
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col antialiased">
      <PublicNavbar onRefresh={handleRefresh} refreshing={refreshing} lastUpdated={lastRefreshed} activeOverride="sports" />

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-8 space-y-8">
        {/* Header */}
        <div className="border-b border-slate-200 pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-100 text-xs text-[#0284C7] font-bold mb-3">
              <Trophy className="w-3.5 h-3.5" />
              <span>Championship Arena</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              8 Participating Sports
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-2xl leading-relaxed">
              Every house competes across all 8 official disciplines. Points scored across these disciplines roll directly into the unified APL Season 9 championship tally.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${
                  selectedCategory === cat
                    ? 'bg-[#0284C7] text-white shadow-2xs'
                    : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Sports Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filteredSports.map((sp: any) => (
            <article
              key={sp.id}
              className="rounded-2xl bg-white border border-slate-200 hover:border-[#0284C7]/50 transition p-5 space-y-4 shadow-xs hover:shadow-md flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-sky-50 text-[#0284C7] flex items-center justify-center group-hover:scale-105 transition-transform shadow-2xs">
                    <SportIcon name={sp.name} className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-slate-100 text-slate-600">
                    {sp.category || 'Discipline'}
                  </span>
                </div>

                <div>
                  <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                    {sp.name}
                  </h2>
                  <span className="text-xs font-semibold text-[#0284C7] block mt-0.5">
                    {sp.tournamentFormat}
                  </span>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                  {sp.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-medium">
                <span>Rules Certified</span>
                <Link
                  href="/schedule"
                  className="text-[#0284C7] font-bold flex items-center gap-1 group-hover:underline"
                >
                  <span>Matches</span>
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
