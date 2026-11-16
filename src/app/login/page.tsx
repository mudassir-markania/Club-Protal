'use client';

import React from 'react';
import Link from 'next/link';
import { Shield, Scale, ArrowRight, ArrowLeft, Crown } from 'lucide-react';

export default function UnifiedLoginPage() {
  return (
    <div className="min-h-screen bg-[#080A0E] text-[#EDEDED] flex flex-col justify-between selection:bg-[#C6A04A] selection:text-[#0A0D14] antialiased">
      {/* Top Header */}
      <header className="border-b border-white/[0.08] px-4 sm:px-8 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 select-none group">
          <div className="w-8 h-8 rounded-lg bg-[#141822] border border-[#C6A04A]/40 p-1 flex items-center justify-center group-hover:border-[#C6A04A] transition">
            <img src="/logo.png" alt="APL Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <span className="font-serif font-black text-base tracking-tight text-white block leading-tight">
              APL <span className="text-[#C6A04A]">SEASON 9</span>
            </span>
            <span className="text-[10px] text-slate-400 block font-medium">
              Inter-Club House Championship
            </span>
          </div>
        </Link>

        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#C6A04A]" />
          <span>Public Viewer Portal</span>
        </Link>
      </header>

      {/* Main Role Selection Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-8 flex flex-col justify-center space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs text-[#C6A04A]">
            <Crown className="w-3.5 h-3.5 text-[#C6A04A]" />
            <span>Staff & Officials Access</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Championship Sign In Portal
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
            Select your assigned championship role to access authorized management tools.
          </p>
        </div>

        {/* Dual Role Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          {/* Card 1: Admin */}
          <div className="rounded-2xl bg-[#141822] border border-[#C6A04A]/30 hover:border-[#C6A04A] transition-all p-6 sm:p-8 space-y-5 flex flex-col justify-between shadow-xl group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#0A0D14] border border-[#C6A04A]/40 flex items-center justify-center text-[#C6A04A] shadow-inner group-hover:scale-105 transition-transform">
                <Shield className="w-6 h-6" />
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#C6A04A] block mb-1">
                  Director Access
                </span>
                <h2 className="font-serif text-2xl font-bold text-white">
                  Tournament Administrator
                </h2>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Full championship controls: manage houses, sports, schedule assignments, referee accounts, and final points validation.
                </p>
              </div>
            </div>

            <Link
              href="/admin/login"
              className="w-full py-3 rounded-xl bg-[#C6A04A] hover:bg-[#B38F3A] text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-md"
            >
              <span>Enter Admin Portal</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Card 2: Referee */}
          <div className="rounded-2xl bg-[#141822] border border-emerald-500/30 hover:border-emerald-500 transition-all p-6 sm:p-8 space-y-5 flex flex-col justify-between shadow-xl group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#0A0D14] border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-inner group-hover:scale-105 transition-transform">
                <Scale className="w-6 h-6" />
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block mb-1">
                  Official Match Scorer
                </span>
                <h2 className="font-serif text-2xl font-bold text-white">
                  Match Referee
                </h2>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Restricted officiating console: view assigned fixtures, record match scores, and submit official match results.
                </p>
              </div>
            </div>

            <Link
              href="/referee/login"
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-md"
            >
              <span>Enter Referee Portal</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>

      {/* Bottom Footer */}
      <footer className="border-t border-white/[0.08] py-6 px-4 text-center text-xs text-slate-500">
        APL Season 9 House Championship • Strict Role-Based Authentication
      </footer>
    </div>
  );
}
