'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Shield, Lock } from 'lucide-react';

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
    <header className="fixed top-0 left-0 w-full z-50 bg-[#faf8ff]/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-[#e2e7ff]/60">
      <div className="h-20 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 flex items-center justify-between gap-4">
        {/* Brand Crest & Title */}
        <div className="flex items-center gap-3.5 shrink-0">
          <Link href="/" className="flex items-center gap-3 group">
            {/* Crest Logo */}
            <img
              alt="Apex Arena Crest Logo"
              className="h-8 w-auto object-contain transition-transform group-hover:scale-105"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDsYOXH0JYiyX1rmUrq9scGTZImP9xqWivkekIWmx1Ruo3otUd9tF9VRe8WIEtDDPKFqcNYPrtpXTIXrhPILhl9C2Uw5zIvtHrgYGOblFU_y9Yhx0x9Afb48VKHwvWODlmjYpYUyz_3yPcHKJKV9F_uUUhRi2EmHmOnbK1FUcl9_CtwK5i8ia2Y4vQEOzSc86Qw-nN0mJFIxB1L5GZVK5OaxLk0RGsSzIYuMPIrLWbc"
            />
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-manrope text-xl font-bold uppercase tracking-tight text-[#000f3f] leading-none">
                  Apex Arena
                </span>
                <span className="px-1.5 py-0.5 rounded-lg bg-[#dae2fd] text-[#000f3f] text-[10px] font-extrabold uppercase tracking-wider font-manrope">
                  APL S9
                </span>
              </div>
              <span className="text-[10px] font-bold text-[#45464f] tracking-wider uppercase font-manrope mt-0.5">
                NexCore Institute of Technology
              </span>
            </div>
          </Link>
        </div>

        {/* Desktop Nav Items */}
        <nav className="hidden xl:flex items-center gap-1.5">
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
        <div className="flex items-center gap-3 shrink-0">
          {/* Live Ping Badge */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#ffdad6]/40 border border-[#ffdad6]">
            <span className="w-2 h-2 rounded-full bg-[#ba1a1a] animate-ping" />
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#93000a] font-manrope">
              APL S9 Live
            </span>
          </div>

          {/* View Championship Primary Button */}
          <Link
            href="/schedule"
            className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-[#000f3f] hover:bg-[#0051d5] text-white text-xs uppercase tracking-wider font-bold transition-colors duration-150 shadow-[0_1px_8px_rgba(0,0,0,0.04)] font-manrope"
          >
            View Championship
          </Link>

          {/* Referee & Admin Portal Access Pill */}
          <div className="hidden md:flex items-center gap-1.5 pl-1 border-l border-[#c6c5d0]">
            <Link
              href="/referee/login"
              title="Referee Portal"
              className="p-2 rounded-lg hover:bg-[#e2e7ff] text-[#45464f] hover:text-[#000f3f] transition-colors"
            >
              <Shield className="w-4 h-4" />
            </Link>
            <Link
              href="/admin/login"
              title="Admin Console"
              className="p-2 rounded-lg hover:bg-[#e2e7ff] text-[#45464f] hover:text-[#000f3f] transition-colors"
            >
              <Lock className="w-4 h-4" />
            </Link>
          </div>

          {/* Profile / Secretariat Icon */}
          <div className="flex items-center gap-2 pl-1">
            <img
              alt="Tournament Director"
              className="w-8 h-8 rounded-full object-cover border border-[#c6c5d0]"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCnjT1YhFNcqD1FRCReeI5S0PbJaxS_LD9CSr7zhdwx_TZKDLTDxJ4fQixoWzuVaGzmBWOXL3erJfxxw2e0ObMBD-i2-1Q9WcJ3XqosbexhBYTpRdS6uq7QGJyKABUl2AEZK5HjAVZHsbROFkfVO4NSUEvtRVbGqYVAOqxelPtqmS6fp0KdweHYLl86NO_6HMaFJP_i0GpmxxvUuL8dTkCnMFmim_iozAX7CQoWZb8R"
            />
            <div className="hidden 2xl:flex flex-col leading-tight">
              <span className="text-[10px] font-bold text-[#000f3f] uppercase font-manrope">
                Tournament Dir.
              </span>
              <span className="text-[10px] text-[#45464f] font-medium">Sec. Operations</span>
            </div>
          </div>

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-2 rounded-lg text-[#000f3f] hover:bg-[#e2e7ff]"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
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
          <div className="pt-2 border-t border-[#e2e7ff] flex flex-col gap-2">
            <Link
              href="/referee/login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase text-[#000f3f] bg-[#f2f3ff]"
            >
              <Shield className="w-4 h-4 text-[#0051d5]" />
              Referee Console
            </Link>
            <Link
              href="/admin/login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase text-white bg-[#000f3f]"
            >
              <Lock className="w-4 h-4 text-amber-300" />
              Tournament Admin Portal
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
