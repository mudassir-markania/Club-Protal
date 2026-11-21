'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu,
  X,
  LogIn,
  Home,
  Calendar,
  Trophy,
  Shield,
  Medal,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface PublicNavbarProps {
  onRefresh?: () => void;
  refreshing?: boolean;
  lastUpdated?: string;
  activeOverride?: string;
}

export default function PublicNavbar({ activeOverride }: PublicNavbarProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (mobileMenuOpen) {
      const prevBodyOverflow = document.body.style.overflow;
      const prevHtmlOverflow = document.documentElement.style.overflow;
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';

      return () => {
        document.body.style.overflow = prevBodyOverflow;
        document.documentElement.style.overflow = prevHtmlOverflow;
      };
    }
  }, [mobileMenuOpen]);

  const navItems = [
    { label: 'Home', href: '/', key: 'home', icon: Home, subtitle: 'Championship Hub & Overview' },
    { label: 'Schedule', href: '/schedule', key: 'schedule', icon: Calendar, subtitle: 'Fixtures, Timings & Results' },
    { label: 'Leaderboard', href: '/leaderboard', key: 'leaderboard', icon: Trophy, subtitle: 'House Standings & Total Points' },
    { label: 'Houses', href: '/houses', key: 'houses', icon: Shield, subtitle: 'The 5 Dynasties & Rosters' },
    { label: 'Sports', href: '/sports', key: 'sports', icon: Medal, subtitle: '6 Sanctioned Disciplines' },
  ];

  const isItemActive = (item: (typeof navItems)[0]) => {
    if (activeOverride) {
      return activeOverride === item.key;
    }
    if (item.key === 'home' && pathname === '/') return true;
    if (pathname === item.href) return true;
    if (item.key === 'sports' && (pathname === '/sports' || pathname === '/7-sports')) return true;
    if (item.key === 'schedule' && (pathname === '/schedule' || pathname === '/matches')) return true;
    if (item.key === 'leaderboard' && (pathname === '/leaderboard' || pathname === '/player-leaderboard')) return true;
    if (item.key === 'houses' && (pathname === '/houses' || pathname === '/the-5-houses')) return true;
    return false;
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-[#faf8ff]/95 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-[#e2e7ff]/60">
      <div className="h-16 sm:h-20 max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-12 flex items-center justify-between gap-3">
        {/* Brand Crest & Title */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <Link href="/" className="flex items-center gap-2 sm:gap-2.5 group">
            {/* Logo */}
            <div className="h-8 w-8 sm:h-9 sm:w-9 relative shrink-0 flex items-center justify-center" style={{ width: '36px', height: '36px', minWidth: '36px', minHeight: '36px' }}>
              <img
                alt="APL Logo"
                className="w-full h-full object-contain transition-transform group-hover:scale-105"
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                src="/logo.png"
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-manrope text-base sm:text-xl font-bold uppercase tracking-tight text-[#000f3f] leading-none whitespace-nowrap">
                  APL
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-[#dae2fd] text-[#000f3f] text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider font-manrope shrink-0">
                  Season 9
                </span>
              </div>
              <span className="text-[9px] sm:text-[10px] font-bold text-[#45464f] tracking-wider uppercase font-manrope mt-0.5 truncate hidden sm:block">
                NexCore Institute of Technology
              </span>
            </div>
          </Link>
        </div>

        {/* Desktop Nav Items */}
        <nav className="hidden xl:flex items-center gap-1.5 shrink-0">
          {navItems.map((item) => {
            const active = isItemActive(item);
            return (
              <Link
                key={item.key}
                href={item.href}
                className={`px-4 py-2 rounded-lg text-xs uppercase tracking-wider font-bold transition-all font-manrope ${
                  active
                    ? 'bg-[#000f3f] text-white shadow-sm'
                    : 'text-[#45464f] hover:bg-[#e2e7ff] hover:text-[#131b2e]'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right CTA / Status / Portals */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* View Championship Primary Button - Hidden on phone, visible on tablet/desktop */}
          <Link
            href="/schedule"
            className="hidden md:inline-flex items-center justify-center px-4 py-2 rounded-lg bg-[#000f3f] hover:bg-[#0051d5] text-white text-xs uppercase tracking-wider font-bold transition-colors duration-150 shadow-[0_1px_8px_rgba(0,0,0,0.04)] font-manrope shrink-0"
          >
            View Championship
          </Link>

          {/* Unified Role-Based Login CTA */}
          <Link
            href="/login"
            className={`inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg border border-[#000f3f]/20 hover:border-[#000f3f] bg-white hover:bg-[#000f3f] text-[#000f3f] hover:text-white text-xs uppercase tracking-wider font-extrabold transition-all duration-150 shadow-xs font-manrope group shrink-0 ${
              mobileMenuOpen ? 'hidden sm:inline-flex' : ''
            }`}
          >
            <LogIn className="w-3.5 h-3.5 text-[#0051d5] group-hover:text-white transition-colors" />
            <span>Log In</span>
          </Link>

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`xl:hidden p-2 rounded-xl transition-colors shrink-0 ${
              mobileMenuOpen
                ? 'bg-[#000f3f] text-white shadow-xs'
                : 'text-[#000f3f] hover:bg-[#e2e7ff]'
            }`}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          className="xl:hidden fixed inset-0 top-16 sm:top-20 z-40 bg-navy-950/60 backdrop-blur-xs overscroll-none touch-none animate-in fade-in duration-150"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden fixed top-16 sm:top-20 left-0 right-0 z-50 bg-white/98 backdrop-blur-2xl border-b border-[#e2e7ff] shadow-2xl p-4 max-h-[calc(100vh-4.5rem)] overflow-y-auto animate-in slide-in-from-top-2 duration-200 space-y-2">
          {/* Tournament Live Pill */}
          <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-100 text-[11px] font-manrope mb-1">
            <span className="font-extrabold uppercase tracking-wider text-[#000f3f] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Season 9 Championship</span>
            </span>
            <span className="flex items-center gap-1 font-bold text-emerald-600 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              LIVE
            </span>
          </div>

          {navItems.map((item) => {
            const active = isItemActive(item);
            const Icon = item.icon;
            return (
              <Link
                key={item.key}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between p-3 rounded-xl transition-all font-manrope ${
                  active
                    ? 'bg-[#000f3f] text-white shadow-md shadow-[#000f3f]/15'
                    : 'bg-white hover:bg-[#f2f3ff] text-slate-700 hover:text-[#000f3f] border border-slate-200/80'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                      active
                        ? 'bg-white/10 text-amber-400'
                        : 'bg-[#dae2fd]/50 text-[#0051d5]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className={`block text-xs uppercase tracking-wider font-extrabold leading-tight ${active ? 'text-white' : 'text-[#000f3f]'}`}>
                      {item.label}
                    </span>
                    <span className={`block text-[11px] truncate mt-0.5 ${active ? 'text-white/70' : 'text-slate-400 font-medium'}`}>
                      {item.subtitle}
                    </span>
                  </div>
                </div>

                <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${active ? 'text-amber-400 translate-x-0.5' : 'text-slate-300'}`} />
              </Link>
            );
          })}

          <div className="pt-3 border-t border-[#e2e7ff] space-y-2">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-extrabold uppercase tracking-wider text-white bg-[#0051d5] hover:bg-[#000f3f] transition-all font-manrope shadow-md shadow-blue-500/20 active:scale-[0.99]"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In to Official Portal</span>
            </Link>
            <div className="flex items-center justify-between text-[10px] text-slate-400 px-1 pt-0.5 font-medium">
              <span className="font-semibold text-slate-500">APL Season 9 • NexCore</span>
              <span className="text-slate-400">Admin • Referee • Athlete</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
