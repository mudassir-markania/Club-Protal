'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import PublicNavbar from '@/components/public/PublicNavbar';
import PublicFooter from '@/components/public/PublicFooter';
import { Trophy, Shield, Users, RefreshCw, ArrowRight, Award } from 'lucide-react';
import { SportIcon } from '@/components/ui/icons';

const DEFAULT_HOUSES = [
  {
    id: 'club-mav',
    name: 'Mavericks',
    code: 'MAV',
    captainName: 'Alex Rivera',
    rank: 1,
    totalPoints: 420,
    accentColor: '#DC2626',
    motto: 'Unyielding Speed, Unbroken Pride',
    cricketTeams: [{ id: 'mav-a', name: 'Mavericks A' }, { id: 'mav-b', name: 'Mavericks B' }],
  },
  {
    id: 'club-dom',
    name: 'Dominators',
    code: 'DOM',
    captainName: 'Leo Vance',
    rank: 2,
    totalPoints: 380,
    accentColor: '#1E3A8A',
    motto: 'Command the Arena, Rule the Field',
    cricketTeams: [{ id: 'dom-a', name: 'Dominators A' }, { id: 'dom-b', name: 'Dominators B' }],
  },
  {
    id: 'club-alp',
    name: 'Alphas',
    code: 'ALP',
    captainName: 'Ethan Hunt',
    rank: 3,
    totalPoints: 355,
    accentColor: '#7C3AED',
    motto: 'First to Strike, Last to Fall',
    cricketTeams: [{ id: 'alp-a', name: 'Alphas A' }, { id: 'alp-b', name: 'Alphas B' }],
  },
  {
    id: 'club-spa',
    name: 'Spartans',
    code: 'SPA',
    captainName: 'Marcus Cole',
    rank: 4,
    totalPoints: 310,
    accentColor: '#D97706',
    motto: 'Discipline in Battle, Honor in Triumph',
    cricketTeams: [{ id: 'spa-a', name: 'Spartans A' }, { id: 'spa-b', name: 'Spartans B' }],
  },
  {
    id: 'club-phx',
    name: 'Phoenix',
    code: 'PHX',
    captainName: 'Aiden Drake',
    rank: 5,
    totalPoints: 275,
    accentColor: '#EA580C',
    motto: 'From the Ashes, Infinite Radiance',
    cricketTeams: [{ id: 'phx-a', name: 'Phoenix A' }, { id: 'phx-b', name: 'Phoenix B' }],
  },
];

export default function HousesPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState('');

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

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col antialiased">
      <PublicNavbar onRefresh={handleRefresh} refreshing={refreshing} lastUpdated={lastRefreshed} activeOverride="clubs" />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-8 space-y-8">
        {/* Page Header */}
        <div className="border-b border-slate-200 pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-100 text-xs text-[#0284C7] font-bold mb-3">
              <Shield className="w-3.5 h-3.5" />
              <span>Official Participating Houses</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              The 5 Participating Houses
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-2xl leading-relaxed">
              Explore the five student houses competing for the APL Season 9 Championship Trophy. Each house fields athletes across all 8 sports disciplines.
            </p>
          </div>
        </div>

        {/* Houses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {houses.map((house: any) => (
            <div
              key={house.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5 shadow-xs hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-base text-white shadow-xs"
                    style={{ backgroundColor: house.accentColor || '#0284C7' }}
                  >
                    {house.code}
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900 leading-tight">
                      {house.name}
                    </h2>
                    <span className="text-xs text-slate-500 font-medium">
                      Capt: {house.captainName || 'Senior Captain'}
                    </span>
                  </div>
                </div>

                <span className="font-mono text-xs font-black px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                  #{house.rank}
                </span>
              </div>

              {house.motto && (
                <p className="text-xs italic text-slate-500">
                  &ldquo;{house.motto}&rdquo;
                </p>
              )}

              {/* Franchise Teams */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Registered Franchises
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  {house.cricketTeams?.map((ct: any) => (
                    <span
                      key={ct.id}
                      className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700"
                    >
                      🏏 {ct.name}
                    </span>
                  ))}
                </div>
              </div>

              {/* Total Points Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Championship Points</span>
                <span className="font-mono font-black text-lg text-slate-900">
                  {Number(house.totalPoints).toFixed(2)} pts
                </span>
              </div>
            </div>
          ))}
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
