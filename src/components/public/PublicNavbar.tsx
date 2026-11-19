'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, LogIn } from 'lucide-react';

interface PublicNavbarProps {
  onRefresh?: () => void;
  refreshing?: boolean;
  lastUpdated?: string;
  activeOverride?: string;
}

export default function PublicNavbar({ activeOverride }: PublicNavbarProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Home', href: '/', key: 'home' },
    { label: 'Schedule', href: '/schedule', key: 'schedule' },
    { label: 'Leaderboard', href: '/leaderboard', key: 'leaderboard' },
    { label: 'Houses', href: '/houses', key: 'houses' },
    { label: 'Sports', href: '/sports', key: 'sports' },
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
      <div className="h-16 sm:h-20 max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-12 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand Crest & Title */}
        <div className="flex items-center gap-2 sm:gap-3.5 min-w-0 shrink">
          <Link href="/" className="flex items-center gap-2 sm:gap-3 group min-w-0">
            {/* Crest Logo */}
            <img
              alt="Apex Arena Crest Logo"
              className="h-7 sm:h-8 w-auto object-contain transition-transform group-hover:scale-105 shrink-0"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDsYOXH0JYiyX1rmUrq9scGTZImP9xqWivkekIWmx1Ruo3otUd9tF9VRe8WIEtDDPKFqcNYPrtpXTIXrhPILhl9C2Uw5zIvtHrgYGOblFU_y9Yhx0x9Afb48VKHwvWODlmjYpYUyz_3yPcHKJKV9F_uUUhRi2EmHmOnbK1FUcl9_CtwK5i8ia2Y4vQEOzSc86Qw-nN0mJFIxB1L5GZVK5OaxLk0RGsSzIYuMPIrLWbc"
            />
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-manrope text-base sm:text-xl font-bold uppercase tracking-tight text-[#000f3f] leading-none whitespace-nowrap">
                  Apex Arena
                </span>
                <span className="px-1.5 py-0.5 rounded bg-[#dae2fd] text-[#000f3f] text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider font-manrope shrink-0">
                  APL S9
                </span>
              </div>
              <span className="text-[9px] sm:text-[10px] font-bold text-[#45464f] tracking-wider uppercase font-manrope mt-0.5 truncate hidden xs:block">
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
            className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg border border-[#000f3f]/20 hover:border-[#000f3f] bg-white hover:bg-[#000f3f] text-[#000f3f] hover:text-white text-xs uppercase tracking-wider font-extrabold transition-all duration-150 shadow-xs font-manrope group shrink-0"
          >
            <LogIn className="w-3.5 h-3.5 text-[#0051d5] group-hover:text-white transition-colors" />
            <span>Log In</span>
          </Link>

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-1.5 sm:p-2 rounded-lg text-[#000f3f] hover:bg-[#e2e7ff] shrink-0"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-white/98 backdrop-blur-xl border-b border-[#c6c5d0] px-4 py-4 space-y-2 animate-in slide-in-from-top-2">
          {navItems.map((item) => {
            const active = isItemActive(item);
            return (
              <Link
                key={item.key}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-2.5 rounded-lg text-sm uppercase tracking-wider font-bold transition-all font-manrope ${
                  active
                    ? 'bg-[#000f3f] text-white'
                    : 'text-[#45464f] hover:bg-[#f2f3ff] hover:text-[#000f3f]'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          <div className="pt-2 border-t border-[#e2e7ff]">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-extrabold uppercase tracking-wider text-white bg-[#000f3f] hover:bg-[#0051d5] transition-all font-manrope shadow-sm"
            >
              <LogIn className="w-4 h-4" />
              <span>Log In</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
