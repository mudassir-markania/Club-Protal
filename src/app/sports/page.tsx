'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import PublicNavbar from '@/components/public/PublicNavbar';
import PublicFooter from '@/components/public/PublicFooter';
import { SportIcon } from '@/components/ui/icons';
import { Trophy, Calendar, ChevronRight, X, ArrowRight, BookOpen, ShieldCheck } from 'lucide-react';

const INITIAL_SPORTS = [
  {
    id: 'sport-cricket',
    name: 'Cricket',
    category: 'Field Sport',
    tournamentFormat: '10 Teams • 2 Pools • Super 4',
    venue: 'Main Oval Ground',
    timing: 'Nov 25th - 28th',
    rulesSummary: 'T10 format, 10 overs per side. Maximum 2 overs per bowler. Powerplay in the first 3 overs. Tie decider is a Super Over.',
    description: 'Main tournament flagship with 10 franchise teams competing across league matches, semifinals, and the grand final under full campus floodlights.',
  },
  {
    id: 'sport-football',
    name: 'Football',
    category: 'Field Sport',
    tournamentFormat: '5-a-side Turf League',
    venue: 'Synthetic Turf Arena',
    timing: 'Nov 25th - 27th',
    rulesSummary: '5 players + 3 rolling substitutes. Two halves of 15 minutes each. Direct free kicks only. Sudden-death penalties if tied in knockout rounds.',
    description: 'Fast-paced turf football with knockout stages, high-intensity pressing, and sudden-death penalty deciders under perimeter lighting.',
  },
  {
    id: 'sport-badminton',
    name: 'Badminton',
    category: 'Racquet',
    tournamentFormat: 'Singles • Doubles • Mixed Doubles',
    venue: 'Indoor Sports Complex',
    timing: 'Nov 26th - 28th',
    rulesSummary: 'BWF standard rules. Best of 3 sets to 21 points with rally scoring. Sudden death golden point at 29-all.',
    description: 'Intense 21-point rally format on Olympic sprung wooden courts across Men’s Singles, Women’s Singles, and Mixed Doubles categories.',
  },
  {
    id: 'sport-tt',
    name: 'Table Tennis',
    category: 'Racquet',
    tournamentFormat: '11-Point Fast Table',
    venue: 'Table Tennis Hall',
    timing: 'Nov 25th - 27th',
    rulesSummary: 'ITTF service rotation every 2 points. Best of 5 sets to 11 points. 2-point clear lead required upon reaching 10-all.',
    description: 'Lightning reflex table tennis on international standard tables with professional referees and sudden death deuce rules.',
  },
  {
    id: 'sport-chess',
    name: 'Chess',
    category: 'Mind Sport',
    tournamentFormat: 'Rapid 15+10 & Classical',
    venue: 'Mind Sports Auditorium',
    timing: 'Nov 26th - 27th',
    rulesSummary: 'FIDE Swiss Pairing. 15 minutes baseline + 10-second increment per move on DGT digital boards. Touch-move rule strictly enforced.',
    description: 'Strategic intellectual showdown with digital clock timers and FIDE Swiss bracket system in an acoustic, sound-dampened auditorium.',
  },
  {
    id: 'sport-carrom',
    name: 'Carrom',
    category: 'Indoor',
    tournamentFormat: 'Singles • Doubles',
    venue: 'Indoor Recreation Center',
    timing: 'Nov 25th - 26th',
    rulesSummary: 'Points limit 25 or 8 boards. White 1 pt, Black 2 pts, Queen 3 pts. Immediate confirmation cover required on queen pocketing.',
    description: 'Classic precision board championship featuring singles, doubles, and queen cover point systems on smooth tournament boards.',
  },
  {
    id: 'sport-bgmi',
    name: 'BGMI',
    category: 'E-Sports',
    tournamentFormat: 'Battle Royale 4-Man Squads',
    venue: 'Esports LAN Dome',
    timing: 'Nov 27th - 28th',
    rulesSummary: 'Official esports scoring matrix: 15 pts for Winner Winner Chicken Dinner, 1 pt per verified kill. 4 maps played.',
    description: 'High-intensity mobile esports battle royale across custom low-latency campus LAN servers with live casting and spectator feeds.',
  },
  {
    id: 'sport-mystery',
    name: 'Mystery Game',
    category: 'Special Quest',
    tournamentFormat: 'Revealed on Nov 27th',
    venue: 'Central Arena Plaza',
    timing: 'Nov 27th, 04:00 PM',
    rulesSummary: 'House captains submit 4 athletes. Rules and format unveiled live by the Tournament Director 10 minutes prior to kickoff.',
    description: 'Surprise team challenge unlocked on tournament Day 3 with massive bonus championship points awarded to the podium finishers.',
  },
];

