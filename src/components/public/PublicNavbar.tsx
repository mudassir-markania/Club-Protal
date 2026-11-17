'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Trophy,
  UserCheck,
  Crown,
  Menu,
  X,
  ExternalLink,
  Calendar,
  Sparkles,
} from 'lucide-react';

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
    { label: 'About', href: '#about-section', key: 'about' },
    { label: 'Sports', href: '/sports', key: 'sports' },
    { label: 'Schedule', href: '/schedule', key: 'schedule' },
    { label: 'Leaderboard', href: '/leaderboard', key: 'leaderboard' },
    { label: 'Clubs', href: '/houses', key: 'clubs' },
    { label: 'Gallery', href: '#gallery-section', key: 'gallery' },
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
    if (item.key === 'clubs' && (pathname === '/houses' || pathname === '/the-5-houses')) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          <Link href="/" className="flex items-center gap-2 group cursor-pointer">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center shadow-xs text-white group-hover:scale-105 transition-transform">
              <Trophy className="w-4 h-4 fill-white text-white drop-shadow-xs" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-black text-sm sm:text-base tracking-tight text-[#0B1E38] uppercase">
                APEX<span className="text-[#0284C7]">ARENA</span>
              </span>
              <span className="text-[10px] font-black tracking-widest text-[#EA580C] uppercase -mt-0.5">
                APL SEASON 9
              </span>
            </div>
          </Link>

          {/* Divider */}
          <div className="h-6 w-[1.5px] bg-slate-300 hidden md:block" />

          {/* Nexcore Institution Badge */}
          <div className="hidden md:flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[#0A2540] text-white font-mono font-black text-[10px] flex items-center justify-center tracking-tighter">
              NT
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-[11px] font-bold text-slate-800 tracking-wider uppercase">
                NEXCORE
              </span>
              <span className="text-[9px] font-medium text-slate-500 tracking-tight">
                INSTITUTE OF TECHNOLOGY
              </span>
            </div>
          </div>
        </div>

        {/* Center Desktop Navigation Pills */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5">
          {navItems.map((item) => {
            const active = isItemActive(item);
            return (
              <Link
                key={item.key}
                href={item.href}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 ${
                  active
                    ? 'bg-[#0284C7] text-white shadow-xs font-bold'
                    : 'text-slate-600 hover:text-[#0B1E38] hover:bg-slate-100/80'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Side: Referee Login & Admin Login Buttons */}
        <div className="hidden sm:flex items-center gap-2.5 shrink-0">
          {/* Referee Login Pill */}
          <Link
            href="/referee/login"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white hover:bg-slate-50 border border-slate-300 hover:border-slate-400 text-slate-700 hover:text-slate-900 text-xs font-bold transition shadow-2xs group"
          >
            <UserCheck className="w-3.5 h-3.5 text-slate-600 group-hover:text-[#0284C7] transition-colors" />
            <span>Referee Login</span>
          </Link>

          {/* Admin Login Pill */}
          <Link
            href="/admin/login"
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-[#0088FF] to-[#0060DF] hover:from-[#007AE6] hover:to-[#0050C0] text-white text-xs font-bold transition shadow-md shadow-blue-500/25 group transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <Crown className="w-3.5 h-3.5 text-amber-300 group-hover:rotate-12 transition-transform" />
            <span>Admin Login</span>
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex sm:hidden items-center gap-2">
          <Link
            href="/admin/login"
            className="p-1.5 rounded-full bg-[#0284C7] text-white"
            title="Admin Login"
          >
            <Crown className="w-4 h-4 text-amber-300" />
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-700 hover:bg-slate-100"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-3 shadow-xl">
          <div className="grid grid-cols-2 gap-2 pt-2">
            {navItems.map((item) => {
              const active = isItemActive(item);
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2 rounded-xl text-center text-xs font-bold ${
                    active
                      ? 'bg-[#0284C7] text-white'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            <Link
              href="/referee/login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 py-2 rounded-xl bg-slate-100 text-slate-800 text-xs font-bold"
            >
              <UserCheck className="w-4 h-4 text-[#0284C7]" />
              <span>Referee Login</span>
            </Link>
            <Link
              href="/admin/login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 py-2 rounded-xl bg-gradient-to-r from-[#0088FF] to-[#0060DF] text-white text-xs font-bold shadow-md"
            >
              <Crown className="w-4 h-4 text-amber-300" />
              <span>Admin Login</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
