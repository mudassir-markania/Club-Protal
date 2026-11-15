'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, RefreshCw, Trophy } from 'lucide-react';

interface PublicNavbarProps {
  onRefresh?: () => void;
  refreshing?: boolean;
  lastUpdated?: string;
  activeOverride?: string;
}

export default function PublicNavbar({
  onRefresh,
  refreshing = false,
  lastUpdated,
  activeOverride,
}: PublicNavbarProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Home', href: '/', key: 'home' },
    { label: 'Leaderboard', href: '/leaderboard', key: 'leaderboard' },
    { label: 'The 5 Houses', href: '/houses', key: 'houses' },
    { label: '7 Sports', href: '/sports', key: 'sports' },
    { label: 'Match Radar', href: '/schedule', key: 'schedule' },
    { label: 'Approved Scores', href: '/results', key: 'results' },
    { label: 'Points Rules', href: '/points-rules', key: 'rules' },
  ];

  const isItemActive = (item: (typeof navItems)[0]) => {
    if (activeOverride) {
      return activeOverride === item.key;
    }
    if (item.key === 'home' && pathname === '/') return true;
    if (pathname === item.href) return true;
    if (item.key === 'houses' && (pathname === '/houses' || pathname === '/the-5-houses')) return true;
    if (item.key === 'sports' && (pathname === '/sports' || pathname === '/7-sports')) return true;
    if (item.key === 'schedule' && (pathname === '/schedule' || pathname === '/matches')) return true;
    if (item.key === 'results' && (pathname === '/results' || pathname === '/approved-results')) return true;
    if (item.key === 'rules' && (pathname === '/points-rules' || pathname === '/rules' || pathname === '/points-system')) return true;
    return false;
  };

  const handleRefreshClick = () => {
    if (onRefresh) {
      onRefresh();
    } else {
      window.location.reload();
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[#080A0E]/85 backdrop-blur-2xl border-b border-[#C6A04A]/25 transition-all shadow-[0_4px_30px_rgba(0,0,0,0.85)]">
      {/* Subtle Bottom Gold Hairline Ambient Glow */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#C6A04A]/40 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-6">
        {/* Brand: Metallic APL Season 9 Logo */}
        <Link
          href="/"
          className="flex items-center gap-3 cursor-pointer select-none group shrink-0"
        >
          {/* Logo Crest Box with Metallic Chamfer */}
          <div className="relative w-9 h-9 rounded-xl bg-gradient-to-b from-[#18202C] to-[#0A0D14] border border-[#C6A04A]/50 p-1.5 flex items-center justify-center shadow-lg shadow-black/80 group-hover:border-[#DFB85C] group-hover:shadow-[#C6A04A]/20 transition-all duration-300">
            <img
              src="/logo.png"
              alt="APL Trophy"
              className="w-full h-full object-contain filter drop-shadow-[0_2px_6px_rgba(198,160,74,0.5)] group-hover:scale-105 transition-transform duration-300"
            />
            {/* Top corner glint */}
            <div className="absolute -top-[1px] -left-[1px] w-2 h-2 border-t border-l border-[#DFB85C] rounded-tl-xl opacity-90" />
          </div>

          {/* Typography: Metallic Gold APL SEASON 9 */}
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5 leading-none">
              <span className="font-sans font-black italic text-xl tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-[#FFF5C7] via-[#DFB85C] to-[#8C6D23] drop-shadow-[0_2px_10px_rgba(198,160,74,0.4)]">
                APL
              </span>
              <span className="font-sans font-black italic text-sm tracking-wider text-slate-100">
                SEASON 9
              </span>
            </div>
            <span className="text-[8px] uppercase tracking-[0.25em] font-extrabold text-[#C6A04A] font-sans -mt-0.5">
              House Championship
            </span>
          </div>
        </Link>

        {/* Center Navigation Links: Luxury Championship Editorial */}
        <nav className="hidden lg:flex items-center gap-6 xl:gap-8 shrink-0">
          {navItems.map((item) => {
            const active = isItemActive(item);
            return (
              <Link
                key={item.key}
                href={item.href}
                className={`relative py-1 text-[11px] xl:text-xs font-bold tracking-[0.16em] uppercase whitespace-nowrap transition-all duration-200 select-none ${
                  active
                    ? 'text-[#FFF0B3] drop-shadow-[0_0_12px_rgba(198,160,74,0.65)] font-black'
                    : 'text-slate-400 hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]'
                }`}
              >
                <span>{item.label}</span>

                {/* Glowing Gold Indicator Bar directly underneath */}
                {active && (
                  <span className="absolute -bottom-2 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#C6A04A] to-transparent shadow-[0_0_10px_#C6A04A] rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Side: Live Standings Status Pill & Refresh Button */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Live Standings Pill with Pulsing Beacon */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#141A24]/90 border border-emerald-500/30 text-xs text-slate-200 shadow-inner backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-[10px] font-extrabold tracking-wider uppercase text-emerald-400 whitespace-nowrap">
              Live Standings
            </span>
          </div>

          {/* Refresh Action Button */}
          <button
            onClick={handleRefreshClick}
            className="p-2 text-slate-400 hover:text-[#C6A04A] bg-[#141A24]/80 hover:bg-[#1A2230] rounded-full transition-all border border-white/[0.08] hover:border-[#C6A04A]/50 shadow-sm active:scale-95"
            title={lastUpdated ? `Last updated ${lastUpdated}` : 'Refresh Tournament Data'}
            aria-label="Refresh Data"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-[#C6A04A]' : ''}`}
            />
          </button>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-300 hover:text-white bg-[#141A24]/80 rounded-lg border border-white/[0.1] active:scale-95 transition"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4 text-[#C6A04A]" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Luxury Slide-Out Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-16 left-0 right-0 bg-[#080A0E]/95 backdrop-blur-2xl border-b border-[#C6A04A]/30 p-4 space-y-2 shadow-2xl animate-in slide-in-from-top-2 duration-200 z-50">
          {navItems.map((item) => {
            const active = isItemActive(item);
            return (
              <Link
                key={item.key}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between p-3 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
                  active
                    ? 'bg-[#141A24] text-[#C6A04A] border border-[#C6A04A]/40 shadow-sm'
                    : 'text-slate-300 hover:bg-white/[0.05] hover:text-white'
                }`}
              >
                <span>{item.label}</span>
                {active && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C6A04A] shadow-[0_0_6px_#C6A04A]" />
                )}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