export default function SportsPage() {
  const [sports, setSports] = useState<any[]>(INITIAL_SPORTS);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedSport, setSelectedSport] = useState<any | null>(null);
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
          // merge with rich local metadata
          const merged = json.sports.map((s: any) => {
            const found = INITIAL_SPORTS.find((init) => init.name.toLowerCase() === s.name.toLowerCase());
            return { ...found, ...s };
          });
          setSports(merged);
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

  const categories = ['ALL', 'Field Sport', 'Racquet', 'Indoor', 'E-Sports', 'Mind Sport', 'Special Quest'];

  const filteredSports =
    selectedCategory === 'ALL'
      ? sports
      : sports.filter((s) => s.category?.toLowerCase() === selectedCategory.toLowerCase());

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col antialiased selection:bg-[#0284C7] selection:text-white">
      <PublicNavbar onRefresh={handleRefresh} refreshing={refreshing} lastUpdated={lastRefreshed} activeOverride="sports" />

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-8 space-y-10">
        {/* Header */}
        <div className="border-b border-slate-200/90 pb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-sky-50 border border-sky-100 text-xs text-[#0284C7] font-bold mb-3 shadow-2xs">
              <Trophy className="w-3.5 h-3.5" />
              <span>Championship Arena</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0B2545] tracking-tight">
              8 Participating Sports
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-2xl leading-relaxed">
              Every house competes across all 8 official disciplines. Points scored across these disciplines roll directly into the unified APL Season 9 championship tally.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#0284C7] text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Sports Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredSports.map((sp: any) => (
            <article
              key={sp.id}
              onClick={() => setSelectedSport(sp)}
              className="rounded-2xl bg-white border border-slate-200/90 hover:border-[#0284C7]/60 transition-all duration-300 p-5 space-y-4 shadow-xs hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between group cursor-pointer"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-sky-50 text-[#0284C7] border border-sky-100 flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xs">
                    <SportIcon name={sp.name} className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                    {sp.category || 'Discipline'}
                  </span>
                </div>

                <div>
                  <h2 className="text-lg font-black text-[#0B2545] tracking-tight group-hover:text-[#0284C7] transition-colors">
                    {sp.name}
                  </h2>
                  <span className="text-xs font-bold text-[#EA580C] block mt-0.5">
                    {sp.tournamentFormat}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                  {sp.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-medium">
                <span className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Rules Certified
                </span>
                <span className="text-[#0284C7] font-bold flex items-center gap-1 group-hover:underline">
                  <span>View Details</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </article>
          ))}
        </div>
      </main>

      {/* Sport Details Modal */}
      {selectedSport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 relative space-y-5">
            <button
              onClick={() => setSelectedSport(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-sky-50 text-[#0284C7] border border-sky-100 flex items-center justify-center p-2 shadow-xs">
                <SportIcon name={selectedSport.name} className="w-8 h-8" />
              </div>
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-sky-100 text-sky-800">
                  {selectedSport.category}
                </span>
                <h3 className="font-black text-2xl text-slate-900 uppercase">
                  {selectedSport.name}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {selectedSport.venue}
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">
                Tournament Format:
              </span>
              <p className="text-xs font-bold text-slate-800">{selectedSport.tournamentFormat}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-sky-50/70 border border-sky-100 space-y-1">
              <span className="text-[10px] uppercase font-bold text-sky-700 block">
                Certified Rules Summary:
              </span>
              <p className="text-xs text-slate-700 leading-relaxed">{selectedSport.rulesSummary || selectedSport.description}</p>
            </div>

            <div className="pt-2 flex gap-3">
              <Link
                href="/schedule"
                className="flex-1 py-2.5 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white text-center font-bold text-xs transition shadow-md flex items-center justify-center gap-2"
              >
                <span>View {selectedSport.name} Fixtures</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                onClick={() => setSelectedSport(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <PublicFooter />
    </div>
  );
}
