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

          {/* Mobile hamburger / close button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`xl:hidden p-2 rounded-xl transition-colors shrink-0 ${
              mobileMenuOpen
                ? 'bg-slate-100 hover:bg-slate-200 text-navy-950 shadow-2xs'
                : 'text-[#000f3f] hover:bg-[#e2e7ff]'
            }`}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
          </button>
        </div>
      </div>

      {/* Full-Height Solid Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden fixed inset-x-0 top-16 sm:top-20 bottom-0 z-50 bg-white flex flex-col justify-between border-t border-slate-200/80 shadow-2xl overflow-y-auto overscroll-contain animate-in fade-in duration-150">
          <div className="p-4 space-y-2 flex-1">
            {/* Live Championship Header Pill */}
            <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] font-manrope mb-3">
              <span className="font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>APL Season 9 Championship</span>
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                LIVE
              </span>
            </div>

            {/* Navigation Links */}
            <div className="space-y-1">
              {navItems.map((item) => {
                const active = isItemActive(item);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-3.5 py-3 rounded-xl transition-all font-manrope ${
                      active
                        ? 'bg-blue-50 text-blue-950 font-bold border border-blue-200/90 shadow-2xs'
                        : 'text-slate-700 hover:bg-slate-50 active:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                          active
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className={`block text-xs uppercase tracking-wider font-extrabold leading-tight ${active ? 'text-blue-950 font-black' : 'text-slate-900'}`}>
                          {item.label}
                        </span>
                        <span className={`block text-[11px] truncate mt-0.5 font-sans ${active ? 'text-blue-700 font-medium' : 'text-slate-400 font-normal'}`}>
                          {item.subtitle}
                        </span>
                      </div>
                    </div>

                    <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${active ? 'text-blue-600 translate-x-0.5' : 'text-slate-300'}`} />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Bottom Portal Action Area */}
          <div className="p-4 border-t border-slate-100 bg-slate-50/80 space-y-2.5 shrink-0 pb-6">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.99] transition-all font-manrope shadow-md shadow-blue-600/20"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In to Official Portal</span>
            </Link>
            <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 font-medium">
              <span className="font-semibold text-slate-500">APL Season 9 • NexCore</span>
              <span className="text-slate-400">Admin • Referee • Athlete</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
