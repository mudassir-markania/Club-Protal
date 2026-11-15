'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, RefreshCw } from 'lucide-react';

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
    <header className="sticky top-0 z-50 bg-[#0A0D14]/95 backdrop-blur-md border-b border-white/[0.08] px-4 sm:px-8 py-3 flex items-center justify-between">
      {/* Brand & Championship Tag */}
      <Link href="/" className="flex items-center gap-3 cursor-pointer select-none group">
        <div className="w-8 h-8 rounded-lg bg-[#141822] border border-[#C6A04A]/30 p-1 flex items-center justify-center shrink-0 group-hover:border-[#C6A04A] transition">
          <img src="/logo.png" alt="APL Logo" className="w-full h-full object-contain" />
        </div>
        <div className="flex items-center gap-2">
          <span className="font-serif text-base font-bold text-white tracking-tight">
            APL <span className="text-[#C6A04A]">Season 9</span>
          </span>
          <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-white/[0.06] text-[#C6A04A] border border-[#C6A04A]/30">
            House Championship
          </span>
        </div>
      </Link>

      {/* Desktop Navigation Links */}
      <nav className="hidden lg:flex items-center gap-6 text-xs font-medium">
        {navItems.map((item) => {
          const active = isItemActive(item);
          return (
            <Link
              key={item.key}
              href={item.href}
              className={`pb-1 border-b-2 transition ${
                active
                  ? 'text-[#C6A04A] font-bold border-[#C6A04A]'
                  : 'border-transparent text-slate-400 hover:text-white hover:border-slate-600'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Live Status and Refresh / Mobile Toggle */}
      <div className="flex items-center gap-2.5">
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/[0.08] text-xs text-slate-300">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>Live Standings</span>
        </div>

        <button
          onClick={handleRefreshClick}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-white/[0.06] rounded-md transition border border-white/[0.08]"
          title={lastUpdated ? `Updated ${lastUpdated}` : 'Refresh Data'}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-[#C6A04A]' : ''}`} />
        </button>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-1.5 text-slate-300 hover:text-white bg-white/[0.06] rounded-md border border-white/[0.08]"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-[#0E131C] border-b border-white/[0.08] p-4 space-y-2 text-xs font-medium shadow-xl">
          {navItems.map((item) => {
            const active = isItemActive(item);
            return (
              <Link
                key={item.key}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block w-full text-left p-2.5 rounded-lg transition ${
                  active
                    ? 'bg-[#141822] text-[#C6A04A] font-bold border border-[#C6A04A]/30'
                    : 'text-slate-300 hover:bg-white/[0.05]'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}

