'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, RefreshCw, Shield, Scale, Lock, ChevronDown } from 'lucide-react';

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
  const [signInDropdownOpen, setSignInDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { label: 'Home', href: '/', key: 'home' },
    { label: 'Leaderboard', href: '/leaderboard', key: 'leaderboard' },
    { label: 'The 5 Houses', href: '/houses', key: 'houses' },
    { label: '8 Sports', href: '/sports', key: 'sports' },
    { label: 'Schedule', href: '/schedule', key: 'schedule' },
    { label: 'Results', href: '/results', key: 'results' },
    { label: 'Points Rules', href: '/points-rules', key: 'rules' },
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setSignInDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isItemActive = (item: (typeof navItems)[0]) => {
    if (activeOverride) {
      return activeOverride === item.key;
    }
    if (item.key === 'home' && pathname === '/') return true;
    if (pathname === item.href) return true;
    if (item.key === 'houses' && (pathname === '/houses' || pathname === '/the-5-houses')) return true;
    if (item.key === 'sports' && (pathname === '/sports' || pathname === '/7-sports' || pathname === '/8-sports')) return true;
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
    <header className="sticky top-0 z-50 bg-[#080A0E]/95 backdrop-blur-md border-b border-white/[0.08] px-4 lg:px-8 h-16 flex items-center justify-between transition-all">
      {/* Brand Logo & Name */}
      <Link href="/" className="flex items-center gap-2.5 cursor-pointer select-none group shrink-0">
        <div className="w-8 h-8 rounded-lg bg-[#141822] border border-[#C6A04A]/40 p-1 flex items-center justify-center shrink-0 group-hover:border-[#C6A04A] transition">
          <img src="/logo.png" alt="APL Logo" className="w-full h-full object-contain" />
        </div>
        <div className="flex items-center gap-2">
          <span className="font-serif font-black text-base sm:text-lg tracking-tight text-white whitespace-nowrap">
            APL <span className="text-[#C6A04A]">SEASON 9</span>
          </span>
          <span className="hidden 2xl:inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-white/[0.04] text-[#C6A04A] border border-[#C6A04A]/30 whitespace-nowrap">
            House Championship
          </span>
        </div>
      </Link>

      {/* Desktop Navigation Links — single-line & whitespace-nowrap */}
      <nav className="hidden lg:flex items-center gap-4 xl:gap-6">
        {navItems.map((item) => {
          const active = isItemActive(item);
          return (
            <Link
              key={item.key}
              href={item.href}
              className={`relative py-1 text-xs font-semibold tracking-wider uppercase whitespace-nowrap transition-colors duration-150 ${
                active
                  ? 'text-[#C6A04A] font-bold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <span>{item.label}</span>
              {active && (
                <span className="absolute -bottom-1 left-0 right-0 h-[2px] bg-[#C6A04A] rounded-full shadow-[0_0_8px_rgba(198,160,74,0.7)]" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Right Side: Live Standings + Sign In Buttons (Admin & Referee) + Refresh */}
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
        {/* Live Standings Status Pill */}
        <div className="hidden sm:flex items-center gap-2 px-2.5 xl:px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs text-slate-300 whitespace-nowrap">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-[11px] font-medium tracking-wide">Live Standings</span>
        </div>

        {/* Divider */}
        <div className="hidden xl:block h-4 w-[1px] bg-white/[0.1]" />

        {/* 1. Direct Buttons for XL Screens */}
        <div className="hidden xl:flex items-center gap-2">
          {/* Admin Sign In Button */}
          <Link
            href="/admin/login"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#141822] hover:bg-[#1C2331] border border-[#C6A04A]/50 text-xs font-bold text-[#F3D787] hover:border-[#C6A04A] transition shadow-xs whitespace-nowrap group"
            title="Access Tournament Director & Championship Admin"
          >
            <Shield className="w-3.5 h-3.5 text-[#C6A04A] group-hover:scale-110 transition-transform" />
            <span>Admin Sign In</span>
          </Link>

          {/* Referee Sign In Button */}
          <Link
            href="/referee/login"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#141822] hover:bg-[#1C2331] border border-emerald-500/40 text-xs font-bold text-emerald-400 hover:border-emerald-400 transition shadow-xs whitespace-nowrap group"
            title="Access Official Referee Match Scoring Portal"
          >
            <Scale className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
            <span>Referee Sign In</span>
          </Link>
        </div>

        {/* 2. Compact Sign In Dropdown for Tablet / Medium screens */}
        <div className="relative xl:hidden" ref={dropdownRef}>
          <button
            onClick={() => setSignInDropdownOpen(!signInDropdownOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#141822] hover:bg-[#1C2331] border border-[#C6A04A]/50 text-xs font-bold text-[#F3D787] transition shadow-xs"
            aria-expanded={signInDropdownOpen}
          >
            <Lock className="w-3 h-3 text-[#C6A04A]" />
            <span>Sign In</span>
            <ChevronDown className={`w-3 h-3 text-[#C6A04A] transition-transform duration-200 ${signInDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {signInDropdownOpen && (
            <div className="absolute right-0 mt-2 w-60 rounded-xl bg-[#0E131C] border border-[#C6A04A]/40 p-2 shadow-2xl backdrop-blur-xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <Link
                href="/admin/login"
                onClick={() => setSignInDropdownOpen(false)}
                className="flex items-center gap-2.5 p-2.5 rounded-lg hover:bg-white/[0.06] transition group"
              >
                <div className="w-8 h-8 rounded-lg bg-[#141822] border border-[#C6A04A]/40 flex items-center justify-center text-[#C6A04A] group-hover:bg-[#C6A04A] group-hover:text-slate-950 transition shrink-0">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white group-hover:text-[#C6A04A] transition block">
                    Admin Sign In
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    Tournament director controls
                  </span>
                </div>
              </Link>

              <div className="h-[1px] bg-white/[0.08] my-1" />

              <Link
                href="/referee/login"
                onClick={() => setSignInDropdownOpen(false)}
                className="flex items-center gap-2.5 p-2.5 rounded-lg hover:bg-white/[0.06] transition group"
              >
                <div className="w-8 h-8 rounded-lg bg-[#141822] border border-emerald-500/40 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-slate-950 transition shrink-0">
                  <Scale className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white group-hover:text-emerald-400 transition block">
                    Referee Sign In
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    Match score & points submission
                  </span>
                </div>
              </Link>
            </div>
          )}
        </div>

        {/* Refresh Button */}
        <button
          onClick={handleRefreshClick}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-white/[0.06] rounded-lg transition border border-white/[0.08]"
          title={lastUpdated ? `Updated ${lastUpdated}` : 'Refresh'}
          aria-label="Refresh Data"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-[#C6A04A]' : ''}`} />
        </button>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-1.5 text-slate-300 hover:text-white bg-white/[0.06] rounded-lg border border-white/[0.08]"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="w-4 h-4 text-[#C6A04A]" /> : <Menu className="w-4 h-4" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-16 left-0 right-0 bg-[#0E131C] border-b border-white/[0.08] p-4 space-y-3 text-xs font-semibold tracking-wider uppercase shadow-2xl z-50">
          <div className="space-y-1">
            {navItems.map((item) => {
              const active = isItemActive(item);
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between p-2.5 rounded-lg transition ${
                    active
                      ? 'bg-[#141822] text-[#C6A04A] font-bold border border-[#C6A04A]/30'
                      : 'text-slate-300 hover:bg-white/[0.05]'
                  }`}
                >
                  <span>{item.label}</span>
                  {active && <span className="w-1.5 h-1.5 rounded-full bg-[#C6A04A]" />}
                </Link>
              );
            })}
          </div>

          {/* Portal Sign In Section in Mobile Menu */}
          <div className="pt-3 border-t border-white/[0.08] space-y-2">
            <span className="text-[10px] font-bold text-slate-500 block px-1">
              PORTAL AUTHENTICATION
            </span>
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/admin/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-1.5 p-2.5 rounded-lg bg-[#141822] border border-[#C6A04A]/40 text-[#F3D787] font-bold text-[11px] text-center"
              >
                <Shield className="w-3.5 h-3.5 text-[#C6A04A]" />
                <span>Admin Login</span>
              </Link>
              <Link
                href="/referee/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-1.5 p-2.5 rounded-lg bg-[#141822] border border-emerald-500/40 text-emerald-400 font-bold text-[11px] text-center"
              >
                <Scale className="w-3.5 h-3.5 text-emerald-400" />
                <span>Referee Login</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
