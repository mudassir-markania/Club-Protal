import React from 'react';
import Link from 'next/link';

export default function PublicFooter() {
  return (
    <footer className="bg-[#0A0D14] py-10 px-4 sm:px-8 border-t border-white/[0.08] text-xs text-slate-400 mt-16">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#141822] border border-[#C6A04A]/30 p-1 flex items-center justify-center">
            <img src="/logo.png" alt="APL Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <span className="font-serif font-bold text-white text-sm block">
              APL Season 9 House Championship
            </span>
            <span className="text-[11px] text-slate-400">
              Official Spectator Portal • No Login Required
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex flex-wrap items-center justify-center gap-5 text-xs">
          <Link href="/" className="hover:text-[#C6A04A] transition">
            Home
          </Link>
          <Link href="/leaderboard" className="hover:text-[#C6A04A] transition">
            Leaderboard
          </Link>
          <Link href="/houses" className="hover:text-[#C6A04A] transition">
            The 5 Houses
          </Link>
          <Link href="/sports" className="hover:text-[#C6A04A] transition">
            8 Sports
          </Link>
          <Link href="/schedule" className="hover:text-[#C6A04A] transition">
            Schedule
          </Link>
          <Link href="/results" className="hover:text-[#C6A04A] transition">
            Results
          </Link>
          <Link href="/points-rules" className="hover:text-[#C6A04A] transition">
            Points Rules
          </Link>
          <span className="text-slate-600 hidden md:inline">|</span>
          <Link href="/admin/login" className="text-slate-400 hover:text-[#C6A04A] transition">
            Admin Sign In
          </Link>
          <Link href="/referee/login" className="text-slate-400 hover:text-emerald-400 transition">
            Referee Sign In
          </Link>
        </div>

        {/* Tagline / Year */}
        <div className="text-right text-[11px] text-slate-400 font-mono">
          Season 2026 • 5 Houses • 8 Sports
        </div>
      </div>
    </footer>
  );
}

