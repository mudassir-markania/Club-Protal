'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import PublicNavbar from '@/components/public/PublicNavbar';
import PublicFooter from '@/components/public/PublicFooter';
import { Trophy, Shield, Users, RefreshCw, ArrowRight, Award } from 'lucide-react';
import { SportIcon } from '@/components/ui/icons';

const HOUSE_METADATA: Record<
  string,
  { accentColor: string; bgSoft: string; borderHover: string }
> = {
  ALP: { accentColor: '#2563EB', bgSoft: 'rgba(37,99,235,0.08)', borderHover: 'hover:border-blue-500/50' },
  CRW: { accentColor: '#D97706', bgSoft: 'rgba(217,119,6,0.08)', borderHover: 'hover:border-amber-500/50' },
  DOM: { accentColor: '#DC2626', bgSoft: 'rgba(220,38,38,0.08)', borderHover: 'hover:border-red-500/50' },
  MAV: { accentColor: '#059669', bgSoft: 'rgba(5,150,105,0.08)', borderHover: 'hover:border-emerald-500/50' },
  RYL: { accentColor: '#7C3AED', bgSoft: 'rgba(124,58,237,0.08)', borderHover: 'hover:border-purple-500/50' },
};

const DEFAULT_HOUSES = [
  { id: 'club-alp', name: 'Alpha', code: 'ALP', captainName: 'Ethan Hunt', rank: 1, totalPoints: 0, cricketTeams: [{ id: 'alp-a', name: 'Alpha A' }, { id: 'alp-b', name: 'Alpha B' }] },
  { id: 'club-crw', name: 'Crown Crushers', code: 'CRW', captainName: 'Zane Malik', rank: 2, totalPoints: 0, cricketTeams: [{ id: 'crw-a', name: 'Crown Crushers A' }, { id: 'crw-b', name: 'Crown Crushers B' }] },
  { id: 'club-dom', name: 'Dominator', code: 'DOM', captainName: 'Leo Vance', rank: 3, totalPoints: 0, cricketTeams: [{ id: 'dom-a', name: 'Dominator A' }, { id: 'dom-b', name: 'Dominator B' }] },
  { id: 'club-mav', name: 'Mavericks', code: 'MAV', captainName: 'Alex Rivera', rank: 4, totalPoints: 0, cricketTeams: [{ id: 'mav-a', name: 'Mavericks A' }, { id: 'mav-b', name: 'Mavericks B' }] },
  { id: 'club-ryl', name: 'Royal Force', code: 'RYL', captainName: 'Carlos Vega', rank: 5, totalPoints: 0, cricketTeams: [{ id: 'ryl-a', name: 'Royal Force A' }, { id: 'ryl-b', name: 'Royal Force B' }] },
];

export default function HousesPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState('');
  const [selectedHouse, setSelectedHouse] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
    setLastRefreshed(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/public/overview');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
    setLastRefreshed(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  };

  const houses = (data?.standings && data.standings.length > 0) ? data.standings : DEFAULT_HOUSES;
  const sports = data?.sports || [];

  return (
    <div className="min-h-screen bg-[#0A0D14] text-[#EDEDED] flex flex-col selection:bg-[#C6A04A] selection:text-[#0A0D14] antialiased">
      <PublicNavbar onRefresh={handleRefresh} refreshing={refreshing} lastUpdated={lastRefreshed} activeOverride="houses" />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-8 space-y-8">
        {/* Page Header */}
        <div className="border-b border-white/[0.08] pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs text-[#C6A04A] mb-3">
              <Shield className="w-3.5 h-3.5" />
              <span>Official Participating Houses</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white tracking-tight">
              The 5 Participating Houses
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-2xl leading-relaxed">
              5 storied houses competing across all 7 championship disciplines. Each house sponsors two official cricket franchises whose tournament points contribute directly to the house total.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/leaderboard"
              className="px-4 py-2 rounded-lg bg-[#C6A04A] hover:bg-[#B38F3A] text-slate-950 font-bold text-xs transition flex items-center gap-2"
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>View Leaderboard</span>
            </Link>
          </div>
        </div>

        {/* 5 Houses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {houses.map((club: any) => {
            const meta = HOUSE_METADATA[club.code] || HOUSE_METADATA.ALP;
            const isSelected = selectedHouse === club.id;

            return (
              <article
                key={club.id}
                onClick={() => setSelectedHouse(isSelected ? null : club.id)}
                className={`rounded-2xl bg-[#141822] border transition p-6 space-y-5 shadow-sm cursor-pointer ${
                  isSelected ? 'border-[#C6A04A] ring-1 ring-[#C6A04A]/50' : 'border-white/[0.08] hover:border-[#C6A04A]/40'
                }`}
              >
                {/* Crest + House Name + Rank Badge */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center font-serif font-bold text-base text-white shadow-md shrink-0"
                      style={{ backgroundColor: meta.accentColor }}
                    >
                      {club.code}
                    </div>
                    <div>
                      <h2 className="font-serif text-xl font-bold text-white leading-tight">
                        {club.name}
                      </h2>
                      <span className="text-xs text-slate-400">
                        Senior Captain: <strong className="text-slate-200">{club.captainName || 'Senior Captain'}</strong>
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Rank</span>
                    <span className="font-mono text-sm font-bold px-2 py-0.5 rounded bg-[#0A0D14] border border-white/[0.08] text-[#C6A04A]">
                      #{club.rank}
                    </span>
                  </div>
                </div>

                {/* House Teams */}
                <div className="space-y-2">
                  <span className="text-[11px] font-semibold text-slate-400 block">
                    House Teams (2)
                  </span>
                  <div className="flex items-center gap-2 flex-wrap">
                    {club.cricketTeams && club.cricketTeams.length > 0 ? (
                      club.cricketTeams.map((ct: any) => (
                        <span
                          key={ct.id}
                          className="px-2.5 py-1 rounded-md bg-[#0A0D14] border border-white/[0.06] text-xs font-medium text-slate-200 flex items-center gap-1.5"
                        >
                          <span>🏏</span>
                          <span>{ct.name}</span>
                        </span>
                      ))
                    ) : (
                      <>
                        <span className="px-2.5 py-1 rounded-md bg-[#0A0D14] border border-white/[0.06] text-xs font-medium text-slate-200">
                          🏏 {club.name} A
                        </span>
                        <span className="px-2.5 py-1 rounded-md bg-[#0A0D14] border border-white/[0.06] text-xs font-medium text-slate-200">
                          🏏 {club.name} B
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Sport Points Breakdown (when sports data available) */}
                {sports.length > 0 && club.sportBreakdown && (
                  <div className="pt-3 border-t border-white/[0.06] space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Sport Points Breakdown</span>
                      <span className="text-[10px] text-[#C6A04A]">8 Sports</span>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5 text-center">
                      {sports.slice(0, 4).map((sp: any) => {
                        const pts = club.sportBreakdown?.[sp.id] ?? club.sportBreakdown?.[sp.name] ?? 0;
                        return (
                          <div key={sp.id} className="p-1.5 rounded bg-[#0A0D14] border border-white/[0.04]">
                            <span className="text-[9px] text-slate-400 block truncate">{sp.name}</span>
                            <span className="font-mono text-xs font-bold text-slate-200">{Number(pts).toFixed(1)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Points Bar */}
                <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between">
                  <span className="text-xs text-slate-400">Championship Tally</span>
                  <span className="font-mono font-bold text-lg text-[#C6A04A]">
                    {Number(club.totalPoints).toFixed(2)} pts
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}

