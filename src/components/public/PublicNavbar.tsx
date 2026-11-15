'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, RefreshCw, Crown } from 'lucide-react';

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
    { label: 'Schedule', href: '/schedule', key: 'schedule' },
    { label: 'Results', href: '/results', key: 'results' },
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
    <header className="sticky top-0 z-50 bg-[#080A0E]/90 backdrop-blur-xl border-b border-[#C6A04A]/20 px-4 sm:px-8 py-3.5 transition-all shadow-[0_4px_30px_rgba(0,0,0,0.85)]">
      {/* Subtle Hairline Gold Glow Divider */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#C6A04A]/30 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand & Championship Emblem */}
        <Link
          href="/"
          className="flex items-center gap-3 cursor-pointer select-none group shrink-0"
        >
          {/* Trophy Crest Box */}
          <div className="relative w-9 h-9 rounded-xl bg-gradient-to-b from-[#141A24] to-[#0A0D14] border border-[#C6A04A]/40 p-1.5 flex items-center justify-center shadow-lg shadow-black/60 group-hover:border-[#C6A04A] transition-all duration-300">
            <img
              src="/logo.png"
              alt="APL Logo"
              className="w-full h-full object-contain filter drop-shadow-[0_2px_4px_rgba(198,160,74,0.4)] group-hover:scale-105 transition-transform duration-300"
            />
            {/* Subtle corner specular glint */}
            <div className="absolute -top-[1px] -left-[1px] w-2 h-2 border-t border-l border-[#C6A04A] rounded-tl-xl opacity-75" />
          </div>

          {/* Championship Title */}
          <div className="flex items-center gap-2.5">
            <div className="flex flex-col">
              <span className="font-sans font-black italic text-lg tracking-tight leading-none text-transparent bg-clip-text bg-gradient-to-r from-white via-[#F5F2EB] to-[#C6A04A] drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                APL <span className="text-[#C6A04A]">Season 9</span>
              </span>
              <span className="text-[9px] uppercase tracking-[0.2em] font-extrabold text-[#C6A04A]/80 -mt-0.5 font-sans">
                Inter-Club Showdown
              </span>
            </div>

            {/* Chamfered Pill Tag */}
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#141A24]/90 text-[#DFB85C] border border-[#C6A04A]/30 shadow-xs">
              <Crown className="w-2.5 h-2.5 text-[#C6A04A]" />
              <span>House Championship</span>
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links (Centered & Luxury Editorial) */}
        <nav className="hidden lg:flex items-center gap-7 text-xs font-bold tracking-wide uppercase">
          {navItems.map((item) => {
            const active = isItemActive(item);
            return (
              <Link
                key={item.key}
                href={item.href}
                className={`relative py-1.5 transition-all duration-200 select-none ${
                  active
                    ? 'text-[#F3D787] drop-shadow-[0_0_12px_rgba(198,160,74,0.45)]'
                    : 'text-slate-400 hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]'
                }`}
              >
                <span>{item.label}</span>

                {/* Glowing Gold Active Underline */}
                {active && (
                  <span className="absolute -bottom-[15px] left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#C6A04A] to-transparent shadow-[0_0_8px_#C6A04A]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Side: Live Standings Status Beacon & Refresh */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Live Standings Pill with Pulsing Beacon */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#141A24]/90 border border-emerald-500/30 text-xs text-slate-200 shadow-inner backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-[11px] font-bold tracking-wider uppercase text-emerald-400">
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

          {/* Mobile Hamburger Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-300 hover:text-white bg-[#141A24]/80 rounded-lg border border-white/[0.1] active:scale-95 transition"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4 text-[#C6A04A]" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer (Luxury Sliding Panel) */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-[#080A0E]/95 backdrop-blur-2xl border-b border-[#C6A04A]/30 p-4 space-y-1.5 shadow-2xl animate-in slide-in-from-top-2 duration-200">
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
